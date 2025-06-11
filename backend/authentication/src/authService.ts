import argon2 from "argon2";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import db from "./db";

import { AuthResultObj, Enable2FAResultObj } from "./types/types";

export const register = async (username: string, password: string): Promise<number> => {
	try {
		const hashedPassword = await argon2.hash(password);

		const stmt = db.prepare(`
			INSERT INTO user (username, password_hash) 
			VALUES (?, ?)
		`);

		const result = stmt.run(username, hashedPassword);
		
		console.log(`Inserted row with ID: ${result.lastInsertRowid}`);
		
		return Number(result.lastInsertRowid);
	} catch (e) {
		console.error('Error during registration:', e);
		throw new Error("An error occured during registration");
	}
};

export const login = async (username: string, password: string): Promise<AuthResultObj> => {
	try {
		const stmt = db.prepare(`
			SELECT 
				user_id,
				password_hash,
				two_fa_enabled
			FROM
				user
			WHERE
				username = ?
		`);
		const row = stmt.get(username) as {	user_id: number, password_hash: string, two_fa_enabled: boolean };

		if (!row) {
			return { success: false, error: "User not found" };
		}

		if (await argon2.verify(row.password_hash, password)) {
			return { success: true, userId: row.user_id, twoFA: row.two_fa_enabled };
		} else {
			return { success: false, error: "Incorrect password" };
		}
	} catch (e) {
		console.error('Error during login:', e);
		return { success: false, error: "An error occured during login" };
	}
};

/**
 * Verifies the 2FA token for a given user.
 * @param userId - The ID of the user for whom to verify the 2FA token.
 * @param token - The 2FA token to verify.
 * @returns An object containing the success status and username if successful, or an error message if not.
 *          If an error occurs, it returns { success: false, error: <error_message> }.
 */	
export const verify2FA = async (userId: number, token: string): Promise<AuthResultObj> => {
	try {
		const stmt = db.prepare(`
			SELECT 
				username,
				two_fa_secret
			FROM
				user
			WHERE
				user_id = ?
		`);
		const row = stmt.get(userId) as { username: string, two_fa_secret: string };

		if (!row) {
			return { success: false, error: "User not found" };
		}

		const totp = new OTPAuth.TOTP({
			issuer: 'Transendence',
			label: row.username,
			algorithm: 'SHA1',
			digits: 6,
			period: 30,
			secret: OTPAuth.Secret.fromBase32(row.two_fa_secret)
		});

		if (await totp.validate({ token, window: 1 })) {
			return { success: true, username: row.username };
		} else {
			return { success: false, error: "Invalid 2FA token" };
		}
	} catch (e) {
		console.error('Error during 2FA verification:', e);
		return { success: false, error: "An error occured during 2FA verification" };
	}
}

export const updateUsername = async (newUsername: string, userId: number) => {
	try {
		const stmt = db.prepare(`
			UPDATE user
			SET username = ?
			WHERE
				user_id = ?
		`);

		stmt.run(newUsername, userId);
	} catch (e) {
		throw new Error("An error occured updating the authentication database");
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
		throw new Error("An error occured updating the authentication database");
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
			label: row.username,
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