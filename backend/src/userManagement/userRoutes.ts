import { FastifyInstance } from "fastify";
import { updateAvatar, getUserData } from "./userController";

export const userRoutes = async (app: FastifyInstance) => {
	app.post('/avatar', updateAvatar);
	app.get('/profile', { preHandler: [app.authenticate] }, getUserData);
};
