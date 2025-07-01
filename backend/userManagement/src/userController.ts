import { FastifyRequest, FastifyReply } from "fastify";
import { promises as fs } from "fs";
import path from 'path';

import {
	insertUser,
	getUserDataFromDb,
	updateUsername,
	updatePassword,
	updateStatus,
	getUserAvatarPath,
	getUserId,
	updateAvatar,
	getUsername
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

		console.log(`[User Controller] Updating password in auth db for user ${request.user.userId}`);
		await updatePassword(request.user.userId, newValue);
		console.log(`[User Controller] Updating password for user ${request.user.userId} successful`);

		reply.status(200).send({
			success: true,
			message: "Password successfully changed"
		});
	} catch (e) {
		console.error('Error updating password:', e);
		reply.status(500).send({
			success: false,
			error: 'An error occured updating the password:' + e
		});
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

export const getUsernameByUserIdHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { userId } = request.query as { userId: number };

		console.log(`[User Controller] Getting corresponding username for user id '${userId}'`);
		const username = await getUsername(userId);
		console.log(`[User Controller] Getting corresponding username for user id '${userId}' successful: ${username}`);

		reply.status(200).send({
			success: true,
			username: username
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