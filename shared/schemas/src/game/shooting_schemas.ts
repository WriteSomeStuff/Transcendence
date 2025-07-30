import { z } from "zod";

export const ShootingOptionsSchema = z.object({
  targetsDisappear: z.boolean().default(false),
  gameSpeed: z.number().min(0.5).max(2).default(1),
});

export type ShootingOptions = z.infer<typeof ShootingOptionsSchema>;

export const ShootingTargetSchema = z.object({
  radius: z.number(),
  x: z.number(),
  y: z.number(),
});

export type ShootingTarget = z.infer<typeof ShootingOptionsSchema>;

export const ShootingCanvasSchema = z.object({
  width: z.number(),
  height: z.number(),
  target: z.union([ShootingTargetSchema, z.null()]),
});

export type ShootingCanvas = z.infer<typeof ShootingCanvasSchema>;

export const ShootingPlayerInputSchema = z.object({
  shootX: z.number(),
  shootY: z.number(),
});

export type ShootingPlayerInput = z.infer<typeof ShootingPlayerInputSchema>;
