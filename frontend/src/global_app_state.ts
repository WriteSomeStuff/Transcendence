import { z } from "zod";

import { ViewStateSchema, ViewName, ViewState } from "./views/views.js";

const NotLoggedInViews: ViewName[] = ["home", "login", "register"];
const LoggedInViews: ViewName[] = ["profile", "matchmaking"];
const InGameViews: ViewName[] = ["game"];

const DefaultViews: Record<GlobalAppStatus, ViewState> = {
  NotLoggedIn: { view: "home", params: {} },
  LoggedIn: { view: "profile", params: {} },
  InGame: { view: "game", params: {} },
};

export const GlobalAppStateSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("NotLoggedIn"),
    viewState: ViewStateSchema.refine(
      (v) => NotLoggedInViews.includes(v.view),
      {
        message: "Not allowed in NotLoggedIn status",
      },
    ),
  }),
  z.object({
    status: z.literal("LoggedIn"),
    viewState: ViewStateSchema.refine((v) => LoggedInViews.includes(v.view), {
      message: "Not allowed in LoggedIn status",
    }),
  }),
  z.object({
    status: z.literal("InGame"),
    viewState: ViewStateSchema.refine((v) => InGameViews.includes(v.view), {
      message: "Not allowed in InGame status",
    }),
  }),
]);

export type GlobalAppState = z.infer<typeof GlobalAppStateSchema>;
export type GlobalAppStatus = GlobalAppState["status"];

export function getFallbackGlobalAppState(): GlobalAppState {
  if (document.cookie.includes("logged_in=")) {
    if (localStorage.getItem("gameId") !== null) {
      return {
        status: "InGame",
        viewState: DefaultViews["InGame"],
      };
    }
    return {
      status: "LoggedIn",
      viewState: DefaultViews["LoggedIn"],
    };
  } else {
    return {
      status: "NotLoggedIn",
      viewState: DefaultViews["NotLoggedIn"],
    };
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
