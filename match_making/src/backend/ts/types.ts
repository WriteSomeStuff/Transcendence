/**
 * Represents the possible statuses of a room.
 * options are: Waiting, inProgress or Finished
 * 
 */
export type roomStatus = 'Waiting' | 'inProgress' | 'Finished'

/*Shows which game we are referencing */
export enum GameMode {
	pong_2 = "pong_2",
	pong_3 = "pong_3",
	pong_4 = "pong_4",
	memory = "memory"
};

export const gameQueues: Record<GameMode, Player[]> = { //TODO? make this dynamically define the queues depending ont the games in GameModes
	pong_2: [],
	pong_3: [],
	pong_4: [],
	memory: []
};

export interface Player{
	PlayerID: number;
	gameMode: GameMode;

}