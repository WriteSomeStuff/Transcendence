import Database from 'better-sqlite3';
import BetterSqlite3 from 'better-sqlite3';

const db: BetterSqlite3.Database = new Database('database.sqlite3');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `)

export default db;
