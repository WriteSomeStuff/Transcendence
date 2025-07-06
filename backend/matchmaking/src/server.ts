import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";

import type { WebSocket } from "ws";

import { UserController } from "./controllers/user_controller.js";

const app = Fastify();
await app.register(fastifyWebsocket);

app.get("/ws", { websocket: true }, (socket: WebSocket, req) => {
  const userId = Number(req.headers.cookie);
  if (Number.isNaN(userId)) {
    socket.close();
    return;
  }
  new UserController(userId, socket);
});

app.listen(
  { port: 80, host: "0.0.0.0" },
  (err: Error | null, address: string) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    setInterval(async () => {
      // todo fetch tournament rooms and add them to controllers
      UserController.update();
    }, 1000);
    console.log(`Server·listening·on·${address}`);
  },
);
