import type { Vector2, Court } from "schemas";

import { vec2 } from "./vector2.js";
import {
  getPaddleQuadrilateral,
  getWallQuadrilateral,
} from "./court_geometry.js";

function addQuadrilateral(
  ctx: CanvasRenderingContext2D,
  points: [Vector2, Vector2, Vector2, Vector2],
  translatePoint: (p: Vector2) => Vector2,
) {
  ctx.beginPath();
  ctx.moveTo(...vec2.toTuple(translatePoint(points[0])));
  ctx.lineTo(...vec2.toTuple(translatePoint(points[1])));
  ctx.lineTo(...vec2.toTuple(translatePoint(points[2])));
  ctx.lineTo(...vec2.toTuple(translatePoint(points[3])));
  ctx.closePath();
  ctx.fill();
}

export function render(court: Court, ctx: CanvasRenderingContext2D) {
  ctx.reset();
  ctx.fillStyle = "green";
  const aspectRatio = court.geometry.frameWidth / court.geometry.frameHeight;
  const canvasAspectRatio = ctx.canvas.width / ctx.canvas.height;
  const ratio =
    aspectRatio >= canvasAspectRatio
      ? ctx.canvas.width / court.geometry.frameWidth
      : ctx.canvas.height / court.geometry.frameHeight;
  const translatePoint = (p: Vector2): Vector2 =>
    vec2.create(
      p.x * ratio + ctx.canvas.width / 2,
      p.y * ratio + ctx.canvas.height / 2,
    );
  for (let i = 0; i < court.geometry.playerCount; i++) {
    addQuadrilateral(
      ctx,
      getWallQuadrilateral(court.geometry, i),
      translatePoint,
    );
    addQuadrilateral(
      ctx,
      getPaddleQuadrilateral(court.geometry, i, court.state.paddles[i]!),
      translatePoint,
    );
  }
  const widthRatio = ctx.canvas.width / court.geometry.frameWidth;
  const heightRatio = ctx.canvas.height / court.geometry.frameHeight;
  ctx.beginPath();
  ctx.ellipse(
    ...vec2.toTuple(translatePoint(court.state.ballPosition)),
    court.geometry.ballRadius * widthRatio,
    court.geometry.ballRadius * heightRatio,
    0,
    0,
    2 * Math.PI,
  );
  ctx.fill();
}
