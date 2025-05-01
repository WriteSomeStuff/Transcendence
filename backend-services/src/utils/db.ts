import Database from "better-sqlite3";
import type BetterSqlite3 from "better-sqlite3";
import fs from 'fs/promises';
import path from 'path';

const DB_PATH: string = "database.sqlite3";

let db: BetterSqlite3.Database | null = null;

const openDbConnection = () => {
	try {
	db = new Database(DB_PATH, {
		verbose: console.log,
	});
	console.log('\x1b[32m%s\x1b[0m', "database connection opened.");
	} catch (e) {
		if (e instanceof Error) {
			console.error('Error opening the database connection:', e.message);
		} else {
			console.error('Unknown error:', e);
		}
		throw e;
	}
};

// Open the database connection
export const setupDatabase = async () => {
	try {
		openDbConnection();
		const sqlFilePath = path.join(__dirname, 'init_database.sql');
		const sql = await fs.readFile(sqlFilePath, 'utf-8');
		if (db) {
			db.exec(sql);
		}
		console.log('\x1b[32m%s\x1b[0m', "Database setup completed");
	} catch (e) {
		if (e instanceof Error) {
			console.error('Error setting up the database:', e.message);
		} else {
			console.error('Unknown error:', e);
		}
	}
	return db;
};

export default db;