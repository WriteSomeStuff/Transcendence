import { getDb } from "../utils/db";

export const updateUserAvatar = async (userId: number, avatarBuffer: Buffer): Promise<void> => {
	const db = getDb();

	try {
		const stmt = db.prepare(`
			UPDATE user
			SET avatar = ?
			WHERE user_id = ?
		`);

		stmt.run(avatarBuffer, userId);
	} catch (e) {
		throw new Error("An error occured updating avatar");
	}
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