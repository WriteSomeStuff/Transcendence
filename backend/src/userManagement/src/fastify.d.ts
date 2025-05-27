import "fastify";

declare module "fastify" {
	interface FastifyInstance {
		authenticate: import("fastify").preHandlerAsyncHookHandler;
	}
}