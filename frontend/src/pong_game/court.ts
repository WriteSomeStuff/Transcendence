import {CourtValues} from "./court_values.ts";
import {Vector2} from "./vector2.ts";

export class Court {
  private readonly playersCount: number;
  private readonly values: CourtValues;
  private paddleOffsets: number[];
  private ballPosition: Vector2;
  private ballDirection: Vector2;

  private chooseRandomDirection(): Vector2 {
    const chosenBaseline = Math.floor(Math.random() * this.playersCount);
    const [a, b] = this.values.getBaselineSurface(chosenBaseline);
    return b.subtract(a).multiply(Math.random()).add(b).normalize();
  }

  private reset() {
    this.paddleOffsets = [];
    for (let i = 0; i < this.playersCount; i++) {
      this.paddleOffsets.push(0);
    }
    this.ballPosition = new Vector2(0, 0);
    this.ballDirection = this.chooseRandomDirection();
  }

  constructor(playersCount: number = 2) {
    this.playersCount = playersCount;
    this.values = new CourtValues(this.playersCount, 100, 100, 5, 20, 4);
    this.paddleOffsets = [];
    for (let i = 0; i < this.playersCount; i++) {
      this.paddleOffsets.push(0);
    }
    this.ballPosition = new Vector2(0, 0);
    this.ballDirection = this.chooseRandomDirection();
  }

  private translatePoint(ctx: CanvasRenderingContext2D, p: Vector2): Vector2 {
    const widthRatio = ctx.canvas.width / this.values.width;
    const heightRatio = ctx.canvas.height / this.values.height;
    return new Vector2(p.x * widthRatio + ctx.canvas.width / 2, p.y * heightRatio + ctx.canvas.height / 2);
  }

  private addQuadrilateral(ctx: CanvasRenderingContext2D, points: Vector2[]) {
    ctx.beginPath();
    ctx.moveTo(...this.translatePoint(ctx, points[0]).toTuple());
    ctx.lineTo(...this.translatePoint(ctx, points[1]).toTuple());
    ctx.lineTo(...this.translatePoint(ctx, points[2]).toTuple());
    ctx.lineTo(...this.translatePoint(ctx, points[3]).toTuple());
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.fill();
  }
  
  private doesBounce(surfaceStart: Vector2, surfaceEnd: Vector2, normal: Vector2): number {
    if (this.ballPosition.subtract(surfaceStart).dot(normal) > this.values.ballRadius) {
      return Number.POSITIVE_INFINITY;
    }
    const center = surfaceStart.add(surfaceEnd).multiply(0.5);
    const length = surfaceStart.subtract(surfaceEnd).length();
    if (Math.abs(surfaceEnd.subtract(center).normalize().dot(this.ballPosition.subtract(center))) * 2 > length) {
      return Number.POSITIVE_INFINITY;
    }
    return this.ballPosition.subtract(surfaceStart).dot(normal);
  }

  public update(delta: number, paddleMovements: (-1 | 0 | 1)[]) {
    this.ballPosition = this.ballPosition.add(this.ballDirection.multiply(delta));
    for (let i = 0; i < this.playersCount; i++) {
      this.paddleOffsets[i] += paddleMovements[i] * delta;
      this.paddleOffsets[i] = Math.min(Math.max(this.paddleOffsets[i], -1), 1);
    }
    let bouncedPaddleIndex = -1;
    let newDirection = this.ballDirection;
    let minDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.playersCount; i++) {
      const [sidelineStart, sidelineEnd] = this.values.getSidelineSurface(i);
      const sidelineDistance = this.doesBounce(sidelineStart, sidelineEnd, this.values.getSidelineNormal(i));
      if (sidelineDistance < minDistance) {
        bouncedPaddleIndex = -1;
        newDirection = this.ballDirection.reflect(this.values.getSidelineNormal(i));
        minDistance = sidelineDistance;
      }
      const [paddleStart, paddleEnd] = this.values.getPaddleSurface(i, this.paddleOffsets[i], 0.4);
      const paddleDistance = this.doesBounce(paddleStart, paddleEnd, this.values.getBaselineNormal(i));
      if (paddleDistance < minDistance) {
        bouncedPaddleIndex = i;
        newDirection = this.ballDirection.reflect(this.values.getBaselineNormal(i));
        minDistance = paddleDistance;
      }
      if (this.doesBounce(...this.values.getBaselineSurface(i), this.values.getBaselineNormal(i)) != Number.POSITIVE_INFINITY) {
        this.reset();
        return -1;
      }
    }
    this.ballDirection = newDirection;
    return bouncedPaddleIndex;
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.reset();
    for (let i = 0; i < this.playersCount; i++) {
      this.addQuadrilateral(ctx, this.values.getSidelineQuadrilateral(i));
      this.addQuadrilateral(ctx, this.values.getBaselinePaddleQuadrilateral(i, this.paddleOffsets[i], 0.4));
    }
    const widthRatio = ctx.canvas.width / this.values.width;
    const heightRatio = ctx.canvas.height / this.values.height;
    ctx.beginPath();
    ctx.ellipse(...this.translatePoint(ctx, this.ballPosition).toTuple(),
      this.values.ballRadius * widthRatio, this.values.ballRadius * heightRatio,
      0, 0, 2 * Math.PI);
    ctx.fill();
  }
}
