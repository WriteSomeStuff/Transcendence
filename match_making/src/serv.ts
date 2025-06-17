import Fastify from 'fastify'
import fastifyStatic from '@fastify/static';
import path from 'path';
import fastifyFormbody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';


import { joinRoom } from './backend/joinRoom.js';
import { leaveRoom } from './backend/leaveRoom.js'
import { cleanUpOldRooms } from './backend/room.js';

const ONE_MINUTE = 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;

// Parse the port from environment variable or use default 8080
const port = process.env.MATCH_MAKING_PORT ? 
  parseInt(process.env.MATCH_MAKING_PORT, 10) : 8080;

// Log warning if using default port
if (!process.env.MATCH_MAKING_PORT) {
  console.log("CAUTION: No MATCH_MAKING_PORT environment variable found. Using default port 8080.");
}

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
	return reply.sendFile('public/index.html');
});


fastify.post('/joinRoom', async (req, reply) => {
  // handle the player joining logic here

	const userId = req.cookies.userId;
	const gameMode = (req.body as any).gameMode;
	
	if (userId)
	{
		//userId comes in as a 'string | undefined' and the '+' converts it to number 
		const idAsNumber: number = +userId;
  		joinRoom(idAsNumber, gameMode);
	}
	else {
  // Handle the case where there's no userId cookie
  	reply.status(400).send({ error: 'No userId cookie found' });
	}

	//TODO:	make TS that receives the roomNumber and returns it to frontend?
});

fastify.post('/leaveRoom', async (request, reply) =>{
	const userId = request.cookies.userId;
	
	if (userId)
	{
		//userId comes in as a 'string | undefined' and the '+' converts it to number 
		const idAsNumber: number = +userId;
  		leaveRoom(idAsNumber);
	}
	else {
  // Handle the case where there's no userId cookie
  	reply.status(400).send({ error: 'No userId cookie found' });
	}
})

fastify.listen({host: '0.0.0.0', port : port}, (err, address) =>{
	if (err)
	{
		console.log('Error starting server: ', err);
		process.exit(1);
	}
	console.log(`Matchmaking server up and running on ${address}`)
});

function generateUniqueId(): number { //DEBUG just to generate userId cookies for test REMOVE
    return Math.floor(Math.random() * 1000000);
}

setInterval(() => {
  cleanUpOldRooms(FIVE_MINUTES); // 5 minutes in ms
}, ONE_MINUTE); // run once every minute



// TODO: add /Health or /ping
// add logging
//