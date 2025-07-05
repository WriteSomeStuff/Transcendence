import { z } from "zod";

export const FriendSchema = z.object({
  friendshipId: z.number(),
  userId: z.number(),
  username: z.string(),
  accountStatus: z.string(),
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
