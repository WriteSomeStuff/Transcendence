import { FastifyRequest, FastifyReply } from "fastify";

import type { Friend } from "./types/types.js";
import {
	Friendship,
	FriendRequestListResponseSchema,
	FriendListResponseSchema
} from "schemas";
import {
	createFriendRequest,
	getFriendRequests,
	getFriendList,
	acceptFriendRequest,
	removeFriend
} from "./friendService.js";

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
		const friendRequests: Friendship[] = await getFriendRequests(request.user.userId);
		console.log(`[User Controller] Getting pending friend requests for user ${request.user.userId} successful`);
		console.log(friendRequests);

		const successPayload = { success: true, data: friendRequests };
		reply.status(200).send(FriendRequestListResponseSchema.parse(successPayload));

	} catch (e) {
		console.error('Error:', e);
		const errorPayload = { success: false, error: 'Error: ' + e };
		reply.status(500).send(FriendRequestListResponseSchema.parse(errorPayload));
	}
}

// TODO use Friend schema from shared schemas instead of interface
export const getFriendsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		console.log(`[User Controller] Getting friend list for user ${request.user.userId}`);
		const friends: Friend[] = await getFriendList(request.user.userId);
		console.log(`[User Controller] Getting friend list for user ${request.user.userId} successful`);

		const successPayload = { success: true, data: friends };
		reply.status(200).send(FriendListResponseSchema.parse(successPayload));

	} catch (e) {
		console.error('Error:', e);
		const errorPayload = { success: false, error: 'Error: ' + e };
		reply.status(500).send(FriendListResponseSchema.parse(errorPayload));
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
		});
	}
}