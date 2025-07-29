import { z } from "zod";

import { UserIdSchema } from "./user_schemas.js";
import { PongOptionsSchema } from "./game/pong_schemas.js";
import { UsernameSchema } from "./auth_schemas.js";

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
    matchId: z.number(),
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
  size: z.number().int().min(2),
  maxScore: z.number().int().min(1).max(100),
  joinedUsers: z.array(UserIdSchema),
  permissions: RoomPermissionsSchema,
  gameData: RoomGameDataSchema,
});

export type Room = z.infer<typeof RoomSchema>;

export const TournamentMatchRoomSchema = z.object({
  size: z.number().int().min(2),
  maxScore: z.number(),
  permissions: RoomPermissionsSchema.refine((p) => p.type == "tournament"),
  gameData: RoomGameDataSchema,
});

export type TournamentMatchRoom = z.infer<typeof TournamentMatchRoomSchema>;

export const TournamentMatchSchema = z.object({
  id: z.string(),
  databaseId: z.union([z.number(), z.null()]),
  round: z.number(),
  participants: z.array(UserIdSchema),
  winner: z.union([UserIdSchema, z.null()]),
  nextMatchId: z.union([z.string(), z.null()]),
});

export type TournamentMatch = z.infer<typeof TournamentMatchSchema>;

export const TournamentBracketSchema = z.object({
  matches: z.array(TournamentMatchSchema),
  currentRound: z.number(),
  maxScore: z.number(), // extra stuff for room creation
  gameData: RoomGameDataSchema,
});

export type TournamentBracket = z.infer<typeof TournamentBracketSchema>;

/** Use of bracket
 * totalMatches = totalPlayers - 1
 * first match in round index = totalPlayers / 2 * currentRound
 * totalMatchesRound = 2 ^ (totalMatches - 1 - currentRound)
 * so we loop over the matches array and everytime matches[i] finishes we update
 * the array and start the next match
 **/

export const TournamentSchema = z.object({
  id: z.number(),
  name: z.string(),
  size: z.number().refine((n) => [4, 8, 16].includes(n)),
  joinedUsers: z.array(UserIdSchema),
  gameData: RoomGameDataSchema,
  bracket: z.union([TournamentBracketSchema, z.null()]),
});

export type Tournament = z.infer<typeof TournamentSchema>;

export const MatchmakingMessageSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createRoom"),
    size: z.number().int().min(1),
    maxScore: z.number().int().min(1).max(100),
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

export const TournamentCreateMessageSchema = z.object({
  name: z.string(),
  size: z.number().refine((n) => [4, 8, 16].includes(n)),
  maxScore: z.number().int().min(1).max(100),
  participants: z.array(UsernameSchema),
  gameData: RoomGameDataSchema,
});

export type TournamentCreateMessage = z.infer<
  typeof TournamentCreateMessageSchema
>;

export const TournamentMatchCreateMessageSchema = z.object({
  matchId: z.string(), // TODO delete this?
  matchStatus: z.literal("pending"),
  participants: z.array(z.union([UserIdSchema, z.null()])),
  tournamentId: z.number(),
});

export type TournamentMatchCreateMessage = z.infer<
  typeof TournamentMatchCreateMessageSchema
>;
