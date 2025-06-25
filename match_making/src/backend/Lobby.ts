
import { joinRoom } from './joinRoom';
import { tournamentJoinRoom } from './tournamentJoinRoom';
import { playerIsAlreadyInRoom } from './helperFunctions';
import { leaveRoom } from './leaveRoom';
import { tournamentLeaveRoom } from './tournamentLeaveRoom';

export function joinLobby(userID: number, gameMode: string, gameType: string) {

	if (playerIsAlreadyInRoom(userID))
		return; //TODO send error here?

	console.log("Uid = " + userID + "; gameMode = " + gameMode + "; gameType = " + gameType + ";");

	if (gameType === "singleGame") {
		joinRoom(userID, gameMode);
	}
	else if (gameType === "tournament")
		tournamentJoinRoom(userID, gameMode);

	//TODO broadcast new join to the whole Room
}

export function leaveLobby(userID: number, gameType: string){

	if (gameType === "singleGame")
		leaveRoom(userID);
	else if (gameType ===  "tournament")
		tournamentLeaveRoom(userID);

	//TODO broadcast leave to the whole room
}