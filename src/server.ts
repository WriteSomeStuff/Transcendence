import fastify from "fastify";
import fjwt, {FastifyJWT} from '@fastify/jwt';
import bcrypt from "bcrypt";

import db from "./db";

const app = fastify();

// app.register(fjwt, {secret: process.env.JWT_SECRET});

// app.register(jwt, {secret: process.env.JWT_SECRET});

app.post("/register", async (req, res) => {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
        return res.status(400).send({ error: "Username and password is required"});
    }

    const hashedPassword = await bcrypt.hash(password, 10); // TODO possibly replace with own hash calculation

    db.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`).run(username, hashedPassword);
});

app.get("/health", (req, res) => {
    res.send({message: "Success"});
});

app.listen({port: 8080}, (err: Error | null, address: string) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    console.log('Server listening on port 8080');
})