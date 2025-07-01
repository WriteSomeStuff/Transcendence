import fs from 'fs/promises';

import db from "./db";
import { UserObj } from "./types/types";

export const insertUser = async (username: string, userId: number) => {
	try {
		const stmt = db.prepare(`
			INSERT INTO user (user_id, username)
			VALUES (?, ?)
		`);

		stmt.run(userId, username);
	} catch (e) {
		throw e;
	}
};

export const getUserDataFromDb = async (userId: number): Promise<UserObj> => {
	try {
		const stmt = db.prepare(`
			SELECT * FROM user
			WHERE user_id = ?
		`);

		const row = stmt.get(userId) as UserObj;
		
		if (!row) {
			throw new Error("User not found");
		}

		return row;
	} catch (e) {
		throw e;
	}
};

export const updateUsername = async (userId: number, newUsername: string) => {
	try {
		const stmt = db.prepare(`
			UPDATE user
			SET username = ?
			WHERE
				user_id = ?
		`);

		stmt.run(newUsername, userId);
	} catch (e: any) {
		throw e;
	}
};

export const updatePassword = async (userId: number, newPassword: string) => {
	try {
		const url = process.env.AUTH_SERVICE_URL + '/password';
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				newPassword,
				userId
			})
		});
	
		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}
	} catch (e) {
		throw e;
	}
	
}

export const updateStatus = async (userId: number, status: string) => {
	try {
		const stmt = db.prepare(`
			UPDATE user
			SET account_status = ?
			WHERE
				user_id = ?	
		`);

		stmt.run(status, userId);
	} catch (e) {
		throw e;
	}
}

export const getUserId = async (username: string): Promise<number> => {
	try {
		const stmt = db.prepare(`
			SELECT 
				user_id
			FROM
				user
			WHERE
				username = ?	
		`)

		const row = stmt.get(username) as { user_id: number } | undefined;
		if (!row) { // user not found
			throw new Error("User not found");
		}
		return row.user_id;
	} catch (e) {
		throw e;
	}
}

export const getUsername = async (userId: number): Promise<string> => {
	try {
		const stmt = db.prepare(`
			SELECT 
				username
			FROM
				user
			WHERE
				user_id = ?	
		`)

		const row = stmt.get(userId) as { username: string } | undefined;
		if (!row) { // user not found
			throw new Error("User not found");
		}
		return row.username;
	} catch (e) {
		throw e;
	}
}

export const getUserAvatarPath = async (userId: number): Promise<string> => {
	try {
		const stmt = db.prepare(`
			SELECT avatar_path
			FROM user
			WHERE user_id = ?
		`);

		const row = stmt.get(userId) as { avatar_path: string } | undefined;
		
		if (!row) {
			throw new Error("User not found");
		}

		return row.avatar_path;
	} catch (e) {
		throw e;
	}
}

export const updateAvatar = async (userId: number, filePath: string, newAvatar: Buffer) => {
	try {
		await fs.writeFile(filePath, newAvatar);

		const stmt = db.prepare(`
			UPDATE user
			SET avatar_path = ?
			WHERE
				user_id = ?
		`);

		stmt.run(filePath, userId);
	} catch (e) {
		throw e;
	}
}