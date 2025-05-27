import fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";

import { userRoutes } from "./userRoutes";

const PORT: number = 3000;
const HOST: string = '0.0.0.0';

const app = fastify({
	logger: true
});

app.register(fastifyCookie);
app.register(fastifyJwt, {
	secret: 'secret-key' // TODO: same key as in authentication, where stored?
});

app.decorate(
	'authenticate',
	async function (request: FastifyRequest, reply: FastifyReply) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.code(401).send({ message: 'Unauthorized' });
		}
	}
);

app.register(userRoutes, {
	prefix: '/users'
});

app.get('/ping', async (request, reply) => {
	return 'pong\n'
});

const start = async () => {
	try {
		await app.listen({
			port: PORT,
			host: HOST
		});
		console.log(`Server is running on http://${HOST}:${PORT}`);
	} catch (e) {
		console.error('Error starting up server:', e);
		process.exit(1);
	}
};

start();