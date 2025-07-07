import fs from 'fs/promises';

import { runTransaction } from "./db.js";
import type { UserObj, FriendRequest, Friend } from "./types/types.js";

export const insertUser = async (username: string, userId: number) => {
	try {
		runTransaction((db) => {
			const stmt = db.prepare(`
				INSERT INTO user (user_id, username)
				VALUES (?, ?)
			`);
			stmt.run(userId, username);
		});
	} catch (e) {
		throw e;
	}
};

export const getUserDataFromDb = async (userId: number): Promise<UserObj> => {
	try {
		const user = runTransaction((db) => {
			const stmt = db.prepare(`
				SELECT * FROM user
				WHERE user_id = ?
			`);
	
			const row = stmt.get(userId) as UserObj;
			if (!row) {
				throw new Error("User not found");
			}
	
			return row;
		});

		return user;
	} catch (e) {
		throw e;
	}
};

export const updateUsername = async (userId: number, newUsername: string) => {
	try {
		runTransaction((db) => {
			const stmt = db.prepare(`
				UPDATE user
				SET username = ?
				WHERE
					user_id = ?
			`);
	
			stmt.run(newUsername, userId);
		});
	} catch (e: any) {
		throw e;
	}
};

export const updatePassword = async (userId: number, newPassword: string) => {
	try {
		const url = process.env["AUTH_SERVICE_URL"] + '/password';
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				newPassword,
				userId
			})
		});
	
		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}`);
		}
	} catch (e) {
		throw e;
	}
	
}

export const updateStatus = async (userId: number, status: string) => {
	try {
		runTransaction((db) => {
			const stmt = db.prepare(`
				UPDATE user
				SET account_status = ?
				WHERE
					user_id = ?	
			`);
	
			stmt.run(status, userId);
		});
	} catch (e) {
		throw e;
	}
}

export const getUserId = async (username: string): Promise<number> => {
	try {
		const userId = runTransaction((db) => {
			const stmt = db.prepare(`
				SELECT 
					user_id
				FROM
					user
				WHERE
					username = ?	
			`)
	
			const row = stmt.get(username) as { user_id: number } | undefined;
			if (!row) { // user not found
				throw new Error("User not found");
			}
			return row.user_id;
		});

		return userId;
	} catch (e) {
		throw e;
	}
}

export const getUserAvatarPath = async (userId: number): Promise<string> => {
	try {
			const avatarPath = runTransaction((db) => {
			const stmt = db.prepare(`
				SELECT avatar_path
				FROM user
				WHERE user_id = ?
			`);
	
			const row = stmt.get(userId) as { avatar_path: string } | undefined;
			
			if (!row) {
				throw new Error("User not found");
			}
	
			return row.avatar_path;
		});

		return avatarPath;
	} catch (e) {
		throw e;
	}
}

export const updateAvatar = async (userId: number, filePath: string, newAvatar: Buffer) => {
	try {
		await fs.writeFile(filePath, newAvatar);

		runTransaction((db) => {
			const stmt = db.prepare(`
				UPDATE user
				SET avatar_path = ?
				WHERE
					user_id = ?
			`);
	
			stmt.run(filePath, userId);
		});
	} catch (e) {
		throw e;
	}
}

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

export const getFriendRequests = async (userId: number): Promise<FriendRequest[]> => {
	try {
		const requests = runTransaction((db) => {
			const stmt = db.prepare(`
				SELECT * FROM friendship
				WHERE friend_id = ? AND status = 'pending'
			`);

			const rows: FriendRequest[] = stmt.all(userId) as FriendRequest[];

			return rows;
		})

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