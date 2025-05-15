/** Defines the authentication routes and associates them with controller functions.
* 1. Imports FastifyInstance and controller functions.
* 2. Defines routes for /register
* 3. Associates routes with controller functions.
* 4. Exports the routes.
 */

// 1.
import { FastifyInstance } from "fastify";
import { registerUser, loginUser, logoutUser } from "./authController";

// 2. & 4.
export const authRoutes = async (app: FastifyInstance) => {
	// 3.
	app.post('/register', registerUser);
	app.post('/login', loginUser);
	app.delete('/logout', { preHandler: [app.authenticate] }, logoutUser);
};