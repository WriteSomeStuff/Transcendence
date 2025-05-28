import { FastifyInstance } from "fastify";
import { getUserDataHandler, updateUsernameHandler } from "./userController";

const userRoutes = async (app: FastifyInstance) => {
	// app.get('/profile', { preHandler: [app.authenticate] }, getUserDataHandler);
	// app.post('/username', { preHandler: [app.authenticate] }, updateUsernameHandler);
	app.get('/profile', getUserDataHandler);
	app.post('/username', updateUsernameHandler);
};

export default userRoutes;