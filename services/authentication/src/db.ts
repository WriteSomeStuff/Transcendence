import Database from "better-sqlite3";
import type BetterSqlite3 from "better-sqlite3";

const DB_PATH: string = "database.sqlite3";

const db: BetterSqlite3.Database = new Database(DB_PATH, {
  verbose: console.log,
});

try {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
  `);
  console.log("Users table exists!");
} catch (e) {
  console.error("Error creating users table", e);
}

export default db;
