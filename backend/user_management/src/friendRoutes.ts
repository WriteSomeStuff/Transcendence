import { FastifyInstance } from "fastify";

import {
  friendRequestHandler,
  acceptFriendRequestHandler,
  rejectFriendRequestHandler,
  getFriendRequestsHandler,
  getFriendsHandler,
  removeFriendHandler,
} from "./friendController.js";

// prefix: /users/friends
const friendRoutes = async (app: FastifyInstance) => {
  app.post(
    "/request",
    { preHandler: [app.authenticate] },
    friendRequestHandler,
  );

  app.put(
    "/accept",
    { preHandler: [app.authenticate] },
    acceptFriendRequestHandler,
  );
  app.put(
    "/reject",
    { preHandler: [app.authenticate] },
    rejectFriendRequestHandler,
  );

  app.get(
    "/requests",
    { preHandler: [app.authenticate] },
    getFriendRequestsHandler,
  );
  app.get("/list", { preHandler: [app.authenticate] }, getFriendsHandler);

  app.delete(
    "/remove",
    { preHandler: [app.authenticate] },
    removeFriendHandler,
  );
};

export default friendRoutes;
