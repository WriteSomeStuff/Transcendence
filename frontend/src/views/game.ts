import { z } from "zod";

import { render as renderCourt } from "pong";
import { render as renderShootingCanvas } from "shooting";
import {
  GameInputMessage,
  GameUpdateMessageSchema,
  ShootingCanvas,
  ShootingPlayerInput,
} from "schemas";
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

function sendShootingInput(
  socket: WebSocket,
  input: ShootingPlayerInput,
): void {
  const message: GameInputMessage = {
    type: "shootingPlayerInput",
    payload: input,
  };
  socket.send(JSON.stringify(message));
}

function setupMobileControls(socket: WebSocket, input: PongPlayerInput) {
  const controls = document.getElementById("mobile-controls");
  if (controls) controls.hidden = false;

  const arrowUp = document.getElementById("arrow-up");
  const arrowDown = document.getElementById("arrow-down");

  arrowUp?.addEventListener("touchstart", (e) => {
    e.preventDefault();
    input.upPressed = true;
    sendUpdatePongInput(socket, input);
  });

  arrowUp?.addEventListener("touchend", (e) => {
    e.preventDefault();
    input.upPressed = false;
    sendUpdatePongInput(socket, input);
  });

  arrowDown?.addEventListener("touchstart", (e) => {
    e.preventDefault();
    input.downPressed = true;
    sendUpdatePongInput(socket, input);
  });

  arrowDown?.addEventListener("touchend", (e) => {
    e.preventDefault();
    input.downPressed = false;
    sendUpdatePongInput(socket, input);
  });
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

  if (/Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    setupMobileControls(socket, input);
  }
}

function updateCourt(canvas: HTMLCanvasElement, court: Court) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  renderCourt(court, ctx);
}

function initShootingCanvas(
  canvas: HTMLCanvasElement,
  socket: WebSocket,
  shootingCanvas: ShootingCanvas,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  renderShootingCanvas(shootingCanvas, ctx);
  const aspectRatio = shootingCanvas.width / shootingCanvas.height;
  const canvasAspectRatio = canvas.width / canvas.height;
  const ratio =
    aspectRatio >= canvasAspectRatio
      ? ctx.canvas.width / shootingCanvas.width
      : ctx.canvas.height / shootingCanvas.height;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const onInput = (clientX: number, clientY: number) => {
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    sendShootingInput(socket, {
      shootX: (x - canvas.width / 2) / ratio + shootingCanvas.width / 2,
      shootY: (y - canvas.height / 2) / ratio + shootingCanvas.height / 2,
    });
  };
  canvas.addEventListener("mousedown", (e) => {
    console.log("clicked");
    onInput(e.clientX, e.clientY);
  });
  canvas.addEventListener("touchstart", (e) => {
    console.log("touched");
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch) return;
    onInput(touch.clientX, touch.clientY);
  });
}

function updateShootingCanvas(
  canvas: HTMLCanvasElement,
  shootingCanvas: ShootingCanvas,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  renderShootingCanvas(shootingCanvas, ctx);
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
      case "shootingInit": {
        initShootingCanvas(canvas, socket, parsed.data.payload);
        break;
      }
      case "shootingUpdate": {
        updateShootingCanvas(canvas, parsed.data.payload);
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
