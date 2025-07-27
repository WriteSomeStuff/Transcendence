import { runTransaction } from "./db.js";
import { TournamentBracketSchema } from "schemas";
import type {
  MatchHistory,
  TournamentBracket,
  TournamentMatchRoom,
} from "schemas";

export const insertTournament = async (
  name: string,
  bracket: TournamentBracket,
) => {
  try {
    return runTransaction((db) => {
      const stmt = db.prepare(`
				INSERT INTO tournament (tournament_name, bracket)
				VALUES (?, ?)
			`);

      const bracketBuffer = Buffer.from(JSON.stringify(bracket));
      const info = stmt.run(name, bracketBuffer);
      return Number(info.lastInsertRowid);
    });
  } catch (e) {
    throw e;
  }
};

export const validateExistingTournamentMatchState = async (matchId: number) => {
  try {
    return runTransaction((db) => {
      const stmt = db.prepare(`
				SELECT * FROM match_state
				WHERE match_id = ?;
			`);
      const result = stmt.get(matchId);
      if (!result) {
        throw new Error("Invalid match id in db");
      }
      return matchId;
    });
  } catch (e) {
    throw e;
  }
};

export const createMatchState = async (
  start?: string,
  end?: string,
  tournamentId?: number,
) => {
  try {
    return runTransaction((db) => {
      const stmt = db.prepare(`
				INSERT INTO match_state (match_date, match_end, tournament_id)
				VALUES (?, ?, ?)
			`);

      const info = stmt.run(start, end, tournamentId ?? null);
      return Number(info.lastInsertRowid);
    });
  } catch (e) {
    throw e;
  }
};

export const createMatchParticipant = async (
  userId: number,
  matchId: number,
  score: number,
) => {
  try {
    runTransaction((db) => {
      const stmt = db.prepare(`
				INSERT INTO match_participant (user_id, match_id, score)
				VALUES (?, ?, ?)
				`);

      stmt.run(userId, matchId, score);
    });
  } catch (e) {
    throw e;
  }
};

export const createMatchParticipant = async (userId: number, matchId: number, score: number) => {
  try {
    runTransaction((db) => {
      const stmt = db.prepare(`
				INSERT INTO match_participant (user_id, match_id, score)
				VALUES (?, ?, ?)
				`);

      stmt.run(userId, matchId, score);
    });
  } catch (e) {
    throw e;
  }
}

export const getMatchHistory = async (userId: number) => {
  try {
    return runTransaction((db) => {
      const getHistoryStmt = db.prepare(`
				SELECT
					ms.match_end,
					mp.score AS user_score,
					GROUP_CONCAT(mp2.user_id) AS opponent_ids,
					GROUP_CONCAT(mp2.score) AS opponent_scores
				FROM match_participant mp
				JOIN match_state ms ON ms.match_id = mp.match_id
				JOIN match_participant mp2 ON mp2.match_id = mp.match_id AND mp2.user_id != mp.user_id
				WHERE mp.user_id = ?
					AND ms.match_status = 'finished'
				GROUP BY ms.match_id, mp.user_id
				ORDER BY ms.match_end DESC;
			`)

      const rows = getHistoryStmt.all(userId) as {
        match_end: string,
        user_score: number,
        opponent_ids: number[],
        opponent_scores: number[],
      }[];

      if (!rows || rows.length === 0) return []

      const history: MatchHistory[] = rows.map(row => ({
        date: new Date(row.match_end),
        userScore: row.user_score,
        opponentInfo: row.opponent_ids.map((id, i) => ({
          opponentId: id,
          opponentScore: row.opponent_scores[i]!,
        })),
      }));
      return history;
    });
  } catch (e) {
    throw e;
  }
}

export function insertTournamentMatchState(
  matchStatus: string,
  tournamentId: number,
) {
  try {
    return runTransaction((db) => {
      const stmt = db.prepare(`
				INSERT INTO match_state (match_status, tournament_id)
				VALUES (? , ?)
			`);

      const result = stmt.run(matchStatus, tournamentId);
      return Number(result.lastInsertRowid);
    });
  } catch (e) {
    throw e;
  }
}

export function insertTournamentMatchParticipant(
  userId: number | null,
  matchId: number,
) {
  try {
    runTransaction((db) => {
      const stmt = db.prepare(`
				INSERT INTO match_participant (user_id, match_id)
				VALUES (?, ?)
			`);

      stmt.run(userId, matchId);
    });
  } catch (e) {
    throw e;
  }
}

export function getTournament(tournamentId: number): TournamentBracket {
  try {
    return runTransaction((db) => {
      const stmt = db.prepare(`
				SELECT bracket
				FROM tournament
				WHERE tournament_id = ?
			`);

      const result = stmt.get(tournamentId) as { bracket: Buffer };
      if (!result) throw new Error("Tournament not found");
      return TournamentBracketSchema.parse(
        JSON.parse(result.bracket.toString()),
      );
    });
  } catch (e) {
    throw e;
  }
}

function extractMatchIds(brackets: TournamentBracket[]): TournamentMatchRoom[] {
  const result: TournamentMatchRoom[] = [];
  brackets.forEach((bracket: TournamentBracket) => {
    bracket.matches.forEach((match) => {
      if (match.participants.length === 2 && match.winner === null) {
        if (match.databaseId === null) {
          throw new Error("Missing database id");
        }
        result.push({
          size: match.participants.length,
          permissions: {
            type: "tournament",
            allowedUsers: match.participants,
            matchId: match.databaseId,
          },
          gameData: {
            game: "pong",
            options: {
              paddleRatio: 0.4,
              gameSpeed: 1,
            },
          },
        });
      }
    });
  });
  return result;
}

export function getTournamentMatches() {
  try {
    return runTransaction((db) => {
      const stmt = db.prepare(`
				SELECT bracket
				FROM tournament
				WHERE tournament_status = 'ongoing'
			`);
      const result = stmt.all() as { bracket: Buffer }[];
      const brackets = result.map((row) =>
        TournamentBracketSchema.parse(JSON.parse(row.bracket.toString())),
      );
      return extractMatchIds(brackets);
    });
  } catch (e) {
    throw e;
  }
}

export function updateBracketWithMatchIds(
  tournamentId: number,
  bracket: TournamentBracket,
) {
  try {
    return runTransaction((db) => {
      const stmt = db.prepare(`
				UPDATE tournament
				SET bracket = ?
				WHERE tournament_id = ?
			`);
      const bracketBuffer = Buffer.from(JSON.stringify(bracket));
      stmt.run(bracketBuffer, tournamentId);
    });
  } catch (e) {
    throw e;
  }
}
