import { PlayerScore } from "../score/player_score.js";

export abstract class GameController {
  protected scores: PlayerScore[];

  protected constructor(playersAmount: number) {
    this.scores = Array.from({ length: playersAmount });
  }

  public abstract getBroadcastMessages(): object[];
  public abstract getPlayerMessages(index: number): object[];
  public abstract onPlayerJoin(index: number): void;
  public abstract onPlayerAction(index: number, action: object): void;
  public abstract onPlayerLeave(index: number): void;
  public abstract start(): void;
  public abstract update(delta: number): void;
}
