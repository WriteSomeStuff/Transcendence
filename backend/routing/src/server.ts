import fastify from "fastify";
import proxy from "@fastify/http-proxy";

const app = fastify();

app.get("/health", async (_, res) => {
  res.send({ message: "Success" });
});

app.addHook("onRequest", async (req, res) => {
  const allowedRoutes = [
    "/auth/logout",
    "/auth/register",
    "/auth/login",
    "/auth/oauth/login",
    "/auth/oauth/callback",
    "/auth/password",
    "/auth/verify2fa",
    "/auth/enable2fa",
    "/auth/disable2fa",
    "/users/new-user",
    "/users/username",
    "/users/password",
    "/users/avatar",
    "/users/status",
    "/users/profile",
    "/users/get-userid",
    "/users/get-username",
    "/users/friends/request",
    "/users/friends/accept",
    "/users/friends/reject",
    "/users/friends/requests",
    "/users/friends/list",
    "/users/friends/remove",
    "/users/match",
    "/users/match/insert-tournament",
    "/users/match/insert-tournament-match",
    "/users/match/history",
    "/users/match/tournament",
    "/users/match/tournament-matches",
    "/users/match/create-tournament",
    "/matchmaking/ws",
    "/game/ws",
  ];
  void res;
  if (!allowedRoutes.includes(req.url)) {
    console.log("Not allowed"); // TODO return actual error
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
