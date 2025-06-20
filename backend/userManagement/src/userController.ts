import { FastifyRequest, FastifyReply } from "fastify";

import {
	insertUser,
	getUserDataFromDb,
	updateUsername,
	updateStatus,
	getUserId
} from "./userService";

export const insertUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { username, userId } = request.body as { username: string, userId: number };

		console.log(`[User controller] Inserting user with username '${username}' into db`);

		await insertUser(username, userId);

		console.log(`[User controller] Successfully inserted user '${username}' into db`);

		reply.send({ success: true });

	} catch (e: any) {
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

		reply.status(200).send({
			success: true,
			message: 'Username successfully changed'
		});
	} catch (e) { // TODO better handling to send if username already exists for example
		reply.status(500).send({
			success: false,
			error: 'An error occured updating the username:' + e
		});
	}
};

export const updatePasswordHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { newPassword } = request.body as { newPassword: string };

		const url = process.env.AUTH_SERVICE_URL + '/password';
		const response = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				newPassword,
				userId: request.user.userId
			})
		});

		if (!response.ok) {
			reply.status(500).send("Failed to update authentication database");
		}

		reply.status(200).send({
			success: true,
			message: 'Password successfully changed'
		});
	} catch (e) {
		reply.status(500).send({
			success: false,
			error: 'An error occured updating the password:' + e
		});
	}
}

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

export const getUserIdByUsernameHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { username } = request.query as { username: string };

		const user_id = await getUserId(username);
		
		if (!user_id) {
			return reply.status(404).send({
				success: false,
				error: "User not found"
			});
		}

		reply.send({
			success: true,
			user_id: user_id
		});
	} catch (e) {
		reply.send({
			success: false,
			error: e
		});
	}
}