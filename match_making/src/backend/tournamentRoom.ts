import { Room } from "./room"
import { GameMode } from "./types";

const MAX_PLAYERS_TOURNAMENT = 64;

export class tournamentRoom extends Room {
	host:	number; //decide whos the host on creation so they can start the tournament
	constructor (userID: number, mode: GameMode){
		super(userID, MAX_PLAYERS_TOURNAMENT, mode);
		this.host = userID;
	}
}