import type { App } from "./app.ts";

abstract class AppState {
  protected app: App;
  protected appContainer: HTMLElement;

  protected constructor(app: App) {
    this.app = app;
    const appContainer: HTMLElement | null = document.getElementById("app");
    if (appContainer == null) {
      throw new Error("Incorrect html");
    }
    this.appContainer = appContainer;
  }

  public abstract enterState(): void;
  public abstract exitState(): void;
}

export { AppState };
