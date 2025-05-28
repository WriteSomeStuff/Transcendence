/** Defines the authentication routes and associates them with controller functions.
* 1. Imports FastifyInstance and controller functions.
* 2. Defines routes for /register
* 3. Associates routes with controller functions.
* 4. Exports the routes.
 */

// 1.
import { FastifyInstance } from "fastify";
// import { registerUserHandler, loginUserHandler, logoutUserHandler } from "./authController";
import { registerUserHandler, loginUserHandler } from "./authController";

// 2. & 4.
const authRoutes = async (app: FastifyInstance) => {
	// 3.
	app.post('/register', registerUserHandler);
	app.post('/login', loginUserHandler);
	// app.delete('/logout', { preHandler: [app.authenticate] }, logoutUserHandler);
};

export default authRoutes;