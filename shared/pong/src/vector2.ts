import { z } from "zod";

import { createDtoTransformable } from "./dto_transformable.js";

const Vector2Dto = z.object({
  x: z.number(),
  y: z.number(),
});

export class Vector2 extends createDtoTransformable(Vector2Dto) {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number) {
    super();
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
    return Math.hypot(this.x, this.y);
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

// const myVecDto = {x: 1, y: 1};
// const myVec = Vector2.fromDTO(myVecDto);
// console.log(myVec);
// console.log(myVec.normalize().toDTO());
