import fs from 'fs/promises';

import db from "./db";
import { UserObj } from "./types/types";

// whats needed to actually create tournament? where do i get this info from?
// in table: tournament id, tournament name, created at, tournament end, tournament status
export const createTournament = async (name: string) => {
	try {
		const stmt = db.prepare(`
			INSERT INTO tournament (tournament_name)
			VALUES (?)
		`);

		stmt.run(name);
	} catch (e) {
		throw e;
	}	
}