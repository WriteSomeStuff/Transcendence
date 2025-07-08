import type { Court, CourtState } from "schemas";

import { initCourt } from "./court.ts";
import { initCourtState, updateCourtState } from "./court_state.ts";
import { PlayerInput } from "./player_input.ts";
import { ScoreController } from "./score_controller.ts";
import { vec2 } from "./vector2.js";

export class CourtController {
  private readonly court: Court;
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
    const updateResult = updateCourtState(
      this.getState(),
      this.court.geometry,
      delta,
    );
    if (typeof updateResult === "number") {
      this.scoreController.onBallMissed(
        this.court.state.lastBouncedIndex,
        updateResult,
      );
      this.court.state = initCourtState(
        this.court.geometry,
        vec2.length(this.court.state.ballVelocity),
        this.court.state.paddles.map((paddle) => paddle.edgeRatio),
        updateResult,
      );
    } else {
      this.court.state = updateResult;
    }
  }
}
