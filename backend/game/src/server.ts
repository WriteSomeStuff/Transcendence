import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";

import { GameController } from "./game_controllers/game_controller.js";
import { PongController } from "./game_controllers/pong_controller.js";

import { type MatchResult, RoomSchema } from "schemas";

import { WebSocket } from "ws";

const app = Fastify();

await app.register(fastifyWebsocket);

class GameUser {
  public userId: number;
  public socket: WebSocket | null;

  public constructor(userId: number) {
    this.userId = userId;
    this.socket = null;
  }

  public setSocket(socket: WebSocket) {
    console.log("setSocket called");
    if (this.socket) {
      this.socket.close(); // TODO send message
    }
    this.socket = socket;
  }

  public unsetSocket() {
    console.log("unset socket called");
    if (this.socket) {
      this.socket.close();
    }
    this.socket = null;
  }

  public sendMessages(messages: object[]): void {
    for (const message of messages) {
      this.socket!.send(JSON.stringify(message));
    }
  }
}

async function saveMatchResult(matchResult: MatchResult): Promise<number> {
  const url = process.env["USER_SERVICE_URL"] + "/match";
  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(matchResult),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data["success"]) {
        return Number(data["matchId"]);
      } else {
        console.error("Error in saving match:", data["error"]);
        return -1;
      }
    });
}

class Game {
  public gameId: string;
  public users: GameUser[];
  public controller: GameController;
  private isGameOver: boolean = false;

  public constructor(
    gameId: string,
    userIds: number[],
    controller: GameController,
  ) {
    this.gameId = gameId;
    this.users = userIds.map((id) => new GameUser(id));
    this.controller = controller;
  }

  public isReady(): boolean {
    return this.users.every((user) => !!user.socket);
  }

  public update(delta: number): void {
    if (this.isGameOver) {
      return;
    }
    this.controller.update(delta);
    const broadcastMessages = this.controller.getBroadcastMessages();
    for (let i = 0; i < this.users.length; i++) {
      this.users[i]!.sendMessages(broadcastMessages);
      this.users[i]!.sendMessages(this.controller.getPlayerMessages(i));
    }
    if (this.controller.isGameOver()) {
      this.isGameOver = true;
      saveMatchResult(this.controller.getGameResult()).then((matchId) => {
        for (const user of this.users) {
          user.sendMessages([
            {
              type: "gameEnded",
              matchId: matchId,
            },
          ]);
          user.unsetSocket();
          delete usersToGames[user.userId];
        }
        delete games[this.gameId];
      });
    }
  }

  private getUserIndex(userId: number): number {
    return this.users.findIndex((user) => user.userId === userId);
  }

  public register(userId: number, socket: WebSocket) {
    console.log("register", userId);
    const user = this.users.find((user) => user.userId === userId);
    if (!user) {
      socket.close(); // TODO also send some error message
      return;
    }
    const index = this.getUserIndex(userId);
    const controller = this.controller;
    user.setSocket(socket);
    controller.onPlayerJoin(index);
    socket.on("disconnect", () => {
      user.unsetSocket();
      controller.onPlayerLeave(index);
    });
    socket.on("message", (data: WebSocket.RawData) => {
      controller.onPlayerAction(index, JSON.parse(data.toString()));
    });
  }
}

const usersToGames: { [userId: string]: string } = {};
const games: { [gameId: string]: Game } = {};

app.get("/ws", { websocket: true }, (socket: WebSocket, req) => {
  console.log("Processing ws request", req, req.headers);
  const userId = Number(req.headers["cookie"]!);
  console.log("userId", userId);
  const gameId = usersToGames[userId];
  console.log("gameId", gameId);
  if (gameId === undefined) {
    socket.close();
    return;
  }
  const game: Game = games[gameId]!;
  game.register(userId, socket);
});

app.get("/users", (req, res) => {
  console.log("Processing users request", req, req.headers);
  const userId = Number(req.headers["cookie"]!);
  console.log("userId", userId);
  const gameId = usersToGames[userId];
  console.log("gameId", gameId);
  if (gameId === undefined) {
    res.status(404).send("Not found gameId");
    return;
  }
  const game: Game = games[gameId]!;
  const userIds = game.users.map((user) => user.userId);
  res.status(200).send(userIds);
});

let lastUpdate = new Date().getTime();
let lastGameId: number = 0;

setInterval(() => {
  const delta = new Date().getTime() - lastUpdate;
  for (let gameId in games) {
    const game = games[gameId]!;
    if (game.isReady()) game.update(delta / 1000);
  }
  lastUpdate += delta;
}, 50);

app.post("/create", (req, res) => {
  const gameId = lastGameId.toString();
  lastGameId++;
  const parsed = RoomSchema.safeParse(JSON.parse(req.body as string));
  if (!parsed.success) {
    res.status(400).send({
      error: "Failed to parse",
    });
    return;
  }
  const userIds = parsed.data.joinedUsers;
  const controller = new PongController(parsed.data);
  games[gameId] = new Game(gameId, userIds, controller);
  for (const userId of userIds) {
    console.log("adding user", userId);
    usersToGames[userId] = gameId;
  }
  res.status(201).send(JSON.stringify({ gameId, userIds }));
});

app.get("/inGame", (req, res) => {
  console.log("getting game", req.query);
  const { userId } = req.query as { userId: string };
  console.log("userId", userId);
  if (!userId) {
    res.send({
      inGame: true,
    });
  }
  console.log("inGame", !!usersToGames[userId]);
  res.send({
    inGame: !!usersToGames[userId],
  });
});

app.get("/health", (_, res) => {
  res.status(200).send("Success");
});

app.listen({ port: 80, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log("Listening on " + address);
});
