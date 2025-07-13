import type { PongPlayerInput } from "schemas";

export function getDirection(input: PongPlayerInput): number {
  return Number(input.upPressed) - Number(input.downPressed);
}
