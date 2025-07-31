import type { ShootingCanvas } from "schemas";

export function render(
  shootingCanvas: ShootingCanvas,
  ctx: CanvasRenderingContext2D,
) {
  ctx.reset();
  if (shootingCanvas.target === null) {
    return;
  }
  ctx.fillStyle = "red";
  const aspectRatio = shootingCanvas.width / shootingCanvas.height;
  const canvasAspectRatio = ctx.canvas.width / ctx.canvas.height;
  const ratio =
    aspectRatio >= canvasAspectRatio
      ? ctx.canvas.width / shootingCanvas.width
      : ctx.canvas.height / shootingCanvas.height;
  const translatePoint = (x: number, y: number): [number, number] => [
    (x - shootingCanvas.width / 2) * ratio + ctx.canvas.width / 2,
    (y - shootingCanvas.height / 2) * ratio + ctx.canvas.height / 2,
  ];
  ctx.beginPath();
  ctx.ellipse(
    ...translatePoint(shootingCanvas.target.x, shootingCanvas.target.y),
    shootingCanvas.target.radius * ratio,
    shootingCanvas.target.radius * ratio,
    0,
    0,
    2 * Math.PI,
  );
  ctx.fill();
}
