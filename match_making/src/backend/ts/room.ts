import {GameMode } from "./types";

/**
 * Represents the possible statuses of a room.
 * options are: Waiting, inProgress or Finished
 * 
 */
export type roomStatus = 'Waiting' | 'inProgress' | 'Finished'

export class Room {
	roomID: 				number;
	playerList:				number[]; //TODO is playerId just a number?
	amountPlayersInRoom:	number;
	maxPlayerAmount: 		number;
	roomStatus: 			roomStatus;
	roomGameMode:			GameMode;
	createdAt:				Date;
	lastActivity:			Date;


	constructor(playerID: number, maxPlayerAmount: number, mode: GameMode){
		this.roomID = generateUniqueId();

		this.playerList = [];
		this.playerList.push(playerID);

		this.amountPlayersInRoom = 1;

		this.maxPlayerAmount = maxPlayerAmount;

		this.roomStatus = 'Waiting';

		this.roomGameMode = mode;

		this.createdAt = new Date();
		this.lastActivity = this.createdAt;
	}

	joinRoom(playerid: number){ //TODO: add mutex type thing here so no 2 users can join at the same time?
		this.playerList.push(playerid);
		this.amountPlayersInRoom++;
		this.lastActivity = new Date();
	}

	tryStartGame(){
		if (this.amountPlayersInRoom == this.maxPlayerAmount)
		{
			this.roomStatus = 'inProgress';
			console.log("Room ready to start a game. add logic here pls"); //TODO: figure out how to start a game
			//add starting logic here //TODO!
			
			// Remove this room from the queue
			const roomIndex = roomQueues[this.roomGameMode].indexOf(this);
			if (roomIndex > -1) {
				roomQueues[this.roomGameMode].splice(roomIndex, 1);
			}
			console.log("removing room from roomQueue");
		}
	}

}

function generateUniqueId(): number { //TODO: check whether this is accepted solution by group lol :)
    return Math.floor(Math.random() * 1000000);
}

export const roomQueues: Record<GameMode, Room[]> = { //TODO? make this dynamically define the queues depending ont the games in GameModes
	pong_2: [],
	pong_3: [],
	pong_4: [],
	memory: []
};


//removes rooms that havent had any activity for over maxAgeMs milliseconds
export function cleanUpOldRooms(maxAgeMs: number){
	const now = Date.now();

	for (const gameMode in roomQueues) {
		//remove rooms that are over the limit
		roomQueues[gameMode as GameMode] = roomQueues[gameMode as GameMode].filter(room => {
			const age = now - room.lastActivity.getTime();
			if (age > maxAgeMs)
				console.log("room " + gameMode + " has been idle for " + age + "/" + maxAgeMs + "ms. Removing it now");
			return age < maxAgeMs;
		});
	}
}