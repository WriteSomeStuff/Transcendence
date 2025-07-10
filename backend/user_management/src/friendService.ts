import { runTransaction } from "./db.ts";
import type { Friend, Friendship } from "schemas";

export const createFriendRequest = async (userId: number, friendId: number) => {
	try {
		runTransaction((db) => {
			const checkStmt = db.prepare(`
				SELECT 1
				FROM friendship
				WHERE user_id = ? AND friend_id = ?
			`);

			const row = checkStmt.get(friendId, userId);

			if (row) {
				throw new Error("REQUEST_ALREADY_RECEIVED");
			}

			const insertStmt = db.prepare(`
				INSERT INTO friendship (user_id, friend_id)
				VALUES (?, ?)
			`);

			insertStmt.run(userId, friendId);
		});
	} catch (e) {
		throw e;
	}
}

export const getFriendRequests = async (userId: number): Promise<Friendship[]> => {
	try {
		const requests: Friendship[] = runTransaction((db) => {
			const stmt = db.prepare(`
				SELECT
					f.friendship_id,
					f.user_id,
					f.friend_id,
					f.status,
					u.username
				FROM friendship f
				JOIN user u ON u.user_id = f.user_id
				WHERE friend_id = ? AND status = 'pending'
			`);

			const rows = stmt.all(userId) as {
				friendship_id: number,
				user_id: number,
				friend_id: number,
				status: string,
				username: string
			}[];
			if (!rows || rows.length === 0) return [];
			
			return rows.map(row => ({
				friendshipId: row.friendship_id,
				userId: row.user_id,
				usernameSender: row.username,
				friendId: row.friend_id,
				accepted: row.status === 'accepted'
			})) as Friendship[];
		});

		return requests;
	} catch (e) {
		throw e;
	}
}

export const getFriendList = async (userId: number): Promise<Friend[]> => {
	try {
		const friendList = runTransaction((db) => {
			const getFriendsStmt = db.prepare(`
				SELECT
					f.friendship_id,
					CASE
						WHEN f.user_id = ? THEN f.friend_id
						ELSE f.user_id
					END AS friend_id,
					u.username,
					u.account_status
				FROM friendship f
				JOIN user u ON u.user_id = (
					CASE
						WHEN f.user_id = ? THEN f.friend_id
						ELSE f.user_id
					END
				)
				WHERE (f.user_id = ? OR f.friend_id = ?) AND f.status = 'accepted'
			`);

			const rows = getFriendsStmt.all(userId, userId, userId, userId) as {
				friendship_id: number,
				friend_id: number,
				username: string,
				account_status: string
			}[];
			if (!rows || rows.length === 0) return [];

			const friends: Friend[] = rows.map(row => ({
				friendshipId: row.friendship_id,
				userId: row.friend_id,
				username: row.username,
				accountStatus: row.account_status
			}));

			return friends;
		});

		return friendList;
	} catch (e) {
		console.error(`Error: ${e}`);
		throw e;
	}
}

export const acceptFriendRequest = async (userIdRequested: number, userIdSender: number) => {
	try {
		runTransaction((db) => {
			const stmt = db.prepare(`
				UPDATE friendship
				SET status = 'accepted'
				WHERE
					user_id = ? AND friend_id = ?
			`);

			stmt.run(userIdSender, userIdRequested);
		});
	} catch (e) {
		throw e;
	}
}

export const removeFriend = async (userIdRequested: number, userIdSender: number) => {
	try {
		runTransaction((db) => {
			const stmt = db.prepare(`
				DELETE FROM friendship
				WHERE
					(user_id = ? AND friend_id = ?)
					OR
					(user_id = ? AND friend_id = ?)
			`);

			stmt.run(userIdSender, userIdRequested, userIdRequested, userIdSender);
		});
	} catch (e) {
		throw e;
	}
}