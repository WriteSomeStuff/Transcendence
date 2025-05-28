import {CourtValues} from "./court_values.ts";
import {Vector2} from "./vector2.ts";

export class Court {
  private readonly values: CourtValues;
  private paddleOffsets: number[];

  constructor() {
    this.values = new CourtValues(2, 200, 100, 5, 20, 4);
    this.paddleOffsets = [0, 0];
  }

  private translatePoint(ctx: CanvasRenderingContext2D, p: Vector2): Vector2 {
    const widthRatio = ctx.canvas.width / this.values.width;
    const heightRatio = ctx.canvas.height / this.values.height;
    return new Vector2(p.x * widthRatio + ctx.canvas.width / 2, p.y * heightRatio + ctx.canvas.height / 2);
  }

  private addQuadrilateral(ctx: CanvasRenderingContext2D, points: Vector2[]) {
    console.log(points[0], points[1], points[2], points[3]);
    ctx.beginPath();
    ctx.moveTo(...this.translatePoint(ctx, points[0]).toTuple());
    ctx.lineTo(...this.translatePoint(ctx, points[1]).toTuple());
    ctx.lineTo(...this.translatePoint(ctx, points[2]).toTuple());
    ctx.lineTo(...this.translatePoint(ctx, points[3]).toTuple());
    ctx.closePath();
    ctx.fillStyle = "black";
    ctx.fill();
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < 2; i++) {
      this.addQuadrilateral(ctx, this.values.getSidelineQuadrilateral(i));
      this.addQuadrilateral(ctx, this.values.getBaselinePaddleQuadrilateral(i, this.paddleOffsets[i], 0.1));
    }
  }
}
