import { FastifyInstance } from "fastify";

import {
	getUserDataHandler,
	updateUsernameHandler,
	updatePasswordHandler,
	updateUserAvatarHandler,
	getUserAvatarHandler,
	insertUserHandler,
	setStatusHandler,
	getUserIdByUsernameHandler,
	getUsernameByUserIdHandler,
	friendRequestHandler,
	acceptFriendRequestHandler,
	rejectFriendRequestHandler,
	getFriendRequestsHandler,
	getFriendsHandler,
	removeFriendHandler
} from "./userController.js";

// prefix: /users
export const userRoutes = async (app: FastifyInstance) => {
	app.get('/profile',		{ preHandler: [app.authenticate] },	getUserDataHandler);
	app.put('/username',	{ preHandler: [app.authenticate] },	updateUsernameHandler);
	app.put('/password',	{ preHandler: [app.authenticate] },	updatePasswordHandler);
	app.get('/avatar',		{ preHandler: [app.authenticate] },	getUserAvatarHandler);
	app.put('/avatar',		{ preHandler: [app.authenticate] },	updateUserAvatarHandler);
	
	app.post('/new-user',		insertUserHandler);
	app.put('/status',			setStatusHandler);
	app.get('/get-userid',		getUserIdByUsernameHandler);
	app.get('/get-username',	getUsernameByUserIdHandler);
};

// prefix: /users/friends
export const friendRoutes = async (app: FastifyInstance) => {
	app.post('/request',	{ preHandler: [app.authenticate] }, friendRequestHandler);
	app.put('/accept',		{ preHandler: [app.authenticate] }, acceptFriendRequestHandler);
	app.put('/reject',		{ preHandler: [app.authenticate] }, rejectFriendRequestHandler);
	
	app.get('/requests',	{ preHandler: [app.authenticate] }, getFriendRequestsHandler);
	app.get('/list',		{ preHandler: [app.authenticate] }, getFriendsHandler);
	
	app.delete('/remove',	{ preHandler: [app.authenticate] }, removeFriendHandler);
};