import { AppState } from "./app_state.ts";
import { Court, render as renderCourt, PlayerInput, CourtGeometry } from "pong";
import type { App } from "./app.ts";
import { websocketAuthorized } from "./utils/authorized_requests.js";

export class GameState extends AppState {
  private updater: NodeJS.Timeout | undefined;
  private gameCanvas: HTMLCanvasElement | undefined;
  private playerInput: PlayerInput;
  private socket: WebSocket | undefined = undefined;
  private court: Court | null = null;

  public constructor(app: App) {
    super(app);
    this.playerInput = new PlayerInput();
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
      this.playerInput.releaseUp();
    }
    if (e.key === "s") {
      this.playerInput.releaseDown();
    }
  };

  private processKeydown = (e: KeyboardEvent) => {
    if (e.key === "w") {
      this.playerInput.pressUp();
    }
    if (e.key === "s") {
      this.playerInput.pressDown();
    }
  };

  // private renderGame() {
  //   const ctx = this.gameCanvas?.getContext("2d");
  //   if (!ctx) {
  //     return;
  //   }
  //   // this.game?.render(ctx);
  // }
  //
  // private async fetchGame() {
  //
  //   // this.game?.update(1, [0, 0]);
  //   // if (!localStorage.getItem("game_id") || this.gameCanvas === undefined) {
  //   //   return;
  //   // }
  //   // const action =
  //   //   this.upPressed !== this.downPressed
  //   //     ? this.upPressed
  //   //       ? "up"
  //   //       : "down"
  //   //     : null;
  //   // if (this.action !== action) {
  //   //   this.action = action;
  //   // }
  //   // this.game.movePaddle(action);
  //   // // if (this.action) {
  //   // //   await fetch(
  //   // //     `/game/action?gameid=${localStorage.getItem("game_id")}&action=${this.action}`,
  //   // //     {
  //   // //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //   // //     },
  //   // //   );
  //   // // }
  //   // // const game: Game = await fetch(
  //   // //   `/game/state?gameid=${localStorage.getItem("game_id")}`,
  //   // //   {
  //   // //     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //   // //   },
  //   // // ).then((res) => res.json());
  //   // // if (game) {
  //   // //   this.renderGame(game);
  //   // // }
  //   this.renderGame();
  // }

  public enterState(): void {
    websocketAuthorized("ws://localhost:8080/game/pong/ws").then((socket) => {
      this.socket = socket;
      this.socket.onopen = (ev) => {
        console.log(ev);
      };
      this.socket.onmessage = (ev) => {
        const data: Object = JSON.parse(ev.data);
        // @ts-ignore
        if (data.type === "courtSet") {
          this.court = {
            // @ts-ignore
            geometry: Object.assign(new CourtGeometry(2, 100, 50, 5, 10, 4), data.payload.geometry),
            // @ts-ignore
            state: data.payload.state,
          };
          renderCourt(this.court!, this.gameCanvas!.getContext("2d")!);
          // @ts-ignore
        } else if (this.court && data.type === "stateSet") {
          // @ts-ignore
          this.court.state = data.payload;
          renderCourt(this.court, this.gameCanvas!.getContext("2d")!);
        }
        console.log(data);
      };
    });
    this.render();
    // this.game = new Court();
    // console.log(this.game);
    document.addEventListener("keydown", this.processKeydown);
    document.addEventListener("keyup", this.processKeyup);
    // this.updater = setInterval(() => this.fetchGame(), 50);
    console.log("Entering game state");
  }

  public exitState(): void {
    // this.gameCanvas = undefined;
    this.appContainer.innerHTML = "";
    document.removeEventListener("keydown", this.processKeydown);
    document.removeEventListener("keyup", this.processKeyup);
    clearInterval(this.updater);
    this.updater = undefined;
    console.log("Exiting game state");
  }
}
