import fastify, {FastifyReply, FastifyRequest} from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyJwt from "@fastify/jwt";
import proxy from "@fastify/http-proxy";

import authRoutes from "./authRoutes.js";
import { handleAuthInvalidation } from "./helpers/authControllerHelpers.js";

const PORT: number = 80;
const HOST: string = '0.0.0.0';

const app = fastify({
	logger: true
});

app.register(fastifyCookie);
app.register(fastifyJwt, {
	secret: process.env["JWT_SECRET"] as string
});

app.decorate(
	'authenticate',
	async function (request: FastifyRequest, reply: FastifyReply) {
		const token = request.cookies["access_token"];
		console.log('Token: ', token);
		if (!token) {
			console.error("no token");
			await handleAuthInvalidation(request, reply, -1);
		}
		try {
			request.user = request.jwt.verify<{ userId: number }>(token as string);
		} catch (err) {
			console.error("Failed to authenticate", err);
			await handleAuthInvalidation(request, reply, -1);
		}
	}
);

app.addHook('preHandler', async (request, reply) => {
	request.jwt = app.jwt;
	if (request.url.startsWith("/auth/")) {
		return;
	}
	console.log('Non-auth request');
	await app.authenticate(request, reply);
	console.log('Tried to authenticate');
	if (reply.statusCode === 401) {
		return;
	}
	request.headers.cookie = request.user.userId.toString();
});

app.register(authRoutes, {
	prefix: '/auth'
});

app.get('/auth/health', async (_, reply) => {
	reply.send({ message: "Auth server is healthy" });
});

app.register(proxy, {
	upstream: "http://routing_service/",
	websocket: true,
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
