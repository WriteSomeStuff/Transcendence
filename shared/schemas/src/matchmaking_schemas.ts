import { z } from "zod";

import { UserIdSchema } from "./user_schemas.js";
import { PongOptionsSchema } from "./game/pong_schemas.js";

export const RoomPermissionsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("public"),
  }),
  z.object({
    type: z.literal("private"),
    allowedUsers: z.array(UserIdSchema),
  }),
  z.object({
    type: z.literal("tournament"),
    allowedUsers: z.array(UserIdSchema),
    matchId: z.string(),
  }),
]);

export type RoomPermissions = z.infer<typeof RoomPermissionsSchema>;

export const RoomGameDataSchema = z.discriminatedUnion("game", [
  z.object({
    game: z.literal("pong"),
    options: PongOptionsSchema,
  }),
]);

export type RoomGameData = z.infer<typeof RoomGameDataSchema>;

export const RoomSchema = z.object({
  id: z.string(),
  size: z.number().int().min(1),
  joinedUsers: z.array(UserIdSchema),
  permissions: RoomPermissionsSchema,
  gameData: RoomGameDataSchema,
});

export type Room = z.infer<typeof RoomSchema>;

export const MatchmakingMessageSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createRoom"),
    size: z.number().int().min(1),
    permissions: RoomPermissionsSchema.refine((p) => p.type !== "tournament"),
    gameData: RoomGameDataSchema,
  }),
  z.object({
    action: z.literal("joinRoom"),
    roomId: z.string(),
  }),
  z.object({
    action: z.literal("leaveRoom"),
    roomId: z.string(),
  }),
]);

export type MatchmakingMessage = z.infer<typeof MatchmakingMessageSchema>;
