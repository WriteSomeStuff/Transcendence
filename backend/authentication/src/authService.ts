import argon2 from "argon2";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import runTransaction from "./db.js";

import type { AuthResultObj, Enable2FAResultObj } from "./types/types.js";
import { fetchUserIdByEmail, fetchEmailByUserId, processOAuthLogin, fetchUserInfoFrom42 } from "./helpers/authServiceHelpers.js";

// @ts-ignore
export const register = async (email: string, password: string): Promise<number> => {
	try {
		const hashedPassword = await argon2.hash(password);

		return runTransaction((db) => {
			const stmt = db.prepare(`
				INSERT INTO user (email, password_hash)
				VALUES (?, ?)
			`);
			const result = stmt.run(email, hashedPassword);

			return Number(result.lastInsertRowid);
		});
	} catch (e) {
		throw e;
	}
};

export const registerUserInUserService = async (username: string, userId: number): Promise<Response> => {
	try {
		const url = process.env["USER_SERVICE_URL"] + '/new-user';
		return await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({username, userId})
		});
	} catch (e) {
		throw e;
	}
}

export const login = async (email: string, password: string): Promise<AuthResultObj> => {
	try {
		const userId = await fetchUserIdByEmail(email);

		console.log(`[Auth Service] Fetching user info for user ID ${userId}`);
		const userInfo = runTransaction((db) => {
			const stmt = db.prepare(`
				SELECT
					password_hash,
					two_fa_enabled
				FROM
					user
				WHERE
					user_id = ?
			`);
			return stmt.get(userId) as { password_hash: string, two_fa_enabled: boolean };
		});
		if (!userInfo) {
			console.log(`[Auth Service] User '${email}' not found in auth service db`);
			return {
				success: false,
				error: "User not found"
			};
		}
		const verified = await argon2.verify(userInfo.password_hash, password);
		if (!verified) {
			console.log(`[Auth Service] Incorrect password for user '${email}'`);
			return {
				success: false,
				error: "Incorrect password"
			};
		} else {
			console.log(`[Auth Service] User '${email}' verified`);
			return {
				success: true,
				userId: userId,
				twoFA: userInfo.two_fa_enabled
			};
		}

	} catch (e: any) {
		console.error('Error during login:', e.message);
		return { success: false, error: e.message };
	}
};

const findOrCreateUser = async (email: string, username: string): Promise<{userId: number}> => {
	try {
		console.log(`[Auth Service] Finding or creating user with email: ${email}`);
		let userId: number | undefined;
		try {
			userId = await fetchUserIdByEmail(email);
		} catch (e) {
			console.log(`[Auth Service] User not found, creating new user`);

			const password = await argon2.hash(email);

			console.log(`[Auth Controller] Registering user '${email}'`);
			const newUserId = await register(email, password);
			console.log(`[Auth Controller] Registering user '${email}' to auth db successful: ${newUserId}`);

			console.log(`[Auth Controller] Registering user '${email}' with username '${username}' to user db`);
			const response = await registerUserInUserService(username, newUserId);
			if (!response.ok) {
				throw new Error(`Failed to register user in user service: ${response.statusText}`);
			}
			console.log(`[Auth Controller] Registering user '${email}' to user db successful`);


			console.log(`[Auth Service] New user created with ID: ${newUserId}`);
			return { userId: newUserId };
		}
		console.log(`[Auth Service] User found with ID: ${userId}`);
		return { userId: userId };
	} catch (e) {
		console.error('[Auth Service] Error finding or creating user:', e);
		throw new Error("An error occurred while finding or creating the user");
	}
}

export const OAuthCallback = async (code: string): Promise<{ userId: number }> => {
	try {
		console.log(`[Auth Service] Processing OAuth callback with code: ${code}`);
		const tokenResponse = await processOAuthLogin(code);

		console.log(`[Auth Service] OAuth token received: ${tokenResponse.token}`);
		const email = await fetchUserInfoFrom42(tokenResponse.token);

		console.log(`[Auth Service] User info fetched: ${JSON.stringify(email)}`);
		const userId = await findOrCreateUser(email.email);

		return { userId: userId.userId };
	} catch (e) {
		console.error('[Auth Service] Error during OAuth callback:', e);
		throw new Error("An error occurred during OAuth callback");

	}
}

export const setStatusInUserService = async (userId: number, status: string): Promise<Response> => {
	try {
		const url = process.env["USER_SERVICE_URL"] + '/status';
		return await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				userId: userId,
				status: status
			})
		});
	} catch (e) {
		throw e;
	}
}

