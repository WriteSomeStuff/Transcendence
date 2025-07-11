import { FastifyRequest, FastifyReply } from "fastify";

import type {
	Friend,
	Friendship
} from "schemas";
import {
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

const handleFriendRequestError = (reply: FastifyReply, error: string) => {
	const errorResponses: Record<string, { status: number; message: string }> = {
		"SQLITE_CONSTRAINT_UNIQUE":		{ status: 409, message: "Request already sent" },
		"REQUEST_ALREADY_RECEIVED":		{ status: 409, message: "User requested you already, check Requests" },
		"CANNOT_FRIEND_SELF":			{ status: 400, message: "Cannot send friend request to yourself" },
		"SQLITE_CONSTRAINT_FOREIGNKEY":	{ status: 400, message: "User not found" }
	};

	const response = errorResponses[error];
	if (response) {
		reply.status(response.status).send({
			success: false,
			error: response.message
		});
	} else {
		reply.status(500).send({
			success: false,
			error: 'Error creating friend request: ' + error
		});
	}
}

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
		handleFriendRequestError(reply, (e.code || e.message) as string);
	}
}

export const acceptFriendRequestHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { userIdSender } = request.body as { userIdSender: number };

		console.log(`[User Controller] Accepting friend request for ${request.user.userId} of ${userIdSender}`);
		await acceptFriendRequest(request.user.userId, userIdSender);
		console.log(`[User Controller] Accepting friend request for ${request.user.userId} of ${userIdSender} successful`);

		reply.status(200).send({ success: true });
	} catch (e) {
		console.error('Error:', e);
		reply.status(500).send({
			success: false,
			error: 'Error: ' + e
		});
	}
}

export const rejectFriendRequestHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { userIdSender } = request.body as { userIdSender: number };

		console.log(`[User Controller] Removing friend request for ${request.user.userId} of ${userIdSender}`);
		await removeFriend(request.user.userId, userIdSender);
		console.log(`[User Controller] Removing friend request for ${request.user.userId} of ${userIdSender} successful`);

		reply.status(200).send({ success: true });
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
		const { userIdToRemove } = request.query as { userIdToRemove: number };

		console.log(`[User Controller] Removing friend ${userIdToRemove} of ${request.user.userId}`);
		await removeFriend(request.user.userId, userIdToRemove);
		console.log(`[User Controller] Removing friend ${userIdToRemove} for ${request.user.userId} successful`);

		reply.status(200).send({ success: true });
	} catch (e) {
		console.error('Error:', e);
		reply.status(500).send({
			success: false,
			error: 'Error: ' + e
		});
	}
}