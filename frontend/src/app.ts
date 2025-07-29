import { ViewStateSchema, ViewState, ViewName } from "./views/views.js";
import { renderHomeView } from "./views/home.js";
import { renderLoginView } from "./views/login.js";
import { renderRegisterView } from "./views/register.js";
import { renderProfileView } from "./views/profile.js";
import { renderMatchmakingView } from "./views/matchmaking.js";
import { renderGameView } from "./views/game.js";
import {
  getFallbackGlobalAppState,
  GlobalAppState,
  navigateTo,
} from "./global_app_state.js";

function getViewFromHref(): ViewState | null {
  const url = new URL(window.location.href);
  const view = url.pathname.slice(1) as ViewName;
  const params: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    params[k] = v;
  });
  const result = ViewStateSchema.safeParse({ view, params });
  return result.success ? result.data : null;
}

function getGlobalState(): GlobalAppState {
  const view = getViewFromHref();
  if (view === null) {
    return getFallbackGlobalAppState();
  }
  return navigateTo(view);
}

function toStringRecord<T extends Record<string, any>>(
  obj: T,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = String(value); // Converts to string
    }
  }

  return result;
}

async function renderState(
  state: GlobalAppState,
  app: App,
  push: boolean = true,
) {
  switch (state.viewState?.view) {
    case "home": {
      await renderHomeView(state.viewState, app);
      break;
    }
    case "login": {
      await renderLoginView(state.viewState, app);
      break;
    }
    case "register": {
      await renderRegisterView(state.viewState, app);
      break;
    }
    case "profile": {
      await renderProfileView(state.viewState, app);
      break;
    }
    case "matchmaking": {
      await renderMatchmakingView(state.viewState, app);
      break;
    }
    case "game": {
      await renderGameView(state.viewState, app);
      break;
    }
  }
  if (push) {
    const params = new URLSearchParams(toStringRecord(state.viewState.params));
    const newUrl =
      window.location.protocol +
      "//" +
      window.location.host +
      "/" +
      state.viewState.view +
      (params.size > 0 ? "?" + params.toString() : "");
    window.history.pushState({ path: newUrl }, "", newUrl);
  }
}

class App {
  private state: GlobalAppState;
  public readonly appContainer: HTMLElement;

  constructor() {
    const appContainer = document.getElementById("app-container");
    if (!appContainer) {
      throw new Error("No appContainer found!");
    }
    this.appContainer = appContainer;
    this.state = getGlobalState();
    renderState(this.state, this).then((_) => {});
    window.addEventListener("popstate", () => {
      this.resetView();
    });
  }

  public selectView(view: ViewState): void {
    this.state = navigateTo(view);
    renderState(this.state, this, true).then((_) => {});
  }

  public resetView(): void {
    this.state = getGlobalState();
    renderState(this.state, this).then((_) => {});
  }
}

document.addEventListener("DOMContentLoaded", () => new App());

export type { App };
