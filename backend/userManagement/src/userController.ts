import { FastifyRequest, FastifyReply } from "fastify";
import { promises as fs } from "fs";
import path from 'path';

import { FriendRequest, Friend } from "./types/types";
import {
	insertUser,
	getUserDataFromDb,
	updateUsername,
	updatePassword,
	updateStatus,
	getUserAvatarPath,
	getUserId,
	updateAvatar,

	createFriendRequest,
	getFriendRequests,
	getFriendList,
	acceptFriendRequest,
	removeFriend
} from "./userService";

export const insertUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { username, userId } = request.body as { username: string, userId: number };

		console.log(`[User controller] Inserting user with username '${username}' into db`);
		await insertUser(username, userId);
		console.log(`[User controller] Inserting user '${username}' into db successful`);

		reply.status(200).send({ success: true });

	} catch (e: any) {
		console.error('Error inserting new user:', e);
		if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			reply.status(409).send({
				success: false,
				error: "Username already exists."
			});
		} else {
			reply.status(500).send({
				success: false,
				error: "An error occured inserting a new user into user_service database."
			});
		}
	}
}

export const getUserDataHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		console.log('[User Controller] Getting user data from user db for:', request.user.userId);
		const userData = await getUserDataFromDb(request.user.userId);
		console.log('[User Controller] Getting user data successful:', userData);

		reply.status(200).send({
			success: true,
			data: userData
		});

	} catch (e) {
		console.error('Error ugetting user data:', e);
		reply.status(500).send({
			success: false,
			error: 'An error occured getting the user data: '+ e
		});
	}
};

export const updateUsernameHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { newValue } = request.body as { newValue: string };

		if (newValue.length < 3) {
			throw new Error("Username too short");
		} else if (newValue.length > 32) {
			throw new Error("Username too long");
		}

		console.log(`[User Controller] Updating username in db for user ${request.user.userId} to '${newValue}'`);
		await updateUsername(request.user.userId, newValue);
		console.log(`[User Controller] Updating username for user ${request.user.userId} successful`);

		reply.status(200).send({
			success: true,
			message: "Username successfully changed"
		});

	} catch (e: any) {
		console.error('Error updating username:', e);
		if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			reply.status(409).send({
				success: false,
				error: "Username already exists"
			})
		} else if (e.message === "Username too short" || e.message === "Username too long") {
			reply.status(400).send({
				success: false,
				error: e.message
			});
		} else {
			reply.status(500).send({
				success: false,
				error: 'An error occured updating the username:' + e
			});
		}		
	}
};

export const updatePasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { newValue } = request.body as { newValue: string };

		if (newValue.length < 6) {
			throw new Error("Password too short");
		} else if (newValue.length > 64) {
			throw new Error("Password too long");
		}

		console.log(`[User Controller] Updating password in auth db for user ${request.user.userId}`);
		await updatePassword(request.user.userId, newValue);
		console.log(`[User Controller] Updating password for user ${request.user.userId} successful`);

		reply.status(200).send({
			success: true,
			message: "Password successfully changed"
		});
	} catch (e: any) {
		console.error('Error updating password:', e);
		if (e.message === "Password too short" || e.message === "Password too long") {
			reply.status(400).send({
				success: false,
				error: e.message
			});
		} else {
			reply.status(500).send({
				success: false,
				error: 'An error occured updating the password:' + e
			});
		}
	}
}

export const setStatusHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { userId, status } = request.body as { userId: number, status: string };

		console.log(`[User Controller] Setting status for user ${userId} to ${status}`);
		await updateStatus(userId, status);
		console.log(`[User Controller] Setting status for user ${userId} to ${status} Successful`);

		reply.send({ success: true });
	} catch (e) {
		console.error('Error setting status:', e);
		reply.status(500).send({
			success: false,
			error: 'An error occured setting the status' + e
		});
	}
}

export const getUserIdByUsernameHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { username } = request.query as { username: string };

		console.log(`[User Controller] Getting corresponding user id for user '${username}'`);
		const userId = await getUserId(username);
		console.log(`[User Controller] Getting corresponding user id for user '${username}' successful: ${userId}`)

		reply.status(200).send({
			success: true,
			user_id: userId
		});
	} catch (e: any) {
		if (e.message === "User not found") {
			reply.status(404).send({
				success: false,
				error: e.message
			});
		} else {
			reply.status(500).send({
				success: false,
				error: e
			});
		}
	}
}

export const getUserAvatarHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		console.log('[User Controller] Getting user avatar from user db for:', request.user.userId);
		const avatarPath = await getUserAvatarPath(request.user.userId);
		console.log('[User Controller] Getting user avatar successful:', avatarPath);

		if (!avatarPath) {
			reply.status(404).send({
				success: false,
				error: "Avatar not found"
			});
		}
		
		console.log('[User Controller] Reading from file', avatarPath);
		const data = await fs.readFile(avatarPath);
		console.log('[User Controller] Sending avatar data', data);
		
		reply.type('image/jpg').send(data);
	} catch (e: any) {
		if (e.code === "ENOENT") {
			console.error('[User Controller] Error getting the avatar:', e);
			reply.status(404).send({
                success: false,
                error: "Avatar file not found"
            });
		} else {
			console.error('[User Controller] Error getting the avatar:', e);
			reply.status(500).send({
				success: false,
				error: 'Error getting the avatar: ' + e
			});
		}
	}
}

