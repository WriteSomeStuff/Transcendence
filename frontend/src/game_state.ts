import { AppState } from "./app_state.ts";
import { Court } from "pong";
import type { App } from "./app.ts";

export class GameState extends AppState {
  private updater: NodeJS.Timeout | undefined;
  private gameCanvas: HTMLCanvasElement | undefined;
  // @ts-ignore
  private action: "up" | "down" | null = null;
  // @ts-ignore
  private upPressed = false;
  // @ts-ignore
  private downPressed = false;
  private game: Court | null = null;

  public constructor(app: App) {
    super(app);
  }

  private render() {
    this.appContainer.innerHTML = `
            <canvas id="game-canvas" width="500" height="400"></canvas>
        `;
    const canvas: HTMLCanvasElement | null = document.getElementById(
      "game-canvas",
    ) as HTMLCanvasElement;
    if (canvas == null) {
      throw new Error("Incorrect html");
    }
    this.gameCanvas = canvas;
  }

  private processKeyup = (e: KeyboardEvent) => {
    if (e.key === "w") {
      this.upPressed = false;
    }
    if (e.key === "s") {
      this.downPressed = false;
    }
  };

  private processKeydown = (e: KeyboardEvent) => {
    if (e.key === "w") {
      this.upPressed = true;
    }
    if (e.key === "s") {
      this.downPressed = true;
    }
  };

  private renderGame() {
    const ctx = this.gameCanvas?.getContext("2d");
    if (!ctx) {
      return;
    }
    this.game?.render(ctx);
  }

  private async fetchGame() {
    this.game?.update(1, [0, 0]);
    // if (!localStorage.getItem("game_id") || this.gameCanvas === undefined) {
    //   return;
    // }
    // const action =
    //   this.upPressed !== this.downPressed
    //     ? this.upPressed
    //       ? "up"
    //       : "down"
    //     : null;
    // if (this.action !== action) {
    //   this.action = action;
    // }
    // this.game.movePaddle(action);
    // // if (this.action) {
    // //   await fetch(
    // //     `/game/action?gameid=${localStorage.getItem("game_id")}&action=${this.action}`,
    // //     {
    // //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    // //     },
    // //   );
    // // }
    // // const game: Game = await fetch(
    // //   `/game/state?gameid=${localStorage.getItem("game_id")}`,
    // //   {
    // //     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    // //   },
    // // ).then((res) => res.json());
    // // if (game) {
    // //   this.renderGame(game);
    // // }
    this.renderGame();
  }

  public enterState(): void {
    this.render();
    this.game = new Court();
    console.log(this.game);
    document.addEventListener("keydown", this.processKeydown);
    document.addEventListener("keyup", this.processKeyup);
    this.updater = setInterval(() => this.fetchGame(), 50);
    console.log("Entering game state");
  }

  public exitState(): void {
    this.gameCanvas = undefined;
    this.appContainer.innerHTML = "";
    document.removeEventListener("keydown", this.processKeydown);
    document.removeEventListener("keyup", this.processKeyup);
    clearInterval(this.updater);
    this.updater = undefined;
    console.log("Exiting game state");
  }
}
