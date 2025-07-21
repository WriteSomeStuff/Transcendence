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
					mp.score	AS user_score,
					mp2.user_id	AS opponent_id,
					mp2.score	AS opponent_score,
					ms.match_end
				FROM match_participant mp
				JOIN match_participant mp2 ON mp.match_id = mp2.match_id AND mp.user_id != mp2.user_id
				JOIN match_state ms ON ms.match_id = mp.match_id
				WHERE mp.user_id = ? AND ms.match_status = 'finished'
				ORDER BY ms.match_end DESC;
			`);
			const rows = getHistoryStmt.all(userId) as {
				user_score: number,
				opponent_id: number,
				opponent_score: number,
				match_end: string,
			}[];

			if (!rows || rows.length === 0) return []

			const history: MatchHistory[] = rows.map(row => ({
				date: new Date(row.match_end),
				userScore: row.user_score,
				opponentInfo: [{opponentId: row.opponent_id, opponentScore: row.opponent_score}],
			}));
			return history;
		});
	} catch (e) {
		throw e;
	}
}
