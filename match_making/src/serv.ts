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
	const uniqueId = generateUniqueId();
	reply.header('Set-Cookie', ['sessionId=abc123; Path=/; HttpOnly', `userId=${uniqueId}; Path=/; HttpOnly`]);
	console.log("set cookies")
	return reply.sendFile('index.html');
});


fastify.post('/joinRoom', async (req, reply) => {
  // handle the player joining logic here

	const userId = req.cookies.userId;
	const gameMode = (req.body as any).gameMode;
	
	if (userId)
	{
		const idAsNumber: number = +userId;
  		joinRoom(idAsNumber, gameMode);
	}
	else {
  // Handle the case where there's no userId cookie
  	reply.status(400).send({ error: 'No userId cookie found' });
	}
});

fastify.listen({ port : 8080}, (err, address) =>{
	if (err)
	{
		console.log('Error starting server: ', err);
		process.exit(1);
	}
	console.log(`Matchmaking server up and running on ${address}`)
});

function generateUniqueId(): number { //TODO: check whether this is accepted solution by group lol :)
    return Math.floor(Math.random() * 1000000);
}