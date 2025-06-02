import db from "./db";

export const insertUser = async (username: string) => {
	try {
		const stmt = db.prepare(`
			INSERT INTO user (username)
			VALUES (?)
		`);
		// TODO: set default avatar path

		stmt.run(username);
	} catch (e) {
		throw new Error("Error inserting new user into user table");
	}
};

export const getUserDataFromDb = async (userId: number) => {
	try {
		const stmt = db.prepare(`
			SELECT * FROM user
			WHERE user_id = ?
		`);

		return stmt.all(userId);
	} catch (e) {
		throw new Error("An error occured getting the profile information");
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
		if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			throw new Error("Username already exists.");
		}
		throw new Error(`${e.message || e}`);
	}
};
