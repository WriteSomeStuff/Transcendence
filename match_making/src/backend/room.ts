import { roomQueues, GameMode, User } from "./types";
import http from "http";

export class Room {
	playerList: User[];
	amountPlayersInRoom: number;
	maxPlayerAmount: number;
	roomGameMode: GameMode;
	lastActivity: Date;


	constructor(user: User, maxPlayerAmount: number, mode: GameMode, socket?: any){

		this.playerList = [];
		this.playerList.push(user);

		this.amountPlayersInRoom = 1;

		this.maxPlayerAmount = maxPlayerAmount;

		this.roomGameMode = mode;

		this.lastActivity = new Date();
	}

	joinRoom(user: User, socket?: any){
		if (this.amountPlayersInRoom == this.maxPlayerAmount)
		{
			//TODO send error here
			return ;
		}
		this.playerList.push(user);
		this.amountPlayersInRoom++;
		this.lastActivity = new Date();
		this.broadcastPlayers();
	}

	broadcastPlayers(){
		let data: number[] = [];

		this.playerList.forEach (player => {
			data.push(player.userID);
		})
		this.playerList.forEach( player => {
			player.socket.send(JSON.stringify(data));
		})
	}

	tryStartGame(){
		if (this.amountPlayersInRoom == this.maxPlayerAmount)
		{
			// Prepare data to send
			
			let arr: any[] = [];

			arr.push(this.roomGameMode);
			this.playerList.forEach (player => {
				arr.push(player.userID);
			})
			let data = JSON.stringify(arr);
			console.log("starting game now!");
			console.log(data);


			const GAME_MODULE_PORT = process.env.GAME_MODULE_PORT || -1;
			const options = {
				hostname: 'localhost',
				port: GAME_MODULE_PORT,
				path: '/startGame',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					// 'Content-Length': Buffer.byteLength(data)
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
