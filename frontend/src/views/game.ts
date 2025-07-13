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

export async function renderGameView(
  view: z.infer<typeof GameViewSchema>,
  app: App,
): Promise<void> {
  app.appContainer.innerHTML = await fetch("/views/pong.html").then((res) =>
    res.text(),
  );
  const canvas = document.getElementById("myCanvas");
  if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
    console.error("Can't find a game canvas");
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
  quitButton.addEventListener("click", async () => {
    localStorage.removeItem("gameId");
    app.resetView();
  });
  const socket = new WebSocket("/api/game/ws");
  socket.onmessage = (event: MessageEvent) => {
    const parsed = GameUpdateMessageSchema.safeParse(JSON.parse(event.data));
    if (!parsed.success) {
      console.error("Game update failed", parsed.error);
      return;
    }
    switch (parsed.data.type) {
      case "pongInit": {
        initCourt(canvas, socket, parsed.data.payload);
        break;
      }
      case "pongUpdate": {
        updateCourt(canvas, parsed.data.payload);
        break;
      }
    }
  };
  void view;
}
