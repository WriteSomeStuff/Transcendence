import Fastify from 'fastify'
import fastifyStatic from '@fastify/static';
import path from 'path';
import fastifyFormbody from '@fastify/formbody';
import fastifyCookie from '@fastify/cookie';

// Parse the port from environment variable or use default 8080
const port = process.env.TOURNAMENT_PORT ? 
  parseInt(process.env.TOURNAMENT_PORT, 10) : 8080;

// Log warning if using default port
if (!process.env.TOURNAMENT_PORT) {
  console.log("CAUTION: No TOURNAMENT_PORT environment variable found. Using default port 8080.");
}

const fastify = Fastify({
	
});

fastify.register(fastifyStatic, {
	root: path.join(__dirname, ''),
});


fastify.register(fastifyFormbody);
fastify.register(fastifyCookie);

fastify.get('/', async (_req, reply) => {
	console.log("HEy")
	return reply.sendFile('public/index.html');
});

fastify.get('/joinTournament', async (_req, _reply) => {
	console.log("player joining tournament :)")

	//Need to figure out how the match_making service will send the player[] and gameMode to here.
	//start the tournament from here

});

fastify.listen({host: '0.0.0.0', port : 8081}, (err, address) =>{
	if (err)
	{
		console.log('Error starting server: ', err);
		process.exit(1);
	}
	console.log(`Tournament server up and running on ${address}`)
});

