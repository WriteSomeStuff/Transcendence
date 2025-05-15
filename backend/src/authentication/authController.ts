
/** Handles the authentication logic for registration and login.
* 1. Imports FastifyRequest, FastifyReply, and authentication service functions.
* 2. Defines registerUser and loginUser functions.
* 3. Handles request data and calls service functions.
* 4. Sends appropriate responses based on the outcome.
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { register, login } from "./authService";
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

const LOGIN_SCHEMA = z.object({
	username: z.string()
		.min(3, "Username too short")
		.max(32, "Username too long"),
	password: z.string()
		.min(6, "Password too short")
		.max(64, "Password too long"),
})
.required();

export const registerUser = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const parsedData = REGISTER_SCHEMA.parse(request.body);
		const { username, password } = parsedData;

		// call the service function to register user into database
		await register(username, password);
		reply.redirect('registerSuccess', 301); 
		// Use 201 Created if you want to follow RESTful conventions and let the client handle navigation.
		// Use 303 See Other if you want the server to handle navigation to the success page. Avoid 301 for this use case.
	} catch (e) {
		if (e instanceof z.ZodError) { // Schema error (e.g. password too short)
			reply.status(400).send({ error: e.errors });
		} else if (e instanceof Error) { // Failed stmt (e.g. username exists)
			reply.status(400).send({ error: e.message });
		} else {
			reply.status(400).send({ error: e });
		}
	}
};

export const loginUser = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const parsedData = LOGIN_SCHEMA.parse(request.body);
		const { username, password } = parsedData;

		const isVerified = await login(username, password);

		if (isVerified) {
			const token = request.jwt.sign({ username: username, type: "registered" }, { expiresIn: "1d" });
			console.log("Login successful");
			reply.setCookie("access_token", token, {
				path: '/',
				httpOnly: true,
				secure: true,
			});
			reply.redirect('profile', 301);
		} else {
			reply.status(401).send({ error: 'Invalid username or password' });
		}
	} catch (e) {
		if (e instanceof z.ZodError) {
      		reply.status(400).send({ error: e.errors });
    	} else {
			if (e instanceof Error) {
				reply.status(500).send({ error: 'An error occurred during login:' + e.message });
			}
    	}
	}
};

export const logoutUser = async (request: FastifyRequest, reply: FastifyReply) => {
	reply.clearCookie('access_token');
	return reply.send({ message: "Logout successfull" });
}
