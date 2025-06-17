import { Vector2 } from "./vector2.ts";
import { PaddleState, initPaddle, updatePaddle } from "./paddle_state.js";
import { CourtGeometry } from "./court_geometry.js";

export interface CourtState {
  ballPosition: Vector2;
  ballVelocity: Vector2;
  paddles: PaddleState[];
}

function chooseRandomBallDirection(
  geometry: CourtGeometry,
  ballSpeed: number,
): Vector2 {
  const index = Math.floor(Math.random() * geometry.size);
  const [a, b] = geometry.getBaselineSurface(index);
  return b.subtract(a).scale(Math.random()).add(b).normalize().scale(ballSpeed);
}

export function initCourtState(
  geometry: CourtGeometry,
  ballSpeed: number,
  paddleToEdgeRatios: number[],
): CourtState {
  return {
    ballPosition: new Vector2(0, 0),
    ballVelocity: chooseRandomBallDirection(geometry, ballSpeed),
    paddles: paddleToEdgeRatios.map((ratio) => initPaddle(ratio)),
  };
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
  for (let i = 0; i < geometry.size; i++) {
    const [sidelineStart, sidelineEnd] = geometry.getSidelineSurface(i);
    const sidelineDistance = doesBounce(
      state.ballPosition,
      geometry.ballRadius,
      sidelineStart,
      sidelineEnd,
      geometry.getSidelineNormal(i),
    );
    if (sidelineDistance < minDistance) {
      bouncedPaddleIndex = -1;
      newDirection = state.ballVelocity.reflect(geometry.getSidelineNormal(i));
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
      geometry.getBaselineNormal(i),
    );
    if (paddleDistance < minDistance) {
      bouncedPaddleIndex = i;
      newDirection = state.ballVelocity.reflect(geometry.getBaselineNormal(i));
      minDistance = paddleDistance;
    }
    if (
      doesBounce(
        state.ballPosition,
        geometry.ballRadius,
        ...geometry.getBaselineSurface(i),
        geometry.getBaselineNormal(i),
      ) != Number.POSITIVE_INFINITY
    ) {
      state = initCourtState(
        geometry,
        state.ballVelocity.length(),
        state.paddles.map((paddle) => paddle.edgeRatio),
      );
      return [-1, state];
    }
  }
  state.ballVelocity = newDirection;
  return [bouncedPaddleIndex, state];
}
