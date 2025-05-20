import { FastifyRequest, FastifyReply } from "fastify";
import { updateUserAvatar, getUserDataFromDb } from "./userService";

export const updateAvatar = async (request: FastifyRequest, reply: FastifyReply) => {

};

export const getUserData = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		console.log('[User Controller] Fetching user data for:', request.user.user_id);
		const userData = await getUserDataFromDb(request.user.user_id);
		
		console.log('username:', userData);

		reply.send({ userData });

	} catch (e) {
		if (e instanceof Error) {
			reply.status(500).send({ error: 'An error occured getting the user data: '+ e.message });
		}
	}
};