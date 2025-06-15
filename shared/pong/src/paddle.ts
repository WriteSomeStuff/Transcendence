import { Vector2 } from "./vector2.ts";

export class Paddle {
  private offsetFromCenter = 0; // from -1 to 1, relative
  private edgePercentSize: number; // for bigger or smaller paddles
  // @ts-ignore
  private direction: -1 | 0 | 1 = 0;
  private velocity = 0;

  public constructor(edgePercentSize: number = 10) {
    this.edgePercentSize = edgePercentSize;
  }

  public updateMovement(direction: -1 | 0 | 1) {
    this.direction = direction;
    this.velocity = direction; // potentially improve velocity logic
  }

  public getBounds(edgeStart: Vector2, edgeEnd: Vector2): [Vector2, Vector2] {
    const offset = (this.offsetFromCenter + 1) * 0.5;
    const edge = edgeEnd.subtract(edgeStart);
    const paddlePosition = edgeStart.add(edge.multiply(offset));
    return [paddlePosition.subtract(edge.multiply(this.edgePercentSize * 0.5)), paddlePosition.add(edge.multiply(this.edgePercentSize * 0.5))];
  }

  update(deltaTime: number): void {
    this.offsetFromCenter += this.velocity * deltaTime;
    this.offsetFromCenter = Math.max(-1, Math.min(this.offsetFromCenter, 1));
  }
}
