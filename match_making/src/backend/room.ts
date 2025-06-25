import { roomQueues, GameMode } from "./types";
import http from "http";

export class Room {
	playerList: Map<number, any>; // userID -> socket
	amountPlayersInRoom: number;
	maxPlayerAmount: number;
	roomGameMode: GameMode;
	lastActivity: Date;


	constructor(userID: number, maxPlayerAmount: number, mode: GameMode, socket?: any){

		this.playerList = new Map();
		this.playerList.set(userID, socket);

		this.amountPlayersInRoom = 1;

		this.maxPlayerAmount = maxPlayerAmount;

		this.roomGameMode = mode;

		this.lastActivity = new Date();
	}

	joinRoom(playerid: number, socket?: any){
		if (this.amountPlayersInRoom == this.maxPlayerAmount)
		{
			//TODO send error here
			return ;
		}
		this.playerList.set(playerid, socket);
		this.amountPlayersInRoom++;
		this.lastActivity = new Date();
	}

	tryStartGame(){
		if (this.amountPlayersInRoom == this.maxPlayerAmount)
		{
			// Prepare data to send
			const playerIds = Array.from(this.playerList.keys());
			const data = JSON.stringify({
				playerList: playerIds,
				gameMode: this.roomGameMode
			});

			const GAME_MODULE_PORT = process.env.GAME_MODULE_PORT || 9000;
			console.log("PORT = " + GAME_MODULE_PORT);
			const options = {
				hostname: 'localhost',
				port: GAME_MODULE_PORT,
				path: '/startGame',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(data)
				}
			};

			const req = http.request(options, (res) => {
				console.log(`Game module response status: ${res.statusCode}`);
				res.on('data', (chunk) => {
					console.log(`Game module response: ${chunk}`);
				});
			});

			req.on('error', (error) => {
				console.error('Error sending playerList to game module:', error);
			});

			req.write(data); //TODO: test!
			req.end();

			// Remove this room from the queue
			const roomIndex = roomQueues[this.roomGameMode].indexOf(this);
			if (roomIndex > -1) {
				roomQueues[this.roomGameMode].splice(roomIndex, 1);
			}
			console.log("removing room from roomQueue");
		}
	}

}
