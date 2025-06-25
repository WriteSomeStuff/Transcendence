import { FastifyInstance } from "fastify";

import {
	getUserDataHandler,
	updateUsernameHandler,
	updatePasswordHandler,
	getUserAvatarHandler,
	insertUserHandler,
	setStatusHandler,
	getUserIdByUsernameHandler
} from "./userController";

const userRoutes = async (app: FastifyInstance) => {
	app.get('/profile',		{ preHandler: [app.authenticate] },	getUserDataHandler);
	app.put('/username',	{ preHandler: [app.authenticate] },	updateUsernameHandler);
	app.put('/password',	{ preHandler: [app.authenticate] },	updatePasswordHandler);
	app.get('/avatar',		{ preHandler: [app.authenticate] },	getUserAvatarHandler);
	
	app.post('/new-user',		insertUserHandler);
	app.put('/status',			setStatusHandler);
	app.get('/get-username',	getUserIdByUsernameHandler);
};

export default userRoutes;