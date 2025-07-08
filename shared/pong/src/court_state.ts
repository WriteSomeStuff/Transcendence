import { z } from "zod";

import { createDtoTransformable } from "./dto_transformable.js";

import { Vector2 } from "./vector2.ts";
import { PaddleState, initPaddle, updatePaddle } from "./paddle_state.ts";
import { CourtGeometry } from "./court_geometry.ts";

const CourtStateDto = z.object({
  ballPosition: Vector2.getSchema(),
  ballVelocity: Vector2.getSchema(),
  paddles: z.array(z.any()),
});

function chooseRandomBallDirection(
  geometry: CourtGeometry,
  ballSpeed: number,
): Vector2 {
  const index = Math.floor(Math.random() * geometry.playerCount);
  const [a, b] = geometry.getPlayerLineSurface(index);
  return b.subtract(a).scale(Math.random()).add(b).normalize().scale(ballSpeed);
}

export class CourtState extends createDtoTransformable(CourtStateDto) {
  ballPosition: Vector2;
  ballVelocity: Vector2;
  paddles: PaddleState[];

  constructor(
    geometry: CourtGeometry,
    ballSpeed: number,
    paddleToEdgeRatios: number[],
  ) {
    super();
    this.ballPosition = new Vector2(0, 0);
    this.ballVelocity = chooseRandomBallDirection(geometry, ballSpeed);
    this.paddles = paddleToEdgeRatios.map((ratio) => initPaddle(ratio));
  }
}

function doesBounce(
  ballPosition: Vector2,
  ballRadius: number,
  surfaceStart: Vector2,
  surfaceEnd: Vector2,
  normal: Vector2,
): number {
  if (ballPosition.subtract(surfaceStart).dot(normal) > ballRadius) {
    return Number.POSITIVE_INFINITY;
  }
  const center = surfaceStart.add(surfaceEnd).scale(0.5);
  const length = surfaceStart.subtract(surfaceEnd).length();
  if (
    Math.abs(
      surfaceEnd
        .subtract(center)
        .normalize()
        .dot(ballPosition.subtract(center)),
    ) *
      2 >
    length
  ) {
    return Number.POSITIVE_INFINITY;
  }
  return ballPosition.subtract(surfaceStart).dot(normal);
}

// the point of this function is to update the state and return the index of player with whom the ball bounced (to keep track and increment the score) or -1 if no bounce or bounce with a wall
export function updateCourtState(
  state: CourtState,
  geometry: CourtGeometry,
  delta: number,
): [number, CourtState] {
  state.ballPosition = state.ballPosition.add(state.ballVelocity.scale(delta));
  state.paddles = state.paddles.map(function (paddle) {
    return updatePaddle(paddle, delta);
  });
  // TODO update this whole mess, more clear way to return one of 3/4 different results in enum
  let bouncedPaddleIndex = -1;
  let newDirection = state.ballVelocity;
  let minDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < geometry.playerCount; i++) {
    const [sidelineStart, sidelineEnd] = geometry.getWallSurface(i);
    const sidelineDistance = doesBounce(
      state.ballPosition,
      geometry.ballRadius,
      sidelineStart,
      sidelineEnd,
      geometry.getWallNormal(i),
    );
    if (sidelineDistance < minDistance) {
      bouncedPaddleIndex = -1;
      newDirection = state.ballVelocity.reflect(geometry.getWallNormal(i));
      minDistance = sidelineDistance;
    }
    const [paddleStart, paddleEnd] = geometry.getPaddleSurface(
      i,
      state.paddles[i]!,
    );
    const paddleDistance = doesBounce(
      state.ballPosition,
      geometry.ballRadius,
      paddleStart,
      paddleEnd,
      geometry.getPlayerLineNormal(i),
    );
    if (paddleDistance < minDistance) {
      bouncedPaddleIndex = i;
      newDirection = state.ballVelocity.reflect(
        geometry.getPlayerLineNormal(i),
      );
      minDistance = paddleDistance;
    }
    if (
      doesBounce(
        state.ballPosition,
        geometry.ballRadius,
        ...geometry.getPlayerLineSurface(i),
        geometry.getPlayerLineNormal(i),
      ) != Number.POSITIVE_INFINITY
    ) {
      state = new CourtState(
        geometry,
        state.ballVelocity.length(),
        state.paddles.map((paddle) => paddle.edgeRatio),
      );
      return [i, state];
    }
  }
  state.ballVelocity = newDirection;
  return [bouncedPaddleIndex, state];
}
