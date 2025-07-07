import { FastifyRequest, FastifyReply } from "fastify";
import { z } from 'zod';
import { promises as fs } from "fs";
import path from 'path';

import {
	createMatchParticipant,
	createMatchState,
	createTournament
} from "./matchService";

const MatchResultSchema = z.object({
	participants: z.array(z.object({
		user_id: z.number().int(),
		score: z.number().int(),
	})),
	start: z.date(),
	end: z.date()
});

export const createTournamentHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { name, userId } = request.body as { name: string, userId: number  };

		console.log(`[Match controller] inserting tournament name '${name}' into db`);
		const tournamentId = await createTournament(name);
		console.log(`[Match controller] Inserting tournament '${name}' into db successful`);

		console.log(`[Match controller] inserting match_state into db`);
		const matchId = await createMatchState(undefined, undefined, tournamentId);
		console.log(`[Match controller] Inserting match_state into db successful`);

		// console.log(`[Match controller] inserting match_participant into db`);
		// await createMatchParticipant(userId, matchId);
		// console.log(`[Match controller] Inserting match_participant into db successful`);

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

export const createMatchHandler = async(request: FastifyRequest, reply:FastifyReply) => {
	try {
		const parsed = MatchResultSchema.safeParse(request.body);
		if (!parsed.success) {
			return reply.code(400);
		}
		console.log(`[Match controller] inserting match_state into db`);
		const matchId = await createMatchState(parsed.data.start.toISOString(), parsed.data.end.toISOString());
		console.log(`[Match controller] Inserting match_state into db successful`);

		for (const participant of parsed.data.participants) {
			console.log(`[Match controller] inserting match_participant into db`);
			await createMatchParticipant(participant.user_id, matchId, participant.score);
			console.log(`[Match controller] Inserting match_participant into db successful`);
		}
	}
	catch (e: any) {
		console.error('Error inserting new match:', e);
		if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			reply.status(409).send({
				success: false,
				error: "Match already exists."
		});
		} else {
			reply.status(500).send({
				success: false,
				error: "An error occured inserting a match into user_service database."
			});
		}
	}
}