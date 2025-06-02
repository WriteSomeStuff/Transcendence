import { FastifyInstance } from "fastify";

import {
	insertUserHandler,
	getUserDataHandler,
	updateUsernameHandler
} from "./userController";

const userRoutes = async (app: FastifyInstance) => {
	app.get('/profile', { preHandler: [app.authenticate] }, getUserDataHandler);
	app.put('/username', { preHandler: [app.authenticate] }, updateUsernameHandler);
	app.post('/new-user', insertUserHandler);
};

export default userRoutes;