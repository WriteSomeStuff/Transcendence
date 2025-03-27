import type { SPA } from "./app.ts";

export class Dashboard {
  private spa: SPA;
  private appContainer: HTMLElement;

  constructor(spa: SPA) {
    this.spa = spa;
    const appContainer: HTMLElement | null = document.getElementById("app");
    if (appContainer == null) {
      throw new Error("Incorrect html");
    }
    this.appContainer = appContainer;
  }

  public render() {
    this.appContainer.innerHTML = `
            <h2>Dashboard</h2>
            <button id="logout">Logout</button>
        `;

    document
      .getElementById("logout")
      ?.addEventListener("click", () => this.handleLogout());
  }

  private handleLogout() {
    localStorage.removeItem("token");
    this.spa.render();
  }
}
