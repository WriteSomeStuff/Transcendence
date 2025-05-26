import fastify, { FastifyReply, FastifyRequest } from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider
} from "fastify-type-provider-zod";

import path from "path";

import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static"

import authRoutes from "./authRoutes";

const app = fastify({
	logger: true
})
.withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyJwt, { secret: process.env.JWT_SECRET as string || "default_secret" });
app.addHook('preHandler', (request, reply, done) => {
	request.jwt = app.jwt;
	done();
});
app.register(fastifyCookie, {
	secret: 'cookie_secret',
	hook: 'preHandler'
});

app.decorate(
	'authenticate',
	async (request: FastifyRequest, reply: FastifyReply) => {
		const token = request.cookies.access_token;
		console.log('Token:', token);
		if (!token) {
			return reply.status(401).send({ message: "Authentication required" });
		}
		try {
			const decoded = request.jwt.verify<{ user_id: number }>(token);
			console.log('Decoded user:', decoded);
			request.user = decoded;
		} catch (e) {
			if (e instanceof Error) {
				console.error('[Authenticate] ', e.message);
				reply.status(401).send({ error: 'Invalid or expired token' });
			}
		}
	},
);

app.register(fastifyStatic, {
	root: path.join(__dirname, 'static'),
	prefix: '/'
});

app.get('/register', (request, reply) => {
	reply.sendFile('register.html');
});

app.get('/login', (request, reply) => {
	reply.sendFile('login.html');
});

app.get('/ping', async (request, reply) => {
	return 'pong\n'
});

app.register(authRoutes);

export default app;