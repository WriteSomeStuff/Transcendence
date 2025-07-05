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

export const ProfileViewSchema = z.object({
  view: z.literal("profile"),
  params: z.object({
    userId: z.string().uuid().optional(),
  }),
});

export const GameViewSchema = z.object({
  view: z.literal("game"),
  params: z.object({}),
});

export const ViewStateSchema = z.discriminatedUnion("view", [
  HomeViewSchema,
  LoginViewSchema,
  RegisterViewSchema,
  ProfileViewSchema,
  GameViewSchema,
]);

export type ViewState = z.infer<typeof ViewStateSchema>;
export type ViewName = ViewState["view"];
