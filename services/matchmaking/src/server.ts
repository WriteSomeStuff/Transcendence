import fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { Verrou } from "@verrou/core";
import { memoryStore } from "@verrou/core/drivers/memory";
import { z } from "zod";

const verrou = new Verrou({
  default: "memory",
  stores: {
    memory: { driver: memoryStore() },
  },
});

const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const ROOM_SCHEMA = z.object({
  size: z.coerce.number().int().finite().safe().min(2).max(2), // TODO increase upper limit
  game: z.enum(["pong"]),
});

const USER_HEADERS_SCHEMA = z.object({
  user_id: z.string(),
  user_type: z.string(),
});

interface User {
  user_id: string;
  user_type: string;
}

interface GameRoom {
  size: number;
  game: string;
  creator: User;
  slots: User[];
  game_id?: string;
}

let availableRooms: GameRoom[] = [];
const roomsMap = new Map<string, GameRoom>();

app.get(
  "/create_room",
  { schema: { querystring: ROOM_SCHEMA, headers: USER_HEADERS_SCHEMA } },
  async (req, res) => {
    const user: User = {
      user_id: req.headers["user_id"] as string,
      user_type: req.headers["user_type"] as string,
    };
    return verrou.createLock("room").run(async () => {
      if (roomsMap.has(user.user_id)) {
        return res.status(403).send("You're already in a room!");
      }
      const room: GameRoom = {
        // @ts-ignore
        size: req.query.size,
        // @ts-ignore
        game: req.query.game,
        creator: user,
        slots: [],
      };
      availableRooms.push(room);
      roomsMap.set(user.user_id, room);
      return res.status(201).send(room);
    });
  },
);

app.get(
  "/join_room",
  { schema: { headers: USER_HEADERS_SCHEMA } },
  async (req, res) => {
    const user: User = {
      user_id: req.headers["user_id"] as string,
      user_type: req.headers["user_type"] as string,
    };
    return verrou.createLock("room").run(async () => {
      if (roomsMap.has(user.user_id)) {
        return res.status(403).send("You're already in a room!");
      }
      if (availableRooms.length === 0) {
        return res.status(404).send("No available rooms!");
      }
      const room = availableRooms[0]!;
      room.slots.push(user);
      roomsMap.set(user.user_id, room);
      if (room.slots.length + 1 === room.size) {
        console.log("the room is full");
        availableRooms = availableRooms.splice(0, 1);
        const userIds = [room.creator.user_id];
        console.log(userIds);
        for (const slot of room.slots) {
          userIds.push(slot.user_id);
          console.log(slot, userIds);
        }
        const response = await (
          await fetch("http://game/create", {
            method: "POST",
            body: JSON.stringify({ userIds: userIds }),
          })
        ).json();
        console.log(response);
        room.game_id = response.gameId;
      }
      return res.status(200).send(room);
    });
  },
);

app.get(
  "/get_room",
  { schema: { headers: USER_HEADERS_SCHEMA } },
  async (req, res) => {
    const user: User = {
      user_id: req.headers["user_id"] as string,
      user_type: req.headers["user_type"] as string,
    };
    return verrou.createLock("room").run(async () => {
      if (!roomsMap.has(user.user_id)) {
        return res.status(403).send("You're not in a room!");
      }
      return res.status(200).send(roomsMap.get(user.user_id));
    });
  },
);

app.listen(
  { port: 80, host: "0.0.0.0" },
  (err: Error | null, address: string) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    console.log(`Server·listening·on·${address}`);
  },
);
