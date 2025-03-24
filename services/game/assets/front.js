let gameId;

let user1_action = null;
let user2_action = null;

fetch('/game/start?user1=a&user2=b').then(res => res.text()).then((res) => {
    gameId = res;
})

function render_game(game) {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 200, 100);
    ctx.strokeRect(0, 0, 200, 100);
    ctx.fillRect(game.paddle1.x, game.paddle1.y - 10, 5, 20);
    ctx.fillRect(game.paddle2.x - 5, game.paddle2.y - 10, 5, 20);
    ctx.fillRect(game.ball.x - 2, game.ball.y - 2, 4, 4);
}

async function update_game() {
    if (gameId === undefined || gameId === null) {
        return;
    }
    if (user1_action) {
        await fetch('/game/action?gameid=' + gameId + '&user=a&action=' + user1_action);
    }
    if (user2_action) {
        await fetch('/game/action?gameid=' + gameId + '&user=b&action=' + user2_action);
    }
    let game = await fetch('/game/state?gameid=' + gameId).then(res => res.json());
    render_game(game);
}

onkeydown = (event) => {
    if (event.key === 'w') {
        if (user1_action === null || user1_action === 'up')
            user1_action = 'up';
        else
            user1_action = null;
    }
    if (event.key === 's') {
        if (user1_action === null || user1_action === 'down')
            user1_action = 'down';
        else
            user1_action = null;
    }
    if (event.key === 'ArrowUp') {
        if (user2_action === null || user2_action === 'up')
            user2_action = 'up';
        else
            user2_action = null;
    }
    if (event.key === 'ArrowDown') {
        if (user2_action === null || user2_action === 'down')
            user2_action = 'down';
        else
            user2_action = null;
    }
}

onkeyup = (event) => {
    if (event.key === 'w') {
        if (user1_action === null || user1_action === 'up')
            user1_action = null;
        else
            user1_action = 'down';
    }
    if (event.key === 's') {
        if (user1_action === null || user1_action === 'down')
            user1_action = null;
        else
            user1_action = 'up';
    }
    if (event.key === 'ArrowUp') {
        if (user2_action === null || user2_action === 'up')
            user2_action = null;
        else
            user2_action = 'down';
    }
    if (event.key === 'ArrowDown') {
        if (user2_action === null || user2_action === 'down')
            user2_action = null;
        else
            user2_action = 'up';
    }
}

setInterval(update_game, 50);
