import fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from '@fastify/multipart';

import { userRoutes, friendRoutes } from "./userRoutes.js";

const PORT: number = 8080;
const HOST: string = '0.0.0.0';

const app = fastify({
	logger: true
});

app.addHook('preHandler', (request, _, done) => {
	request.jwt = app.jwt;
	done();
});
app.register(fastifyCookie);
app.register(fastifyJwt, {
	secret: process.env["JWT_SECRET"] as string
});
app.register(fastifyMultipart);

app.decorate(
	'authenticate',
	async function (request: FastifyRequest, reply: FastifyReply) {
		const token = request.cookies["access_token"];
		console.log('Token: ', token);
		if (!token) {
			console.error("no token");
			reply.code(401).send({ message: 'Unauthorized' });
		}
		try {
			const decoded = request.jwt.verify<{ userId: number }>(token as string);
			request.user = decoded;
		} catch (err) {
			console.error("not verified");
			reply.code(401).send({ message: 'Unauthorized' });
		}
	}
);

app.register(userRoutes, {
	prefix: '/users'
});

app.register(friendRoutes, {
	prefix: '/users/friends'
});

app.get('/users/health', async (_, reply) => {
	reply.send({ message: "User server is healthy" });
});

const start = async () => {
	try {
		await app.listen({
			port: PORT,
			host: HOST
		});
		console.log(`[user server startup] Server is running on http://${HOST}:${PORT}`);
	} catch (e) {
		console.error('[user server startup] Error starting up server:', e);
		process.exit(1);
	}
};

start();