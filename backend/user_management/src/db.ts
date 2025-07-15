import Database from "better-sqlite3";

const DB_PATH: string = process.env["USER_DB_PATH"] as string;
if (!DB_PATH) {
	throw new Error("DB_PATH environment variable is not set");
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
		created_at		TEXT	DEFAULT (datetime('now')),
		last_login		TEXT,
		avatar_path		TEXT,
		account_status	TEXT	DEFAULT ('offline')	CHECK(account_status IN ('online', 'offline'))
	);

	CREATE TABLE IF NOT EXISTS tournament (
		tournament_id		INTEGER PRIMARY KEY,
		tournament_name		TEXT	NOT NULL	UNIQUE,
		created_at			TEXT	DEFAULT (datetime('now', '+2 hour')),
		tournament_end		TEXT,
		tournament_status	TEXT	DEFAULT ('ongoing')	CHECK(tournament_status IN ('ongoing', 'finished'))
	);

	CREATE TABLE IF NOT EXISTS match_state (
		match_id		INTEGER PRIMARY KEY,
		match_date		TEXT,
		match_status	TEXT	DEFAULT ('finished')	CHECK(match_status IN ('ongoing', 'finished')),
		match_end		TEXT,
		tournament_id	INTEGER,
		FOREIGN KEY (tournament_id)
			REFERENCES tournament (tournament_id)
	);

	CREATE TABLE IF NOT EXISTS match_participant (
		user_id		INTEGER		NOT NULL,
		match_id	INTEGER		NOT NULL,
		score		INTEGER		DEFAULT (0),
		PRIMARY KEY (user_id, match_id),
		FOREIGN KEY (user_id)
			REFERENCES user (user_id),
		FOREIGN KEY (match_id)
			REFERENCES match_state (match_id)
	);

	CREATE TABLE IF NOT EXISTS friendship (
		friendship_id	INTEGER	PRIMARY KEY,
		user_id			INTEGER	NOT NULL,
		friend_id		INTEGER	NOT NULL,
		status			TEXT	DEFAULT ('pending')	CHECK(status IN ('pending', 'accepted', 'rejected')),
		created_at		TEXT	DEFAULT (datetime('now')),

		CONSTRAINT unq UNIQUE (user_id, friend_id),
		FOREIGN KEY (user_id)
			REFERENCES user (user_id),
		FOREIGN KEY (friend_id)
			REFERENCES user (user_id)
	);

	CREATE TRIGGER IF NOT EXISTS update_last_login
	AFTER UPDATE OF account_status ON user
	WHEN NEW.account_status = 'online'
	BEGIN
		UPDATE user
		SET last_login = (datetime('now'))
		WHERE rowid = NEW.rowid;
	END;

	PRAGMA foreign_keys = ON;
`;

try {
	console.log("[user-mgmt-db init] Initialising user management database:");
	db.pragma('foreign_keys = ON;');
	db.exec(sql);
	console.log("[user-mgmt-db init] Successfully initialised user management database");
} catch (e) {
	console.error('Error creating user database:', e);
	process.exit(1);
}

export default db;
// export default runTransaction;
