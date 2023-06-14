const gameBoard = document.querySelector("#gameBoard");
var ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#score");
const resetBtn = document.querySelector("#resetBtn");
const gameWidth = 500;
const gameHeight = 400;
const boardBackground = "chocolate";
const snakeColor = "green";
const snakeBorder = "black";
const appleColor = "red";
const goldColor = "gold";
const mode = document.querySelector("#mode");
const gameType = document.getElementById("gameType");
const unitSize = 25;
let running = false;
let twoPlayerGame = true;
let aiGame = false;
let xVelocity = unitSize;
let yVelocity = 0;
let appleX;
let appleY;
let goldX;
let goldY;
let gameTick = 75;
let scoreDec = 0;
let score = 0;
let snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize, y: 0 },
    { x: 0, y: 0 }
];

window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);

gameStart();

function gameStart() {
    scoreText.textContent = score;
    mode.addEventListener("click", checkTwoPlayer);
    if (aiGame) {
        createApple(true);
        drawApple(goldColor, goldX, goldY);
        gameTick = 35;
    } else {
        gameTick = 75;
        createApple(false);
        drawApple(appleColor, appleX, appleY);
    }
    nextTick();
};

function checkTwoPlayer() {
    if (twoPlayerGame) {
        twoPlayerGame = false;
        aiGame = true;
        gameType.innerText = "DIFFICULTY: HARD";
        console.log(gameType.innerText);

    } else if (aiGame) {
        twoPlayerGame = true;
        aiGame = false;
        gameType.innerText = "DIFFICULTY: EASY";
        console.log(gameType.innerText);
    }
}

function nextTick() {
    if (running) {
        setTimeout(() => {
            if (scoreDec > 10) {
                gameTick -= 3;
                scoreDec -= 10;
                console.log(gameTick);
            }
            clearBoard();
            drawApple(appleColor, appleX, appleY);
            drawApple(goldColor, goldX, goldY);
            moveSnake();
            drawSnake();
            checkGameOver();
            nextTick();
        }, gameTick);
    }
    else {
        displayGameOver();
    }
};
function clearBoard() {
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
};
function createApple(gold) {
    function randomapple(min, max) {
        const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
        return randNum;
    }

    if (gold) {
        goldX = randomapple(0, gameWidth - unitSize);
        goldY = randomapple(0, gameHeight - unitSize);
    } else if (!gold) {
        appleX = randomapple(0, gameWidth - unitSize);
        appleY = randomapple(0, gameHeight - unitSize);
    }
};
function drawApple(color, x, y) {
    ctx.fillStyle = color;
    if (x == goldX && y == goldY) {
        ctx.beginPath();
        ctx.arc(x, y, unitSize / 2, 0, 2 * Math.PI);
        ctx.fill();
    } else {
        ctx.fillRect(x, y, unitSize, unitSize);
    }

}

function moveSnake() {
    const head = {
        x: snake[0].x + xVelocity,
        y: snake[0].y + yVelocity
    };

    snake.unshift(head);

    if (snake[0].x == appleX && snake[0].y == appleY) {
        score++;
        scoreDec++;
        scoreText.textContent = score;
        createApple(false);
    } else if (snake[0].x == goldX && snake[0].y == goldY) {
        score += 3;
        scoreDec += 3;
        scoreText.textContent = score;
        createApple(true);
    }
    else {
        snake.pop();
    }
};
function drawSnake() {
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    snake.forEach(snakePart => {
        ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
        ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    })
};
function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;
    const reset = 82;

    const goingUp = (yVelocity == -unitSize);
    const goingDown = (yVelocity == unitSize);
    const goingRight = (xVelocity == unitSize);
    const goingLeft = (xVelocity == -unitSize);

    switch (true) {
        case (keyPressed == LEFT && !goingRight):
            xVelocity = -unitSize;
            yVelocity = 0;
            break;
        case (keyPressed == UP && !goingDown):
            xVelocity = 0;
            yVelocity = -unitSize;
            event.preventDefault();
            break;
        case (keyPressed == RIGHT && !goingLeft):
            xVelocity = unitSize;
            yVelocity = 0;
            break;
        case (keyPressed == DOWN && !goingUp):
            xVelocity = 0;
            yVelocity = unitSize;
            event.preventDefault();
            break;

        case (keyPressed == reset):
            resetGame();
    }
};
function checkGameOver() {
    switch (true) {
        case (snake[0].x < 0):
            running = false;
            break;
        case (snake[0].x >= gameWidth):
            running = false;
            break;
        case (snake[0].y < 0):
            running = false;
            break;
        case (snake[0].y >= gameHeight):
            running = false;
            break;
    }
    for (let i = 1; i < snake.length; i += 1) {
        if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
            running = false;
        }
    }
};
function displayGameOver() {
    ctx.font = "50px Permanent Marker";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
    running = false;
};
function resetGame() {
    running = true;
    score = 0;
    xVelocity = unitSize;
    yVelocity = 0;
    snake = [
        { x: unitSize * 4, y: 0 },
        { x: unitSize * 3, y: 0 },
        { x: unitSize * 2, y: 0 },
        { x: unitSize, y: 0 },
        { x: 0, y: 0 }
    ];
    gameStart();
};