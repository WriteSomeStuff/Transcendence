import { tournamentRoom } from "./tournamentRoom";
import { tournamentQueues, GameMode } from "./types";
import { playerIsAlreadyInRoom, getMaxPlayerAmount } from "./helperFunctions";

export function tournamentJoinRoom(userID: number, playersGameMode: string) {
	console.log('"' + userID + '"' + " is trying to join a room in gameMode: " + playersGameMode); //DEBUG

	if (playerIsAlreadyInRoom(userID))
		return ;

	const gameMode = playersGameMode as GameMode;
	
	//check if a room exists
	if (tournamentQueues[gameMode].length > 0)
	{	//join first available room
		tournamentQueues[gameMode][0].joinRoom(userID); 
	}
	else{
		//create a room and put player in it
		const maxPlayers = getMaxPlayerAmount(gameMode);
		const newRoom = new tournamentRoom(userID, gameMode); 

		tournamentQueues[gameMode].push(newRoom);
	}

	//player will always join first available room so can try to start with [0];
	tournamentQueues[gameMode][0].tryStartGame();
	
	console.log(tournamentQueues); //DEBUG
}
