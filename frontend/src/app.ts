import { AppState } from "./app_state.ts";

import { Auth_state } from "./auth_state.ts";
import { Dashboard_state } from "./dashboard_state.ts";
import { GameState } from "./game_state.ts";

class App {
  private readonly auth: Auth_state;
  private readonly dashboard: Dashboard_state;
  private readonly game: GameState;

  private state: AppState;

  constructor() {
    this.auth = new Auth_state(this);
    this.dashboard = new Dashboard_state(this);
    this.game = new GameState(this);
    this.state = this.getState();
    this.state.enterState();
  }

  private getState(): AppState {
    if (!this.auth.isLoggedIn()) {
      return this.auth;
    }
    if (!this.dashboard.isGameReady()) {
      return this.dashboard;
    }
    return this.game;
  }
  
  public updateState() {
    this.state.exitState();
    this.state = this.getState();
    this.state.enterState();
  }
}

document.addEventListener("DOMContentLoaded", () => new App());

export type { App };
