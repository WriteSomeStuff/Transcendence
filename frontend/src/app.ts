import { Auth } from "./auth.ts";
import { Dashboard } from "./dashboard.ts";
import { GameState } from "./game.ts";

class SPA {
  private auth: Auth;
  private dashboard: Dashboard;
  private game: GameState;

  constructor() {
    this.auth = new Auth(this);
    this.dashboard = new Dashboard(this);
    this.game = new GameState(this);
    this.render();
  }

  public render() {
    if (this.auth.isLoggedIn()) {
      const gameId = this.dashboard.getGameId();
      if (gameId) {
        this.dashboard.stopUpdating();
        this.game.render(gameId);
      } else {
        this.dashboard.render();
      }
    } else {
      this.auth.renderLoginForm();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new SPA());

export type { SPA };
