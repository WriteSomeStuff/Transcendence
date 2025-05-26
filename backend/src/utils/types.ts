import { JWT } from "@fastify/jwt";

declare module 'fastify' {
	interface FastifyRequest {
		jwt: JWT
	}
	export interface FastifyInstance {
		authenticate: any
	}
}

type UserPayload = {
	// username: string
	user_id: number
}

declare module '@fastify/jwt' {
	interface FastifyJWT {
		user: UserPayload
	}
}