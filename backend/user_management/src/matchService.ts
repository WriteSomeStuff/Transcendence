import db from "./db.js";

export const createTournament = async (name: string) => {
	try {
		const stmt = db.prepare(`
			INSERT INTO tournament (tournament_name)
			VALUES (?)
		`);

		const info = stmt.run(name);
		return Number(info.lastInsertRowid);
	} catch (e) {
		throw e;
	}
}

export const createMatchState = async (start?: string, end?: string, tournamentId?: number) => {
	try {
		const stmt = db.prepare(`
			INSERT INTO match_state (match_date, match_end, tournament_id)
			VALUES (?, ?, ?)
			`);

		const info = stmt.run(start, end, tournamentId ?? null);
		return Number(info.lastInsertRowid);
	} catch (e) {
		throw e;
	}
}

export const createMatchParticipant = async (userId: number, matchId: number, score: number) => {
	try {
		const stmt = db.prepare(`
			INSERT INTO match_participant (user_id, match_id, score)
			VALUES (?, ?, ?)
			`);

		stmt.run(userId, matchId, score);
	} catch (e) {
		throw e;
	}
}
