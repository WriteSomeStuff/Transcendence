import { AppState } from "./app_state.ts";
import {
  Court,
  render as renderCourt,
  PlayerInput,
  CourtGeometry,
  CourtState,
} from "pong";
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
    if (this.playerInput.collectUpdatedFlag()) {
      this.socket?.send(JSON.stringify(this.playerInput));
    }
  };

  private processKeydown = (e: KeyboardEvent) => {
    if (e.key === "w") {
      this.playerInput.pressUp();
    }
    if (e.key === "s") {
      this.playerInput.pressDown();
    }
    if (this.playerInput.collectUpdatedFlag()) {
      this.socket?.send(JSON.stringify(this.playerInput));
    }
  };

  public enterState(): void {
    websocketAuthorized("ws://localhost:8080/game/pong/ws").then((socket) => {
      this.socket = socket;
      this.socket.onopen = (ev) => {
        console.log(ev);
      };
      this.socket.onmessage = (ev) => {
        const data: Object = JSON.parse(ev.data);
        if ((data as any).type === "courtSet") {
          this.court = {
            geometry: CourtGeometry.fromDTO((data as any).payload.geometry),
            state: CourtState.fromDTO((data as any).payload.state),
          };
          renderCourt(this.court!, this.gameCanvas!.getContext("2d")!);
        } else if (this.court && (data as any).type === "stateSet") {
          this.court.state = CourtState.fromDTO((data as any).payload);
          renderCourt(this.court, this.gameCanvas!.getContext("2d")!);
        }
        console.log(data);
      };
    });
    this.render();
    document.addEventListener("keydown", this.processKeydown);
    document.addEventListener("keyup", this.processKeyup);
    console.log("Entering game state");
  }

  public exitState(): void {
    this.appContainer.innerHTML = "";
    document.removeEventListener("keydown", this.processKeydown);
    document.removeEventListener("keyup", this.processKeyup);
    clearInterval(this.updater);
    this.updater = undefined;
    console.log("Exiting game state");
  }
}
