import { FastifyInstance } from "fastify";

import {
	insertUserHandler,
	getUserDataHandler,
	updateUsernameHandler,
	setStatusHandler,
	updatePasswordHandler,
	getUserIdByUsernameHandler
} from "./userController";

const userRoutes = async (app: FastifyInstance) => {
	app.get('/profile', { preHandler: [app.authenticate] }, getUserDataHandler);
	app.put('/username', { preHandler: [app.authenticate] }, updateUsernameHandler);
	app.put('/password', { preHandler: [app.authenticate] }, updatePasswordHandler);
	app.post('/new-user', insertUserHandler);
	app.put('/status', setStatusHandler);
	app.get('/get-username', getUserIdByUsernameHandler);
};

export default userRoutes;