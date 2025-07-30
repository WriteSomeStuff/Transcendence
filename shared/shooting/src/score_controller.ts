export interface ScoreController {
  onTargetHit(hitBy: number): void;
  getScores(): number[];
  isMaxScoreReached(): boolean;
}
