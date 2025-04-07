import Fastify from 'fastify'
import fastifyStatic from '@fastify/static'
import fastifyFormbody from '@fastify/formbody'
import path from 'path'
import { routes } from './routes.js'
import { authentication } from './auth/auth.js'

// import sqlitePlugin from './plugins/sqlite.js'



const fastify = Fastify({
	// logger : true
})



//Create database
import sqlite3 from 'sqlite3'

const db = new sqlite3.Database('./database/test.db')

db.serialize(() => {
	db.run("CREATE TABLE IF NOT EXISTS users (userID TEXT PRIMARY KEY, name TEXT, password TEXT)")
	// const cmd = 'INSERT INTO users (userID, name, password) VALUES (? ,?, ?)'
	// db.run(cmd, [54, "Tim", "SecretPass"])
	console.log ("database has been instanciated")
})
fastify.decorate('db', db)

// //


fastify.register(fastifyStatic, {
	root : path.join(__dirname, 'public'),
	prefix: '/public/',
})
fastify.register(fastifyFormbody)
fastify.register(routes)
fastify.register(authentication)

fastify.listen({port: 8080 }, (err, address) => {
	if (err) {
		console.error(err)
		process.exit(999)
	}
	console.log(`listening on ${address}`)
})