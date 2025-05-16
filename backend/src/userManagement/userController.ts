import { FastifyRequest, FastifyReply } from "fastify";
import { updateUserAvatar, getUserDataFromDb } from "./userService";

export const updateAvatar = async (request: FastifyRequest, reply: FastifyReply) => {

};

export const getUserData = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		console.log("Fetching user data for:", request.user.username);
		const userData = await getUserDataFromDb(request.user.username);
		
		console.log('username:', userData);

		const username =

		return reply.send({ username });

	} catch (e) {
		reply.status(500).send({ error: "An error occured getting the user data" });
	}
};