import { FastifyInstance } from "fastify";

import {
  InsertTournamentHandler,
  createMatchHandler,
  getMatchHistoryHandler,
  insertTournamentMatchHandler,
  getTournamentHandler,
  getTournamentMatchesHandler,
  createTournamentHandler,
} from "./matchController.js";

const matchRoutes = async (app: FastifyInstance) => {
  app.post("/insert-tournament", InsertTournamentHandler);
  app.post("/", { preHandler: [app.authenticate] }, createMatchHandler);

  app.get(
    "/history",
    { preHandler: [app.authenticate] },
    getMatchHistoryHandler,
  );

  app.post("/insert-tournament-match", insertTournamentMatchHandler);

  app.get(
    "/tournament",
    { preHandler: [app.authenticate] },
    getTournamentHandler,
  );

  app.get("/tournament-matches", getTournamentMatchesHandler);

  app.post(
    "/create-tournament",
    { preHandler: [app.authenticate] },
    createTournamentHandler,
  );
};

export default matchRoutes;
