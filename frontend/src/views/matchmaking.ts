import { z } from "zod";

import { MatchmakingViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";
import { logOut } from "./profile.js";

import { RoomSchema } from "schemas";
import type { MatchmakingMessage, Room } from "schemas";
import { log } from "console";

const MatchmakingServerMessage = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update"),
    rooms: z.array(RoomSchema),
  }),
  z.object({
    action: z.literal("started"),
    gameId: z.string(),
  }),
]);

function createRoomElement(room: Room, socket: WebSocket): HTMLElement {
  const roomDiv = document.createElement("div");
  roomDiv.classList.add("flex");
  roomDiv.classList.add("flex-col");
  roomDiv.classList.add("sm:flex-row");
  roomDiv.classList.add("justify-between");
  roomDiv.classList.add("items-center");
  roomDiv.classList.add("bg-purple-900/80");
  roomDiv.classList.add("border");
  roomDiv.classList.add("border-purple-600");
  roomDiv.classList.add("rounded-lg");
  roomDiv.classList.add("p-4");
  roomDiv.classList.add("gap-4");
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("text-left");
  const gameType = document.createElement("p");
  gameType.classList.add("text-lg");
  gameType.classList.add("font-semibold");
  gameType.textContent = room.gameData.game;
  infoDiv.appendChild(gameType);
  const playersAmount = document.createElement("p");
  playersAmount.classList.add("text-sm");
  playersAmount.classList.add("text-purple-200");
  playersAmount.textContent = `${room.joinedUsers.length}/${room.size} players`;
  infoDiv.appendChild(playersAmount);
  roomDiv.appendChild(infoDiv);
  const button = document.createElement("button");
  button.classList.add("px-4");
  button.classList.add("py-2");
  button.classList.add("bg-blue-900");
  button.classList.add("hover:bg-blue-950");
  button.classList.add("rounded-md");
  button.classList.add("w-full");
  button.classList.add("sm:w-auto");
  button.textContent = "Join";
  button.onclick = () => {
    const message: MatchmakingMessage = {
      action: "joinRoom",
      roomId: room.id,
    };
    socket.send(JSON.stringify(message));
  };
  roomDiv.appendChild(button);
  return roomDiv;
}

function fillAvailableRooms(rooms: Room[], docRooms: HTMLElement, userId: number, socket: WebSocket) {
  docRooms.innerHTML = "";
  for (const room of rooms) {
    if (
      room.permissions.type === "public" ||
      room.permissions.allowedUsers.includes(userId)
    ) {
      docRooms.appendChild(createRoomElement(room, socket));
    }
  }
}

async function promptTotalPlayers(): Promise<number> {
  const modal = document.getElementById("players-modal") as HTMLDialogElement;
  const closeModalButton = document.getElementById("close-total-players-modal") as HTMLButtonElement;
  const playerButtons = modal.querySelectorAll("button[id$='players']");

  if (!modal || !closeModalButton || playerButtons.length === 0) return 0;
  
  modal.showModal();
  
  return new Promise<number>((resolve) => {
    playerButtons.forEach(button => {
      button.addEventListener("click", () => {
        const value = parseInt(button.id, 10); // converts "4players" -> 4
        modal.close();
        resolve(value);
      });
    });

    closeModalButton.addEventListener("click", () => {
      modal.close();
      resolve(0);
    });
  });
}

export async function renderMatchmakingView(
  view: z.infer<typeof MatchmakingViewSchema>,
  app: App,
): Promise<void> {
  const userId = await fetch("/api/user/profile")
    .then((res) => res.json())
    .then((user) => {
      return user.id as number;
    });
  app.appContainer.innerHTML = await fetch("/views/matchmaking.html").then(
    (res) => res.text(),
  );
  bindNavbar(app);
  await logOut(app);
  const createButton = document.getElementById("createRoom");
  if (!createButton) {
    console.error("Couldn't find a button!");
    app.selectView({ view: "profile", params: {} });
    return;
  }
  const createTournamentButton = document.getElementById("createTournament") as HTMLButtonElement;
  if (!createTournamentButton) {
    console.error("Couldn't find a button!");
    app.selectView({ view: "profile", params: {} });
    return;
  }
  const docRooms = document.getElementById("availableRooms");
  if (!docRooms) {
    console.error("Couldn't find rooms grid!");
    app.selectView({ view: "profile", params: {} });
    return;
  }
  const socket = new WebSocket("/api/matchmaking/ws");
  createButton.addEventListener("click", () => {
    const newRoomMessage: MatchmakingMessage = {
      action: "createRoom",
      size: 2,
      permissions: {
        type: "public",
      },
      gameData: {
        game: "pong",
        options: {
          paddleRatio: 0.4,
          gameSpeed: 1,
        },
      },
    };
    socket.send(JSON.stringify(newRoomMessage));
  });
  createTournamentButton.addEventListener("click", async () => {
	const totalPlayers = await promptTotalPlayers();
	if (totalPlayers === 0) return;
	// TODO own type for tournament message, and parsing in backend
	const newTournamentMessage: MatchmakingMessage = {
		action: "createRoom",
		size: totalPlayers,
		permissions: {
			type: "tournament",
		},
		gameData: {
			game: "pong",
			options: {
				paddleRatio: 0.4,
				gameSpeed: 1,
			},
		},
	};
	socket.send(JSON.stringify(newTournamentMessage));
  })
  socket.onmessage = (e: MessageEvent) => {
    const parsed = MatchmakingServerMessage.safeParse(JSON.parse(e.data));
    if (!parsed.success) {
      console.error("Unable to parse matchmaking", parsed.error, e);
      return;
    }
    switch (parsed.data.action) {
      case "update": {
        fillAvailableRooms(parsed.data.rooms, docRooms, userId, socket);
        break;
      }
      case "started": {
        localStorage.setItem("gameId", parsed.data.gameId);
        app.resetView();
        break;
      }
    }
  };
  void view;
}
