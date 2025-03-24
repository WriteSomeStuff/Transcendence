import fastify from "fastify";
import proxy from "@fastify/http-proxy";

const app = fastify();

app.get("/health", (req, res) => {
    res.send({ message: "Success" });
});

app.register(proxy, {
    upstream: "http://matchmaking:8082",
    prefix: "/matchmaking",
})

app.register(proxy, {
    upstream: "http://game:8083",
    prefix: "/game",
});

app.listen(
    { port: 8081, host: "0.0.0.0" },
    (err: Error | null, address: string) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }
        console.log("Server listening on " + address);
    },
);
