import { Room } from "./room"
import { tournamentRoom } from "./tournamentRoom";

export type User = {
	userID: number;
	socket: any;
};

/*Shows which game we are referencing */
export enum GameMode {
	pong_2 = "pong_2",
	pong_3 = "pong_3",
	pong_4 = "pong_4",
	memory = "memory"
};

export const roomQueues: Record<GameMode, Room[]> = {
	pong_2: [],
	pong_3: [],
	pong_4: [],
	memory: []
};

export const tournamentQueues: Record<GameMode, tournamentRoom[]> = {
	pong_2: [],
	pong_3: [],
	pong_4: [],
	memory: []
};

export const GAME_MODULE_PORT = process.env.GAME_MODULE_PORT ? 
  parseInt(process.env.GAME_MODULE_PORT, 10) : 8081;

// Log warning if using default port
if (!process.env.GAME_MODULE_PORT) {
  console.log("CAUTION: No GAME_MODULE_PORT environment variable found. Using default port 8081.");
}
