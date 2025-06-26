
import { joinRoom } from './joinRoom';
import { tournamentJoinRoom } from './tournamentJoinRoom';
import { playerIsAlreadyInRoom } from './helperFunctions';
import { leaveRoom } from './leaveRoom';
import { tournamentLeaveRoom } from './tournamentLeaveRoom';
import { User } from "./types";

export function joinLobby(user: User, gameMode: string, gameType: string) {

	console.log('"' + user.userID + '"' + " is trying to join a room in gameMode: " + gameMode); //DEBUG
	

	if (playerIsAlreadyInRoom(user))
		return; //TODO send error here?

	if (gameType === "singleGame") {
		joinRoom(user, gameMode);
	}
	else if (gameType === "tournament")
		tournamentJoinRoom(user, gameMode);


	//TODO broadcast new join to the whole Room
}

export function leaveLobby(user: User, gameType: string){
	
	if (gameType === "singleGame")
	{
		leaveRoom(user);
	}
	else if (gameType ===  "tournament")
	{
		tournamentLeaveRoom(user);
	}
	console.log(user.userID + " has left their lobby");
}