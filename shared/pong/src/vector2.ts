export class Vector2 {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  public subtract(v: Vector2): Vector2 {
    return this.add(v.negate());
  }

  public dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  public reflect(v: Vector2): Vector2 {
    return this.subtract(v.scale(this.dot(v) * 2));
  }

  public scale(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  public negate(): Vector2 {
    return new Vector2(-this.x, -this.y);
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalize(): Vector2 {
    if (this.length() < 0.000001) {
      return new Vector2(0, 0);
    }
    return this.scale(1 / this.length());
  }

  public toTuple(): [number, number] {
    return [this.x, this.y];
  }

  public static fromAngle(angle: number): Vector2 {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }
}
