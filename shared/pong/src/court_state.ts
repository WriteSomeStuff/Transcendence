import type { Vector2, CourtGeometry, CourtState } from "schemas";
import { initPaddle, updatePaddle } from "./paddle_state.js";
import {
  getPlayerLineSurface,
  getPlayerLineNormal,
  getWallNormal,
  getWallSurface,
  getPaddleSurface,
} from "./court_geometry.js";
import { vec2 } from "./vector2.js";

function chooseRandomBallDirection(
  geometry: CourtGeometry,
  ballSpeed: number,
  index: number,
  initialPoint: Vector2,
): Vector2 {
  const [a, b] = getPlayerLineSurface(geometry, index);
  const targetPoint = vec2.add(
    vec2.scale(vec2.subtract(b, a), Math.random()),
    b,
  );
  return vec2.scale(
    vec2.normalize(vec2.subtract(targetPoint, initialPoint)),
    ballSpeed,
  );
}

export function initCourtState(
  geometry: CourtGeometry,
  ballSpeed: number,
  paddleToEdgeRatios: number[],
  initialIndex: number | null = null,
): CourtState {
  if (initialIndex === null || initialIndex === undefined) {
    initialIndex = Math.floor(Math.random() * geometry.playerCount);
  }
  let targetIndex: number = Math.floor(
    Math.random() * (geometry.playerCount - 1),
  );
  if (targetIndex >= initialIndex) {
    targetIndex++;
  }
  const [a, b] = getPlayerLineSurface(geometry, initialIndex);
  const initialPoint = vec2.add(
    vec2.scale(vec2.add(a, b), 0.5),
    vec2.scale(
      getPlayerLineNormal(geometry, initialIndex),
      geometry.ballRadius + geometry.paddleThickness,
    ),
  );
  return {
    ballPosition: initialPoint,
    ballVelocity: chooseRandomBallDirection(
      geometry,
      ballSpeed,
      targetIndex,
      initialPoint,
    ),
    paddles: paddleToEdgeRatios.map((ratio) => initPaddle(ratio)),
    lastBouncedIndex: initialIndex,
  };
}

function doesBounce(
  ballPosition: Vector2,
  ballRadius: number,
  surfaceStart: Vector2,
  surfaceEnd: Vector2,
  normal: Vector2,
): number {
  if (
    vec2.dot(vec2.subtract(ballPosition, surfaceStart), normal) > ballRadius
  ) {
    return Number.POSITIVE_INFINITY;
  }
  if (vec2.dot(vec2.subtract(ballPosition, surfaceStart), normal) < 0) {
    return Number.NEGATIVE_INFINITY;
  }
  const center = vec2.scale(vec2.add(surfaceStart, surfaceEnd), 0.5);
  const length = vec2.length(vec2.subtract(surfaceStart, surfaceEnd));
  if (
    Math.abs(
      vec2.dot(
        vec2.normalize(vec2.subtract(surfaceEnd, center)),
        vec2.subtract(ballPosition, center),
      ),
    ) *
      2 >
    length
  ) {
    return Number.POSITIVE_INFINITY;
  }
  return vec2.dot(vec2.subtract(ballPosition, surfaceStart), normal);
}

// the point of this function is to update the state and return the index of player with whom the ball bounced (to keep track and increment the score) or -1 if no bounce or bounce with a wall
export function updateCourtState(
  state: CourtState,
  geometry: CourtGeometry,
  delta: number,
): CourtState | number {
  state.ballPosition = vec2.add(
    state.ballPosition,
    vec2.scale(state.ballVelocity, delta),
  );
  state.paddles = state.paddles.map(function (paddle) {
    return updatePaddle(paddle, delta);
  });
  // TODO update this whole mess, more clear way to return one of 3/4 different results in enum
  let bouncedPaddleIndex = -1;
  let newDirection = state.ballVelocity;
  let minDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < geometry.playerCount; i++) {
    const [sidelineStart, sidelineEnd] = getWallSurface(geometry, i);
    const sidelineDistance = doesBounce(
      state.ballPosition,
      geometry.ballRadius,
      sidelineStart,
      sidelineEnd,
      getWallNormal(geometry, i),
    );
    if (Number.isFinite(sidelineDistance) && sidelineDistance < minDistance) {
      bouncedPaddleIndex = -1;
      newDirection = vec2.reflect(
        state.ballVelocity,
        getWallNormal(geometry, i),
      );
      minDistance = sidelineDistance;
    } else if (sidelineDistance === Number.NEGATIVE_INFINITY) {
      bouncedPaddleIndex = -1;
      state.ballPosition = vec2.add(
        vec2.add(
          sidelineStart,
          vec2.scale(
            vec2.normalize(vec2.subtract(sidelineEnd, sidelineStart)),
            vec2.dot(
              vec2.subtract(sidelineEnd, sidelineStart),
              vec2.subtract(state.ballPosition, sidelineStart),
            ),
          ),
        ),
        vec2.scale(getWallNormal(geometry, i), geometry.ballRadius),
      );
      newDirection = vec2.reflect(
        state.ballVelocity,
        getWallNormal(geometry, i),
      );
      break;
    }
    const [paddleStart, paddleEnd] = getPaddleSurface(
      geometry,
      i,
      state.paddles[i]!,
    );
    const paddleDistance = doesBounce(
      state.ballPosition,
      geometry.ballRadius,
      paddleStart,
      paddleEnd,
      getPlayerLineNormal(geometry, i),
    );
    if (Number.isFinite(paddleDistance) && paddleDistance < minDistance) {
      bouncedPaddleIndex = i;
      if (vec2.dot(getPlayerLineNormal(geometry, i), state.ballVelocity) < 0) {
        newDirection = vec2.reflect(
          state.ballVelocity,
          getPlayerLineNormal(geometry, i),
        );
      }
      minDistance = paddleDistance;
    }
    if (
      doesBounce(
        state.ballPosition,
        geometry.ballRadius,
        ...getPlayerLineSurface(geometry, i),
        getPlayerLineNormal(geometry, i),
      ) != Number.POSITIVE_INFINITY
    ) {
      return i;
    }
  }
  state.ballVelocity = newDirection;
  if (bouncedPaddleIndex !== -1) {
    state.lastBouncedIndex = bouncedPaddleIndex;
  }
  return state;
}
