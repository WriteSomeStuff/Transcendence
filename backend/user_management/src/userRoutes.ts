import { FastifyInstance } from "fastify";

import {
	insertUserHandler,
	updateUsernameHandler,
	updateUserAvatarHandler,
	setStatusHandler,
	getUserAvatarHandler,
	getUserDataHandler,
	getUserIdByUsernameHandler,
	getUsernameByUserIdHandler
} from "./userController.js";

// prefix: /users
const userRoutes = async (app: FastifyInstance) => {
	app.post('/new-user',	insertUserHandler);
	
	app.put('/username',	{ preHandler: [app.authenticate] },	updateUsernameHandler);
	app.put('/avatar',		{ preHandler: [app.authenticate] },	updateUserAvatarHandler);
	app.put('/status',		setStatusHandler);
	
	app.get('/avatar',		{ preHandler: [app.authenticate] },	getUserAvatarHandler);
	app.get('/profile',		{ preHandler: [app.authenticate] },	getUserDataHandler);
	app.get('/get-userid',		getUserIdByUsernameHandler);
	app.get('/get-username',	getUsernameByUserIdHandler);
};

export default userRoutes;