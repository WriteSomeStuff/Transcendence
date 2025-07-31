import fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyMultipart from "@fastify/multipart";
import fastifyWebsocket from "@fastify/websocket";

import type { WebSocket } from "ws";

import userRoutes from "./userRoutes.js";
import friendRoutes from "./friendRoutes.js";
import matchRoutes from "./matchRoutes.js";
import { updateStatus } from "./userService.ts";


const PORT: number = 80;
const HOST: string = "0.0.0.0";

const app = fastify({
  // logger: true,
});

const onlineUsers: Map<number, WebSocket> = new Map();

app.register(fastifyMultipart);
app.register(fastifyWebsocket);

app.decorate(
  "authenticate",
  async function (request: FastifyRequest, _reply: FastifyReply) {
    request.user = { userId: Number(request.headers["cookie"]) };
    console.log(request.user);
  },
);

app.register(userRoutes, {
  prefix: "/",
});

app.register(friendRoutes, {
  prefix: "/friends",
});

app.register(matchRoutes, {
  prefix: "/match",
});

app.get("/ws", { websocket: true }, async (socket: WebSocket, req) => {
  console.log("Processing ws request", req, req.headers);
  const userId = Number(req.headers.cookie);
  if (Number.isNaN(userId)) {
    socket.close();
    return;
  }
  if (!app.authenticate) {
    console.error("Authentication in WebSocket handler is not set up");
    socket.close();
    await updateStatus(userId, "offline", onlineUsers);
    onlineUsers.delete(userId);
    return;
  }
  socket.on("open", async () => {
    console.log(`User ${userId} connected`);
    await updateStatus(userId, "online", onlineUsers);
    onlineUsers.set(userId, socket);
  });
  socket.on("close", async () => {
    console.log(`User ${userId} disconnected`);
    await updateStatus(userId, "offline", onlineUsers);
    onlineUsers.delete(userId);
  });
});

app.get("/health", async (_, reply) => {
  reply.send({ message: "User server is healthy" });
});

const start = async () => {
  try {
    await app.listen({
      port: PORT,
      host: HOST,
    });
    console.log(
      `[user server startup] Server is running on http://${HOST}:${PORT}`,
    );
  } catch (e) {
    console.error("[user server startup] Error starting up server:", e);
    process.exit(1);
  }
};

start();
