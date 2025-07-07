import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(20),
});

export type User = z.infer<typeof UserSchema>;

export const MatchSchema = z.object({
  id: z.string(),
  players: z.array(UserSchema),
  status: z.enum(["playing", "finished"]),
});

export type Match = z.infer<typeof MatchSchema>;
