/**	Contains business logic (connected to the DB) for user registration and login. 
* 1. Imports the database instance and Argon2 for password hashing.
* 2. Defines register and login functions.
* 3. Handles password hashing and verification.
* 4. Interacts with the database to store and retrieve user data.
*/

import argon2 from "argon2";
import { getDb } from "../utils/db";

export const register = async (username: string, password: string): Promise<number> => {
	const db = getDb();
	const hashedPassword = await argon2.hash(password);
	const stmt = db.prepare('INSERT INTO user (username, password_hash) VALUES (?, ?)');
	const result = stmt.run(username, hashedPassword);
	return Number(result.lastInsertRowid);
};