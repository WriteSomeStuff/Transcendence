import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import ws from 'ws';

import { joinLobby, leaveLobby } from './backend/Lobby';
import { User } from './backend/types'
import { findPlayerAndKick } from './backend/helperFunctions';

const MATCH_MAKING_PORT = process.env.MATCH_MAKING_PORT ? 
  parseInt(process.env.MATCH_MAKING_PORT, 10) : 8080;

// Log warning if using default port
if (!process.env.MATCH_MAKING_PORT) {
  console.log("CAUTION: No MATCH_MAKING_PORT environment variable found. Using default port 8080.");
}


const fastify = Fastify({});
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
});

const wss = new ws.Server({ noServer: true });

wss.on('connection', (socket) => {
  socket.on('message', (data) => {
	try{
		// Validate and extract fields
		const msg = JSON.parse(data.toString());
		const { playerId, gameMode, gameType } = msg.payload || {};

		switch(msg.action) {
			case 'joinRoom': {
				if (!playerId || !gameMode || !gameType) {
					socket.send(JSON.stringify({ error: 'Invalid joinRoom payload' }));
					return;
				}
				const user : User = {userID: playerId, socket: socket};
				joinLobby(user, gameMode, gameType);
				break;
			}
			case 'leaveRoom': {
				if (!playerId || !gameType) {
					socket.send(JSON.stringify({ error: 'Invalid joinRoom payload' }));
					return;
				}
				const user : User = {userID: playerId, socket: socket};
				leaveLobby(user, gameType);
				break;
			}
			default:
				//send error here
		}
	}
	catch (err){
		console.error('Invalid Room request received:', err);
	}
	// console.log(roomQueues);
	// console.log(tournamentQueues);
  });

socket.on('close', () => {
	console.log("user Disconnected");
	findPlayerAndKick(socket);
	});
});


fastify.server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (wsSocket) => {
      wss.emit('connection', wsSocket, request);
    });
  }
});


let index = 1; //FOR TEST UUID TODO: REMOVE

fastify.get('/', (req, reply) => { //TODO this is for DEBUG. later should only get connection req from routing. figure out later what it should look like
  console.log("page visited and cookies sent.")
  reply.header('Set-Cookie', [`userId=TYMONSCUSTOMID${index}; Path=/`]);
  index >= 10 ? index = 1 : index++;
  return reply.sendFile('index.html');
});


fastify.listen({ port: MATCH_MAKING_PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});