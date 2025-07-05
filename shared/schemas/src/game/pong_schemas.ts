import { z } from "zod";

export const Vector2Schema = z.object({
  x: z.number(),
  y: z.number(),
});

export type Vector2 = z.infer<typeof Vector2Schema>;

export const CourtStateSchema = z.object({
  ballPosition: Vector2Schema,
  ballVelocity: Vector2Schema,
  paddles: z.array(z.any()),
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
});

export type CourtGeometry = z.infer<typeof CourtGeometrySchema>;

export const CourtSchema = z.object({
  geometry: CourtGeometrySchema,
  state: CourtStateSchema,
});

export type Court = z.infer<typeof CourtSchema>;
