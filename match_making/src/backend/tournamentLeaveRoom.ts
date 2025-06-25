import { tournamentQueues, GameMode } from "./types";

export function tournamentLeaveRoom(userID: number){
	for (const gameMode in tournamentQueues)
	{
		const rooms = tournamentQueues[gameMode as GameMode];

		for (const room of rooms) {
			if (room.playerList.has(userID))
			{
				//remove player from playerlist
				room.playerList.delete(userID);
				room.amountPlayersInRoom--;
				//if the host has left, set new host
				if (userID == room.host)
				{
					const nextEntry = room.playerList.keys().next().value;
					if (nextEntry !== undefined) {
						room.host = nextEntry;
					}
					else{
						console.log("Something went wrong in assigning new room. deleting room");
						room.amountPlayersInRoom = 0;
					}
				}
				if (room.amountPlayersInRoom == 0)
				{
					//remove room if its empty
					tournamentQueues[gameMode as GameMode] = tournamentQueues[gameMode as GameMode].filter((remove) => remove !== room);
					console.log(userID + " has left the tournament room");
				}
			}
		}
	}
	console.log(tournamentQueues);
}
