import { FastifyRequest, FastifyReply } from "fastify";
import { updateUserAvatar, getUserDataFromDb } from "../src/userManagement/userService";

export const updateAvatar = async (request: FastifyRequest, reply: FastifyReply) => {

};

export const getUserData = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		console.log('[User Controller] Fetching user data for:', request.user.user_id);
		const userData = await getUserDataFromDb(request.user.user_id);
		
		console.log('[User Controller] User data:', userData);

		reply.send({
			success: true,
			data: userData
		});

	} catch (e) {
		if (e instanceof Error) {
			reply.status(500).send({
				success: false,
				error: 'An error occured getting the user data: '+ e.message
			});
		}
	}
};