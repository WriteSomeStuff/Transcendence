import type { Vector2, Court } from "schemas";

import { vec2 } from "./vector2.js";
import {
  getPaddleQuadrilateral,
  getWallQuadrilateral,
} from "./court_geometry.js";

function translatePoint(
  court: Court,
  ctx: CanvasRenderingContext2D,
  p: Vector2,
): Vector2 {
  const widthRatio = ctx.canvas.width / court.geometry.frameWidth;
  const heightRatio = ctx.canvas.height / court.geometry.frameHeight;
  return vec2.create(
    p.x * widthRatio + ctx.canvas.width / 2,
    p.y * heightRatio + ctx.canvas.height / 2,
  );
}

function addQuadrilateral(
  court: Court,
  ctx: CanvasRenderingContext2D,
  points: [Vector2, Vector2, Vector2, Vector2],
) {
  ctx.beginPath();
  ctx.moveTo(...vec2.toTuple(translatePoint(court, ctx, points[0])));
  ctx.lineTo(...vec2.toTuple(translatePoint(court, ctx, points[1])));
  ctx.lineTo(...vec2.toTuple(translatePoint(court, ctx, points[2])));
  ctx.lineTo(...vec2.toTuple(translatePoint(court, ctx, points[3])));
  ctx.closePath();
  ctx.fillStyle = "black";
  ctx.fill();
}

export function render(court: Court, ctx: CanvasRenderingContext2D) {
  ctx.reset();
  for (let i = 0; i < court.geometry.playerCount; i++) {
    addQuadrilateral(court, ctx, getWallQuadrilateral(court.geometry, i));
    addQuadrilateral(
      court,
      ctx,
      getPaddleQuadrilateral(court.geometry, i, court.state.paddles[i]!),
    );
  }
  const widthRatio = ctx.canvas.width / court.geometry.frameWidth;
  const heightRatio = ctx.canvas.height / court.geometry.frameHeight;
  ctx.beginPath();
  ctx.ellipse(
    ...vec2.toTuple(translatePoint(court, ctx, court.state.ballPosition)),
    court.geometry.ballRadius * widthRatio,
    court.geometry.ballRadius * heightRatio,
    0,
    0,
    2 * Math.PI,
  );
  ctx.fill();
}
