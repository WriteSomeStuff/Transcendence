
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
	updatePassword,
	verify2FA,
	enable2FA,
	disable2FA
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

		const response = await fetch('http://user_service:8080/users/new-user', {
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

// in controller or service?
async function handleSuccessfulLogin(request: FastifyRequest, reply: FastifyReply, userId: number, username: string) {
	const token = request.jwt.sign({ userId: userId }, { expiresIn: "1d" });
	
	console.log("Login successful");
	
	const isProduction = process.env.NODE_ENV === 'production'; // because testing with http requests, can also be set to "auto" maybe?
	
	reply.setCookie('access_token', token, {
		path: '/',
		httpOnly: true,
		secure: isProduction,
	});

	const response = await fetch ('http://user_service:8080/users/status', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			userId: userId,
			status: 'online'
		})
	})
	
	if (!response.ok) {
		reply.status(500).send("Failed to update user service database");
		return;
	}

	reply.status(200).send({ message: `user '${username}' logged in successfully` });
}

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
		
		// If login is successful and 2FA is enabled, send a response indicating that 2FA verification is required
		if (result.twoFA) {
			reply.status(200).send({
				success: true,
				twoFA: true,
				message: "Two-factor authentication is enabled for this user. Please verify your token.",
				next: "/verify2FA",
				username: username
			});
			return;
		}

		// If login is successful and 2FA is not enabled, handle the successful login
		await handleSuccessfulLogin(request, reply, result.userId, username);

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

export const verify2FATokenHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { username, token } = request.body as { username: string, token: string };

		if (!username || !token) {
			reply.status(400).send({ error: 'Username and token are required' });
			return;
		}

		const result = await verify2FA(username, token);

		if (!result.success) {
			reply.status(401).send({ error: result.error });
			return;
		}

		if (typeof result.userId !== 'number') {
			reply.status(500).send({ error: 'Invalid userId returned from 2FA verification' });
			return;
		}

		console.log('User %d verified via 2FA', result.userId);

		await handleSuccessfulLogin(request, reply, result.userId, username);

		reply.status(200).send({ message: "2FA verification successful" });

	} catch (e) {
		if (e instanceof Error) {
			reply.status(500).send({ error: 'An error occurred during 2FA verification:' + e.message });
		}
	}
};

export const logoutUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	reply.clearCookie('access_token'); // to clear cookie in browser

	const response = await fetch ('http://user_service:8080/users/status', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			userId: request.user.userId,
			status: 'offline'
		})
	})

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

export const enable2FAHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { userId } = request.body as { userId: number };

		const result = await enable2FA(userId);

		if (!result.success) {
			reply.status(400).send({ error: result.error });
			return;
		}

		reply.status(200).send({
			success: true,
			twoFASecret: result.twoFASecret,
			qrCode: result.qrCode,
			message: "Two-factor authentication enabled successfully"
		});
	} catch (e) {
		reply.send({
			success: false,
			error: 'An error occurred enabling 2FA' 
		});
	}
}

export const disable2FAHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { userId } = request.body as { userId: number };

		disable2FA(userId);

		reply.status(200).send({ success: true, message: "Two-factor authentication disabled successfully" });

	} catch (e) {
		reply.status(500).send({
			success: false,
			error: 'An error occurred disabling 2FA' 
		});
	}
}