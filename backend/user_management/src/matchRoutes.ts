import { FastifyInstance } from "fastify";

import {
  createTournamentHandler,
  createMatchHandler,
  getMatchHistoryHandler,
} from "./matchController.js";

const matchRoutes = async (app: FastifyInstance) => {
  app.post(
    "/tournament",
    { preHandler: [app.authenticate] },
    createTournamentHandler,
  );
  app.post("/", { preHandler: [app.authenticate] }, createMatchHandler);

  app.get(
    "/history",
    { preHandler: [app.authenticate] },
    getMatchHistoryHandler,
  );
};

export default matchRoutes;