export const verify2FA = async (token: string, username: string): Promise<AuthResultObj> => {
	try {
		console.log(`[Auth Service] Fetching to get corresponding user id for '${username}'`);
		const userId = await fetchUserIdByUsername(username);
		console.log(`[Auth Service] Fetching to get corresponding user id for '${username}' successful: ${userId}`);

		const userInfo = runTransaction((db) => {
			const stmt = db.prepare(`
				SELECT
					two_fa_secret,
					two_fa_enabled
				FROM
					user
				WHERE
					user_id = ?
			`);
			return stmt.get(userId) as {two_fa_secret: string, two_fa_enabled: number};
		});

		if (!userInfo) {
			console.error(`[Auth Service] User with username ${username} not found for 2FA verification`);
			return { success: false, error: "User not found" };
		}

		if (!userInfo.two_fa_secret || userInfo.two_fa_enabled !== 1) {
			console.error(`[Auth Service] User with username ${username} does not have 2FA enabled`);
			return { success: false, error: "2FA is not enabled for this user" };
		}

		console.log(`[Auth Service] Verifying 2FA token for user ${username}`);
		const totp = new OTPAuth.TOTP({
			issuer: 'Transcendence',
			label: username,
			algorithm: 'SHA1',
			digits: 6,
			period: 30,
			secret: OTPAuth.Secret.fromBase32(userInfo.two_fa_secret)
		});

		console.log(`[Auth Service] TOTP instance created for user ${username} with secret ${userInfo.two_fa_secret}`);

		var res = totp.validate({ token, window: 1 });
		if (res !== null) {
			console.log(`[Auth Service] 2FA token for user ${username} is valid`);
			return { success: true, userId: userId, username: username };
		} else {
			console.error(`[Auth Service] Invalid 2FA token for user ${username}`);
			return { success: false, error: "Invalid 2FA token" };
		}
	} catch (e) {
		console.error('[Auth Service] Error during 2FA verification:', e);
		return { success: false, error: "An error occurred during 2FA verification" };
	}
}

export const updatePassword = async (newPassword: string, userId: number) => {
	try {
		const hashedPassword = await argon2.hash(newPassword);

		runTransaction((db) => {
			const stmt = db.prepare(`
				UPDATE user
				SET password_hash = ?
				WHERE
					user_id = ?
			`);
			stmt.run(hashedPassword, userId);
		});
	} catch (e) {
		throw e;
	}
}

/**
 * Enables 2FA for a user and returns the secret and QR code data URL.
 * @param userId - The ID of the user for whom to enable 2FA.
 * @returns An object containing the success status, 2FA secret, and QR code data URL.
 *          If an error occurs, it returns { success: false, error: <error_message> }.
 */
export const enable2FA = async (userId: number): Promise<Enable2FAResultObj> => {
	try {
		console.log(`[Auth Service] Enabling 2FA for user ID ${userId}`);
		const username = await fetchUsernameByUserId(userId);
		if (!username) {
			console.error(`[Auth Service] Username not found for user ID ${userId}`);
			return { success: false, error: "Username not found" };
		}
		console.log(`[Auth Service] Fetched username for user ID ${userId}: ${username}`);

		console.log(`[Auth Service] Creating TOTP instance for user ${username}`);
		const totp = new OTPAuth.TOTP({
			issuer: 'Transcendence',
			label: username,
			algorithm: 'SHA1',
			digits: 6,
			period: 30
		});

		const secret = totp.secret.base32;
		const otpAuthUrl = totp.toString();
		const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

		console.log(`[Auth Service] 2FA enabled for user ${username} with secret ${secret}`);
		runTransaction((db) => {
			const updateStmt = db.prepare(`
				UPDATE user
				SET
					two_fa_enabled = 1,
					two_fa_secret = ?
				WHERE
					user_id = ?
			`);

			console.log(`[Auth Service] Updating user entry ${userId} to enable 2FA`);
			updateStmt.run(secret, userId);
		});

		return { success: true, twoFASecret: secret, qrCode: qrCodeDataUrl };
	} catch (e) {
		console.error('Error enabling 2FA:', e);
		return { success: false, error: "An error occurred enabling 2FA" };
	}
};

export const disable2FA = async (userId: number) => {
	try {
		runTransaction((db) => {
			const stmt = db.prepare(`
				UPDATE user
				SET
					two_fa_enabled = 0,
					two_fa_secret = NULL
				WHERE
					user_id = ?
			`);
			stmt.run(userId);
		});
	} catch (e) {
		throw new Error("An error occurred disabling 2FA in the authentication database");
	}
}

export const removeUser = async (userId: number) => {
	try {
		runTransaction((db) => {
			const stmt = db.prepare(`
				DELETE FROM user
				WHERE
					user_id = ?
			`);
			stmt.run(userId);
		});
	} catch (e) {
		throw e;
	}
}
