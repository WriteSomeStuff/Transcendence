import Database from "better-sqlite3";

const DB_PATH: string = process.env.USER_DB_PATH as string;
if (!DB_PATH) {
	throw new Error("DB_PATH environment variable is not set");
}

const DEFAULT_AVATAR_PATH: string = `${process.env.AVATAR_DIR_PATH as string}/default/default_avatar.jpg`;
if (!DEFAULT_AVATAR_PATH) {
	throw new Error("AVATAR_DIR_PATH environment variable is not set");
}

const db = new Database(DB_PATH, {
	verbose: console.log,
});

export function runTransaction<T>(fn: (db: Database.Database) => T): T {
	const transaction = db.transaction(fn);
	return transaction(db);
}

const sql = `
	CREATE TABLE IF NOT EXISTS user (
		user_id			INTEGER PRIMARY KEY,
		username		TEXT	NOT NULL	UNIQUE,
		created_at		TEXT	DEFAULT (datetime('now', '+2 hour')),
		last_login		TEXT,
		avatar_path		TEXT	DEFAULT ('${DEFAULT_AVATAR_PATH}'),
		account_status	TEXT	DEFAULT ('offline')	CHECK(account_status IN ('online', 'offline'))
	);

	CREATE TRIGGER IF NOT EXISTS update_last_login
	AFTER UPDATE OF account_status ON user
	WHEN NEW.account_status = 'online'
	BEGIN
		UPDATE user
		SET last_login = (datetime('now', '+2 hour'))
		WHERE rowid = NEW.rowid;
	END;
`
// datetime +2 hour because it returns UTC, +2 hour -> CEST

try {
	console.log("[user-mgmt-db init] Initialising user management database:");
	db.exec(sql);
	console.log("[user-mgmt-db init] Successfully initialised user management database");
} catch (e) {
	console.error('Error creating user database:', e);
	process.exit(1);
}

export default db;