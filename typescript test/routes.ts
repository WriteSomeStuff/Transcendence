import { FastifyInstance } from 'fastify'



export async function routes (fastify: FastifyInstance) {

	fastify.get('/', async (request, reply) => {
		return reply.sendFile('index.html')
	})

	fastify.get('/register', async (request, reply) => {
		return reply.sendFile('register.html')
		})

	fastify.get('/data', async(request, reply) =>
	fastify.db.all('SELECT * FROM users', (err, rows) => {
		if (err) {
			console.error(err)
			return reply.code(500).send('Database error')
		  }
	  
		  rows.forEach((row: any) => {
			console.log(row)
		  })
		})

	)
}
