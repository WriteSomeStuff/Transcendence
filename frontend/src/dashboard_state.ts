import type { App } from "./app.ts";
import { AppState } from "./app_state.ts";

interface User {
  user_id: string;
  user_type: string;
}

interface GameRoom {
  size: number;
  game: string;
  creator: User;
  slots: User[];
  game_id?: string;
}

export class Dashboard_state extends AppState {
  private room?: GameRoom;
  private updater?: number;

  constructor(app: App) {
    super(app);
  }

  public render() {
    if (this.room === undefined) {
      this.renderStartPage();
    } else {
      this.renderRoom();
    }
  }

  public isGameReady(): boolean {
    return !!localStorage.getItem("game_id");
  }

  private renderStartPage() {
    this.appContainer.innerHTML = `
            <h2>Dashboard</h2>
            <button id="create-room">Create Room</button>
            <button id="join-room">Join Room</button>
            <button id="logout">Logout</button>
        `;
    document
      .getElementById("create-room")
      ?.addEventListener("click", () => this.handleCreateRoom());
    document
      .getElementById("join-room")
      ?.addEventListener("click", () => this.handleJoinRoom());
    document
      .getElementById("logout")
      ?.addEventListener("click", () => this.handleLogout());
  }

  private renderRoom() {
    if (this.room === undefined) {
      return;
    }
    this.appContainer.innerHTML = `
            <h2>Dashboard</h2>
            <p>Waiting for players: ${this.room.slots.length + 1} / ${this.room.size}</p>
            <button id="logout">Logout</button>
        `;
    document
      .getElementById("logout")
      ?.addEventListener("click", () => this.handleLogout());
  }

  private handleLogout() {
    localStorage.removeItem("token");
    this.app.updateState();
  }

  private async handleCreateRoom() {
    this.room = await fetch("/matchmaking/create_room?size=2&game=pong", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => res.json());
    this.renderRoom();
  }

  private async handleJoinRoom() {
    this.room = await fetch("/matchmaking/join_room", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => res.json());
    this.renderRoom();
  }

  private async fetchRoom() {
    if (this.room === undefined) {
      return;
    }
    const room: GameRoom = await fetch("/matchmaking/get_room", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => res.json());
    if (room !== this.room) {
      this.room = room;
      this.renderRoom();
      if (room.game_id !== undefined) {
        localStorage.setItem("game_id", room.game_id);
        this.app.updateState();
      }
    }
  }

  public enterState(): void {
    this.renderStartPage();
    this.updater = setInterval(() => this.fetchRoom(), 1000);
    console.log("Entering dashboard state");
  }

  public exitState(): void {
    clearInterval(this.updater);
    this.appContainer.innerHTML = "";
    console.log("Exiting dashboard state");
  }
}
