import { ScoreController } from "pong";

export class PongScoreController implements ScoreController {
  private readonly playerScores: number[];
  private readonly maxScore: number;
  private readonly sender: (scores: number[]) => void;

  public constructor(playersCount: number, maxScore: number, sender: (scores: number[]) => void) {
    this.playerScores = Array.from({length: playersCount}).map(_ => 0);
    this.maxScore = maxScore;
    this.sender = sender;
  }

  onBallMissed(lastTouchBy: number, missedBy: number): void {
    void missedBy; // to avoid tsconfig error
    this.playerScores[lastTouchBy] = this.playerScores[lastTouchBy]! + 1;
    if (this.playerScores[lastTouchBy] >= this.maxScore) {
      // TODO handle game end
    }
    this.sender(this.playerScores);
  }

  getScores(): number[] {
    return this.playerScores;
  }

  isMaxScoreReached(): boolean {
    for (const score of this.playerScores) {
      if (score >= this.maxScore) {
        return true;
      }
    }
    return false;
	}
}
