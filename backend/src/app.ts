/** Sets up the Fastify application and registers routes
* 1. Imports Fastify and route modules.
* 2. Creates a Fastify instance.
* 3. Registers routes.
* 4. Exports the configured Fastify instance.
 */

import fastify, { FastifyReply, FastifyRequest } from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import fastifyJwt, { FastifyJWT } from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import {
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider
} from "fastify-type-provider-zod";

import { authRoutes } from "./authentication/authRoutes";
import { userRoutes } from "./userManagement/userRoutes";

// Create a fastify instance
const app = fastify({
	logger: true
})
.withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Register routes
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'public');
app.register(fastifyStatic, {
	root : frontendPath,
	prefix: '/'
});
app.register(fastifyFormbody);

app.get('/register', (request, reply) => {
	reply.sendFile('register.html');
});
app.get('/registerSuccess', (request, reply) => {
	reply.sendFile('registerSuccess.html');
});

app.get('/login', (request, reply) => {
	reply.sendFile('login.html');
});

app.register(fastifyJwt, { secret: process.env.JWT_SECRET as string || "default_secret" });
app.addHook('preHandler', (request, reply, done) => {
	request.jwt = app.jwt;
	done();
}); // hook logic in different file?

app.register(fastifyCookie, {
	secret: 'cookie_secret',
	hook: 'preHandler'
});

// TODO: move this to auth.ts files
app.decorate(
	'authenticate',
	async (request: FastifyRequest, reply: FastifyReply) => {
		const token = request.cookies.access_token;
		console.log('Token:', token);
		if (!token) {
			return reply.status(401).send({ message: "Authentication required" });
		}
		try {
			const decoded = request.jwt.verify<FastifyJWT['user']>(token);
			console.log('Decoded user:', decoded);
			request.user = decoded;
		} catch (e) {
			reply.status(401).send({ message: "Invalid or expired token" });
		}
	},
);

app.register(authRoutes);
app.register(userRoutes);

// Testing
app.get('/ping', async (request, reply) => {
	return 'pong\n'
});

// 4.
export default app;

// TODO: clean up cookies when quitting server