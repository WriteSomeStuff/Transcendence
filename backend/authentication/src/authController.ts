
/** Handles the authentication logic for registration and login.
* 1. Imports FastifyRequest, FastifyReply, and authentication service functions.
* 2. Defines registerUserHandler and loginUserHandler functions.
* 3. Handles request data and calls service functions.
* 4. Sends appropriate responses based on the outcome.
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

import {
	register,
	login,
	updateUsername,
	updatePassword
} from "./authService";

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

export const registerUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const parsedData = REGISTER_SCHEMA.parse(request.body);
		const { username, password } = parsedData;

		// call the service function to register user into database
		await register(username, password);

		// TODO also fetch with user_id in body
		const url = process.env.USER_SERVICE_URL + '/new-user';
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username: username })
		});

		if (!response.ok) {
			reply.status(500).send("Failed to update user service database");
		}

		reply.status(201).send({
			success: true,
			message: "User registered successfully"
		});
	
	} catch (e) {
		if (e instanceof z.ZodError) { // Schema error (e.g. password too short)
			reply.status(400).send({
				success: false,
				error: e.errors.map((err) => err.message).join(", ")
			});
		} else if (e instanceof Error) { // Failed stmt (e.g. username exists)
			reply.status(400).send({
				success: false,
				error: e.message + ': username already exists'
			});
		} else {
			reply.status(400).send({
				success: false,
				error: 'An error occured registrating the user:' + e
			});
		}
	}
};

export const loginUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const parsedData = LOGIN_SCHEMA.parse(request.body);
		const { username, password } = parsedData;

		const result = await login(username, password);

		if (!result.success) {
			reply.status(401).send({ error: result.error });
			return;
		}

		if (typeof result.userId !== 'number') {
			reply.status(500).send({ error: 'Invalid userId returned from login' });
			return;
		}
		console.log('User %d verified', result.userId);
		
		// 2FA if (result.twoFa) { do authentication }

		const token = request.jwt.sign({ userId: result.userId }, { expiresIn: "1d" });
		
		console.log("Login successful");
		
		const isProduction = process.env.NODE_ENV === 'production'; // because testing with http requests, can also be set to "auto" maybe?
		
		reply.setCookie('access_token', token, {
			path: '/',
			httpOnly: true,
			secure: isProduction,
		});

		const url = process.env.USER_SERVICE_URL + '/status';
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				userId: result.userId,
				status: 'online'
			})
		})
		
		if (!response.ok) {
			reply.status(500).send("Failed to update user service database");
		}

		reply.status(200).send({ message: `user '${username}' logged in successfully` });

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

export const logoutUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	reply.clearCookie('access_token'); // to clear cookie in browser

	const url = process.env.USER_SERVICE_URL + '/status';
	const response = await fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			userId: request.user.userId,
			status: 'offline'
		})
	})

	if (!response.ok) {
		reply.status(500).send("Failed to update user service database");
	}

	return reply.send({ message: "Logout successfull" });
}

export const updateUsernameHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { newUsername, userId } = request.body as { newUsername: string, userId: number };

		updateUsername(newUsername, userId);

		reply.send({ success: true });
	} catch (e) {
		reply.send({
			success: false,
			error: 'An error occured inserting a new username into authentication database'
		});
	}
}

export const updatePasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { newPassword, userId } = request.body as { newPassword: string, userId: number };

		updatePassword(newPassword, userId);

		reply.send({ success: true });

	} catch (e) {
		reply.send({
			success: false,
			error: 'An error occured inserting a new password into authentication database'
		});	
	}
}