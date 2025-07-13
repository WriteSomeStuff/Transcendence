import { GameInputMessageSchema } from "schemas";
import type { GameUpdateMessage } from "schemas";

import { GameController } from "./game_controller.js";

import { CourtController, ScoreController } from "pong";
import { Pong2PlayersScoreController } from "../score/pong_2_players_score_controller.js";
import { PlayerScore } from "../score/player_score.js";

export class PongController extends GameController {
  private courtController: CourtController;
  private readonly scoreController: ScoreController;
  private readonly playerMessages: GameUpdateMessage[][];
  private broadcastMessages: GameUpdateMessage[] = [];

  public constructor() {
    super(2);
    this.playerMessages = [[], []];
    this.scores = Array.from({ length: 2 }).map((_) => new PlayerScore());
    this.scoreController = new Pong2PlayersScoreController(this.scores);
    this.courtController = new CourtController(this.scoreController);
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
      // potentially expand with other inputs
    }
  }

  onPlayerJoin(index: number): void {
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
    this.courtController.update(delta);
    this.broadcastMessages.push({
      type: "pongUpdate",
      payload: this.courtController.getCourt(),
    });
  }
}