export const updateUserAvatarHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const file = await request.file();
		if (!file) {
			reply.status(400).send({
				success: false,
				error: "No file uploaded"
			});
			return;
		}
		
		const ext = file.mimetype.split('/')[1];
		const filename = `user_${request.user.userId}.${ext}`;
		const filePath = path.join(process.env.AVATAR_DIR_PATH as string, 'user_uploads/', filename);
		console.log(`${filePath}: ${file}`);
		
		const buffer = await file.toBuffer();

		console.log(`[User Controller] Updating avatar in db for user ${request.user.userId}`);
		await updateAvatar(request.user.userId, filePath, buffer);
		console.log(`[User Controller] Updating avatar for user ${request.user.userId} successful`);

		reply.status(200).send({
			success: true,
			message: "Avatar successfully changed"
		});
	} catch (e) {
		console.error('Error uploading avatar:', e);
		reply.status(500).send({
			success: false,
			error: 'An error occured uploading avatar:' + e
		});
	}
}

// FRIENDS FEATURE
export const friendRequestHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { friendId } = request.body as { friendId: number };

		if (request.user.userId === friendId) {
			throw new Error("CANNOT_FRIEND_SELF");
		}

		console.log(`[User Controller] Creating friend request from user ${request.user.userId} to ${friendId}`);
		await createFriendRequest(request.user.userId, friendId);
		console.log(`[User Controller] Friend request created from user ${request.user.userId} to ${friendId}`);

		reply.status(201).send({ success: true });
	} catch (e: any) {
		console.error('Error creating a friend request:', e);
		if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			reply.status(409).send({ // Conflict
				success: false,
				error: 'Request already sent'
			});
		} else if (e && e.message === "REQUEST_ALREADY_RECEIVED") {
			reply.status(409).send({ // Conflict
				success: false,
				error: 'User requested you already, check Requests'
			});
		} else if (e && e.message === "CANNOT_FRIEND_SELF") {
			reply.status(400).send({ // Bad Request
				success: false,
				error: 'Cannot send friend request to yourself'
			});
		} else if (e && e.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
			reply.status(400).send({ // Bad Request
				success: false,
				error: 'User not found'
			});
		} else {
			reply.status(500).send({ // Internal Server Error
				success: false,
				error: 'Error creating friend request: ' + e
			});
		}
		// TODO clean up errors
	}
}

export const acceptFriendRequestHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		/**
		 * Button is pressed in frontend.
		 * Button pressed by request.user.user_id.
		 * Request sent with user id of user that made request in body.
		 * Change status to accepted.
		 */

		const { userIdSender } = request.body as { userIdSender: number };

		console.log(`[User Controller] Accepting friend request for ${request.user.userId} of ${userIdSender}`);
		await acceptFriendRequest(request.user.userId, userIdSender);
		console.log(`[User Controller] Accepting friend request for ${request.user.userId} of ${userIdSender} successful`);

	} catch (e) {
		console.error('Error:', e);
		reply.status(500).send({
			success: false,
			error: 'Error: ' + e
		})
	}
}

export const rejectFriendRequestHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		/**
		 * Button is pressed in frontend.
		 * Button pressed by request.user.user_id.
		 * Request sent with user id of user that made request in body.
		 */

		const { userIdSender } = request.body as { userIdSender: number };

		console.log(`[User Controller] Removing friend request for ${request.user.userId} of ${userIdSender}`);
		await removeFriend(request.user.userId, userIdSender);
		console.log(`[User Controller] Removing friend request for ${request.user.userId} of ${userIdSender} successful`);

	} catch (e) {
		console.error('Error:', e);
		reply.status(500).send({
			success: false,
			error: 'Error: ' + e
		})
	}
}

export const getFriendRequestsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		/**
		 * send back in s certain data structure list {
		 * 	friendship_id
		 * 	user_id (made request)
		 * 	friend_id (accepted or rejected request)
		 * 	accepted (boolean)
		 * }
		 * handle in frontend to show with buttons accept and reject
		*/

		console.log(`[User Controller] Getting pending friend requests for user ${request.user.userId}`);
		const friendRequests: FriendRequest[] = await getFriendRequests(request.user.userId);
		console.log(`[User Controller] Getting pending friend requests for user ${request.user.userId} successful`);
		console.log(friendRequests);

		reply.status(200).send({
			success: true,
			data: friendRequests
		});

	} catch (e) {
		console.error('Error:', e);
		reply.status(500).send({
			success: false,
			error: 'Error: ' + e
		})
	}
}

export const getFriendsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		console.log(`[User Controller] Getting friend list for user ${request.user.userId}`);
		const friends: Friend[] = await getFriendList(request.user.userId);
		console.log(`[User Controller] Getting friend list for user ${request.user.userId} successful`);


		reply.status(200).send({
			success: true,
			data: friends
		});

	} catch (e) {
		console.error('Error:', e);
		reply.status(500).send({
			success: false,
			error: 'Error: ' + e
		})
	}
}

export const removeFriendHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { userIdToUnfriend } = request.body as { userIdToUnfriend: number };

		console.log(`[User Controller] Removing friend ${userIdToUnfriend} of ${request.user.userId}`);
		await removeFriend(request.user.userId, userIdToUnfriend);
		console.log(`[User Controller] Removing friend ${userIdToUnfriend} for ${request.user.userId}successful`);

	} catch (e) {
		console.error('Error:', e);
		reply.status(500).send({
			success: false,
			error: 'Error: ' + e
		})
	}	
}
