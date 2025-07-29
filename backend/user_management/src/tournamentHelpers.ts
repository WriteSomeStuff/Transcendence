import type {
  Tournament,
  TournamentMatch,
  TournamentBracket,
  Username,
  UserId,
  TournamentMatchCreateMessage,
  TournamentCreateResponse,
  TournamentCreateMessage,
} from "schemas";

import {
  TournamentCreateResponseSchema,
  TournamentMatchCreateResponseSchema,
} from "schemas";

import {
	updateBracketWithMatchIds,
	getTournamentId,
	getTournamentBracket,
	updateTournamentStatusFinished,
 } from "./matchService.js";

import { v4 as uuidv4 } from "uuid";

// TODO what if something goes wrong, matches and tournament should be deleted from db?
export async function createTournamentInfo(
  tournamentInfo: TournamentCreateMessage,
): Promise<number> {
  // 1. fetch user id's
  console.log("[TOURNAMENT] Fetching user ids");
  const userIds: UserId[] = await getUserIds(tournamentInfo.participants);
  if (userIds.length === 0) {
    throw new Error("[TOURNAMENT] A username was invalid");
  }
  // 2. make Tournament room
  console.log("[TOURNAMENT] Found user ids");
  const tournament: Tournament = {
    id: 0,
    name: tournamentInfo.name,
    size: tournamentInfo.size,
    joinedUsers: userIds,
    gameData: tournamentInfo.gameData,
    bracket: null,
  };
  // 3. pass to create bracket
  console.log("[TOURNAMENT] Creating bracket");
  tournament.bracket = createBracket(tournament.size, tournament.joinedUsers);

  // 4. database stuff
  // 4.1. create tournament row
  console.log("[TOURNAMENT] creating in user service");
  const createTournamentResult = await createTournamentInUserService(
    tournamentInfo.name,
    tournament.bracket,
  );
  if (typeof createTournamentResult === "number") {
    tournament.id = createTournamentResult;
  } else {
    throw new Error(`Tournament creation failed: ${createTournamentResult}`);
  }

  // 4.2. create all the matches in match table
  console.log("[TOURNAMENT] Creating matches in the table");
  const createMatchResult = await createTournamentMatchesInUserService(
    tournament.id,
    tournament.bracket,
  ); // continue here
  if (createMatchResult.length != 0) {
    throw new Error(`Tournament matches creation failed: ${createMatchResult}`);
  }

  // updating bracket with match ids
  updateBracketWithMatchIds(tournament.id, tournament.bracket);

  console.log(JSON.stringify(tournament, null, 2));
  return tournament.id;
}

async function createTournamentMatchesInUserService(
  tournamentId: number,
  bracket: TournamentBracket,
): Promise<string> {
  const url =
    process.env["USER_SERVICE_URL"] + "/match/insert-tournament-match";
  for (const match of bracket.matches) {
    const matchInfo: TournamentMatchCreateMessage = {
      matchId: match.id,
      matchStatus: "pending",
      participants: match.participants,
      tournamentId: tournamentId,
    };
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(matchInfo),
    }).then((res) => res.json());
    console.log("inserted match", response);

    const parsed = TournamentMatchCreateResponseSchema.safeParse(response);
    console.log("parsed", parsed);
    if (!parsed.success) {
      // Invalid response
      console.error(parsed.error);
      return "Invalid response from tournament creation service"; // TODO handle error
    }

    const data = parsed.data;
    if (!data.success) {
      return data.error; // TODO handle error in data.error
    }

    console.log("database id", data.dbMatchId);

    match.databaseId = data.dbMatchId;
  }
  return "";
}

async function createTournamentInUserService(
  name: string,
  bracket: TournamentBracket,
): Promise<number | string> {
  const url = process.env["USER_SERVICE_URL"] + "/match/insert-tournament";
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ name, bracket }),
  });

  const parsed = TournamentCreateResponseSchema.safeParse(
    await response.json(),
  );
  if (!parsed.success) {
    // Invalid response
    return "Invalid response from tournament creation service";
  }

  const data = parsed.data as TournamentCreateResponse;
  if (!data.success) {
    return data.error;
  }

  return data.tournamentId;
}

