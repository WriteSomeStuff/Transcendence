import { z } from "zod";

import { render as renderCourt } from "pong";
import { GameInputMessage, GameUpdateMessageSchema } from "schemas";
import type { Court, PongPlayerInput } from "schemas";

import { GameViewSchema } from "./views.js";
import type { App } from "../app.js";

function sendUpdatePongInput(socket: WebSocket, input: PongPlayerInput): void {
  const message: GameInputMessage = {
    type: "pongInputUpdate",
    payload: input,
  };
  socket.send(JSON.stringify(message));
}

function initCourt(canvas: HTMLCanvasElement, socket: WebSocket, court: Court) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  renderCourt(court, ctx);
  let input: PongPlayerInput = {
    upPressed: false,
    downPressed: false,
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "w") {
      input.upPressed = true;
      sendUpdatePongInput(socket, input);
    }
    if (event.key === "s") {
      input.downPressed = true;
      sendUpdatePongInput(socket, input);
    }
  };
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === "w") {
      input.upPressed = false;
      sendUpdatePongInput(socket, input);
    }
    if (event.key === "s") {
      input.downPressed = false;
      sendUpdatePongInput(socket, input);
    }
  };
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
  const observer = new MutationObserver(() => {
    if (!document.body.contains(canvas)) {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      localStorage.removeItem("gameId");
      socket.close();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function updateCourt(canvas: HTMLCanvasElement, court: Court) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  console.log("Updating court from game");
  renderCourt(court, ctx);
}

function updateScores(
  scoreboard: HTMLElement,
  usernames: string[],
  scores: number[],
) {
  scoreboard.innerHTML = "";
  const elements = usernames.map((username, idx) => {
    const p = document.createElement("p");
    p.textContent = `${username}: ${scores[idx]}`;
    return p;
  });
  for (const element of elements) {
    scoreboard.appendChild(element);
  }
}

export async function renderGameView(
  view: z.infer<typeof GameViewSchema>,
  app: App,
): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/pong.html").then((res) =>
    res.text(),
  );

  const isMobile = /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (isMobile) {
	const controls = document.getElementById("mobile-controls");
	if (controls) {
	  controls.hidden = false;
	}
  }

  const canvas = document.getElementById("myCanvas");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.error("Can't find a game canvas");
    localStorage.removeItem("gameId");
    app.resetView();
    return;
  }
  const scoreboard = document.getElementById("scoreboard");
  if (!scoreboard) {
    console.error("Can't find a game scoreboard");
    localStorage.removeItem("gameId");
    app.resetView();
    return;
  }
  const quitButton = document.getElementById("quitButton");
  if (!quitButton || !(quitButton instanceof HTMLButtonElement)) {
    console.error("Can't find a quitButton");
    localStorage.removeItem("gameId");
    app.resetView();
    return;
  }
  const userIds = (await fetch("/api/game/users").then((res) =>
    res.json(),
  )) as number[];
  const usernames = await Promise.all(
    userIds.map(async (userId) => {
      return await fetch(`/api/user/get-username?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => data["username"] as string);
    }),
  );
  updateScores(
    scoreboard,
    usernames,
    usernames.map((_) => 0),
  );
  const socket = new WebSocket("/api/game/ws");
  socket.onmessage = (event: MessageEvent) => {
    const parsed = GameUpdateMessageSchema.safeParse(JSON.parse(event.data));
    if (!parsed.success) {
      console.error("Game update failed", parsed.error);
      return;
    }
    switch (parsed.data.type) {
      case "scoresUpdate": {
        updateScores(scoreboard, usernames, parsed.data.payload);
        break;
      }
      case "pongInit": {
        initCourt(canvas, socket, parsed.data.payload);
        break;
      }
      case "pongUpdate": {
        updateCourt(canvas, parsed.data.payload);
        break;
      }
      case "gameEnded": {
        localStorage.removeItem("gameId");
        app.selectView({
          view: "profile",
          params: {
            matchId: parsed.data.matchId,
          },
        });
      }
    }
  };
  quitButton.addEventListener("click", async () => {
    const message: GameInputMessage = {
      type: "giveUp",
    };
    socket.send(JSON.stringify(message));
    localStorage.removeItem("gameId");
    app.resetView();
  });
  void view;
}
