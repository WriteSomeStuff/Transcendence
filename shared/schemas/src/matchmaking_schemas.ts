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
    // allowedUsers: z.array(UserIdSchema),
    // matchId: z.string(),
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

export const TournamentMatchSchema = z.object({
	id: z.string(),
	round: z.number(),
	player1: z.union([UserIdSchema, z.null()]),
	player2: z.union([UserIdSchema, z.null()]),
  	winner: z.union([UserIdSchema, z.null()]),
	nextMatchId: z.union([z.string(), z.null()]),
});

export type TournamentMatch = z.infer<typeof TournamentMatchSchema>;

export const TournamentBracketSchema = z.object({
	matches: z.array(TournamentMatchSchema),
	currentRound: z.number(),
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
	id: z.string(),
	name: z.string().min(1, "Tournament name is required"),
	size: z.enum(["4", "8", "16"]).transform(Number),
	joinedUsers: z.array(UserIdSchema),
	permissions: RoomPermissionsSchema.refine((p) => p.type === "tournament"),
	gameData: RoomGameDataSchema,
	bracket: z.union([TournamentBracketSchema, z.null()]),
});

export type Tournament = z.infer<typeof TournamentSchema>;

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
