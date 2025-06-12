
import { roomQueues, Room } from "./room";
import { Player, GameMode } from "./types";


//TODO: make leaveRoom function, remove long idle rooms, remove empty rooms

export function joinRoom(userID: number, playersGameMode: string) {
	console.log('"' + userID + '"' + " is trying to join a room in gameMode: " + playersGameMode); //DEBUG

	if (playerIsAlreadyInRoom(userID))
		return ;

	//get player data //TODO: get data needed for the game. dont know what it is yet lol
	const gameModeEnumValue = playersGameMode as GameMode;
	
	let player: Player;
	player = {
		PlayerID: userID,
		gameMode: gameModeEnumValue
	}
	
	//check if a room exists
	if (roomQueues[player.gameMode].length > 0)
	{	//join first available room
		roomQueues[player.gameMode][0].joinRoom(player.PlayerID); 
	}
	//create a room and put player in it
	else{
		console.log("no Room found so creating a new one"); //DEBUG
		const maxPlayers = getMaxPlayerAmount(gameModeEnumValue);
		const newRoom = new Room(player.PlayerID, maxPlayers, gameModeEnumValue); 

		roomQueues[player.gameMode].push(newRoom);
	}

	//player will always join first available room so can try to start with [0];
	roomQueues[player.gameMode][0].tryStartGame();
		
	//clean up rooms and send result to db? TODO: figure out how and when to send stuff to db. (probably make the game microservice send it to db when done?)
	
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