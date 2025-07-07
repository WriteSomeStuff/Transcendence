import fastify from "fastify";
import proxy from "@fastify/http-proxy";

const app = fastify();

app.get("/health", async (_, res) => {
  res.send({ message: "Success" });
});

app.addHook("onRequest", async (req, res) => {
  const allowedRoutes = ["/user/profile", "/matchmaking/ws"];
  (void res);
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
