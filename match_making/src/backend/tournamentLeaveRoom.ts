import { tournamentQueues, GameMode, User } from "./types";

export function tournamentLeaveRoom(user: User){
	for (const gameMode in tournamentQueues)
	{
		const rooms = tournamentQueues[gameMode as GameMode];

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
				//if the host has left, set new host
				if (user.userID == room.host)
				{
					const nextEntry = room.playerList.keys().next().value;
					if (nextEntry !== undefined) {
						room.host = nextEntry;
					}
					else{
						room.amountPlayersInRoom = 0;
					}
				}
				if (room.amountPlayersInRoom == 0)
					{
						//remove room if its empty
						tournamentQueues[gameMode as GameMode] = tournamentQueues[gameMode as GameMode].filter((remove) => remove !== room);
					}
				room.broadcastPlayers();
				}
			}
		}
	}
}
