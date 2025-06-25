//// filepath: /home/tknibbe/Documents/rank6/transcendacne/match_making/src/backend/helperFunct.ts
import { roomQueues, GameMode, tournamentQueues } from "./types";
import { Room } from "./room";

/**
 * Checks if a player is already in any room
 */
export function playerIsAlreadyInRoom(userID: number): boolean { //TODO check tournament rooms too
  for (const gameMode in roomQueues) {
    const rooms = roomQueues[gameMode as GameMode];
    if (rooms.some((room: Room) => room.playerList.has(userID))) {
		console.log("User " + userID + " was already in a normal room") //DEBUG
      return true;
    }
  }
    for (const gameMode in tournamentQueues) {
    const rooms = tournamentQueues[gameMode as GameMode];
    if (rooms.some((room: Room) => room.playerList.has(userID))) {
		console.log("User " + userID + " was already in a tournament room") //DEBUG
		return true;
    }
  }
  return false;
}

/**
 * Returns the maximum number of players for a given game mode
 */
export function getMaxPlayerAmount(gameMode: string): number {
  switch (gameMode) {
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

//removes rooms that havent had any activity for over maxAgeMs milliseconds
export function cleanUpOldRooms(maxAgeMs: number){ //TODO make it for tournaments as well
	const now = Date.now();

	for (const gameMode in roomQueues) {
		//remove rooms that havent had any activity for longer than the time limit
		roomQueues[gameMode as GameMode] = roomQueues[gameMode as GameMode].filter(room => {
			const age = now - room.lastActivity.getTime();
			if (age > maxAgeMs)
				console.log("room " + gameMode + " has been idle for " + age / 1000 + "/" + maxAgeMs / 1000 + "seconds. Removing it now");
			return age < maxAgeMs;
		});
	}
}