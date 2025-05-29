import Database from "better-sqlite3";

const DB_PATH: string = "/app/data/user_db.sqlite3";

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
`

try {
	console.log("[user-mgmt-db init] Initialising user management database:");
	db.exec(sql);
	// // testing (
	// db.prepare(
	// 	`INSERT INTO user (username, avatar_path, account_status) VALUES (?, ?, ?)`
	// ).run('testuser', '/avatars/testuser.png', 'online');
	// // )
	console.log("[user-mgmt-db init] Successfully initialised user management database");
} catch (e) {
	console.error('Error creating user table:', e);
}

export default db;