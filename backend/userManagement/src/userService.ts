import db from "./db";

export const getUserDataFromDb = async (user_id: number) => {
	try {
		const stmt = db.prepare(`
			SELECT * FROM user
			WHERE user_id = ?
		`);

		return stmt.all(user_id);
	} catch (e) {
		throw new Error("An error occured getting the profile information");
	}
};

export const updateUsername = async (user_id: number, newUsername: string) => {
	try {
		const stmt = db.prepare(`
			UPDATE user
			SET username = ?
			WHERE
				user_id = ?
		`);

		stmt.run(newUsername, user_id);
	} catch (e) {
		throw new Error("Error updating username in database");
	}
};
