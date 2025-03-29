import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";

import { WebSocket } from "ws";

const app = Fastify();

await app.register(fastifyWebsocket);

app.get('/ws', { websocket: true }, (socket: WebSocket) => {
    socket.on('message', (data, isBinary) => {
        const message = data.toString();
        socket.send(`hello client from game, you sent us ${message}`);
    })
})

class Point {
    x: number;
    y: number;
}

class Game {
    paddle1: Point;
    paddle2: Point;
    ball: Point;
    ball_direction: Point;
    user1: string;
    user2: string;
}

const games: {[id: string] : Game} = {};
let lastId = 0;

function random_direction(): Point {
    let angle: number;
    switch (Math.floor(Math.random() * 4)) {
        case 0:
            angle = Math.PI / 18 + Math.random() * Math.PI / 3;
            break
        case 1:
            angle = Math.PI - Math.random() * Math.PI / 3 - Math.PI / 18;
            break
        case 2:
            angle = Math.PI + Math.random() * Math.PI / 3 + Math.PI / 18;
            break
        case 3:
            angle = - Math.PI / 18 - Math.random() * Math.PI / 3;
            break
    }
    return {x: Math.cos(angle) * 5, y: Math.sin(angle) * 5};
}

function update_game(game: Game) {
    game.ball = {x: game.ball.x + game.ball_direction.x, y: game.ball.y + game.ball_direction.y};
    if (game.ball.y < 5 || game.ball.y > 95)
        game.ball_direction.y = -game.ball_direction.y;
    if (game.ball.x < 5) {
        if (Math.abs(game.ball.y - game.paddle1.y) < 15)
            game.ball_direction.x = -game.ball_direction.x;
    }
    if (game.ball.x > 195)
    {
        if (Math.abs(game.ball.y - game.paddle2.y) < 15)
            game.ball_direction.x = -game.ball_direction.x;
    }
    if (game.ball.x < 1 || game.ball.x > 199)
        game = {
            paddle1: {x: 0, y: 50},
            paddle2: {x: 200, y: 50},
            ball: {x: 100, y: 50},
            ball_direction: random_direction(),
            user1: game.user1,
            user2: game.user2,
        };
    return game;
}

setInterval(() => {
    for (let gameId in games) {
        games[gameId] = update_game(games[gameId]);
    }
}, 50);

app.get('/start', (req, res) => {
    let user1: string = req.query.user1;
    let user2: string = req.query.user2;
    if (!user1 || !user2)
        return res.status(400).send('2 users required');
    games[lastId.toString()] = {
        paddle1: {x: 0, y: 50},
        paddle2: {x: 200, y: 50},
        ball: {x: 100, y: 50},
        ball_direction: random_direction(),
        user1: user1,
        user2: user2,
    };
    lastId++;
    return res.status(200).send((lastId - 1).toString());
})

app.get('/state', (req, res) => {
    let gameId = +req.query.gameid;
    if (gameId === undefined || gameId < 0 || gameId >= lastId) {
        return res.status(400).send('invalid gameId');
    }
    return res.status(200).send(games[gameId]);
})

function update_point(initial: Point, action: 'up' | 'down'): Point {
    if (action === 'up') {
        if (initial.y > 10)
            return {x: initial.x, y: initial.y - 5};
        else
            return {x: initial.x, y: initial.y};
    }
    else if (action === 'down') {
        if (initial.y < 90)
            return {x: initial.x, y: initial.y + 5};
        else
            return {x: initial.x, y: initial.y};
    }
}

app.get('/action', (req, res) => {
    let gameId = +req.query.gameid;
    if (gameId === undefined || gameId < 0 || gameId >= lastId) {
        return res.status(400).send('invalid gameId');
    }
    let user: string = req.headers.user_id as string;
    if (!user || (user !== games[gameId].user1 && user !== games[gameId].user2)) {
        return res.status(400).send('invalid user');
    }
    let action: 'up' | 'down' = req.query.action;
    if (!action) {
        return res.status(400).send('invalid action');
    }
    if (user === games[gameId].user1) {
        games[gameId].paddle1 = update_point(games[gameId].paddle1, action);
    }
    else if (user === games[gameId].user2) {
        games[gameId].paddle2 = update_point(games[gameId].paddle2, action);
    }
    return res.status(200).send(games[gameId]);
})

app.get('/', (req, res) => {
    res.status(200).send("Success");
})

app.listen({port: 80, host: '0.0.0.0'}, (err, address) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Listening on ' + address);
})
