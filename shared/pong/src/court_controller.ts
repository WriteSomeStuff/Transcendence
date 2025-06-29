import { Court, initCourt } from "./court.ts";
import { CourtState, updateCourtState } from "./court_state.ts";
import { PlayerInput } from "./player_input.ts";
import { ScoreController } from "./score_controller.ts";

export class CourtController {
  private readonly court: Court;
  private lastTouch: number | null = null;
  private scoreController: ScoreController;

  public constructor(scoreController: ScoreController) {
    this.scoreController = scoreController;
    this.court = initCourt(2);
  }

  public getCourt(): Court {
    return this.court;
  }

  public getState(): CourtState {
    return this.court.state;
  }

  public syncState(state: CourtState) {
    this.court.state = state;
  }

  public updateInput(playerIndex: number, playerInput: PlayerInput): void {
    console.log("new input", playerIndex, playerInput);
    this.court.state.paddles[playerIndex]!.velocity =
      playerInput.getDirection();
  }

  public update(delta: number): void {
    const [bouncedIndex, state] = updateCourtState(
      this.getState(),
      this.court.geometry,
      delta,
    );
    this.court.state = state;
    if (this.court.state.ballPosition.length() === 0) {
      // the court was reset
      this.scoreController.onBallMissed(this.lastTouch, bouncedIndex);
    } else if (bouncedIndex != -1) {
      this.lastTouch = bouncedIndex;
    }
  }
}
