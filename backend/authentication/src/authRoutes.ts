import { FastifyInstance } from "fastify";

import {
	registerUserHandler,
	loginUserHandler,
	logoutUserHandler,
	updateUsernameHandler,
	updatePasswordHandler
} from "./authController";

const authRoutes = async (app: FastifyInstance) => {
	app.post('/register', registerUserHandler);
	app.post('/login', loginUserHandler);
	app.delete('/logout', { preHandler: [app.authenticate] }, logoutUserHandler);
	app.put('/username', updateUsernameHandler);
	app.put('/password', updatePasswordHandler);
};

export default authRoutes;