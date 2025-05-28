import fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";

import authRoutes from "./authRoutes";

const PORT: number = 8081;
const HOST: string = '0.0.0.0';

const app = fastify({
	logger: true
});

app.register(fastifyCookie);
app.register(fastifyJwt, {
	secret: process.env.JWT_SECRET as string // TODO: same key as in authentication, where stored?
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

app.register(authRoutes, {
	prefix: '/auth'
});

app.get('/health', async (_, reply) => {
	reply.send({ message: "Auth server is healthy" });
});

const start = async () => {
	try {
		await app.listen({
			port: PORT,
			host: HOST
		});
		console.log(`[auth server startup] Server is running on http://${HOST}:${PORT}`);
	} catch (e) {
		console.error('[auth server startup] Error starting up server:', e);
		process.exit(1);
	}
};

start();