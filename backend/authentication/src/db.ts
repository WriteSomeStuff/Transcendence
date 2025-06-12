import Database from "better-sqlite3";

const DB_PATH: string = "/app/data/auth_db.sqlite3";

const db = new Database(DB_PATH, {
	verbose: console.log,
});

const sql = `
	CREATE TABLE IF NOT EXISTS user (
		user_id			INTEGER	PRIMARY KEY,
		username		TEXT	NOT NULL	UNIQUE,
		password_hash	TEXT	NOT NULL,
		two_fa_enabled	INTEGER	DEFAULT 0,
		two_fa_secret	TEXT,
		created_at		TEXT	DEFAULT (datetime('now', '+2 hour'))
	);
`
// 0 = false, 1 = true
// datetime +2 hour because it return UTC, +2 hour -> CEST

try {
	console.log("[auth-db init] Initialising authentication database:");
	db.exec(sql);
	console.log("[auth-db init] Successfully initialised authentication database");
} catch (e) {
	console.error('Error creating auth-db:', e);
}

export default db;