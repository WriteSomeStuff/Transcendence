/**	Contains business logic (connected to the DB) for user registration and login. 
* 1. Imports the database instance and Argon2 for password hashing.
* 2. Defines register and login functions.
* 3. Handles password hashing and verification.
* 4. Interacts with the database to store and retrieve user data.
*/

import argon2 from "argon2";
import { getDb } from "../utils/db";
import fs from "fs";
import path from "path";

const defaultAvatarPath = path.join(__dirname, '..', '..', 
	'public', 'assets', 'avatars', 'defaults', 'default_avatar_1.png');
const defaultAvatarBlob = fs.readFileSync(defaultAvatarPath);

export const register = async (username: string, password: string): Promise<void> => {
	const db = getDb();
	
	try {
		const hashedPassword = await argon2.hash(password);
		
		const stmt = db.prepare(`
			INSERT INTO user (username, password_hash, avatar) 
			VALUES (?, ?, ?)
		`);
		const result = stmt.run(username, hashedPassword, defaultAvatarBlob);	
		
		console.log(`Inserted row with ID: ${result.lastInsertRowid}`);
	} catch (e) {
		console.error('Error during registration:', e);
		throw new Error("An error occured during registration");
	}
};

export const login = async (username: string, password: string): Promise<number> => {
	const db = getDb();	

	try {
		const stmt = db.prepare(`
			SELECT 
				user_id,
				password_hash
			FROM
				user
			WHERE
				username = ?
		`);
		const row = stmt.get(username) as {	user_id: number, password_hash: string };
		
		console.log('User_id:', row.user_id);

		if (!row) {
			return 0; // User not found
		}

		if (await argon2.verify(row.password_hash, password)) {
			return (row.user_id);
		} else {
			return 0;
		}
	
	} catch (e) {
		console.error('Error during login:', e);
		throw new Error("An error occured during login");
	}
};

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDay()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const setAccountStatusOnline = async (user_id: number) => {
	const db = getDb();

	try {
		const stmt = db.prepare(`
			UPDATE user
			SET	last_login = ?,
				account_status = ?
			WHERE
				user_id = ?	
		`);
		stmt.run(formatDate(new Date()), 'online', user_id);
		
		console.log('Account status updated to online for user:', user_id);
	} catch (e) {
		console.error('Error setting account status:', e);
		throw new Error("An error occured setting the account status");
	}
}

export const setAccountStatusOffline = async (user_id: number) => {
	const db = getDb();

	try {
		const stmt = db.prepare(`
			UPDATE user
			SET	account_status = ?
			WHERE
				user_id = ?
		`);
		stmt.run('offline', user_id);
		
		console.log('Account status updated to offline for user:', user_id);
	} catch (e) {
		console.error('Error setting account status:', e);
		throw new Error("An error occured setting the account status");
	}
}
