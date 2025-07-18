export interface ScoreController {
  onBallMissed(lastTouchBy: number, missedBy: number): void;
  getScores(): number[];
}
