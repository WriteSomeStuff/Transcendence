import { z } from "zod";

export const UserIdSchema = z.number().int();

export type UserId = z.infer<typeof UserIdSchema>;

export const UserSchema = z.object({
  id: UserIdSchema,
  username: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const FriendSchema = z.object({
  friendshipId: z.number(),
  userId: z.number(),
  username: z.string(),
  accountStatus: z.string(),
  onlineStatus: z.string(),
});

export type Friend = z.infer<typeof FriendSchema>;

export const FriendListResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(FriendSchema),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

export type FriendListResponse = z.infer<typeof FriendListResponseSchema>;

export const FriendshipSchema = z.object({
  friendshipId: z.number(),
  userId: z.number(),
  usernameSender: z.string(),
  friendId: z.number(),
  accepted: z.boolean(),
});

export type Friendship = z.infer<typeof FriendshipSchema>;

export const FriendRequestListResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(FriendshipSchema),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

export const HistorySchema = z.object({
  date: z.coerce.date(),
  userScore: z.number(),
  opponentInfo: z.array(
    z.object({
      opponentId: z.number(),
      opponentScore: z.number(),
    }),
  ),
});

export const HistoryResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.array(HistorySchema),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

export type MatchHistory = z.infer<typeof HistorySchema>;

export const TournamentCreateResponseSchema = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    tournamentId: z.number(),
  }),
  z.object({
    success: z.literal(false),
    error: z.string(),
  }),
]);

export type TournamentCreateResponse = z.infer<
  typeof TournamentCreateResponseSchema
>;

export const TournamentMatchCreateResponseSchema = z.discriminatedUnion(
  "success",
  [
    z.object({
      success: z.literal(true),
      dbMatchId: z.number(),
    }),
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  ],
);

export type TournamentMatchCreateResponse = z.infer<
  typeof TournamentMatchCreateResponseSchema
>;
