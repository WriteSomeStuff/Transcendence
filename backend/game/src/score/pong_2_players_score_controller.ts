import { ScoreController } from "pong";
import { PlayerScore } from "./player_score.js";

export class Pong2PlayersScoreController implements ScoreController {
  private playerScores: PlayerScore[];

  public constructor(playerScores: PlayerScore[]) {
    this.playerScores = playerScores;
  }
  onBallMissed(lastTouchBy: number | null, missedBy: number): void {
    void lastTouchBy; // to avoid tsconfig error
    if (missedBy === 0) {
      this.playerScores[1]!.increase();
    } else {
      this.playerScores[0]!.increase();
    }
  }
}
