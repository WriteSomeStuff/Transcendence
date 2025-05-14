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

export const register = async (username: string, password: string): Promise<number> => {
	const db = getDb();
	
	try {
		const hashedPassword = await argon2.hash(password);
		const stmt = db.prepare(`
			INSERT INTO user (username, password_hash, avatar) 
			VALUES (?, ?, ?)
		`);
		const result = stmt.run(username, hashedPassword, defaultAvatarBlob);
		console.log(`Inserted row with ID: ${result.lastInsertRowid}`);
		return Number(result.lastInsertRowid);
	} catch (e) {
		console.error('Error during registration:', e);
		throw new Error("An error occured during registration");
	}
};

export const login = async (username: string, password: string): Promise<boolean> => {
	const db = getDb();	

	try {
		const stmt = db.prepare('SELECT password_hash FROM user WHERE username = ?');
		const row = stmt.get(username) as {	password_hash: string };
		if (!row) {
			return false; // User not found
		}
		const isVerified = await argon2.verify(row.password_hash, password);
		return isVerified;
	} catch (e) {
		console.error('Error during login:', e);
		throw new Error("An error occured during login");
	}
};
