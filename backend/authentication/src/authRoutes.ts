import { FastifyInstance } from "fastify";

import {
	registerUserHandler,
	loginUserHandler,
	logoutUserHandler,
	updateUsernameHandler,
	updatePasswordHandler,
	// generate2FATokenHandler,
	// verify2FATokenHandler
} from "./authController";

const authRoutes = async (app: FastifyInstance) => {
	app.post('/register', registerUserHandler);
	app.post('/login', loginUserHandler);
	app.delete('/logout', { preHandler: [app.authenticate] }, logoutUserHandler);
	app.put('/username', updateUsernameHandler);
	app.put('/password', updatePasswordHandler);
	// app.post('/generate2FA', generate2FATokenHandler);
	// app.post('/verify2FA', verify2FATokenHandler);
};

export default authRoutes;