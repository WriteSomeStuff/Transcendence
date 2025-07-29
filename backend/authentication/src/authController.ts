
/** Handles the authentication logic for registration and login.
* 1. Imports FastifyRequest, FastifyReply, and authentication service functions.
* 2. Defines registerUserHandler and loginUserHandler functions.
* 3. Handles request data and calls service functions.
* 4. Sends appropriate responses based on the outcome.
 */

import { FastifyRequest, FastifyReply } from "fastify";

import {
	RegisterSchema,
	LoginSchema,
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
	OAuthCallback,
	setStatusInUserService,
	updatePassword,
	verify2FA,
	enable2FA,
	disable2FA
} from "./authService.ts";

export const registerUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const parseResult = RegisterSchema.safeParse(request.body);
		if (!parseResult.success) {
			reply.status(400).send({
				success: false,
				error: parseResult.error.errors.map((err) => err.message).join(", ")
			});
			return;
		}
		const { email, password, confirmPassword, username } = parseResult.data;
		if (password !== confirmPassword) {
			reply.status(400).send({
				success: false,
				error: "Passwords do not match"
			});
			return;
		}

		console.log(`[Auth Controller] Registering user '${email}'`);
		const userId = await register(email, password);
		console.log(`[Auth Controller] Registering user '${email}' successful: ${userId}`);

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
		const parseResult = LoginSchema.safeParse(request.body);
		if (!parseResult.success) {
			const badRequestPayload = {
				success: false,
				error: parseResult.error.errors.map((err) => err.message).join(", ")
			};
			reply.status(400).send(AuthResultSchema.parse(badRequestPayload));
			return;
		}
		const { email, password } = parseResult.data;

		console.log(`[Auth Controller] Logging in user '${email}'`);
		const result = await login(email, password);
		console.log(`[Auth Controller] Logging in user '${email}' successful`);

		if (!result.success) {
			const errorPayload = { success: false, error: result.error };
			reply.status(401).send(AuthResultSchema.parse(errorPayload));
		}

		// If login is successful and 2FA is enabled, send a response indicating that 2FA verification is required
		if (result.twoFA) {
			console.log(`[Auth Controller] User ${result.userId} ${email} has 2FA enabled`);
			const twoFAPayload = {
				success: true,
				userId: result.userId,
				email: email,
				twoFA: true,
				message: "Two-factor authentication is enabled for this user. Please verify your token.",
			};
			reply.status(200).send(AuthResultSchema.parse(twoFAPayload));
		}

		console.log(`[Auth Controller] Handling successful login for user ${result.userId} ${email}`);
		await handleSuccessfulLogin(request, reply, Number(result.userId));
		console.log(`[Auth Controller] User ${result.userId} ${email} logged in successfully`);

		const successPayload = {
			success: true,
			userId: result.userId,
			email: email,
			twoFA: false,
			message: "User logged in successfully"
		}
		reply.status(200).send(AuthResultSchema.parse(successPayload));

	} catch (e) {
		const errorPayload = { success: false, error: 'An error occurred during login: ' + e };
		reply.status(500).send(AuthResultSchema.parse(errorPayload));
	}
};

export const OAuthloginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		//TODO: handle as registerUserInUserService
		(void request);
		console.log(`[Auth Controller] OAuth login initiated`);

		const redirectUri = process.env['OAUTH_REDIRECT_URI'];
		const cliendID = process.env['OAUTH_CLIENT_ID'];
		if (!redirectUri || !cliendID) {
			console.error(`[Auth Controller] OAuth redirect URI or client ID is not configured`);
			reply.status(500).send({
				success: false,
				error: 'OAuth redirect URI or client ID is not configured'
			});
			return;
		}

		reply.redirect('https://api.intra.42.fr/oauth/authorize?client_id=' + encodeURIComponent(cliendID) +
			'&redirect_uri=' + encodeURIComponent(redirectUri) +
			'&response_type=code' +
			'&scope=public');
	} catch (e) {
		console.error('Error during OAuth login:', e);
		reply.status(500).send({
			success: false,
			error: 'An error occurred during OAuth login: ' + e
		});
	}
};

export const OAuthCallbackHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		console.log(`[Auth Controller] OAuth callback received`);

		const { code } = request.query as { code: string};
		if (!code) {
			console.error(`[Auth Controller] OAuth callback missing code`);
			reply.status(400).send({
				success: false,
				error: 'OAuth callback missing code'
			});
			return;
		}
		console.log(`[Auth Controller] OAuth callback code: ${code}`);

		const { userId } = await OAuthCallback(code);
		if (!userId) {
			console.error(`[Auth Controller] User not found in OAuth callback`);
			reply.status(404).send({
				success: false,
				error: 'User not found in OAuth callback'
			});
			return;
		}

		console.log(`[Auth Controller] User ID from OAuth callback: ${userId}`);
		await handleSuccessfulLogin(request, reply, userId);
		console.log(`[Auth Controller] User ${userId} logged in successfully after OAuth callback`);

		reply.status(200).send({
			success: true,
			message: "OAuth login successful",
			next: "/home"
		});

	} catch (e) {
		console.error('Error during OAuth callback:', e);
		reply.status(500).send({
			success: false,
			error: 'An error occurred during OAuth callback: ' + e
		});
	}
}

export const verify2FATokenHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		console.log(`[Auth Controller] Received request to verify 2FA token`);
		const { token, email } = request.body as { token: string, email: string };

		console.log(`[Auth Controller] Received request to verify 2FA token for user ${email}`);
		if (!token || !email) {
			console.error(`[Auth Controller] Missing token or email in request body`);
			reply.status(400).send({ error: 'email and token are required' });
			return;
		}

		console.log(`[Auth Controller] Verifying 2FA token for user ${email}`);
		const result = await verify2FA(token, email);

		if (!result.success) {
			reply.status(401).send({ error: result.error });
			return;
		}

		let userId = result.userId; // Ensure userId is defined
		if (userId === undefined) {
			console.error(`[Auth Controller] User ID missing after 2FA verification for user ${email}`);
			reply.status(500).send({ error: "User ID missing after 2FA verification" });
			return;
		}

		console.log(`[Auth Controller] User ${email} verified 2FA token successfully`);

		console.log(`[Auth Controller] Handling successful login for user ${email}`);
		await handleSuccessfulLogin(request, reply, userId);
		console.log(`[Auth Controller] User ${email} logged in successfully after 2FA verification`);

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
