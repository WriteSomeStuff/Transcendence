import fastify from "fastify";
import bcrypt from "bcrypt";
import {v6 as uuidv6} from 'uuid';
import jwt from "@fastify/jwt";
import proxy from "@fastify/http-proxy"

import db from "./db.ts";

const select = db.prepare("SELECT * FROM users WHERE username = ?");
const insert = db.prepare(
    'INSERT into users (id, username, password) VALUES (@id, @username, @password)'
);

const app = fastify();

app.register(jwt, {secret: process.env.JWT_SECRET as string});

app.post("/register", async (req, res) => {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
        return res.status(400).send({ error: "Username and password is required"});
    }

    const hashedPassword = await bcrypt.hash(password, 10); // TODO possibly replace with own hash calculation

    const checkedInsert = db.transaction((username: string, password: string) => {
        if (select.get(username) !== undefined) {
            return res.status(400).send({error: "Username must be unique"});
        }
        let id = uuidv6();
        insert.run({id, username, password});
        return res.status(201).send("User created!");
    });
    try {
        return checkedInsert(username, hashedPassword);
    }
    catch (error) {
        return res.status(500).send('Unknown error');
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body as { username: string; password: string };

    if (!username || !password) {
        return res.status(400).send({ error: "Username and password is required"});
    }
    const user = select.get(username) as { id: string; username: string; password: string };
    if (!user) {
        return res.status(404).send({ error: "User not found" });
    }
    if (!(await bcrypt.compare(password, user.password))) {
        return res.status(401).send({ error: "Password is incorrect" });
    }
    const token = app.jwt.sign({ id: user.id, type: 'registered' });
    return res.status(200).send({ token: token });
})

app.post("/guest", async (req, res) => {
    try {
        await req.jwtVerify();
        res.status(400).send({ error: "Already authenticated" });
    }
    catch (error) {
        const token = app.jwt.sign({ id: uuidv6(), type: 'guest' });
        return res.status(200).send({ token: token });
    }
})

app.get("/health", (req, res) => {
    res.send({message: "Success"});
});

app.addHook("onRequest", async (req, res) => {
    if (["/health", "/login", "/register", "/guest"].includes(req.url))
        return;
    try {
        await req.jwtVerify();
    }
    catch (error) {
        res.status(401).send({ error: "Unauthorized" });
    }
})

app.register(proxy, { upstream: 'http://localhost:8545' }); // TODO replace with some normal value

app.listen({port: 8080, host: '0.0.0.0'}, (err: Error | null, address: string) => {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    console.log('Server listening on port 8080');
})
