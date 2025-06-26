import { tournamentRoom } from "./tournamentRoom";
import { tournamentQueues, GameMode, User } from "./types";
import { playerIsAlreadyInRoom, getMaxPlayerAmount } from "./helperFunctions";

export function tournamentJoinRoom(user: User, playersGameMode: string) {
	const gameMode = playersGameMode as GameMode;
	
	//check if a room exists
	if (tournamentQueues[gameMode].length > 0)
	{	//join first available room
		tournamentQueues[gameMode][0].joinRoom(user); 
	}
	else{
		//create a room and put player in it
		const newRoom = new tournamentRoom(user, gameMode); 

		tournamentQueues[gameMode].push(newRoom);
	}

	//player will always join first available room so can try to start with [0];
	tournamentQueues[gameMode][0].tryStartGame();
	
}
