import fastify from "fastify";
import proxy from "@fastify/http-proxy";

const app = fastify();

app.get("/health", async (_, res) => {
  res.send({ message: "Success" });
});

app.addHook("onRequest", async (req, res) => {
  const allowedRoutes = [
    "/user/username",
    "/user/avatar",
    "/user/profile",
    "/user/get-userid",
    "/user/get-username",
    "/user/get-status",
    "/user/friends/request",
    "/user/friends/accept",
    "/user/friends/reject",
    "/user/friends/requests",
    "/user/friends/list",
    "/user/friends/remove",
    "/user/match/history",
    "/user/match/tournament",
    "/user/match/create-tournament",
    "/matchmaking/ws",
    "/game/ws",
    "/game/users",
  ];
  const route = req.url.split("?")[0]!;
  if (!allowedRoutes.includes(route)) {
    res.status(401).send({ error: "Not allowed route" });
  }
  console.log(req.url);
});

app.register(proxy, {
  upstream: "http://matchmaking_service",
  prefix: "/matchmaking",
  websocket: true,
});

app.register(proxy, {
  upstream: "http://game_service",
  prefix: "/game",
  websocket: true,
});

app.register(proxy, {
  upstream: "http://user_service",
  prefix: "/user",
});

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
