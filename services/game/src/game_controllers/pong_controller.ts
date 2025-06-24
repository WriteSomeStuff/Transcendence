import { GameController } from "./game_controller.js";

import { CourtController, PlayerInput, ScoreController } from "pong";
import { Pong2PlayersScoreController } from "../score/pong_2_players_score_controller.js";
import { PlayerScore } from "../score/player_score.js";

export class PongController extends GameController {
  private courtController: CourtController;
  private readonly scoreController: ScoreController;
  private readonly playerMessages: object[][];
  private broadcastMessages: object[] = [];

  public constructor() {
    super(2);
    this.playerMessages = [[], []];
    this.scores = Array.from({ length: 2 }).map(_ => new PlayerScore());
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
    this.courtController.updateInput(index, Object.assign(new PlayerInput(), action));
    this.broadcastMessages.push({
      "type": "stateSet",
      "payload": this.courtController.getState(),
    });
  }

  onPlayerJoin(index: number): void {
    this.courtController.updateInput(index, new PlayerInput());
    this.playerMessages[index]!.push({
      "type": "courtSet",
      "payload": this.courtController.getCourt(),
    });
  }

  onPlayerLeave(index: number): void {
    this.courtController.updateInput(index, new PlayerInput());
  }

  start(): void {
    this.broadcastMessages.push({
      "type": "courtSet",
      "payload": this.courtController.getCourt(),
    });
  }

  update(delta: number): void {
    this.courtController.update(delta);
    this.broadcastMessages.push({
      "type": "stateSet",
      "payload": this.courtController.getState(),
    });
  }
}
