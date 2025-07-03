import { z } from "zod";

export const HomeViewSchema = z.object({
  view: z.literal("home"),
  params: z.object({}),
});

export const LoginViewSchema = z.object({
  view: z.literal("login"),
  params: z.object({}),
});

export const RegisterViewSchema = z.object({
  view: z.literal("register"),
  params: z.object({}),
});

export const DashboardViewSchema = z.object({
  view: z.literal("dashboard"),
  params: z.object({}),
});

export const FriendsViewSchema = z.object({
  view: z.literal("friends"),
  params: z.object({
    friendId: z.string().uuid().optional(),
  }),
});

export const ProfileViewSchema = z.object({
  view: z.literal("profile"),
  params: z.object({
    userId: z.string().uuid().optional(),
  }),
});

export const LeaderboardViewSchema = z.object({
  view: z.literal("leaderboard"),
  params: z.object({
    page: z.coerce.number().optional(),
    region: z.string().optional(),
  }),
});

export const GameViewSchema = z.object({
  view: z.literal("game"),
  params: z.object({}),
});

// Discriminated union on "view"
export const ViewStateSchema = z.discriminatedUnion("view", [
  HomeViewSchema,
  LoginViewSchema,
  RegisterViewSchema,
  DashboardViewSchema,
  FriendsViewSchema,
  ProfileViewSchema,
  LeaderboardViewSchema,
  GameViewSchema,
]);

export type ViewState = z.infer<typeof ViewStateSchema>;
export type ViewName = ViewState["view"];
