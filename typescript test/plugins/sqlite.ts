import { FastifyInstance, FastifyPluginAsync } from "fastify"
import db from '../db'

const sqlitePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
	fastify.decorate('db', db)
}

export default sqlitePlugin