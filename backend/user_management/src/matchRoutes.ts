import { FastifyInstance } from "fastify";

import {
	createTournamentHandler,
	createMatchHandler
} from "./matchController.js";

const matchRoutes = async (app: FastifyInstance) => {
	app.post('/tournament', createTournamentHandler)
	app.post('/match', createMatchHandler)
};

export default matchRoutes;