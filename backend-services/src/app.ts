/** Sets up the Fastify application and registers routes
* 1. Imports Fastify and route modules.
* 2. Creates a Fastify instance.
* 3. Registers routes.
* 4. Exports the configured Fastify instance.
 */

// 1.
import fastify from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { authRoutes } from "./authentication/authRoutes";

// 2.
const app = fastify({
	logger: true
})
.withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// 3.
app.register(authRoutes);

// Testing
app.get('/ping', async (request, reply) => {
	return 'pong\n'
});

// 4.
export default app;