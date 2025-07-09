
/** Handles the authentication logic for registration and login.
* 1. Imports FastifyRequest, FastifyReply, and authentication service functions.
* 2. Defines registerUserHandler and loginUserHandler functions.
* 3. Handles request data and calls service functions.
* 4. Sends appropriate responses based on the outcome.
 */

import { FastifyRequest, FastifyReply } from "fastify";

import {
	CredentialsSchema,
	AuthResultSchema,
	Enable2FAResultSchema
} from "schemas";
import {
	handleUserDbError,
	handleSuccessfulLogin,
	handleAuthInvalidation
} from "./helpers/authControllerHelpers.ts";

import {
	register,
	registerUserInUserService,
	login,
	setStatusInUserService,
	updatePassword,
	verify2FA,
	enable2FA,
	disable2FA
} from "./authService.ts";

export const registerUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const parseResult = CredentialsSchema.safeParse(request.body);
		if (!parseResult.success) {
			reply.status(400).send({
				success: false,
				error: parseResult.error.errors.map((err) => err.message).join(", ")
			});
			return;
		}
		const { username, password } = parseResult.data;

		console.log(`[Auth Controller] Registering user '${username}'`);
		const userId = await register(username, password);
		console.log(`[Auth Controller] Registering user '${username}' successful: ${userId}`);
		
		console.log(`[Auth Controller] Registering user '${username}' to user db`);
		const response = await registerUserInUserService(username, userId);
		console.log(`[Auth Controller] Registering user '${username}' to user db successful`);

		if (!response.ok) {
			await handleUserDbError(response, userId, reply);
			return;	
		}

		reply.status(201).send({
			success: true,
			message: "User registered successfully"
		});
	
	} catch (e) {
		console.error('Error registering the user:', e);
		reply.status(500).send({
			success: false,
			error: 'An error occurred registering the user: ' + e
		});
	}
};

export const loginUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const parseResult = CredentialsSchema.safeParse(request.body);
		if (!parseResult.success) {
			const badRequestPayload = {
				success: false,
				error: parseResult.error.errors.map((err) => err.message).join(", ")
			};
			reply.status(400).send(AuthResultSchema.parse(badRequestPayload));
			return;
		}
		const { username, password } = parseResult.data;

		console.log(`[Auth Controller] Logging in user '${username}'`);
		const result = await login(username, password);
		console.log(`[Auth Controller] Logging in user '${username}' successful`);

		if (!result.success) {
			const errorPayload = { success: false, error: result.error };
			reply.status(401).send(AuthResultSchema.parse(errorPayload));
		}
		
		// If login is successful and 2FA is enabled, send a response indicating that 2FA verification is required
		if (result.twoFA) {
			console.log(`[Auth Controller] User ${result.userId} ${username} has 2FA enabled`);
			const twoFAPayload = {
				success: true,
				userId: result.userId,
				username: username,
				twoFA: true,
				message: "Two-factor authentication is enabled for this user. Please verify your token.",
			};
			reply.status(200).send(AuthResultSchema.parse(twoFAPayload));
		}

		console.log(`[Auth Controller] Handling successful login for user ${result.userId} ${username}`);
		await handleSuccessfulLogin(request, reply, Number(result.userId));
		console.log(`[Auth Controller] User ${result.userId} ${username} logged in successfully`);

		const successPayload = {
			success: true,
			userId: result.userId,
			username: username,
			twoFA: false,
			message: "User logged in successfully"
		}
		reply.status(200).send(AuthResultSchema.parse(successPayload));

	} catch (e) {
		const errorPayload = { success: false, error: 'An error occurred during login: ' + e };
		reply.status(500).send(AuthResultSchema.parse(errorPayload));
	}
};

export const verify2FATokenHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		// TODO make sure this request is sent with the correct context in body
		// also needs to include username
		console.log(`[Auth Controller] Received request to verify 2FA token`);
		const { token, username } = request.body as { token: string, username: string };

		console.log(`[Auth Controller] Received request to verify 2FA token for user ${username}`);
		if (!token || !username) {
			console.error(`[Auth Controller] Missing token or username in request body`);
			reply.status(400).send({ error: 'Username and token are required' });
			return;
		}

		console.log(`[Auth Controller] Verifying 2FA token for user ${username}`);
		const result = await verify2FA(token, username);
		
		if (!result.success) {
			reply.status(401).send({ error: result.error });
			return;
		}

		let userId = result.userId; // Ensure userId is defined
		if (userId === undefined) {
			console.error(`[Auth Controller] User ID missing after 2FA verification for user ${username}`);
			reply.status(500).send({ error: "User ID missing after 2FA verification" });
			return;
		}

		console.log(`[Auth Controller] User ${username} verified 2FA token successfully`);

		console.log(`[Auth Controller] Handling successful login for user ${username}`);
		await handleSuccessfulLogin(request, reply, userId);
		console.log(`[Auth Controller] User ${username} logged in successfully after 2FA verification`);

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
		await handleAuthInvalidation(request, reply, request.user.userId);
		console.log(`[Auth Controller] Cleared cookie for user ${request.user.userId}`);

		console.log(`[Auth Controller] Setting status to 'offline' for user ${request.user.userId}`);
		const response = await setStatusInUserService(request.user.userId, 'offline');
		
		if (!response.ok) {
			console.error('Failed to update user service database:', response.statusText);
			reply.status(response.status).send({
				success: false,
				error: "Failed to update user service database"
			});
			return;
		}
		console.log(`[Auth Controller] Set status to 'offline' for user ${request.user.userId}`);
	
		return reply.status(200).send({
			success: true,
			message: "Logout successful"
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
			const badRequestPayload = { success: false, error: 'UserId is required' };
			reply.status(400).send(Enable2FAResultSchema.parse(badRequestPayload));
			return;
		}

		console.log(`[Auth Controller] Enabling 2FA for user ${request.user.userId}`);
		const result = await enable2FA(request.user.userId);

		if (!result.success) {
			console.error(`[Auth Controller] Failed to enable 2FA for user ${request.user.userId}: ${result.error}`);
			const badRequestPayload = { success: false, error: result.error };
			reply.status(400).send(Enable2FAResultSchema.parse(badRequestPayload));
			return;
		}

		console.log(`[Auth Controller] 2FA enabled successfully for user ${request.user.userId}`);

		const successPayload = {
			success: true,
			qrCode: result.qrCode,
			message: "Two-factor authentication enabled successfully"
		};
		reply.status(200).send(Enable2FAResultSchema.parse(successPayload));

	} catch (e) {
		const errorPayload = { success: false, error: 'An error occurred enabling 2FA' };
		reply.status(500).send(AuthResultSchema.parse(errorPayload));
	}
}

export const disable2FAHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		await disable2FA(request.user.userId);

		reply.status(200).send({ 
			success: true,
			message: "Two-factor authentication disabled successfully"
		});

	} catch (e) {
		reply.status(500).send({
			success: false,
			error: 'An error occurred disabling 2FA' 
		});
	}
}