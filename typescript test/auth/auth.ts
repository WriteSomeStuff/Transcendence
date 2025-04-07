import { FastifyInstance } from 'fastify'
import bcrypt from 'bcrypt'
import {v4 as uuidv4} from 'uuid'

export async function authentication (fastify: FastifyInstance) {
	
	fastify.post('/register', async (request, reply) => {
		const {username, password } = request.body as {username: string, password: string }

 		//check database if username is free
		await fastify.db.get('SELECT * FROM users WHERE name = ?', [username], (err, row) => {
		if (err) {
			console.error(err)
			return reply.code(500).send('Database error')
			}
		
			if (row) {
			// User already exists
			return reply.code(409).send('Username already taken')
			}
		})

		//TODO: due to async of ts the code still executes if Username is aready taken :/


		//encrypt password
		let hashedPassword = await bcrypt.hash(password, 10)
		console.log('passwd = ' + password +' ' + hashedPassword)

			
		//generate uuid
		let uuid = uuidv4();
		
		//log user into DB (auth on false)
		console.log('Inserting: uuid: ' + uuid, + ' username: ' + username + ' hashedpassword: ' + hashedPassword)
	    fastify.db.run('INSERT INTO users (userID, name, password) VALUES (?, ?, ?)', [uuid, username, hashedPassword], (err) => {
	  	if (err) {
	  	  console.error(err)
	  	  return reply.code(500).send('Failed to register user')
	  	}
	
	  	return reply.sendFile('signupSuccess.html')
	    })
		
		//send email confirmation?
		return reply.sendFile('signupSuccess.html')
	})
}

	
	  //   // User does not exist yet – proceed with registration
	  //   fastify.db.run('INSERT INTO users (name, password) VALUES (?, ?)', [username, password], (err) => {
	  // 	if (err) {
	  // 	  console.error(err)
	  // 	  return reply.code(500).send('Failed to register user')
	  // 	}
	
	  // 	return reply.sendFile('signupSuccess.html')
	  //   })