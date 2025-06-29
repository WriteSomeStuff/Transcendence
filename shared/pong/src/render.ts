import { Court } from "./court.ts";
import { Vector2 } from "./vector2.ts";

function translatePoint(
  court: Court,
  ctx: CanvasRenderingContext2D,
  p: Vector2,
): Vector2 {
  const widthRatio = ctx.canvas.width / court.geometry.frameWidth;
  const heightRatio = ctx.canvas.height / court.geometry.frameHeight;
  return new Vector2(
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
  ctx.moveTo(...translatePoint(court, ctx, points[0]).toTuple());
  ctx.lineTo(...translatePoint(court, ctx, points[1]).toTuple());
  ctx.lineTo(...translatePoint(court, ctx, points[2]).toTuple());
  ctx.lineTo(...translatePoint(court, ctx, points[3]).toTuple());
  ctx.closePath();
  ctx.fillStyle = "black";
  ctx.fill();
}

export function render(court: Court, ctx: CanvasRenderingContext2D) {
  ctx.reset();
  for (let i = 0; i < court.geometry.playerCount; i++) {
    addQuadrilateral(court, ctx, court.geometry.getWallQuadrilateral(i));
    addQuadrilateral(
      court,
      ctx,
      court.geometry.getPaddleQuadrilateral(i, court.state.paddles[i]!),
    );
  }
  const widthRatio = ctx.canvas.width / court.geometry.frameWidth;
  const heightRatio = ctx.canvas.height / court.geometry.frameHeight;
  ctx.beginPath();
  ctx.ellipse(
    ...translatePoint(court, ctx, court.state.ballPosition).toTuple(),
    court.geometry.ballRadius * widthRatio,
    court.geometry.ballRadius * heightRatio,
    0,
    0,
    2 * Math.PI,
  );
  ctx.fill();
}
