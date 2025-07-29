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

export const updateMatchStateFinished = async (
	start?: string,
	end?: string,
	matchId?: number,
) => {
	try {
		runTransaction((db) => {
			const stmt = db.prepare(`
				UPDATE match_state
				SET 
					match_date = ?,
					match_end = ?
				WHERE match_id = ?
			`);

			stmt.run(start, end, matchId);
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

export const getMatchHistory = async (userId: number) => {
  try {
    return runTransaction((db) => {
      const getMatchIdsStmt = db.prepare(`
        SELECT mp.match_id AS match_id, ms.match_end AS match_end FROM match_participant mp
        JOIN match_state ms ON mp.match_id = ms.match_id
        WHERE mp.user_id = ?
        ORDER BY ms.match_end DESC;
      `);
      const matchIds = getMatchIdsStmt.all(userId) as {
        match_id: number;
        match_end: string;
      }[];
      const getUsers = db.prepare(`
        SELECT
          mp.user_id AS user_id,
          mp.score AS score
        FROM match_participant mp
        WHERE mp.match_id = ?;
      `);
      const history: MatchHistory[] = [];
      for (const row of matchIds) {
        const participants = getUsers.all(row.match_id) as {
          user_id: number;
          score: number;
        }[];
        let userScore: number | null = null;
        let opponentScores: {
          opponentId: number;
          opponentScore: number;
        }[] = [];
        for (const p of participants) {
          if (p.user_id === userId) {
            userScore = p.score;
          } else {
            opponentScores.push({
              opponentId: p.user_id,
              opponentScore: p.score,
            });
          }
        }
        if (userScore === null) {
          throw new Error("Invalid user score in db");
        }
        history.push({
          date: new Date(row.match_end),
          userScore: userScore,
          opponentInfo: opponentScores,
        });
      }
      return history;
    });
  } catch (e) {
    throw e;
  }
};

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

export function insertTournamentMatchParticipant( // TODO delete? unused?
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

export function getTournamentBracket(tournamentId: number): TournamentBracket {
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

export function getTournamentId(matchId: number): number {
	try {
		return runTransaction((db) => {
			const stmt = db.prepare(`
				SELECT tournament_id
				FROM match_state
				WHERE match_id = ?
			`);

			const result = stmt.get(matchId) as number;
			if (!result) throw new Error("Tournament not found");
			return result;
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

export function updateTournamentStatusFinished(
	tournamentId: number,
) {
	try {
		runTransaction((db) => {
			const stmt = db.prepare(`
				UPDATE tournament
				SET
					tournament_end = ?,
					tournament_status = 'finished'
				WHERE tournament_id = ?
			`);

			stmt.run(new Date().toISOString(), tournamentId);
		})
	} catch (e) {
		throw e;
	}
}
