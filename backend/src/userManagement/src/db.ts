import Database from "better-sqlite3";

const DB_PATH: string = "user_management.sqlite3";

const db = new Database(DB_PATH, {
	verbose: console.log,
});

const sql = `
	CREATE TABLE IF NOT EXISTS user (
		user_id			INTEGER PRIMARY KEY,
		username		TEXT	NOT NULL	UNIQUE,
		created_at		TEXT	DEFAULT (datetime('now', 'localtime')),
		last_login		TEXT,
		avatar_path		TEXT,
		account_status	TEXT	DEFAULT ('offline')
	);

	CREATE INDEX idx_user_username ON user(username);
`

try {
	db.exec(sql);
} catch (e) {
	console.error('Error creating user table:', e);
}

export default db;