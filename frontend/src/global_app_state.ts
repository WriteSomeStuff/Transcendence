import { z } from "zod";

import { UserSchema, MatchSchema } from "./schemas.js";
import { ViewStateSchema, ViewName, ViewState } from "./views/views.js";

const NotLoggedInViews: ViewName[] = ["home", "login", "register"];
const LoggedInViews: ViewName[] = ["dashboard", "profile", "friends", "leaderboard"];
const InGameViews: ViewName[] = ["game"];

const DefaultViews: Record<GlobalAppStatus, ViewState> = {
  NotLoggedIn: { view: "home", params: {} },
  LoggedIn: { view: "dashboard", params: {} },
  InGame: { view: "game", params: {} },
};

export const GlobalAppStateSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("NotLoggedIn"),
    viewState: ViewStateSchema.refine(v => NotLoggedInViews.includes(v.view), {
      message: "Not allowed in NotLoggedIn status",
    }),
  }),
  z.object({
    status: z.literal("LoggedIn"),
    user: UserSchema,
    viewState: ViewStateSchema.refine(v => LoggedInViews.includes(v.view), {
      message: "Not allowed in LoggedIn status",
    }),
  }),
  z.object({
    status: z.literal("InGame"),
    user: UserSchema,
    match: MatchSchema,
    viewState: ViewStateSchema.refine(v => InGameViews.includes(v.view), {
      message: "Not allowed in InGame status",
    }),
  }),
]);

export type GlobalAppState = z.infer<typeof GlobalAppStateSchema>;
export type GlobalAppStatus = GlobalAppState["status"];

export function getFallbackGlobalAppState(): GlobalAppState {
  if (document.cookie.includes("jwt")) {
    return {
      status: "LoggedIn",
      user: {
        id: document.cookie, // stub
        username: document.cookie,
      },
      viewState: DefaultViews["LoggedIn"],
    }
  } else {
    return {
      status: "NotLoggedIn",
      viewState: DefaultViews["NotLoggedIn"],
    }
  }
}

export function navigateTo(target: ViewState): GlobalAppState {
  const state: GlobalAppState = getFallbackGlobalAppState();
  const allowedViews = {
    NotLoggedIn: NotLoggedInViews,
    LoggedIn: LoggedInViews,
    InGame: InGameViews,
  }[state.status];

  if (!allowedViews.includes(target.view)) {
    return state;
  }
  return { ...state, viewState: target } as GlobalAppState;
}
