import type { Court, CourtState, Room } from "schemas";

import { initCourt } from "./court.ts";
import { initCourtState, updateCourtState } from "./court_state.ts";
import { ScoreController } from "./score_controller.ts";
import type { PongPlayerInput } from "schemas";
import { getDirection } from "./player_input.js";
import { vec2 } from "./vector2.js";

export class CourtController {
  private readonly court: Court;
  private scoreController: ScoreController;
  private readonly gameSpeed: number;

  public constructor(room: Room, scoreController: ScoreController) {
    this.scoreController = scoreController;
    this.court = initCourt(room.size, room.gameData.options.paddleRatio);
    this.gameSpeed = room.gameData.options.gameSpeed;
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

  public updateInput(playerIndex: number, playerInput: PongPlayerInput): void {
    console.log("new input", playerIndex, playerInput);
    this.court.state.paddles[playerIndex]!.velocity = getDirection(playerInput);
  }

  public giveUp(playerIndex: number): void {
    this.court.state.paddles[playerIndex] = {
      offsetFromCenter: 0,
      edgeRatio: 1,
      velocity: 0,
    };
  }

  public update(delta: number): void {
    const updateResult = updateCourtState(
      this.getState(),
      this.court.geometry,
      delta * this.gameSpeed,
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
