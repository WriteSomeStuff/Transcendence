import { roomStatus, GameMode } from "./types";

export class Room {
	roomID: 				number;
	playerList:				number[]; //TODO is playerId just a number?
	amountPlayersInRoom:	number;
	maxPlayerAmount: 		number;
	roomStatus: 			roomStatus;
	roomGameMode:			GameMode;


	constructor(playerID: number, maxPlayerAmount: number, mode: GameMode){
		this.roomID = generateUniqueId();

		this.playerList = [];
		this.playerList.push(playerID);

		this.amountPlayersInRoom = 1;

		this.maxPlayerAmount = maxPlayerAmount;

		this.roomStatus = 'Waiting';

		this.roomGameMode = mode;
	}
}

function generateUniqueId(): number { //TODO: check whether this is accepted solution by group lol :)
    return Math.floor(Math.random() * 1000000);
}




//how am i going to make the queuueueueueuueueues?

/* 
	only rooms in Waiting are in queue
	split on game first
	then on amount of players
*/

// const room: Room = {
// 	roomID: 0,
// 	userIDs: [],
// }