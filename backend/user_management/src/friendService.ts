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
				SELECT * FROM friendship
				WHERE friend_id = ? AND status = 'pending'
			`);

			const rows = stmt.all(userId) as any[];
			if (!rows || rows.length === 0) {
				return [];
			}
			
			return rows.map(row => ({
				friendshipId: row.friendship_id,
				userId: row.user_id,
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
					friendship_id,
					user_id,
					friend_id
				FROM friendship
				WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
			`);

			const rows = getFriendsStmt.all(userId, userId) as { friendship_id: number, user_id: number, friend_id: number }[];			
			let friendsPartial: Partial<Friend>[] = rows.map(row => ({
				friendshipId: row.friendship_id,
				userId: row.user_id === userId ? row.friend_id : row.user_id
			}));

			for (let friend of friendsPartial) {
				const getFriendInfoStmt = db.prepare(`
					SELECT 
						account_status,
						username
					FROM user
					WHERE user_id = ?
				`);

				const { account_status, username } = getFriendInfoStmt.get(friend.userId) as { account_status: string, username: string };
				friend.accountStatus = account_status;
				friend.username = username;
			}

			return friendsPartial as Friend[];
		});

		return friendList;
	} catch (e) {
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