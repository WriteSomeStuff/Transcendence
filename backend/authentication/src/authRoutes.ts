import { FastifyInstance } from "fastify";

import {
	registerUserHandler,
	loginUserHandler,
	logoutUserHandler,
	updateUsernameHandler
} from "./authController";

// 2. & 4.
const authRoutes = async (app: FastifyInstance) => {
	// 3.
	app.post('/register', registerUserHandler);
	app.post('/login', loginUserHandler);
	app.delete('/logout', { preHandler: [app.authenticate] }, logoutUserHandler);
	app.put('/username', updateUsernameHandler);
};

export default authRoutes;