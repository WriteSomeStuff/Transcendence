import Database from "better-sqlite3";

const DB_PATH: string = "/app/data/user_db.sqlite3";

const db = new Database(DB_PATH, {
	verbose: console.log,
});

const sql = `
	CREATE TABLE IF NOT EXISTS user (
		user_id			INTEGER PRIMARY KEY,
		username		TEXT	NOT NULL	UNIQUE,
		created_at		TEXT	DEFAULT (datetime('now', '+2 hour')),
		last_login		TEXT,
		avatar_path		TEXT,
		account_status	TEXT	DEFAULT ('offline')	CHECK(account_status IN ('online', 'offline'))
	);

	CREATE TRIGGER update_last_login
	AFTER UPDATE OF account_status ON user
	WHEN NEW.account_status = 'online'
	BEGIN
		UPDATE user
		SET last_login = (datetime('now', '+2 hour'))
		WHERE rowid = NEW.rowid;
	END;
`

// datetime gets current time in UTC, we are now in CEST so +2, set to +1 for CET

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