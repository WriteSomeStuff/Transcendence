import { leaveRoom } from "./leaveRoom";
import { tournamentLeaveRoom } from "./tournamentLeaveRoom";

const userLastActivity: Record<number, Date> = {};

export function updateLastPing(userId: number) {
	userLastActivity[userId] = new Date();
}

export function cleanupInactiveUsers(maxInactiveTimeMs: number) {
	const now = Date.now();

	for (const user in userLastActivity){
		const lastActivity = userLastActivity[parseInt(user, 10)];

		if (now - lastActivity.getTime() > maxInactiveTimeMs)
		{
			console.log("Kicking player " + user + " for failing the healtcheck for more than " + maxInactiveTimeMs /1000 + "sec"); //DEBUG
			leaveRoom(parseInt(user, 10));
			tournamentLeaveRoom(parseInt(user, 10)); //TODO: bad design but it works
			delete userLastActivity[user];
		}
	}
}