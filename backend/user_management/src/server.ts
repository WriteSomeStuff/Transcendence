import fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyMultipart from "@fastify/multipart";

import userRoutes from "./userRoutes.js";
import friendRoutes from "./friendRoutes.js";
import matchRoutes from "./matchRoutes.js";

const PORT: number = 80;
const HOST: string = "0.0.0.0";

const app = fastify({
  logger: true,
});

app.register(fastifyMultipart);

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
