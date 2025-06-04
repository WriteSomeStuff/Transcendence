
import { Player, gameQueues, GameMode } from "./types";


export function joinRoom(userID: string) {


	//TODO //entry here. does the request header hold userID or session identifier?
	//if session ID, get from db and confirm session here OR is it confirmed before getting it? in that case just get data from db
	
	//get player data

	//check if a room exists
	
	//if room exists join

	//else create a room and put player in it

	let player: Player;
	player = {
		PlayerID: 2,
		gameMode: GameMode.pong_2
	}

	console.log(player + " is trying to join a room");

	console.log(gameQueues);
}
