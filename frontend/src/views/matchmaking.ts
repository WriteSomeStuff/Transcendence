import { z } from "zod";

import { MatchmakingViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";
import { logOut } from "./profile.js";

import { RoomSchema } from "schemas";
import type { MatchmakingMessage, Room, Username, TournamentCreateMessage } from "schemas";

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

function createRoomElement(room: Room, socket: WebSocket, userId: number): HTMLElement {
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
  button.classList.add("border-2");
  button.classList.add("border-blue-500");
  button.classList.add("bg-blue-700");
  button.classList.add("hover:bg-blue-950");
  button.classList.add("rounded-md");
  button.classList.add("w-full");
  button.classList.add("sm:w-auto");
  if (room.joinedUsers.includes(userId)) {
    button.textContent = "Leave";
    button.onclick = () => {
      const message: MatchmakingMessage = {
        action: "leaveRoom",
        roomId: room.id,
      };
      socket.send(JSON.stringify(message));
    };
  } else {
    button.textContent = "Join";
    button.onclick = () => {
      const message: MatchmakingMessage = {
        action: "joinRoom",
        roomId: room.id,
      };
      socket.send(JSON.stringify(message));
    };
  }
  roomDiv.appendChild(button);
  return roomDiv;
}

function fillAvailableRooms(
  rooms: Room[],
  docRooms: HTMLElement,
  userId: number,
  socket: WebSocket,
) {
  docRooms.innerHTML = "";
  for (const room of rooms) {
    if (
      room.permissions.type === "public" || room.permissions.type === "tournament" ||
      room.permissions.allowedUsers.includes(userId)
    ) {
      docRooms.appendChild(createRoomElement(room, socket, userId));
    }
  }
}

function bindRoomCreation(createButton: HTMLButtonElement, roomSettingsModal: HTMLDialogElement, gameSettingsForm: HTMLFormElement, socket: WebSocket) {
  createButton.addEventListener("click", () => {
    roomSettingsModal.showModal();
  });
  // TODO add close
  gameSettingsForm.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(gameSettingsForm);
    const newRoomMessage: MatchmakingMessage = {
      action: "createRoom",
      size: Number(formData.get("gameSize") as string),
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
    roomSettingsModal.close();
  });
}