async function getUserIds(usernames: Username[]): Promise<UserId[]> {
  const UserIds: UserId[] = [];
  for (const username of usernames) {
    const url =
      process.env["USER_SERVICE_URL"] +
      "/get-userid?username=" +
      encodeURIComponent(username);
    const response = await fetch(url, {
      method: "GET",
    });
    const data = (await response.json()) as {
      success: boolean;
      userId?: number;
      error?: string;
    };
    console.log(data);
    if (data.success && typeof data.userId === "number") {
      UserIds.push(data.userId);
    } else {
      return [];
    }
  }

  return UserIds;
}

function shuffle(array: number[]) {
  let currentIndex = array.length;
  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    const temp = array[currentIndex]!;
    array[currentIndex] = array[randomIndex]!;
    array[randomIndex] = temp;
  }
}

function createBracket(
  totalPlayers: number,
  participants: number[],
): TournamentBracket {
  const totalMatches = totalPlayers - 1;
  const totalRounds = Math.round(Math.log2(totalPlayers));

  let bracket: TournamentBracket = {
    matches: [] as TournamentMatch[],
    currentRound: 0,
  };

  // 0. random draw
  shuffle(participants);
  // 1. Create and fill first round: matches[0]-[n/2 - 1]
  for (let i = 0; i < totalPlayers; i += 2) {
    let match: TournamentMatch = {
      id: uuidv4(),
      databaseId: null,
      round: 0,
      participants: [participants[i]!, participants[i + 1]!],
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
        databaseId: null,
        round: round,
        participants: [],
        winner: null,
        nextMatchId: null,
      };
      bracket.matches.push(match);
    }
  }
  console.log("[Tournament] Remaining rounds matches created");

  // 3. Add nextMatchId to first (and subsequent) round(s)
  let nextRoundIndex = totalPlayers / 2;
  for (let i = 0; i < totalMatches - 1; i += 2) {
    // loops through all the matches (as pairs) until the final
    console.log(
      `[Tournament] Winner of [${i}] and [${i + 1}] -> [${nextRoundIndex}]`,
    );
    bracket.matches[i]!.nextMatchId = bracket.matches[nextRoundIndex]!.id;
    bracket.matches[i + 1]!.nextMatchId = bracket.matches[nextRoundIndex]!.id;
    nextRoundIndex++;
  }
  console.log("[Tournament] Bracket created");
  console.log(bracket.matches);

  return bracket;
}

function AddWinnerToNextRound(
	userIdWinner: number, 
	bracket: TournamentBracket,
	matchIndex: number,
) {
	const nextMatchId = bracket.matches[matchIndex]!.nextMatchId!;
	for (const match of bracket.matches) {
		if (match.id === nextMatchId) {
			match.participants.push(userIdWinner);
			break;
		}
	}

}

function isLastMatchInRound(
  matchIndex: number,
  totalPlayers: number,
  bracket: TournamentBracket,
): boolean {
	// baseValue * totalplayers / 8 = matches in first round
	// only works for 4, 8 or 16 player tournament
	let baseValue = 4;
		for (let i = 1; i <= bracket.currentRound; i++) {
		baseValue += 3 - i;
	}
	return matchIndex === (baseValue * totalPlayers) / 8 - 1;
}

function isFinal(
	currentRound: number,
	totalPlayers: number,
) {
	return currentRound === Math.round(Math.log2(totalPlayers)) - 1;
}

export function proceedTournament(
	matchId: number,
	userIdWinner: number,
) {
	const tournamentId = getTournamentId(matchId);
	const bracket = getTournamentBracket(tournamentId);
	
	let currMatchIndex = 0;
	while (currMatchIndex < bracket.matches.length) {
		if (bracket.matches[currMatchIndex]!.databaseId === matchId) break;
		currMatchIndex++;
	}
	
	bracket.matches[currMatchIndex]!.winner = userIdWinner;
	
	const totalPlayers = bracket.matches.length + 1;
	if (isFinal(bracket.currentRound, totalPlayers)) {
		updateTournamentStatusFinished(tournamentId);
		return;
	} else if (isLastMatchInRound(currMatchIndex, totalPlayers, bracket)) { // last match in this round
		bracket.currentRound++;
	}
	
	AddWinnerToNextRound(userIdWinner, bracket, currMatchIndex);
	updateBracketWithMatchIds(tournamentId, bracket);
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

// 4 totalplayers / 8 - 1
// 4 totalplayers / 8 + 2 totalplayers / 8 - 1
// 4 totalplayers / 8 + 2 totalplayers / 8 + 1 totalplayers / 8 - 1

// 4 * totalplayers / 8 - 1 round === 0
// 6 * totalplayers / 8 - 1 round === 1
// 7 * totalplayers / 8 - 1 round === 2