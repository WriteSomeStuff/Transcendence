import { getDb } from "../utils/db";

export const updateUserAvatar = async (userId: number) => {
	const db = getDb();

};

export const getUserDataFromDb = async (user_id: number) => {
	const db = getDb();

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