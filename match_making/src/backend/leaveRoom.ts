import { Room } from "./room";
import { roomQueues, GameMode, User } from "./types";

export function leaveRoom(user: User){

	for (const gameMode in roomQueues)
	{
		const rooms = roomQueues[gameMode as GameMode];

		for (const room of rooms) {

			for (const player of room.playerList)
			{
				if (player.userID == user.userID)
				{
					//remove player from playerlist
					const index = room.playerList.findIndex(player => player.userID === user.userID);
					if (index > -1) {
						room.playerList.splice(index, 1);
					}
					room.amountPlayersInRoom--;
					if (room.amountPlayersInRoom == 0)
					{
						//remove room if its empty
						roomQueues[gameMode as GameMode] = roomQueues[gameMode as GameMode].filter((remove: Room) => remove !== room);
					}
					room.broadcastPlayers();
				}
			}
		}
	}
}
