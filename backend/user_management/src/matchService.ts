import { runTransaction } from "./db.js";
import type { MatchHistory } from "schemas";

export const createTournament = async (name: string) => {
	try {
		return runTransaction((db) => {
			const stmt = db.prepare(`
				INSERT INTO tournament (tournament_name)
				VALUES (?)
			`);

			const info = stmt.run(name);
			return Number(info.lastInsertRowid);
		});
	} catch (e) {
		throw e;
	}
}

export const createMatchState = async (start?: string, end?: string, tournamentId?: number) => {
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
}

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
