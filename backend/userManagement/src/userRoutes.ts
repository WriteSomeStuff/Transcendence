import { FastifyInstance } from "fastify";

import {
	getUserDataHandler,
	updateUsernameHandler,
	updatePasswordHandler,
	updateUserAvatarHandler,
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
	app.put('/avatar',		{ preHandler: [app.authenticate] },	updateUserAvatarHandler);
	
	app.post('/new-user',		insertUserHandler);
	app.put('/status',			setStatusHandler);
	app.get('/get-username',	getUserIdByUsernameHandler);
};

export default userRoutes;