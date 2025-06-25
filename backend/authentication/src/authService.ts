import argon2 from "argon2";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import db from "./db";

import { AuthResultObj, Enable2FAResultObj } from "./types/types";
import { fetchUserIdByUsername } from "./helpers/authServiceHelpers";

export const register = async (username: string, password: string): Promise<number> => {
	try {
		const hashedPassword = await argon2.hash(password);

		const stmt = db.prepare(`
			INSERT INTO user (password_hash) 
			VALUES (?)
		`);

		const result = stmt.run(hashedPassword);
		
		return Number(result.lastInsertRowid);
	} catch (e) {
		throw e;
	}
};

export const registerUserInUserService = async (username: string, userId: number): Promise<Response> => {
	try {
		const url = process.env.USER_SERVICE_URL + '/new-user';
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, userId })
		});

		return response;
	} catch (e) {
		throw e;
	}
}

export const login = async (username: string, password: string): Promise<AuthResultObj> => {
	try {
		console.log(`[Auth Service] Fetching to get corresponding user id for '${username}'`);
		const userId = await fetchUserIdByUsername(username);
		console.log(`[Auth Service] Fetching to get corresponding user id for '${username}' successful: ${userId}`);

		const stmt = db.prepare(`
			SELECT
				password_hash,
				two_fa_enabled
			FROM
				user
			WHERE
				user_id = ?
		`);
		const row = stmt.get(userId) as {password_hash: string, two_fa_enabled: boolean };

		if (!row) {
			console.log(`[Auth Service] User '${username}' not found in auth service db`);
			return {
				success: false, 
				error: "User not found"
			};
		}

		const verified = await argon2.verify(row.password_hash, password);
		if (!verified) {
			console.log(`[Auth Service] Incorrect password for user '${username}'`);
			return {
				success: false,
				error: "Incorrect password"
			};
		} else {
			console.log(`[Auth Service] User '${username}' verified`);
			return {
				success: true,
				userId: userId,
				twoFA: row.two_fa_enabled
			};
		}

	} catch (e: any) {
		console.error('Error during login:', e.message);
		return { success: false, error: e.message };
	}
};

export const setStatusInUserService = async (userId: number, status: string): Promise<Response> => {
	try {
		const url = process.env.USER_SERVICE_URL + '/status';
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				userId: userId,
				status: status
			})
		});

		return response;
	} catch (e) {
		throw e;
	}
}

const fetchUsernameByUserId = async (userId: number): Promise<string> => {
	// fetch call
	// return username
	// only used for label, we can use differnet label maybe

	return "Placeholder";
}

/**
 * Verifies the 2FA token for a given user.
 * @param userId - The ID of the user for whom to verify the 2FA token.
 * @param token - The 2FA token to verify.
 * @returns An object containing the success status and username if successful, or an error message if not.
 *          If an error occurs, it returns { success: false, error: <error_message> }.
 */	
// TODO get username from request
export const verify2FA = async (userId: number, token: string, username: string): Promise<AuthResultObj> => {
	try {
		const stmt = db.prepare(`
			SELECT 
				two_fa_secret
				two_fa_enabled
			FROM
				user
			WHERE
				user_id = ?
		`);
		const row = stmt.get(userId) as {two_fa_secret: string, two_fa_enabled: number };

		if (!row) {
			console.error(`[Auth Service] User with ID ${userId} not found for 2FA verification`);
			return { success: false, error: "User not found" };
		}

		if (!row.two_fa_secret || row.two_fa_enabled !== 1) {
			console.error(`[Auth Service] User with ID ${userId} does not have 2FA enabled`);
			return { success: false, error: "2FA is not enabled for this user" };
		}

		console.log(`[Auth Service] Verifying 2FA token for user ${username} (ID: ${userId})`);
		const totp = new OTPAuth.TOTP({
			issuer: 'Transendence',
			label: username, // change this label or fetch username
			algorithm: 'SHA1',
			digits: 6,
			period: 30,
			secret: OTPAuth.Secret.fromBase32(row.two_fa_secret)
		});

		console.log(`[Auth Service] TOTP instance created for user ${username} with secret ${row.two_fa_secret}`);
		if (await totp.validate({ token, window: 1 })) {
			console.log(`[Auth Service] 2FA token for user ${username} is valid`);
			return { success: true, username: username };
		} else {
			console.error(`[Auth Service] Invalid 2FA token for user ${username}`);
			return { success: false, error: "Invalid 2FA token" };
		}
	} catch (e) {
		console.error('[Auth Service] Error during 2FA verification:', e);
		return { success: false, error: "An error occured during 2FA verification" };
	}
}

export const updatePassword = async (newPassword: string, userId: number) => {
	try {
		const hashedPassword = await argon2.hash(newPassword);

		const stmt = db.prepare(`
			UPDATE user
			SET password_hash = ?
			WHERE
				user_id = ?
		`);

		stmt.run(hashedPassword, userId);
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
// TODO dont use username
export const enable2FA = async (userId: number): Promise<Enable2FAResultObj> => {
	try {
		const stmt = db.prepare(`
			SELECT 
				username
			FROM
				user
			WHERE
				user_id = ?
		`);

		const row = stmt.get(userId) as { username: string};
		if (!row) {
			return { success: false, error: "User not found" };
		}

		const totp = new OTPAuth.TOTP({
			issuer: 'Transendence',
			label: username,
			algorithm: 'SHA1',
			digits: 6,
			period: 30
		});

		const secret = totp.secret.base32;
		const otpAuthUrl = totp.toString();
		const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

		const updateStmt = db.prepare(`
			UPDATE user
			SET 
				two_fa_enabled = 1,
				two_fa_secret = ?
			WHERE
				user_id = ?
		`);

		updateStmt.run(secret, userId);

		return { success: true, twoFASecret: secret, qrCode: qrCodeDataUrl };
	} catch (e) {
		console.error('Error enabling 2FA:', e);
		return { success: false, error: "An error occurred enabling 2FA" };
	}
};

export const disable2FA = async (userId: number) => {
	try {
		const stmt = db.prepare(`
			UPDATE user
			SET 
				two_fa_enabled = 0,
				two_fa_secret = NULL
			WHERE
				user_id = ?
		`);

		stmt.run(userId);

	} catch (e) {
		throw new Error("An error occured disabling 2FA in the authentication database");
	}
}

export const removeUser = async (userId: number) => {
	try {
		const stmt = db.prepare(`
			DELETE FROM user
			WHERE 
				user_id = ?
		`);

		stmt.run(userId);
	} catch (e) {
		throw e;
	}
}