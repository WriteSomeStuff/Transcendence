import { Room } from "./room"
import { GameMode, User } from "./types";

const MAX_PLAYERS_TOURNAMENT = 64;

export class tournamentRoom extends Room {
	host:	number; //decide whos the host on creation so they can start the tournament
	constructor (user: User, mode: GameMode){
		super(user, MAX_PLAYERS_TOURNAMENT, mode);
		this.host = user.userID;
	}
}