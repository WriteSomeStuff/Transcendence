import { Room } from "./room"

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
