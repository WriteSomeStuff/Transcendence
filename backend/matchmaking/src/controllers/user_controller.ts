import type { WebSocket } from "ws";

import type { Room, MatchmakingMessage } from "schemas";
import { MatchmakingMessageSchema } from "schemas";

import {
  createRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  getRooms,
} from "./room_controller.js";
import { checkInGame, startGame } from "../helpers.js";

const connectedUsers: Map<number, UserController> = new Map();

export class UserController {
  public readonly userId: number;
  private readonly socket: WebSocket;
  private room: Room | null = null;

  private static broadcast(message: string): void {
    for (const controller of connectedUsers.values()) {
      controller.socket.send(message);
    }
  }

  public static update() {
    UserController.broadcast(
      JSON.stringify({
        action: "update",
        rooms: getRooms(),
      }),
    );
  }

  constructor(userId: number, socket: WebSocket) {
    this.userId = userId;
    this.socket = socket;
    if (connectedUsers.has(userId)) {
      connectedUsers.get(userId)?.finalize();
    }
    connectedUsers.set(userId, this);
    socket.on("open", () => {
      UserController.update();
    });
    socket.on("message", async (message) => {
      console.log("Received message", message);
      const parsed = MatchmakingMessageSchema.safeParse(
        JSON.parse(message.toString()),
      );
      console.log("parsed message", parsed);
      if (!parsed.success) {
        console.warn(
          "Failed to parse message",
          message.toString(),
          parsed.error,
        );
        return;
      }
      console.log("Checking in game");
      if (await checkInGame(this.userId)) {
        this.finalize();
        return;
      }
      console.log("not in game");
      this.processMessage(parsed.data);
      if (this.room && this.room.joinedUsers.length === this.room.size) {
        console.log("Room is full");
        const gameId = await startGame(this.room);
        console.log("Room is full", gameId);
        const roomId = this.room.id;
        this.room.joinedUsers.forEach((userId) => {
          const controller = connectedUsers.get(userId);
          if (!controller) {
            return;
          }
          console.log("Sending individual message", gameId);
          controller.socket.send(
            JSON.stringify({
              action: "started",
              gameId: gameId,
            }),
          );
          controller.room = null;
        });
        deleteRoom(roomId);
      }
      UserController.update();
    });
    socket.on("disconnect", () => {
      this.finalize();
    });
    socket.on("close", () => {
      this.finalize();
    });
  }

  private processMessage(message: MatchmakingMessage) {
    switch (message.action) {
      case "createRoom": {
        if (this.room) {
          this.leaveRoom();
        }
        this.room = createRoom(
          this,
          message.size,
          message.permissions,
          message.gameData,
        );
        break;
      }
      case "joinRoom": {
        if (this.room && message.roomId !== this.room.id) {
          this.leaveRoom();
        }
        this.room = joinRoom(this, message.roomId);
        break;
      }
      case "leaveRoom": {
        this.leaveRoom();
        break;
      }
    }
  }

  public leaveRoom() {
    if (this.room) {
      leaveRoom(this, this.room.id);
    }
    this.room = null;
  }

  public finalize() {
    this.leaveRoom();
    this.socket.close();
    connectedUsers.delete(this.userId);
  }
}
