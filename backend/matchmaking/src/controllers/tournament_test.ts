import { v4 as uuidv4 } from "uuid";
import { tournament } from "./tournament_controller.ts";
import type { Tournament } from "schemas";

function mockTournament(size: number): Tournament {
	return {
		id: uuidv4(),
		name: "Test Tournament",
		size,
		joinedUsers: Array.from({ length: size }, (_, i) => i + 1),
		permissions: {type: "tournament", allowedUsers: [], matchId: uuidv4() },
		gameData: { game: "pong", options: { paddleRatio: 0.4, gameSpeed: 1 } },
		bracket: null,
	};
}

const sizes = [4, 8, 16];
for (const size of sizes) {
	console.log(`Testing tournament bracket for size ${size}`);
	const room = mockTournament(size);
	const bracket = tournament(room);
	console.log(bracket);
}