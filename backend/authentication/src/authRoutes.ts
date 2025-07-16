import { FastifyInstance } from "fastify";

import {
	registerUserHandler,
	loginUserHandler,
	OAuthloginHandler,
	OAuthCallbackHandler,
	logoutUserHandler,
	updatePasswordHandler,
	verify2FATokenHandler,
	enable2FAHandler,
	disable2FAHandler
} from "./authController.js";

const authRoutes = async (app: FastifyInstance) => {
	app.delete('/logout',		{ preHandler: [app.authenticate] }, logoutUserHandler);
	
	app.post('/register',		registerUserHandler);
	app.post('/login',			loginUserHandler);
	app.get('/oauth/login',		OAuthloginHandler);
	app.get('/oauth/callback',	OAuthCallbackHandler);
	app.put('/password',		updatePasswordHandler);
	
	app.post('/verify2fa',		verify2FATokenHandler);
	app.post('/enable2fa',		{ preHandler: [app.authenticate] }, enable2FAHandler);
	app.post('/disable2fa',		{ preHandler: [app.authenticate] }, disable2FAHandler);
};

export default authRoutes;
