import argon2 from "argon2";
import db from "./db";

export const register = async (username: string, password: string): Promise<void> => {
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

export const login = async (username: string, password: string): Promise<number> => {
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
		
		console.log('userId:', row.user_id);
		
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

export const updateUsername = async (newUsername: string, userId: number): Promise<void> => {
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

// function formatDate(date: Date): string {
// 	const year = date.getFullYear();
// 	const month = String(date.getMonth() + 1).padStart(2, '0');
// 	const day = String(date.getDay()).padStart(2, '0');
// 	const hours = String(date.getHours()).padStart(2, '0');
// 	const minutes = String(date.getMinutes()).padStart(2, '0');
// 	const seconds = String(date.getSeconds()).padStart(2, '0');

// 	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
// }

// export const setAccountStatusOnline = async (userId: number) => {
// 	try {
// 		const stmt = db.prepare(`
// 			UPDATE user
// 			SET	last_login = ?,
// 				account_status = ?
// 			WHERE
// 				user_id = ?	
// 		`);
// 		stmt.run(formatDate(new Date()), 'online', userId);
		
// 		console.log('Account status updated to online for user:', userId);
// 	} catch (e) {
// 		console.error('Error setting account status:', e);
// 		throw new Error("An error occured setting the account status");
// 	}
// }

// export const setAccountStatusOffline = async (userId: number) => {
// 	try {
// 		const stmt = db.prepare(`
// 			UPDATE user
// 			SET	account_status = ?
// 			WHERE
// 				user_id = ?
// 		`);
// 		stmt.run('offline', userId);
		
// 		console.log('Account status updated to offline for user:', userId);
// 	} catch (e) {
// 		console.error('Error setting account status:', e);
// 		throw new Error("An error occured setting the account status");
// 	}
// }
