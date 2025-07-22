import { FastifyRequest, FastifyReply } from "fastify";
import { HistoryResponseSchema, MatchResultSchema } from "schemas";
import type { MatchHistory } from "schemas";

import {
  createMatchParticipant,
  createMatchState,
  createTournament,
  getMatchHistory,
} from "./matchService.ts";

export const createTournamentHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  try {
    const { name, userId } = request.body as { name: string; userId: number };

    console.log(
      `[Match controller] inserting tournament name '${name}' into db`,
    );
    const tournamentId = await createTournament(name);
    console.log(
      `[Match controller] Inserting tournament '${name}' into db successful`,
    );

    console.log(`[Match controller] inserting match_state into db`);
    const matchId = await createMatchState(undefined, undefined, tournamentId);
    console.log(`[Match controller] Inserting match_state into db successful`);

    // console.log(`[Match controller] inserting match_participant into db`);
    // await createMatchParticipant(userId, matchId);
    // console.log(`[Match controller] Inserting match_participant into db successful`);

    reply.status(200).send({ success: true });
  } catch (e: any) {
    console.error("Error inserting new tournament:", e);
    if (e && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      reply.status(409).send({
        success: false,
        error: "Tournament already exists.",
      });
    } else {
      reply.status(500).send({
        success: false,
        error:
          "An error occured inserting a tournament into user_service database.",
      });
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
