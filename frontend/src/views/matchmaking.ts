import { z } from "zod";

import { MatchmakingViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";
import { logOut } from "./profile.js";

import { RoomSchema } from "schemas";
import type { MatchmakingMessage, Room } from "schemas";

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
  button.classList.add("bg-blue-900");
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
      room.permissions.type === "public" ||
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
  const createButton = document.getElementById("createRoom");
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
