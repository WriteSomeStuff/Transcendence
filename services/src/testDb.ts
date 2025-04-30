import { setupDatabase } from "./utils/db";

const testDatabaseSetup = async () => {
	try {
		const db = await setupDatabase();
		if (!db) {
			throw new Error("Database setup failed.");
		}

		const row = db.prepare('SELECT username FROM sqlite_master WHERE type="table" AND name="user"').get();
		if (row) {
			console.log('User table exists!');
		} else {
			console.log('User table does not exist.');
		}
		if (db) {
			db.close();
			console.log("Database connection closed.");
		}
	} catch (e) {
		console.error('Error testing database setup', e);
	}
};

testDatabaseSetup();