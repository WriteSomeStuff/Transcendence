/** Defines the authentication routes and associates them with controller functions.
* 1. Imports FastifyInstance and controller functions.
* 2. Defines routes for /register
* 3. Associates routes with controller functions.
* 4. Exports the routes.
 */

// 1.
import { FastifyInstance } from "fastify";
import { registerUser } from "./authController";

// 2. & 4.
export const authRoutes = async (fastify: FastifyInstance) => {
	// 3.
	fastify.post('/register', registerUser);
};