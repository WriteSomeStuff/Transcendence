import argon2 from "argon2";
import * as OTPAuth from "otpauth";
import db from "./db";

import { AuthResultObj } from "./types/types";

export const register = async (username: string, password: string) => {
	try {
		const hashedPassword = await argon2.hash(password);

		const stmt = db.prepare(`
			INSERT INTO user (username, password_hash) 
			VALUES (?, ?)
		`);

		const result = stmt.run(username, hashedPassword);
		
		console.log(`Inserted row with ID: ${result.lastInsertRowid}`);
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

export const verify2FA = async (username: string, token: string): Promise<AuthResultObj> => {
	try {
		const stmt = db.prepare(`
			SELECT 
				user_id,
				two_fa_secret
			FROM
				user
			WHERE
				username = ?
		`);
		const row = stmt.get(username) as { user_id: number, two_fa_secret: string };

		if (!row) {
			return { success: false, error: "User not found" };
		}

		const totp = new OTPAuth.TOTP({
			issuer: 'Transendence',
			label: username,
			algorithm: 'SHA1',
			digits: 6,
			period: 30,
			secret: OTPAuth.Secret.fromBase32(row.two_fa_secret)
		});

		if (await totp.validate({ token })) {
			return { success: true, userId: row.user_id };
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

//TO DO: add update2FAenabled function