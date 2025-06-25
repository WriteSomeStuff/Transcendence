import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import ws from 'ws';

import { joinLobby, leaveLobby } from './backend/Lobby';

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

		console.log("action = " + msg.action);
		switch(msg.action) {
			case 'joinRoom': {
				if (!playerId || !gameMode || !gameType) {
					socket.send(JSON.stringify({ error: 'Invalid joinRoom payload' }));
					return;
				}
				joinLobby(playerId, gameMode, gameType);
				break;
			}
			case 'leaveRoom': {
				console.log("leaveRoom req");
				if (!playerId || !gameType) {
					socket.send(JSON.stringify({ error: 'Invalid joinRoom payload' }));
					return;
				}
				leaveLobby(playerId, gameType);
				break;
			}
			default:
				//send error here
		}
	}
	catch (err){
		console.error('Invalid Room request received:', err);
	}
  });
});


//TODO make user leaves or disconnects

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



fastify.listen({ port: 8080, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at ${address}`);
});