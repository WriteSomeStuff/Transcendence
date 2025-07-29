import Database from "better-sqlite3";

const DB_PATH = process.env["AUTH_DB_PATH"] as string;
if (!DB_PATH) {
  throw new Error("AUTH_DB_PATH environment variable is not set");
}

const db = new Database(DB_PATH, {
  verbose: console.log,
});

function runTransaction<T>(fn: (db: Database.Database) => T): T {
  const transaction = db.transaction(fn);
  return transaction(db);
}

const sql = `
	CREATE TABLE IF NOT EXISTS user (
		user_id			INTEGER	PRIMARY KEY,
		email			TEXT	NOT NULL UNIQUE,
		password_hash	TEXT	NOT NULL,
		two_fa_enabled	INTEGER	DEFAULT 0,
		two_fa_secret	TEXT,
		created_at		TEXT	DEFAULT (datetime('now'))
	);
`;
// 0 = false, 1 = true

try {
  console.log("[auth-db init] Initialising authentication database:");
  db.exec(sql);
  console.log(
    "[auth-db init] Successfully initialised authentication database",
  );
} catch (e) {
  console.error("Error creating authentication database:", e);
  process.exit(1);
}

export default runTransaction;
