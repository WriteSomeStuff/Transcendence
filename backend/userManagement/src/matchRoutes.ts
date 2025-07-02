import { FastifyInstance } from "fastify";

import {
	createTournamentHandler
} from "./matchController";

const matchRoutes = async (app: FastifyInstance) => {
	app.post('/tournament', createTournamentHandler)
};

export default matchRoutes;