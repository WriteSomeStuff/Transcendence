import { ScoreController } from "shooting";

export class ShootingScoreController implements ScoreController {
  private readonly playerScores: number[];
  private readonly maxScore: number;
  private readonly sender: (scores: number[]) => void;

  public constructor(
    playersCount: number,
    maxScore: number,
    sender: (scores: number[]) => void,
  ) {
    this.playerScores = Array.from({ length: playersCount }).map((_) => 0);
    this.maxScore = maxScore;
    this.sender = sender;
  }

  onTargetHit(hitBy: number) {
    this.playerScores[hitBy] = this.playerScores[hitBy]! + 1;
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
