import { z } from "zod";

import { CourtSchema, PongPlayerInputSchema } from "./game/pong_schemas.js";
import {
  ShootingCanvasSchema,
  ShootingPlayerInputSchema,
} from "./game/shooting_schemas.js";

export const GameInputMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("pongInputUpdate"),
    payload: PongPlayerInputSchema,
  }),
  z.object({
    type: z.literal("shootingPlayerInput"),
    payload: ShootingPlayerInputSchema,
  }),
  z.object({
    type: z.literal("giveUp"),
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
  z.object({
    type: z.literal("shootingInit"),
    payload: ShootingCanvasSchema,
  }),
  z.object({
    type: z.literal("shootingUpdate"),
    payload: ShootingCanvasSchema,
  }),
  z.object({
    type: z.literal("scoresUpdate"),
    payload: z.array(z.number().int()),
  }),
  z.object({
    type: z.literal("gameEnded"),
    matchId: z.number().int(), // TODO actually have the match id from the database
  }),
]);

export type GameUpdateMessage = z.infer<typeof GameUpdateMessageSchema>;

export const MatchResultSchema = z.object({
  participants: z.array(
    z.object({
      userId: z.number().int(),
      score: z.number().int(),
    }),
  ),
  start: z.coerce.date(),
  end: z.coerce.date(),
  matchId: z.number().optional(),
});

export type MatchResult = z.infer<typeof MatchResultSchema>;
