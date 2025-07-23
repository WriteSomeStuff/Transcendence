import { FastifyInstance } from "fastify";

import {
  InsertTournamentHandler,
  createMatchHandler,
  getMatchHistoryHandler,
  insertTournamentMatchHandler,
  getTournamentHandler,
  createTournamentHandler,
} from "./matchController.js";

const matchRoutes = async (app: FastifyInstance) => {
  app.post(
    "/insert-tournament",
    { preHandler: [app.authenticate] },
    InsertTournamentHandler,
  );
  app.post("/", { preHandler: [app.authenticate] }, createMatchHandler);

  app.get(
    "/history",
    { preHandler: [app.authenticate] },
    getMatchHistoryHandler,
  );

  app.post(
	"/insert-tournament-match",
    { preHandler: [app.authenticate] },
	insertTournamentMatchHandler,
  );

  app.get(
	"/tournament",
	getTournamentHandler,
  );

  app.post(
	"/create-tournament",
	createTournamentHandler
  );
};

export default matchRoutes;
