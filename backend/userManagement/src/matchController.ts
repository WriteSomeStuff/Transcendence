import { FastifyRequest, FastifyReply } from "fastify";
import { promises as fs } from "fs";
import path from 'path';

import {
	createTournament
} from "./matchService";

export const createTournamentHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	// call the createTournament function somehow with the requests info?
	try {
		const { name } = request.body as { name: string };

		console.log(`[Match controller] inserting tournament name '${name}' into db`);
		await createTournament(name);
		console.log(`[Match controller] Inserting tournament '${name}' into db successful`);

		reply.status(200).send({ success: true });

	} catch (e: any) {
		console.error('Error inserting new tournament:', e);
		if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			reply.status(409).send({
				success: false,
				error: "Tournament already exists."
			});
		} else {
			reply.status(500).send({
				success: false,
				error: "An error occured inserting a tournament into user_service database."
			});
		}
	}
}