import type { Room, RoomPermissions, RoomGameData } from "schemas";
import type { UserController } from "./user_controller.js";
import { v4 as uuidv4 } from "uuid";

const rooms = new Map<string, Room>();

export function createRoom(
  user: UserController,
  size: number,
  permissions: RoomPermissions,
  gameData: RoomGameData,
) {
  const room: Room = {
    id: uuidv4(),
    size: size,
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
