
/** Handles the authentication logic for registration and login.
* 1. Imports FastifyRequest, FastifyReply, and authentication service functions.
* 2. Defines registerUser and loginUser functions.
* 3. Handles request data and calls service functions.
* 4. Sends appropriate responses based on the outcome.
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { register } from "./authService";
import { z } from "zod";

const REGISTER_SCHEMA = z.object({
	username: z.string()
		.min(3, "Username is required")
		.max(32, "Username too long"),
	password: z.string()
		.min(6, "Password too short")
		.max(64, "Password too long"),
})
.required();

// const LOGIN_SCHEMA = z.object({
// 	username: z.string()
// 		.min(3, "Username is required")
// 		.max(32, "Username too long"),
// 	password: z.string()
// 		.min(6, "Password too short")
// 		.max(64, "Password too long"),
// })
// .required();

export const registerUser = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const parsedData = REGISTER_SCHEMA.parse(request.body);
		const { username, password } = parsedData;

		// call the service function to register user into database
		await register(username, password);
		reply.status(201).send({ message: "User registered successfully"});
	} catch (e) {
		if (e instanceof z.ZodError) {
			reply.status(400).send({ error: e.errors });
		} else if (e instanceof Error) {
			reply.status(400).send({ error: e.message });
		} else {
			reply.status(400).send({ error: e });
		}
	}
};
