import { table } from "console";
import { setupDatabase } from "./utils/db";
import type BetterSqlite3 from "better-sqlite3";

const fillDatabase = (db: BetterSqlite3.Database) => {
	try {
		db.prepare('INSERT INTO user (username, password_hash) VALUES (?, ?)').run('user1', '1234');
		db.prepare('INSERT INTO user (username, password_hash) VALUES (?, ?)').run('user2', '5678');
		console.log('Test data inserted into "user" table.');
	} catch (e) {
		if (e instanceof Error) {
			console.error('Error inserting data into "user" table', e.message);
		} else {
			console.error('Unknown error:', e);
		}
		throw e;
	}
}

const deleteAllDataFromTable = (db: BetterSqlite3.Database, tableName: string) => {
	try {
		db.prepare(`DELETE FROM ${tableName}`).run();
		console.log('\x1b[32m%s\x1b[0m', `Deleted all data from "${tableName}" table`);
	} catch (e) {
		if (e instanceof Error)
		{
			console.error(`Error deleting all data from "${tableName}" table:`, e.message);
		} else {
			console.error('Unknown error:', e);
		}
		throw e;
	}
}

const testDatabaseSetup = async () => {
	try {
		const db = await setupDatabase();
		if (!db) {
			throw new Error("Database setup failed.");
		}
		console.log('\x1b[32m%s\x1b[0m', 'Database connection established:', db);

		deleteAllDataFromTable(db, "user");	// Delete previous added data for testing purposes
		fillDatabase(db); // Add some testing data

		const users = db.prepare('SELECT * FROM user').all();
		console.log('Current data in the "user" table:', users);

		if (db) {
			db.close();
			console.log('\x1b[32m%s\x1b[0m', "Databse connection closed.");
		}
	} catch (e) {
		console.error('Error testing database setup', e);
	}
};

testDatabaseSetup();