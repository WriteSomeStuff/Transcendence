import { FastifyInstance } from "fastify";
import app from "./app"
import { setupDatabase } from "./utils/db";

const PORT = 8080;

const startServer = async () => {
	try {
		await setupDatabase();
		console.log('\x1b[32m%s\x1b[0m', 'Database connection established');

		// Start up the server.
		await app.listen({ port: PORT });
		console.log('\x1b[32m%s\x1b[0m', `Server is running on port ${PORT}`);

		process.on('SIGINT', () => shutdown(app));

	} catch (e) {
		if (e instanceof Error) {
			console.error(e);
		} else {
			console.error('Unknown error:', e);
		}
		process.exit(1);
	}
};

const shutdown = async (server: FastifyInstance) => {
	console.log('\x1b[33m%s\x1b[0m', "\nShutting down server...");
	await server.close();
	console.log('\x1b[32m%s\x1b[0m', "Server shutdown successful");
	process.exit(0);
};

startServer();