
/** Handles the authentication logic for registration and login.
* 1. Imports FastifyRequest, FastifyReply, and authentication service functions.
* 2. Defines registerUserHandler and loginUserHandler functions.
* 3. Handles request data and calls service functions.
* 4. Sends appropriate responses based on the outcome.
 */

import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

import { registerSchema, loginSchema } from "./schemas/authSchemas";
import { handleUserDbError, handleSuccessfulLogin } from "./helpers/authControllerHelpers";

import {
	register,
	registerUserInUserService,
	login,
	setStatusInUserService,
	updatePassword,
	verify2FA,
	enable2FA,
	disable2FA
} from "./authService";

export const registerUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const parsedData = registerSchema.parse(request.body);
		const { username, password } = parsedData;

		console.log(`[Auth Controller] Registering user '${username}'`);
		const userId = await register(username, password);
		console.log(`[Auth Controller] Registering user '${username}' successful: ${userId}`);
		
		console.log(`[Auth Controller] Registering user '${username}' to user db`);
		const response = await registerUserInUserService(username, userId);
		console.log(`[Auth Controller] Registering user '${username}' to user db successful`);

		if (!response.ok) {
			handleUserDbError(response, userId, reply);
			return;	
		}

		reply.status(201).send({
			success: true,
			message: "User registered successfully"
		});
	
	} catch (e) {
		console.error('Error registering the user:', e);
		if (e instanceof z.ZodError) { // Schema error (e.g. password too short)
			reply.status(400).send({
				success: false,
				error: e.errors.map((err) => err.message).join(", ")
			});
		} else {
			reply.status(500).send({
				success: false,
				error: 'An error occured registering the user: ' + e
			});
		}
		
	}
};

export const loginUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const parsedData = loginSchema.parse(request.body);
		const { username, password } = parsedData;

		console.log(`[Auth Controller] Logging in user '${username}'`);
		const result = await login(username, password);
		console.log(`[Auth Controller] Logging in user '${username}' successful`);

		if (!result.success) {
			reply.status(401).send({
				success: false,
				error: result.error
			});
		}
		
		// If login is successful and 2FA is enabled, send a response indicating that 2FA verification is required
		if (result.twoFA) {
			console.log(`[Auth Controller] User ${result.userId} ${username} has 2FA enabled`);
			reply.status(200).send({
				success: true,
				twoFA: true,
				message: "Two-factor authentication is enabled for this user. Please verify your token.",
				next: "/verify2fa",
				// userId: result.userId, //for testing purposes
				username: username
			});
		}

		console.log(`[Auth Controller] Handling successful login for user ${result.userId} ${username}`);
		await handleSuccessfulLogin(request, reply, Number(result.userId), username);
		console.log(`[Auth Controller] User ${result.userId} ${username} logged in successfully`);

		reply.status(200).send({ 
			success: true,
			message: "User logged in successfully"
		});

	} catch (e) {
		console.error('Error logging in the user:', e);
		if (e instanceof z.ZodError) {
			reply.status(400).send({ 
				success: false,
				error: e.errors.map((err) => err.message).join(", ")
			});
		} else {
			reply.status(500).send({
				success: false,
				error: 'An error occurred during login: ' + e
			});
		}
	}
};

export const verify2FATokenHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		// TODO make sure this request is sent with the correct context in body
		// also needs to include username
		const { userId, token, username } = request.body as { userId: number, token: string, username: string };

		if (!userId || !token || !username) {
			console.error(`[Auth Controller] Missing userId, token or username in request body`);
			reply.status(400).send({ error: 'UserId, username and token are required' });
			return;
		}

		console.log(`[Auth Controller] Verifying 2FA token for user ${userId} ${username}`);
		const result = await verify2FA(userId, token, username);
		
		if (!result.success) {
			reply.status(401).send({ error: result.error });
			return;
		}
		
		console.log(`[Auth Controller] User ${userId} ${username} verified 2FA token successfully`);

		console.log(`[Auth Controller] Handling successful login for user ${userId} ${username}`);
		await handleSuccessfulLogin(request, reply, userId, username);
		console.log(`[Auth Controller] User ${userId} ${username} logged in successfully after 2FA verification`);

		reply.status(200).send({ 
			success: true,
			message: "2FA token verified successfully",
			next: "/home"
		});

	} catch (e) {
		console.error('Error verifying 2FA token:', e);
		if (e instanceof Error) {
			reply.status(500).send({ 
				success: false,
				error: 'An error occurred during 2FA verification: ' + e.message
			});
		}
	}
};

export const logoutUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		reply.clearCookie('access_token'); // to clear cookie in browser
		console.log(`[Auth Controller] Cleared cookie for user ${request.user.userId}`);

		console.log(`[Auth Controller] Setting status to 'offline' for user ${request.user.userId}`);
		const response = await setStatusInUserService(request.user.userId, 'offline');
		
		if (!response.ok) {
			console.error('Failed to update user service database:', response.statusText);
			reply.status(response.status).send("Failed to update user service database");
			return;
		}
		console.log(`[Auth Controller] Set status to 'offline' for user ${request.user.userId}`);
	
		return reply.status(200).send({
			success: true,
			message: "Logout successfull"
		});
		
	} catch (e) {
		console.error('Error clearing cookie:', e);
		reply.status(500).send({
			success: false,
			error: 'An error occurred during logout: ' + e
		});
	}
}

export const updatePasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { newPassword, userId } = request.body as { newPassword: string, userId: number };

		console.log(`[Auth Controller] Updating password for user ${userId}`);
		await updatePassword(newPassword, userId);
		console.log(`[Auth Controller] Updating password for user ${userId} successful`);

		reply.status(200).send({ success: true });

	} catch (e) {
		console.error('Error updating the password:', e);
		reply.status(500).send({
			success: false,
			error: 'An error occurred updating the password: ' + e
		});	
	}
}

export const enable2FAHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		if (!request.user.userId) {
			console.error(`[Auth Controller] Missing userId in request body`);
			reply.status(400).send({ error: 'UserId is required' });
			return;
		}

		console.log(`[Auth Controller] Enabling 2FA for user ${request.user.userId}`);
		const result = await enable2FA(request.user.userId);

		if (!result.success) {
			console.error(`[Auth Controller] Failed to enable 2FA for user ${request.user.userId}: ${result.error}`);
			reply.status(400).send({ error: result.error });
			return;
		}

		console.log(`[Auth Controller] 2FA enabled successfully for user ${request.user.userId}`);

		reply.status(200).send({
			success: true,
			twoFASecret: result.twoFASecret,
			qrCode: result.qrCode,
			message: "Two-factor authentication enabled successfully"
		});

	} catch (e) {
		reply.status(500).send({
			success: false,
			error: 'An error occurred enabling 2FA' 
		});
	}
}

export const disable2FAHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		disable2FA(request.user.userId);

		reply.status(200).send({ success: true, message: "Two-factor authentication disabled successfully" });

	} catch (e) {
		reply.status(500).send({
			success: false,
			error: 'An error occurred disabling 2FA' 
		});
	}
}