import fs from "fs/promises";

import { runTransaction } from "./db.js";
import type { User } from "schemas";
import { getFriendList } from "./friendService.ts";

import type { WebSocket } from "ws";

export const insertUser = async (username: string, userId: number) => {
  try {
    runTransaction((db) => {
      const stmt = db.prepare(`
				INSERT INTO user (user_id, username, avatar_path)
				VALUES (?, ?, ?)
			`);

      const assignedAvatar = Math.floor(Math.random() * 4);
      const avatarPath: string = `${process.env["AVATAR_DIR_PATH"] as string}default/default_avatar${assignedAvatar}.jpeg`;

      stmt.run(userId, username, avatarPath);
    });
  } catch (e) {
    throw e;
  }
};

export const getUserDataFromDb = async (userId: number): Promise<User> => {
  try {
    const user = runTransaction((db) => {
      const stmt = db.prepare(`
				SELECT	user_id AS id,
						username
				FROM user
				WHERE user_id = ?
			`);

      const row = stmt.get(userId) as User;
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

async function notifyFriends(userId: number, status: "online" | "offline", onlineUsers: Map<number, WebSocket>): Promise<void> {
  const socket = onlineUsers.get(userId);
  if (!socket) return;

  const friends = await getFriendList(userId);
  for (const friend of friends) {
    const friendSocket = onlineUsers.get(friend.userId);
    if (friendSocket) {
      friendSocket.send(JSON.stringify({
        type: "friendStatusUpdate",
        userId,
        status,
      }));
    }
  }
}

export const updateStatus = async (userId: number, status: string, onlineUsers: Map<number, WebSocket>) => {
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
    notifyFriends(userId, status as "online" | "offline", onlineUsers);
  } catch (e) {
    throw e;
  }
};

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
			`);

      const row = stmt.get(username) as { user_id: number } | undefined;
      if (!row) {
        // user not found
        throw new Error("User not found");
      }
      return row.user_id;
    });

    return userId;
  } catch (e) {
    throw e;
  }
};

export const getUsername = async (userId: number): Promise<string> => {
  try {
    const username = runTransaction((db) => {
      const stmt = db.prepare(`
				SELECT 
					username
				FROM
					user
				WHERE
					user_id = ?	
			`);

      const row = stmt.get(userId) as { username: string } | undefined;
      if (!row) {
        // user not found
        throw new Error("User not found");
      }
      return row.username;
    });
    return username;
  } catch (e) {
    throw e;
  }
};

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
};

export const updateAvatar = async (
  userId: number,
  filePath: string,
  newAvatar: Buffer,
) => {
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
};
