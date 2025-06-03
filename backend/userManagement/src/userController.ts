import { FastifyRequest, FastifyReply } from "fastify";

import {
	insertUser,
	getUserDataFromDb,
	updateUsername,
	updateStatus
} from "./userService";

export const insertUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { username } = request.body as { username: string };

		console.log(`[User controller] Inserting user with username '${username}' into db`);

		insertUser(username);

		console.log(`[User controller] Successfully inserted user '${username}' into db`);

		reply.send({ success: true });

	} catch (e) {
		reply.status(500).send({
			success: false,
			error: 'An error occured inserting a new user into user_service database'
		});
	}
}

export const getUserDataHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		console.log('[User Controller] Fetching user data for:', request.user.userId);
		const userData = await getUserDataFromDb(request.user.userId);
		
		console.log('[User Controller] User data:', userData);

		reply.send({
			success: true,
			data: userData
		});

	} catch (e) {
		reply.status(500).send({
			success: false,
			error: 'An error occured getting the user data: '+ e
		});
	}
};

export const updateUsernameHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { newUsername } = request.body as { newUsername: string };

		await updateUsername(request.user.userId, newUsername);

		const response = await fetch('http://auth_service:8080/auth/username', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				newUsername,
				userId: request.user.userId
			})
		});

		if (!response.ok) {
			reply.status(500).send("Failed to update authentication database");
		}

		reply.status(200).send({
			success: true,
			message: 'Username successfully changed'
		});
	} catch (e) {
		reply.status(500).send({
			success: false,
			error: 'An error occured updating the username:' + e
		});
	}
};

export const setStatusHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { userId, status } = request.body as { userId: number, status: string };


		console.log('Setting status for user,', userId, 'to', status);

		await updateStatus(userId, status);

		reply.send({ success: true });
	} catch (e) {
		reply.send({
			success: false,
			error: e
		});
	}
}