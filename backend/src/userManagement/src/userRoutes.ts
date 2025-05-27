import { FastifyInstance } from "fastify";
import { getUserDataHandler, updateUsernameHandler } from "./userController";

export const userRoutes = async (app: FastifyInstance) => {
	app.get('/profile', { preHandler: [app.authenticate] }, getUserDataHandler);
	app.post('/username', { preHandler: [app.authenticate] }, updateUsernameHandler);
};
