import { GameInputMessageSchema } from "schemas";
import type { GameUpdateMessage, Room, MatchResult } from "schemas";

import { GameController } from "./game_controller.js";

import { ShootingCanvasController, ScoreController } from "shooting";
import { ShootingScoreController } from "../score/shooting_score_controller.js";

export class ShootingController extends GameController {
  private shootingCanvasController: ShootingCanvasController;
  private readonly scoreController: ScoreController;
  private readonly playerMessages: GameUpdateMessage[][];
  private broadcastMessages: GameUpdateMessage[] = [];
  private usersGaveUp: Set<number> = new Set();
  private readonly startTime: Date;
  private gameEnded = false;

  public constructor(room: Room) {
    super(room);
    this.startTime = new Date();
    this.playerMessages = Array.from({ length: room.size }).map((_) => []);
    this.scoreController = new ShootingScoreController(
      room.size,
      room.maxScore,
      (scores) => {
        this.broadcastMessages.push({
          type: "scoresUpdate",
          payload: scores,
        });
        if (this.scoreController.isMaxScoreReached()) {
          this.gameEnded = true;
        }
      },
    );
    this.shootingCanvasController = new ShootingCanvasController(
      room,
      this.scoreController,
    );
  }

  public isGameOver(): boolean {
    return this.gameEnded;
  }

  public getGameResult(): MatchResult {
    const scores = this.scoreController.getScores();
    for (const userIndex of this.usersGaveUp) {
      scores[userIndex] = -1;
    }
    const result: MatchResult = {
      participants: this.room.joinedUsers.map((userId, index) => ({
        userId,
        score: scores[index]!,
      })),
      start: this.startTime,
      end: new Date(),
    };
    if (this.room.permissions.type === "tournament") {
      result.matchId = this.room.permissions.matchId;
    }
    return result;
  }

  getBroadcastMessages(): object[] {
    const result = this.broadcastMessages;
    this.broadcastMessages = [];
    return result;
  }

  getPlayerMessages(index: number): object[] {
    const result = this.playerMessages[index]!;
    this.playerMessages[index] = [];
    return result;
  }

  onPlayerAction(index: number, action: object): void {
    console.log("onPlayerAction", index, action);
    if (this.gameEnded || this.usersGaveUp.has(index)) {
      return;
    }
    const parsed = GameInputMessageSchema.safeParse(action);
    if (!parsed.success) {
      return;
    }
    switch (parsed.data.type) {
      case "shootingPlayerInput": {
        this.shootingCanvasController.acceptInput(index, parsed.data.payload);
        this.broadcastMessages.push({
          type: "shootingUpdate",
          payload: this.shootingCanvasController.getShootingCanvas(),
        });
        break;
      }
      case "giveUp": {
        this.usersGaveUp.add(index);
        if (this.usersGaveUp.size + 1 >= this.room.size) {
          this.gameEnded = true;
        }
        break;
      }
    }
  }

  onPlayerJoin(index: number): void {
    if (this.gameEnded || this.usersGaveUp.has(index)) {
      return;
    }
    this.playerMessages[index]!.push({
      type: "shootingInit",
      payload: this.shootingCanvasController.getShootingCanvas(),
    });
  }

  onPlayerLeave(index: number): void {
    if (this.gameEnded || this.usersGaveUp.has(index)) {
      return;
    }
  }

  start(): void {
    this.broadcastMessages.push({
      type: "shootingInit",
      payload: this.shootingCanvasController.getShootingCanvas(),
    });
  }

  update(delta: number): void {
    if (this.gameEnded) {
      return;
    }
    this.shootingCanvasController.update(delta);
    this.broadcastMessages.push({
      type: "shootingUpdate",
      payload: this.shootingCanvasController.getShootingCanvas(),
    });
  }
}
