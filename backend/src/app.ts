/** Sets up the Fastify application and registers routes
* 1. Imports Fastify and route modules.
* 2. Creates a Fastify instance.
* 3. Registers routes.
* 4. Exports the configured Fastify instance.
 */

// 1.
import fastify from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import {
	serializerCompiler,
	validatorCompiler,
	ZodTypeProvider
} from "fastify-type-provider-zod";

import { authRoutes } from "./authentication/authRoutes";

// 2.
const app = fastify({
	logger: true
})
.withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// 3.
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
app.get('/loginSuccess', (request, reply) => {
	reply.sendFile('loginSuccess.html');
});

app.register(authRoutes);

// Testing
app.get('/ping', async (request, reply) => {
	return 'pong\n'
});

// 4.
export default app;