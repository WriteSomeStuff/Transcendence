import Fastify from "fastify";

const PORT = process.env.PORT;

const fastify = Fastify({
  logger: true,
});

fastify.register(import('./routes.js'));

const startServer = async () => {
  try {
	await fastify.listen({ port: PORT });
	console.log(`Server is running on http://localhost:${PORT}`);
  } catch (error) {
	fastify.log.error(error);
	process.exit(1);
  }
}

startServer();

// export default fastify;
