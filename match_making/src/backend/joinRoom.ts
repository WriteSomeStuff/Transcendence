
import { Room } from "./room";
import { roomQueues, GameMode, User } from "./types";
import { playerIsAlreadyInRoom, getMaxPlayerAmount } from "./helperFunctions";

export function joinRoom(user: User, GameMode: string){

	const gameMode = GameMode as GameMode;

	//check if a room exists
	if (roomQueues[gameMode].length > 0)
	{	//join first available room
		roomQueues[gameMode][0].joinRoom(user); 
	}
	else{
		//create a room and put player in it
		const maxPlayers = getMaxPlayerAmount(gameMode);
		const newRoom = new Room(user, maxPlayers, gameMode); 

		roomQueues[gameMode].push(newRoom);
	}

	//player will always join first available room so can try to start with [0];
	roomQueues[gameMode][0].tryStartGame();

}

