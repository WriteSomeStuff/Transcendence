import { z } from "zod";

import { CourtSchema, PongPlayerInputSchema } from "./game/pong_schemas.js";

export const GameInputMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("pongInputUpdate"),
    payload: PongPlayerInputSchema,
  }),
]);

export type GameInputMessage = z.infer<typeof GameInputMessageSchema>;

export const GameUpdateMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("pongInit"),
    payload: CourtSchema,
  }),
  z.object({
    type: z.literal("pongUpdate"),
    payload: CourtSchema,
  }),
]);

export type GameUpdateMessage = z.infer<typeof GameUpdateMessageSchema>;
