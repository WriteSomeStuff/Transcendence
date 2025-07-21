import type { Vector2 } from "schemas";

export const vec2 = {
  create: (x: number, y: number): Vector2 => {
    return {
      x: x,
      y: y,
    };
  },
  add: (a: Vector2, b: Vector2): Vector2 => {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
    };
  },
  subtract: (a: Vector2, b: Vector2): Vector2 => {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
    };
  },
  dot: (a: Vector2, b: Vector2): number => {
    return a.x * b.x + a.y * b.y;
  },
  reflect: (a: Vector2, b: Vector2): Vector2 => {
    return vec2.subtract(a, vec2.scale(b, vec2.dot(a, b) * 2));
  },
  scale: (a: Vector2, k: number): Vector2 => {
    return {
      x: a.x * k,
      y: a.y * k,
    };
  },
  negate: (a: Vector2): Vector2 => {
    return vec2.scale(a, -1);
  },
  length: (a: Vector2): number => {
    return Math.hypot(a.x, a.y);
  },
  normalize: (a: Vector2): Vector2 => {
    if (vec2.length(a) < 0.000001) {
      return vec2.create(0, 0);
    }
    return vec2.scale(a, 1 / vec2.length(a));
  },
  toTuple: (a: Vector2): [number, number] => {
    return [a.x, a.y];
  },
  fromAngle: (angle: number): Vector2 => {
    return vec2.create(Math.cos(angle), Math.cos(angle));
  },
};
