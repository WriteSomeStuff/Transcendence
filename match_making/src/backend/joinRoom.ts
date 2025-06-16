
import { Room } from "./room";
import { roomQueues, GameMode } from "./types";

export function joinRoom(userID: number, playersGameMode: string) {
	console.log('"' + userID + '"' + " is trying to join a room in gameMode: " + playersGameMode); //DEBUG

	if (playerIsAlreadyInRoom(userID))
		return ;

	const gameMode = playersGameMode as GameMode;
	
	//check if a room exists
	if (roomQueues[gameMode].length > 0)
	{	//join first available room
		roomQueues[gameMode][0].joinRoom(userID); 
	}
	else{
		//create a room and put player in it
		const maxPlayers = getMaxPlayerAmount(gameMode);
		const newRoom = new Room(userID, maxPlayers, gameMode); 

		roomQueues[gameMode].push(newRoom);
	}

	//player will always join first available room so can try to start with [0];
	roomQueues[gameMode][0].tryStartGame();
	
	console.log(roomQueues); //DEBUG
}

function getMaxPlayerAmount(gameMode: string) : number{

	switch(gameMode){
		case "pong_2":
			return 2;
		case "pong_3":
			return 3;
		case "pong_4":
			return 4;
		default:
			return 2;
	}
}

function playerIsAlreadyInRoom(userID: number) : boolean{

	for (const gameMode in roomQueues) {
		const rooms = roomQueues[gameMode as GameMode];
		
		// Check each room in the current game mode
		for (const room of rooms) {
			if (room.playerList.includes(userID)) {
				console.log("Error, player is already in a room")
				return true;
			}
		}
	}
	
	return false;
}