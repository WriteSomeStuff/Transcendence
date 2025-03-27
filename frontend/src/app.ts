import { Auth } from "./auth.ts";
import { Dashboard } from "./dashboard.ts";

class SPA {
  // private appContainer: HTMLElement;
  private auth: Auth;
  private dashboard: Dashboard;

  constructor() {
    // this.appContainer = document.getElementById("app")!;
    this.auth = new Auth(this);
    this.dashboard = new Dashboard(this);
    this.render();
  }

  public render() {
    if (this.auth.isLoggedIn()) {
      this.dashboard.render();
    } else {
      this.auth.renderLoginForm();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new SPA());

export type { SPA };
