import type { SPA } from "./app.ts";

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

export class GameState {
  private spa: SPA;
  private appContainer: HTMLElement;
  private readonly updater: number;
  private gameCanvas?: HTMLCanvasElement;
  private gameId?: string;
  private action: "up" | "down" | null = null;

  constructor(spa: SPA) {
    this.spa = spa;
    const appContainer: HTMLElement | null = document.getElementById("app");
    if (appContainer == null) {
      throw new Error("Incorrect html");
    }
    this.appContainer = appContainer;
    this.updater = setInterval(() => this.fetchGame(), 50);
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "w") {
        if (this.action === null) {
          this.action = "up";
        } else {
          this.action = null;
        }
      }
      if (e.key === "s") {
        if (this.action === null) {
          this.action = "down";
        } else {
          this.action = null;
        }
      }
    });
    document.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.key === "w") {
        if (this.action === null) {
          this.action = "down";
        } else {
          this.action = null;
        }
      }
      if (e.key === "s") {
        if (this.action === null) {
          this.action = "up";
        } else {
          this.action = null;
        }
      }
    });
  }

  public render(gameId: string) {
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
    this.gameId = gameId;
  }

  public stopUpdating(): void {
    clearInterval(this.updater);
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
    if (this.gameId === undefined || this.gameCanvas === undefined) {
      return;
    }
    if (this.action) {
      await fetch(`/game/action?gameid=${this.gameId}&action=${this.action}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
    }
    const game: Game = await fetch(`/game/state?gameid=${this.gameId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then((res) => res.json());
    if (game) {
      this.renderGame(game);
    }
  }
}
