import { roomQueues, GameMode } from "./types";

export class Room {
	playerList:				number[];
	amountPlayersInRoom:	number;
	maxPlayerAmount: 		number;
	roomGameMode:			GameMode;
	lastActivity:			Date;


	constructor(userID: number, maxPlayerAmount: number, mode: GameMode){

		this.playerList = [];
		this.playerList.push(userID);

		this.amountPlayersInRoom = 1;

		this.maxPlayerAmount = maxPlayerAmount;

		this.roomGameMode = mode;

		this.lastActivity = new Date();
	}

	joinRoom(playerid: number){ //TODO: add mutex type thing here so no 2 users can join at the same time?
		if (this.amountPlayersInRoom == this.maxPlayerAmount)
		{
			//TODO send error here
			return ;
		}
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
