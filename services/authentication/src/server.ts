import fastify from "fastify";
import jwt from "@fastify/jwt";
import proxy from "@fastify/http-proxy";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { z } from "zod";
import bcrypt from "bcrypt";
import { v6 as uuidv6 } from "uuid";

import db from "./db.ts";

const select = db.prepare("SELECT * FROM users WHERE username = ?");
const insert = db.prepare(
  "INSERT into users (id, username, password) VALUES (@id, @username, @password)",
);

const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const LOGIN_SCHEMA = z
  .object({
    username: z.string().min(3).max(32),
    password: z.string().min(6).max(64),
  })
  .required();

app.register(jwt, { secret: process.env["JWT_SECRET"] as string });

app.addHook("onError", async (_, res, err) => {
  console.error(err.stack);
  return res.status(500).send("Internal Server Error");
});

app.post("/register", { schema: { body: LOGIN_SCHEMA } }, async (req, res) => {
  // @ts-ignore
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10); // TODO possibly replace with own hash calculation

  const checkedInsert = db.transaction((username: string, password: string) => {
    if (select.get(username) !== undefined) {
      throw new Error("User already exists");
    }
    const id = uuidv6();
    insert.run({ id, username, password });
  });
  try {
    checkedInsert(username, hashedPassword);
    return res.status(201).send("User created");
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/login", { schema: { body: LOGIN_SCHEMA } }, async (req, res) => {
  // @ts-ignore
  const { username, password } = req.body;

  const user = select.get(username) as {
    id: string;
    username: string;
    password: string;
  };
  if (!user) {
    return res.status(404).send({ error: "User not found" });
  }
  if (!(await bcrypt.compare(password, user.password))) {
    return res.status(401).send({ error: "Password is incorrect" });
  }
  const token = app.jwt.sign({ id: user.id, type: "registered" });
  return res.status(200).send({ token: token, id: user.id });
});

app.post("/guest", async (req, res) => {
  try {
    await req.jwtVerify();
    res.status(400).send({ error: "Already authenticated" });
  } catch (error) {
    const token = app.jwt.sign({ id: uuidv6(), type: "guest" });
    return res.status(200).send({ token: token });
  }
});

app.get("/health", (_, res) => {
  res.send({ message: "Success" });
});

app.addHook("preHandler", async (req, res) => {
  if (["/health", "/login", "/register", "/guest"].includes(req.url)) return;
  try {
    if (req.headers["sec-websocket-protocol"] !== undefined) {
      req.headers.authorization = `Bearer ${req.headers["sec-websocket-protocol"].split(", ")[1]}`;
    }
    console.log(req.headers.authorization);
    await req.jwtVerify();
    const { id, type } = req.user as { id: string; type: string };
    req.headers["user_id"] = id;
    req.headers["user_type"] = type;
    req.headers.authorization = undefined;
    if (req.headers["sec-websocket-protocol"] !== undefined) {
      // console.log(req.headers["user_id"], req.headers["sec-websocket-protocol"].split(", ")[1]);
      if (
        req.headers["user_id"] !==
        req.headers["sec-websocket-protocol"].split(", ")[0]
      ) {
        return res.status(401).send({ error: "Wrong user id" });
      }
    }
  } catch (error) {
    res.status(401).send({ error: "Unauthorized" });
  }
});

app.register(proxy, {
  upstream: "http://routing",
  websocket: true,
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
