import Fastify from 'fastify'
import fastifyStatic from '@fastify/static';
import path from 'path';
import fastifyFormbody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';


import { joinRoom } from './backend/ts/joinRoom';

const fastify = Fastify({
	
});


fastify.register(fastifyStatic, {
	root: path.join(__dirname, ''),
});

fastify.register(fastifyFormbody);
fastify.register(fastifyCookie);

fastify.get('/', async (req, reply) => {
	
	reply.header('Set-Cookie', 'sessionId=abc123; userId=testUser Path=/; HttpOnly');
	console.log("set cookies")
	return reply.sendFile('index.html');
});


fastify.post('/joinRoom', async (req, reply) => {
  // handle the player joining logic here

	const userId = req.cookies.userId;
  	console.log(req);
	if (userId)
  		joinRoom(userId);
	else {
  // Handle the case where there's no userId cookie
  	reply.status(400).send({ error: 'No userId cookie found' });
	}
//   joinRoom(req.userId);
  console.log("player attempting to join room")
});

fastify.listen({ port : 8080}, (err, address) =>{
	if (err)
	{
		console.log('Error starting server: ', err);
		process.exit(1);
	}
	console.log(`Matchmaking server up and running on ${address}`)
});