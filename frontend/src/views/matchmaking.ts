import { z } from "zod";

import { MatchmakingViewSchema } from "./views.js";
import { bindNavbar } from "./utils.js";
import type { App } from "../app.js";

import { RoomSchema } from "schemas";
import type { MatchmakingMessage } from "schemas";

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

export async function renderMatchmakingView(
  view: z.infer<typeof MatchmakingViewSchema>,
  app: App,
): Promise<void> {
  const userId = await fetch("/api/user/profile")
    .then((res) => res.json())
    .then((user) => {
      return user.user_id as number;
    });
  app.appContainer.innerHTML = await fetch("/views/matchmaking.html").then(
    (res) => res.text(),
  );
  bindNavbar(app);
  const createButton = document.getElementById("createRoom");
  if (!createButton) {
    console.error("Couldn't find a button!");
    app.selectView({ view: "profile", params: {} });
    return;
  }
  const docRooms = document.getElementById("roomsGrid");
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
  socket.onmessage = (e: MessageEvent) => {
    const parsed = MatchmakingServerMessage.safeParse(JSON.parse(e.data));
    if (!parsed.success) {
      console.error("Unable to parse matchmaking", parsed.error, e);
      return;
    }
    switch (parsed.data.action) {
      case "update": {
        while (docRooms.children.length > 1) {
          if (docRooms.lastChild) docRooms.removeChild(docRooms.lastChild);
        }
        for (const room of parsed.data.rooms) {
          if (
            room.permissions.type === "public" ||
            room.permissions.allowedUsers.includes(userId)
          ) {
            const roomUl = document.createElement("ul");
            for (let i = 0; i < room.size; i++) {
              const li = document.createElement("li");
              const userId = room.joinedUsers[i];
              if (userId !== undefined) {
                li.textContent = userId.toString(); // TODO proper display of s username
              }
              roomUl.appendChild(li);
            }
            const li = document.createElement("li");
            const button = document.createElement("button");
            button.textContent = "Join";
            button.onclick = () => {
              const message: MatchmakingMessage = {
                action: "joinRoom",
                roomId: room.id,
              };
              socket.send(JSON.stringify(message));
            };
            li.appendChild(button);
            roomUl.appendChild(li);
            docRooms.appendChild(roomUl);
          }
        }
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
