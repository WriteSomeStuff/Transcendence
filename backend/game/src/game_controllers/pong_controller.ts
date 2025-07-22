import { GameInputMessageSchema } from "schemas";
import type { GameUpdateMessage, Room, MatchResult } from "schemas";

import { GameController } from "./game_controller.js";

import { CourtController, ScoreController } from "pong";
import { PongScoreController } from "../score/pong_score_controller.js";

export class PongController extends GameController {
  private courtController: CourtController;
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
    this.scoreController = new PongScoreController(room.size, 10, (scores) => {
      this.broadcastMessages.push({
        type: "scoresUpdate",
        payload: scores,
      });
    });
    this.courtController = new CourtController(room, this.scoreController);
  }

  public isGameOver(): boolean {
    return this.gameEnded;
  }

  public getGameResult(): MatchResult {
    const scores = this.scoreController.getScores();
    for (const userIndex of this.usersGaveUp) {
      scores[userIndex] = -1;
    }
    return {
      participants: this.room.joinedUsers.map((userId, index) => ({
        userId,
        score: scores[index]!,
      })),
      start: this.startTime,
      end: new Date(),
    };
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
    if (this.gameEnded || this.usersGaveUp.has(index)) {
      return;
    }
    const parsed = GameInputMessageSchema.safeParse(action);
    if (!parsed.success) {
      return;
    }
    switch (parsed.data.type) {
      case "pongInputUpdate": {
        if (
          this.courtController.getCourt().geometry.playerCount === 2 &&
          index === 0
        ) {
          parsed.data.payload.upPressed = !parsed.data.payload.upPressed;
          parsed.data.payload.downPressed = !parsed.data.payload.downPressed;
        }
        this.courtController.updateInput(index, parsed.data.payload);
        this.broadcastMessages.push({
          type: "pongUpdate",
          payload: this.courtController.getCourt(),
        });
        break;
      }
      case "giveUp": {
        this.usersGaveUp.add(index);
        this.courtController.giveUp(index);
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
    this.courtController.updateInput(index, {
      upPressed: false,
      downPressed: false,
    });
    this.playerMessages[index]!.push({
      type: "pongInit",
      payload: this.courtController.getCourt(),
    });
  }

  onPlayerLeave(index: number): void {
    if (this.gameEnded || this.usersGaveUp.has(index)) {
      return;
    }
    this.courtController.updateInput(index, {
      upPressed: false,
      downPressed: false,
    });
  }

  start(): void {
    this.broadcastMessages.push({
      type: "pongInit",
      payload: this.courtController.getCourt(),
    });
  }

  update(delta: number): void {
    if (this.gameEnded) {
      return;
    }
    this.courtController.update(delta);
    this.broadcastMessages.push({
      type: "pongUpdate",
      payload: this.courtController.getCourt(),
    });
  }
}