async function promptTotalPlayers(): Promise<number> {
  const modal = document.getElementById("total-players-modal") as HTMLDialogElement;
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

async function promptTournamentParticipantsAndName(totalPlayers: number): Promise<{ participants: Username[], name: string }> {
	const modal = document.getElementById("player-input-modal") as HTMLDialogElement;
	const form = document.getElementById("player-input-form") as HTMLFormElement;
	const closeModalButton = document.getElementById("close-player-input-modal") as HTMLButtonElement;
	const tournamentNameInput = document.getElementById("tournament-name") as HTMLInputElement;
	const playersInputDiv = document.getElementById("player-input-div");
	// const tournamentNameDiv = document.getElementById("tournament-name-div");

	if (!modal || !form || !closeModalButton || !playersInputDiv || !tournamentNameInput) {
		return { participants: [], name: "" };
	}

	for (let i = 0; i < totalPlayers; i++) {
		const inputElement: HTMLInputElement = document.createElement("input");
		inputElement.type = "text";
		inputElement.placeholder = `Player ${i + 1}`;
		inputElement.required = true;
		inputElement.className = "sm:text-base rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500";

		playersInputDiv.appendChild(inputElement);
	}

	// const inputElement: HTMLInputElement = document.createElement("input");
	// inputElement.type = "text";
	// inputElement.placeholder = "Enter a tournament name";
	// inputElement.required = true;
	// inputElement.className = "sm:text-base rounded-md border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500";
	// tournamentNameDiv.appendChild(inputElement);
	// const tournamentNameInput = tournamentNameDiv.querySelector("input") as HTMLInputElement;

	modal.showModal();

	return new Promise<{ participants: Username[], name: string }>((resolve) => {
		form.addEventListener("submit", async (event: Event) => {
			event.preventDefault();
			const users = new Set<Username>();
			const inputElements = playersInputDiv.querySelectorAll("input");
			inputElements.forEach((inputElement) => {
				if (users.has(inputElement.value)) {
					playersInputDiv.innerHTML = '';
					alert("Duplicate users"); // TODO dont close modal but give another chance
					resolve({ participants: [], name: "" });
				}
				users.add(inputElement.value);
			});
			modal.close();
			playersInputDiv.innerHTML = '';
      		resolve({ participants: Array.from(users), name: tournamentNameInput.value });
    	});

		closeModalButton.addEventListener("click", () => {
			modal.close();
			playersInputDiv.innerHTML = '';
     		resolve({ participants: [], name: "" });
		});
  	});
	// TODO flush the tournament name input
}

async function handleCreateTournament() {
	const totalPlayers = await promptTotalPlayers();
	if (totalPlayers === 0) return;

	const tournamentInfo: {
		participants: Username[],
		name: string,
	} = await promptTournamentParticipantsAndName(totalPlayers);

	if (tournamentInfo.participants.length === 0) return;
	console.log('Sending message:', tournamentInfo);

	const newTournamentMessage: TournamentCreateMessage = {
		name: tournamentInfo.name,
		size: totalPlayers,
		participants: tournamentInfo.participants,
		gameData: {
			game: "pong",
			options: {
				paddleRatio: 0.4,
				gameSpeed: 1,
			},
		},
	};

	const url = '/api/user/match/create-tournament';
	console.log("url:", url);
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(newTournamentMessage),
	});

	const data = await response.json();
	if (!response.ok || !data.success) {
		console.error("Failed to create tournament:", data);
		alert(`Failed to create tournament: ${data.error || "Unknown error."}`);
		return;
	}

	alert(`Tournament created successfully! Tournament ID: ${data.tournamentId}`);
}

export async function renderMatchmakingView(
  view: z.infer<typeof MatchmakingViewSchema>,
  app: App,
): Promise<void> {
  const userId = await fetch("/api/user/profile")
    .then((res) => res.json())
    .then((user) => {
      return user.data.id as number;
    });
  if (userId === undefined) {
    console.error("Couldn't fetch user id!");
    app.selectView({ view: "profile", params: {} });
    return;
  }
  app.appContainer.innerHTML = await fetch("/views/matchmaking.html").then(
    (res) => res.text(),
  );
  bindNavbar(app);
  await logOut(app);
  const createButton = document.getElementById("createRoom"); // TODO suggestion: change to createMatchButton
  if (!createButton || !(createButton instanceof HTMLButtonElement)) {
    console.error("Couldn't find a button!");
    app.selectView({ view: "profile", params: {} });
    return;
  }
  const roomSettingsModal = document.getElementById("roomSettingsModal");
  if (!roomSettingsModal || !(roomSettingsModal instanceof HTMLDialogElement)) {
    console.error("Couldn't find a roomSettingsModal!");
    app.selectView({ view: "profile", params: {} });
    return;
  }
  const gameSettingsForm = document.getElementById("gameSettingsForm");
  if (!gameSettingsForm || !(gameSettingsForm instanceof HTMLFormElement)) {
    console.error("Couldn't find a gameSettingsForm!");
    app.selectView({ view: "profile", params: {} });
    return;
  }
  const createTournamentButton = document.getElementById("createTournament") as HTMLButtonElement;
  if (!createTournamentButton || !(createTournamentButton instanceof HTMLButtonElement)) {
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
  const observer = new MutationObserver(() => {
    if (!document.body.contains(createButton)) {
      socket.close();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  bindRoomCreation(createButton, roomSettingsModal, gameSettingsForm, socket);
  createTournamentButton.addEventListener("click", async () => {
    handleCreateTournament();
  });
  socket.onmessage = (e: MessageEvent) => {
    const parsed = MatchmakingServerMessage.safeParse(JSON.parse(e.data));
    if (!parsed.success) {
      console.error("Unable to parse matchmaking", parsed.error, e);
      app.resetView();
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
