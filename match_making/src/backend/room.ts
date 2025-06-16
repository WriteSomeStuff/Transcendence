import { roomQueues, GameMode } from "./types";

export class Room {
	playerList:				number[];
	amountPlayersInRoom:	number;
	maxPlayerAmount: 		number;
	roomGameMode:			GameMode;
	lastActivity:			Date;


	constructor(playerID: number, maxPlayerAmount: number, mode: GameMode){

		this.playerList = [];
		this.playerList.push(playerID);

		this.amountPlayersInRoom = 1;

		this.maxPlayerAmount = maxPlayerAmount;

		this.roomGameMode = mode;

		this.lastActivity = new Date();
	}

	joinRoom(playerid: number){ //TODO: add mutex type thing here so no 2 users can join at the same time?
		this.playerList.push(playerid);
		this.amountPlayersInRoom++;
		this.lastActivity = new Date();
	}

	tryStartGame(){
		if (this.amountPlayersInRoom == this.maxPlayerAmount)
		{
			console.log("Room ready to start a game. add logic here pls");
			//add starting logic here //TODO!
			//send the playerList to the game container
			
			// Remove this room from the queue
			const roomIndex = roomQueues[this.roomGameMode].indexOf(this);
			if (roomIndex > -1) {
				roomQueues[this.roomGameMode].splice(roomIndex, 1);
			}
			console.log("removing room from roomQueue");
		}
	}

}

//removes rooms that havent had any activity for over maxAgeMs milliseconds
export function cleanUpOldRooms(maxAgeMs: number){
	const now = Date.now();

	for (const gameMode in roomQueues) {
		//remove rooms that havent had any activity for longer than the time limit
		roomQueues[gameMode as GameMode] = roomQueues[gameMode as GameMode].filter(room => {
			const age = now - room.lastActivity.getTime();
			if (age > maxAgeMs)
				console.log("room " + gameMode + " has been idle for " + age / 1000 + "/" + maxAgeMs / 1000 + "seconds. Removing it now");
			return age < maxAgeMs;
		});
	}
}