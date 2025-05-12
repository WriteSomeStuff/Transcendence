/** Starts up Fastify server and sets up the database
* 1. Imports the Fastify instance and database setup function.
* 2. Sets up the database.
* 3. Starts the Fastify server and listens on a specified port.
* 4. Logs server status.
 */

// 1.
import app from "./app"
import { setupDatabase } from "./utils/db";

const PORT = 8080;

const startServer = async () => {
	try {
		// 2.
		await setupDatabase();
		console.log('\x1b[32m%s\x1b[0m', 'Database connection established');
		// 3.
		await app.listen({ port: PORT });
		// 4.
		console.log('\x1b[32m%s\x1b[0m', `Server is running on port ${PORT}`);

	} catch (e) {
		if (e instanceof Error) {
			console.error(e);
		} else {
			console.error('Unknown error:', e);
		}
		process.exit(1);
	}
};

startServer();