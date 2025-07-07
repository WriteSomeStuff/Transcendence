import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: number }; // payload type
    user: { userId: number };    // decoded token type
  }
}