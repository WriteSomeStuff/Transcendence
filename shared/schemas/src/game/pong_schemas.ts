import { z } from "zod";

export const PongOptionsSchema = z.object({
  paddleRatio: z.number().min(0.1).max(0.5).default(0.4),
  gameSpeed: z.number().min(0.5).max(2).default(1),
});

export type PongOptions = z.infer<typeof PongOptionsSchema>;

export const Vector2Schema = z.object({
  x: z.number(),
  y: z.number(),
});

export type Vector2 = z.infer<typeof Vector2Schema>;

export const PaddleStateSchema = z.object({
  offsetFromCenter: z.number().min(-1).max(1),
  edgeRatio: z.number().min(0.1).max(0.5).default(0.4),
  velocity: z.number().default(0),
});

export type PaddleState = z.infer<typeof PaddleStateSchema>;

export const CourtStateSchema = z.object({
  ballPosition: Vector2Schema,
  ballVelocity: Vector2Schema,
  paddles: z.array(PaddleStateSchema),
  lastBouncedIndex: z.number().int().min(0),
});

export type CourtState = z.infer<typeof CourtStateSchema>;

export const CourtGeometrySchema = z.object({
  playerCount: z.number().int().min(2),
  playerZoneDepth: z.number(),
  wallZoneDepth: z.number(),
  ballRadius: z.number(),
  paddleThickness: z.number(),
  wallThickness: z.number(),

  vertices: z.array(Vector2Schema),
  normals: z.array(Vector2Schema),
  renderEdgeAngle: z.number(),
  frameWidth: z.number(),
  frameHeight: z.number(),
});

export type CourtGeometry = z.infer<typeof CourtGeometrySchema>;

export const CourtSchema = z.object({
  geometry: CourtGeometrySchema,
  state: CourtStateSchema,
});

export type Court = z.infer<typeof CourtSchema>;

export const PongPlayerInputSchema = z.object({
  upPressed: z.boolean().default(false),
  downPressed: z.boolean().default(false),
});

export type PongPlayerInput = z.infer<typeof PongPlayerInputSchema>;
