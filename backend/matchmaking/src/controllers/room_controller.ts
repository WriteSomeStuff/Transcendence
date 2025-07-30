import { z } from "zod";

import type {
  Room,
  RoomPermissions,
  RoomGameData,
  TournamentMatchRoom,
} from "schemas";
import { TournamentMatchRoomSchema } from "schemas";
import type { UserController } from "./user_controller.js";
import { v4 as uuidv4 } from "uuid";

const rooms = new Map<string, Room>();
const tournamentMatchToRoomId = new Map<number, string>();

export function createRoom(
  user: UserController,
  size: number,
  maxScore: number,
  permissions: RoomPermissions,
  gameData: RoomGameData,
) {
  const room: Room = {
    id: uuidv4(),
    size: size,
    maxScore: maxScore,
    joinedUsers: [],
    permissions: permissions,
    gameData: gameData,
  };
  rooms.set(room.id, room);
  return joinRoom(user, room.id);
}

export function joinRoom(user: UserController, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }
  if (
    room.joinedUsers.length === room.size ||
    room.joinedUsers.includes(user.userId)
  ) {
    return null;
  }
  if (
    room.permissions.type === "private" ||
    room.permissions.type === "tournament"
  ) {
    if (!room.permissions.allowedUsers.includes(user.userId)) {
      return null;
    }
  }
  room.joinedUsers.push(user.userId);
  return room;
}

export function leaveRoom(user: UserController, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) {
    return;
  }
  if (room.joinedUsers.includes(user.userId)) {
    room.joinedUsers.splice(room.joinedUsers.indexOf(user.userId), 1);
  }
  if (room.permissions.type !== "tournament" && room.joinedUsers.length === 0) {
    rooms.delete(roomId);
  }
}

export function getRooms(): Room[] {
  const result: Room[] = [];
  for (const room of rooms.values()) {
    result.push(room);
  }
  return result;
}

export function deleteRoom(roomId: string) {
  rooms.delete(roomId);
}

function updateTournamentRoom(tournamentRoom: TournamentMatchRoom) {
  const roomId = tournamentMatchToRoomId.get(
    tournamentRoom.permissions.matchId,
  );
  if (roomId === undefined) {
    const room: Room = {
      id: uuidv4(),
      size: tournamentRoom.size,
      maxScore: tournamentRoom.maxScore,
      joinedUsers: [],
      permissions: tournamentRoom.permissions,
      gameData: tournamentRoom.gameData,
    };
    rooms.set(room.id, room);
    tournamentMatchToRoomId.set(tournamentRoom.permissions.matchId, room.id);
    return;
  }
  const room = rooms.get(roomId);
  if (room !== undefined) {
    room.size = tournamentRoom.size;
    room.maxScore = tournamentRoom.maxScore;
    room.permissions = tournamentRoom.permissions;
    room.gameData = tournamentRoom.gameData;
  }
}

export async function fetchTournamentRooms() {
  try {
    const response = await fetch(
      "http://user_service/match/tournament-matches",
    ).then((res) => res.json());
    if (!response.success) {
      console.error(response.error);
      return;
    }
    const parsed = z.array(TournamentMatchRoomSchema).safeParse(response.rooms);
    if (!parsed.success) {
      console.error(parsed.error);
      return;
    }
    parsed.data.forEach((room) => {
      updateTournamentRoom(room);
    });
  } catch (e) {
    console.error(e);
  }
}
