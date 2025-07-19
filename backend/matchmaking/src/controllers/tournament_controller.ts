import type { 
	Tournament,
	TournamentMatch,
	TournamentBracket
} from "schemas";
import { v4 as uuidv4 } from "uuid";

// export const TournamentSchema = z.object({
// 	id: z.string(),
// 	name: z
// 		.string()
// 		.min(1, "Tournament name is required"),
// 	size: z.enum(["4", "8", "16"]).transform(Number),
// 	joinedUsers: z.array(UserIdSchema),
// 	permissions: RoomPermissionsSchema.refine((p) => p.type === "tournament"),
// 	gameData: RoomGameDataSchema,
// });

// export type Tournament = z.infer<typeof TournamentSchema>;

function tournament(room: Tournament) {
	// room is filled with 4, 8 or 16 users
	/**
	 * 1. divide into pairs -> first matchup
	 * 2. create bracket to decide where people go after winning, losing -> back to default view
	 */

	const totalPlayers: number = room.size;
	// for N players you need N - 1 amount of matches
	const totalMatches = totalPlayers - 1;

	let bracket = {
		matches: new Array<TournamentMatch>(totalMatches),
		currentRound: 1 
	} as TournamentBracket;

	// fill bracket
	const amountOfRounds = Math.log2(totalPlayers);
	// 1. fill first 2/4/8 matches matches[0]-[n/2 - 1]
	for (let i = 0; i < totalPlayers; i += 2) {
		// TODO implement random draw?
		let match: TournamentMatch = {
			id: uuidv4(),
			round: 1,
			player1: room.joinedUsers[i] ?? null,
			player2: room.joinedUsers[i + 1] ?? null,
			winner: null,
			nextMatchId: null,
		};
		bracket.matches.push(match);
	}
	// 2. create rest of tournament with empty matches
	// Create empty matches for the remaining rounds (except the first round)
	for (let round = 2; round <= amountOfRounds; round++) {
		const matchesInRound = Math.pow(2, amountOfRounds - round);
		for (let i = 0; i < matchesInRound; i++) {
			const match: TournamentMatch = {
				id: uuidv4(),
				round: round,
				player1: null,
				player2: null,
				winner: null,
				nextMatchId: null,
			};
			bracket.matches.push(match);
		}
	}
	// 3. add nextMatchId to first (, second and third) round
	// For each match in the first (and subsequent) rounds, set the nextMatchId to the match in the next round
	
	const matchesInFirstRound = totalPlayers / 2;
	// Assign nextMatchId for each match based on the round structure
	
	
	// 4. add bracket to Tournament room I guess
}

// [0] [1]
//   [2]

// [0] [1] [2] [3]
// 	[4] [5]
// 	  [6]

// [0] [1] [2] [3] [4] [5] [6] [7]
// 		[8] [9] [10] [11]
// 			[12] [13]
// 	  		  [14]
