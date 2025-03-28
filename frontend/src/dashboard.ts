import type { SPA } from "./app.ts";

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

export class Dashboard {
  private spa: SPA;
  private appContainer: HTMLElement;
  private room?: GameRoom;
  private readonly updater: number;

  constructor(spa: SPA) {
    this.spa = spa;
    const appContainer: HTMLElement | null = document.getElementById("app");
    if (appContainer == null) {
      throw new Error("Incorrect html");
    }
    this.appContainer = appContainer;
    this.updater = setInterval(() => this.fetchRoom(), 1000);
  }

  public render() {
    if (this.room === undefined) {
      this.renderStartPage();
    } else {
      this.renderRoom();
    }
  }

  public getGameId(): string | undefined {
    return this.room?.game_id;
  }

  public stopUpdating(): void {
    clearInterval(this.updater);
  }

  private renderStartPage() {
    this.appContainer.innerHTML = `
            <h2>Dashboard</h2>
            <button id="create_room">Create Room</button>
            <button id="join_room">Join Room</button>
            <button id="logout">Logout</button>
        `;
    document
      .getElementById("create_room")
      ?.addEventListener("click", () => this.handleCreateRoom());
    document
      .getElementById("join_room")
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
    this.spa.render();
  }

  private async handleCreateRoom() {
    this.room = await fetch("/matchmaking/create_room?size=2&game=pong", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => res.json());
    this.spa.render();
  }

  private async handleJoinRoom() {
    this.room = await fetch("/matchmaking/join_room", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => res.json());
    this.spa.render();
  }

  private async fetchRoom() {
    this.room = await fetch("/matchmaking/get_room", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then((res) => res.json());
    this.spa.render();
  }
}
