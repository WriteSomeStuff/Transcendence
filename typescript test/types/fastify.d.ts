import 'fastify'
import sqlite3 from 'sqlite3'

declare module 'fastify' {
  interface FastifyInstance {
    db: sqlite3.Database
  }
}
