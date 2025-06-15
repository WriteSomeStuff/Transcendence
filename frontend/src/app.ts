import type { AppState } from "./app_state.ts";

// import { AuthState } from "./auth_state.ts";
// import { DashboardState } from "./dashboard_state.ts";
import { GameState } from "./game_state.ts";

class App {
  // private readonly auth: AuthState;
  // private readonly dashboard: DashboardState;
  private readonly game: GameState;

  private state: AppState;

  constructor() {
    // this.auth = new AuthState(this);
    // this.dashboard = new DashboardState(this);
    this.game = new GameState(this);
    this.state = this.getState();
    this.state.enterState();
  }

  private getState(): AppState {
    return this.game;
    // if (!this.auth.isLoggedIn()) {
    //   return this.auth;
    // }
    // if (!this.dashboard.isGameReady()) {
    //   return this.dashboard;
    // }
    // return this.game;
  }

  public updateState() {
    this.state.exitState();
    this.state = this.getState();
    this.state.enterState();
  }
}

document.addEventListener("DOMContentLoaded", () => new App());

export type { App };
