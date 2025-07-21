import type { 
	Tournament,
	TournamentMatch,
	TournamentBracket
} from "schemas";
import { v4 as uuidv4 } from "uuid";

export function tournament(room: Tournament) {
	const totalPlayers: number = room.size;
	const totalMatches = totalPlayers - 1;
	const totalRounds = Math.log2(totalPlayers);

	let bracket = {
		matches: [] as TournamentMatch[],
		currentRound: 0
	} as TournamentBracket;

	// 1. Create and fill first round: matches[0]-[n/2 - 1]
	for (let i = 0; i < totalPlayers; i += 2) {
		// TODO option: implement random draw?
		let match: TournamentMatch = {
			id: uuidv4(),
			round: 0,
			player1: room.joinedUsers[i]!,
			player2: room.joinedUsers[i + 1]!,
			winner: null,
			nextMatchId: null,
		};
		bracket.matches.push(match);
	}
	console.log("[Tournament] First round matches created and filled");
	
	// 2. Create rest of tournament with empty matches: matches[n/2]-[n - 1]
	for (let round = 1; round < totalRounds; round++) {
		const matchesInRound = Math.pow(2, totalRounds - 1 - round);
		for (let i = 0; i < matchesInRound; i++) {
			let match: TournamentMatch = {
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
	console.log("[Tournament] Remaining rounds matches created");
	
	// 3. Add nextMatchId to first (and subsequent) round(s)
	let nextRoundIndex = totalPlayers / 2;
	for (let i = 0; i < totalMatches - 1; i += 2) { // loops through all the matches (as pairs) until the final
		console.log(`[Tournament] Winner of [${i}] and [${i + 1}] -> [${nextRoundIndex}]`);
		bracket.matches[i]!.nextMatchId = bracket.matches[nextRoundIndex]!.id;
		bracket.matches[i + 1]!.nextMatchId = bracket.matches[nextRoundIndex]!.id;
		nextRoundIndex++;
	}
	console.log("[Tournament] Bracket created");
	console.log(bracket.matches);
	
	// 4. Add bracket to Tournament room
	room.bracket = bracket;
}

//rnd| matches
// 0 | [0] [1]
// 1 |   [2]

// 0 | [0] [1] [2] [3]
// 1 | 	[4] [5]
// 2 | 	  [6]

// 0 | [0] [1] [2] [3] [4] [5] [6] [7]
// 1 | 		[8] [9] [10] [11]
// 3 |			[12] [13]
// 4 |	  		  [14]