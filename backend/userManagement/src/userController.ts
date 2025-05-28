import { FastifyRequest, FastifyReply } from "fastify";
import { getUserDataFromDb,updateUsername } from "./userService";

export const getUserDataHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const user_id = (request.user as { user_id: number } | undefined)?.user_id ?? 1;

		console.log('[User Controller] Fetching user data for:', user_id);
		const userData = await getUserDataFromDb(user_id);
		
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
		const user_id = (request.user as { user_id: number } | undefined)?.user_id ?? 1;
		const { newUsername } = request.body as { newUsername: string};

		updateUsername(user_id, newUsername);

		reply.send({
			success: true,
		});
	} catch (e) {
		reply.status(500).send({
			success: false,
			error: 'An error occured getting updating the username:' + e
		});
	}
};