import { FastifyInstance } from "fastify";

import {
	registerUserHandler,
	loginUserHandler,
	logoutUserHandler,
	updateUsernameHandler,
	updatePasswordHandler,
	enable2FAHandler,
	// disable2FAHandler,
	verify2FATokenHandler
} from "./authController";

const authRoutes = async (app: FastifyInstance) => {
	app.post('/register', registerUserHandler);
	app.post('/login', loginUserHandler);
	app.delete('/logout', { preHandler: [app.authenticate] }, logoutUserHandler);
	app.put('/username', updateUsernameHandler);
	app.put('/password', updatePasswordHandler);
	app.post('/enable2FA', enable2FAHandler);
	app.post('/verify2FA', verify2FATokenHandler);
	// app.post('/disable2FA', disable2FAHandler);
};

export default authRoutes;