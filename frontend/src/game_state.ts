import { AppState } from "./app_state.ts";
import type { App } from "./app.ts";

interface Point {
  x: number;
  y: number;
}

interface Game {
  paddle1: Point;
  paddle2: Point;
  ball: Point;
  ball_direction: Point;
  user1: string;
  user2: string;
}

export class GameState extends AppState {
  private updater?: number;
  private gameCanvas?: HTMLCanvasElement;
  private action: "up" | "down" | null = null;
  private upPressed = false;
  private downPressed = false;

  constructor(app: App) {
    super(app);
  }

  private render() {
    this.appContainer.innerHTML = `
            <canvas id="game-canvas" width="200" height="100"></canvas>
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
  }

  private processKeydown = (e: KeyboardEvent) => {
    if (e.key === "w") {
      this.upPressed = true;
    }
    if (e.key === "s") {
      this.downPressed = true;
    }
  }

  private renderGame(game: Game) {
    const ctx = this.gameCanvas?.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, 200, 100);
    ctx.strokeRect(0, 0, 200, 100);
    ctx.fillRect(game.paddle1.x, game.paddle1.y - 10, 5, 20);
    ctx.fillRect(game.paddle2.x - 5, game.paddle2.y - 10, 5, 20);
    ctx.fillRect(game.ball.x - 2, game.ball.y - 2, 4, 4);
  }

  private async fetchGame() {
    if (!localStorage.getItem("game_id") || this.gameCanvas === undefined) {
      return;
    }
    const action = this.upPressed != this.downPressed ? (this.upPressed ? 'up' : 'down') : null;
    if (this.action !== action) {
      this.action = action;
    }
    if (this.action) {
      await fetch(`/game/action?gameid=${localStorage.getItem("game_id")}&action=${this.action}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    }
    const game: Game = await fetch(`/game/state?gameid=${localStorage.getItem("game_id")}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then((res) => res.json());
    if (game) {
      this.renderGame(game);
    }
  }

  public enterState(): void {
    this.render();
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
