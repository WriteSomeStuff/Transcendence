import { tournamentQueues, GameMode } from "./types";

export function tournamentLeaveRoom(userID: number){
	for (const gameMode in tournamentQueues)
	{
		const rooms = tournamentQueues[gameMode as GameMode];

		for (const room of rooms) {
			if (room.playerList.includes(userID))
			{
				//remove player from playerlist
				room.playerList = room.playerList.filter((iD) => iD !== userID);
				room.amountPlayersInRoom--;
				//if the host has left, set new host
				if (userID == room.host)
				{
					console.log("new tournament room host set: " + room.playerList[0]);
					room.host = room.playerList[0];
				}
				if (room.amountPlayersInRoom == 0)
				{
					//remove room if its empty
					tournamentQueues[gameMode as GameMode] = tournamentQueues[gameMode as GameMode].filter((remove) => remove !== room);
				}
			}
		}
	}

	console.log(userID + " has chosen to leave the tournament room");
	console.log(tournamentQueues);
}
