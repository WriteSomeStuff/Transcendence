import { Room } from "./room";
import { roomQueues, GameMode } from "./types";

export function leaveRoom(userID: number){
	for (const gameMode in roomQueues)
	{
		const rooms = roomQueues[gameMode as GameMode];

		for (const room of rooms) {
			if (room.playerList.includes(userID))
			{
				//remove player from playerlist
				room.playerList = room.playerList.filter((iD) => iD !== userID);
				room.amountPlayersInRoom--;
				console.log(room)
				if (room.amountPlayersInRoom == 0)
				{
					//remove room if its empty
					roomQueues[gameMode as GameMode] = roomQueues[gameMode as GameMode].filter((remove: Room) => remove !== room);
				}
			}
		}
	}

	console.log(userID + " has chosen to leave the room");
	console.log(roomQueues);
}
