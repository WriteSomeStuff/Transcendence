import fs from 'fs/promises';

import db from "./db";
import { UserObj } from "./types/types";

export const createTournament = async (name: string) => {
	try {
		const stmt = db.prepare(`
			INSERT INTO tournament (tournament_name)
			VALUES (?)
		`);

		const info = stmt.run(name);
		return info.lastInsertRowid;
	} catch (e) {
		throw e;
	}
}

export const createMatchState = async (tournamentId?: number) => {
	try {
		const stmt = db.prepare(`
			INSERT INTO match_state (tournament_id)
			VALUES (?)
			`);

		const info = stmt.run(tournamentId ?? null);
		return info.lastInsertRowid;
	} catch (e) {
		throw e;
	}
}

export const createMatchParticipant = async (userId: number, matchId: number) => {
	try {
		const stmt = db.prepare(`
			INSERT INTO match_participant (user_id, match_id)
			VALUES (?, ?)
			`);

		stmt.run(userId, matchId);
	} catch (e) {
		throw e;
	}
}
