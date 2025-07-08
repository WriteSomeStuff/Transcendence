export interface ScoreController {
  onBallMissed(lastTouchBy: number | null, missedBy: number): void;
}
