import { FastifyRequest, FastifyReply } from "fastify";
import {
	HistoryResponseSchema,
	MatchResultSchema,
	TournamentCreateResponseSchema,
	TournamentMatchCreateMessageSchema,
	TournamentCreateMessageSchema,
} from "schemas";
import type { MatchHistory, TournamentBracket } from "schemas";

import {
  createMatchParticipant,
  createMatchState,
  insertTournament,
  getTournament,
  getMatchHistory,
  insertTournamentMatchState,
} from "./matchService.ts";

import { createTournamentInfo } from "./tournamentHelpers.js";

export const InsertTournamentHandler = async (request: FastifyRequest, reply: FastifyReply) => {
	try {
		const { name, bracket } = request.body as { name: string, bracket: TournamentBracket };

		console.log(
			`[Match controller] inserting tournament name '${name}' into db`,
		);
		const tournamentId = await insertTournament(name, bracket);
		console.log(
			`[Match controller] Inserting tournament '${name}' into db successful`,
		);

		const successPayload = { success: true, tournamentId: tournamentId };
		reply.status(201).send(TournamentCreateResponseSchema.parse(successPayload));
	} catch (e: any) {
		console.error("Error inserting new tournament:", e);
		if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
			const errorPayload = { success: false, error: "Tournament name already exists." };
			reply.status(409).send(TournamentCreateResponseSchema.parse(errorPayload));
		} else {
			const errorPayload = { success: false, error: "An error occured inserting a tournament into user_service database."};
			reply.status(500).send(TournamentCreateResponseSchema.parse(errorPayload));
		}
	}
};

export const createMatchHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    console.log(
      "[Match controller] received a create match request",
      request.body,
    );
    const parsed = MatchResultSchema.safeParse(
      JSON.parse(request.body as string),
    );
    if (!parsed.success) {
      reply.status(400).send({
        success: false,
        error: parsed.error,
      });
      return;
    }
    console.log(`[Match controller] inserting match_state into db`);
    const matchId = await createMatchState(
      parsed.data.start.toISOString(),
      parsed.data.end.toISOString(),
    );
    console.log(`[Match controller] Inserting match_state into db successful`);

    for (const participant of parsed.data.participants) {
      console.log(`[Match controller] inserting match_participant into db`);
      await createMatchParticipant(
        participant.userId,
        matchId,
        participant.score,
      );
      console.log(
        `[Match controller] Inserting match_participant into db successful`,
      );
    }
    reply.status(201).send({
      success: true,
      matchId: matchId,
    });
  } catch (e: any) {
    console.error("Error inserting new match:", e);
    if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      reply.status(409).send({
        success: false,
        error: "Match already exists.",
      });
    } else {
      reply.status(500).send({
        success: false,
        error: "An error occured inserting a match into user_service database.",
      });
    }
  }
};

export const getMatchHistoryHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    console.log(`[Match controller] getting match history`);
    const history: MatchHistory[] = await getMatchHistory(request.user.userId);
    console.log(`[Match controller] getting match history successful`);

    const successPayload = { success: true, data: history };
    reply.status(200).send(HistoryResponseSchema.parse(successPayload));
  } catch (e: any) {
    console.error("Error getting match history:", e);
    const errorPayload = { success: false, error: "Error: " + e };
    reply.status(500).send(HistoryResponseSchema.parse(errorPayload));
  }
};

export async function insertTournamentMatchHandler(request: FastifyRequest, reply: FastifyReply) {
	try {
		console.log("[Match controller] received a create match request", request.body);
    	
		const parsed = TournamentMatchCreateMessageSchema.safeParse(JSON.parse(request.body as string));
   		if (!parsed.success) {
      		reply.status(400).send({ success: false, error: parsed.error});
      		return;
    	}

		console.log("[Match controller] Inserting t-match intp db");
		const dbMatchId = insertTournamentMatchState(parsed.data.matchStatus, parsed.data.tournamentId);
		console.log("[Match controller] Inserting t-match intp db successful");

		// for (const participant of parsed.data.participants) {
      	// 	console.log("[Match controller] inserting tournament matchparticipant into db");
		// 	  // TODO rethink db structure, particpant can still be null during the tournament, or add later round matches later?
		// 	insertTournamentMatchParticipant(participant, dbMatchId);
		// 	console.log("[Match controller] Inserting match_participant into db successful");
		// }

		reply.status(201).send({
			success: true,
			matchId: dbMatchId,
		});
		return;
	} catch (e: any) {
		console.error("Error inserting new tournament match:", e);
		if (e && e.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
			reply.status(422).send({
				success: false,
				error: "Foreign key constraint failed: referenced resource does not exist.",
			});
		} else {
			reply.status(500).send({
				success: false,
				error: e,
			});
		}
		return;
	}
}

export function getTournamentHandler(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { tournamentId } = request.query as { tournamentId: number };
		const bracket: TournamentBracket = getTournament(tournamentId);
	
		reply.status(200).send({ success: true, bracket });
	} catch (e) {
		reply.status(500).send({ success: false, error: e });
	}
}

export async function createTournamentHandler(request: FastifyRequest, reply: FastifyReply) {
	try {
		console.log("Handlign tournament create");
		const parsed = TournamentCreateMessageSchema.safeParse(JSON.parse(request.body as string));
		if (!parsed.success) {
			console.error(parsed.error);
			reply.status(400).send({ success: false, error: parsed.error });
			return;
		}
		
		console.log("Creating the tournament");
		const tournamentId = await createTournamentInfo(parsed.data);
		console.log("Tournament creation successful");

		reply.status(201).send(TournamentCreateResponseSchema.parse({ success: true, tournamentId }));
	} catch (e) {
		reply.status(500).send({ success: false, error: e });
	}
}