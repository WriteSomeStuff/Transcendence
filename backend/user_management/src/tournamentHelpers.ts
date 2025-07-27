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

import { updateBracketWithMatchIds } from "./matchService.js";

import { v4 as uuidv4 } from "uuid";

// TODO what if something goes wrong, matches and tournament should be deleted from db?
export async function createTournamentInfo(
  tournamentInfo: TournamentCreateMessage,
): Promise<number> {
  // 1. fetch user id's
  console.log("Fetching user ids");
  const userIds: UserId[] = await getUserIds(tournamentInfo.participants);
  if (userIds.length === 0) {
    throw new Error("A username was invalid");
  }
  // 2. make Tournament room
  console.log("Found user ids");
  const tournament: Tournament = {
    id: 0,
    name: tournamentInfo.name,
    size: tournamentInfo.size,
    joinedUsers: userIds,
    gameData: tournamentInfo.gameData,
    bracket: null,
  };
  // 3. pass to create bracket
  console.log("Creating bracket");
  tournament.bracket = createBracket(tournament.size, tournament.joinedUsers);

  // 4. database stuff
  // 4.1. create tournament row
  console.log("creating in user service");
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
  console.log("Creating matches in the table");
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
  const totalRounds = Math.log2(totalPlayers);

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
