import { Room } from "schemas";

export async function checkInGame(userId: number) {
  try {
    const response = await fetch(
      "http://game_service/inGame?userId=" + userId,
      {},
    ).then((res) => res.json());
    return !!response["inGame"];
  } catch (error) {
    console.error(error);
    return true;
  }
}

export async function startGame(room: Room) {
  try {
    console.log("Starting game");
    const response = await fetch("http://game_service/create", {
      method: "POST",
      body: JSON.stringify(room),
    }).then((res) => res.json());
    console.log(response);
    return response["gameId"] as string;
  } catch (error) {
    console.log(error);
    console.error(error);
    return null;
  }
}
