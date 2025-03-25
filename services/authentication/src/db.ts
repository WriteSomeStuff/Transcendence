import Database from "better-sqlite3";
import type BetterSqlite3 from "better-sqlite3";

const DB_PATH: string = "database.sqlite3";

class DatabaseService {
  private static instance: BetterSqlite3.Database;

  public static getInstance(): BetterSqlite3.Database {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new Database(DB_PATH, {
        verbose: console.log,
      });
      try {
        DatabaseService.instance.exec(`
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
    }
    return DatabaseService.instance;
  }
}

const db: BetterSqlite3.Database = DatabaseService.getInstance();

export default db;
