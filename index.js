// Game elements
const gameBoard = document.querySelector("#gameBoard");
var ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#score");
const resetBtn = document.querySelector("#resetBtn");
const mode = document.querySelector("#mode");
const gameType = document.getElementById("gameType");
const themeToggle = document.getElementById("themeToggle");
const howToPlayBtn = document.getElementById("howToPlay");
const instructionsOverlay = document.getElementById("instructionsOverlay");
const startPlayingBtn = document.getElementById("startPlaying");
const closeInstructionsBtn = document.getElementById("closeInstructions");

// Game settings
const gameWidth = 500;
const gameHeight = 400;
const unitSize = 25;

// Theme settings
let isDarkTheme = false;

// Game colors (will be updated based on CSS variables)
let boardBackground;
let snakeColor;
let snakeBorder;
let appleColor;
let goldColor;

// Game state
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

// Update colors from CSS variables
function updateColors() {
    boardBackground = getComputedStyle(document.documentElement).getPropertyValue('--board-bg').trim();
    snakeHeadColor = getComputedStyle(document.documentElement).getPropertyValue('--snake-head-color').trim();
    snakeColor = getComputedStyle(document.documentElement).getPropertyValue('--snake-body-color').trim();
    snakePatternColor = getComputedStyle(document.documentElement).getPropertyValue('--snake-pattern-color').trim();
    snakeBorder = getComputedStyle(document.documentElement).getPropertyValue('--snake-border').trim();
    snakeEyeColor = getComputedStyle(document.documentElement).getPropertyValue('--snake-eye-color').trim();
    appleColor = getComputedStyle(document.documentElement).getPropertyValue('--apple-color').trim();
    appleShine = getComputedStyle(document.documentElement).getPropertyValue('--apple-shine').trim();
    goldColor = getComputedStyle(document.documentElement).getPropertyValue('--gold-color').trim();
    goldShine = getComputedStyle(document.documentElement).getPropertyValue('--gold-shine').trim();
}

// Event listeners
window.addEventListener("keydown", changeDirection);
resetBtn.addEventListener("click", resetGame);
themeToggle.addEventListener("click", toggleTheme);
howToPlayBtn.addEventListener("click", showInstructions);
startPlayingBtn.addEventListener("click", hideInstructions);
closeInstructionsBtn.addEventListener("click", hideInstructions);

// Instructions functions
function showInstructions() {
    instructionsOverlay.style.display = "flex";
    closeInstructionsBtn.style.display = "block";
    // Pause the game if it's running
    if (running) {
        running = false;
    }
}

function hideInstructions() {
    instructionsOverlay.style.display = "none";
    closeInstructionsBtn.style.display = "none";
}

// Initialize game
updateColors();
gameStart();

// Toggle between light and dark theme
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    }
    updateColors();
    clearBoard();
    drawApple(appleColor, appleX, appleY);
    drawApple(goldColor, goldX, goldY);
    drawSnake();
}

// Check for saved theme preference
function checkSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDarkTheme = true;
        document.body.classList.add('dark-theme');
    }
    updateColors();
}

// Start the game
function gameStart() {
    checkSavedTheme();
    scoreText.textContent = score;
    gameType.innerText = "DIFFICULTY: EASY";
    clearBoard();
    drawApple(appleColor, appleX, appleY);
    drawApple(goldColor, goldX, goldY);
    drawSnake();
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
        gameType.classList.add('shake');
        setTimeout(() => {
            gameType.classList.remove('shake');
        }, 500);
    } else if (aiGame) {
        twoPlayerGame = true;
        aiGame = false;
        gameType.innerText = "DIFFICULTY: EASY";
        gameType.classList.add('shake');
        setTimeout(() => {
            gameType.classList.remove('shake');
        }, 500);
    }
}

function nextTick() {
    if (running) {
        setTimeout(() => {
            if (scoreDec > 10) {
                gameTick -= 3;
                scoreDec -= 10;
                // Add a quick flash effect when speed increases
                gameBoard.style.boxShadow = "0 0 20px var(--primary-color)";
                setTimeout(() => {
                    gameBoard.style.boxShadow = "0 8px 16px var(--shadow-color)";
                }, 300);
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
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;

    if (x == goldX && y == goldY) {
        // Draw golden apple (circular)
        ctx.fillStyle = goldColor;
        ctx.beginPath();
        ctx.arc(x + unitSize / 2, y + unitSize / 2, unitSize / 2, 0, 2 * Math.PI);
        ctx.fill();

        // Add shine effect
        ctx.fillStyle = goldShine;
        ctx.beginPath();
        ctx.arc(x + unitSize / 2 - unitSize / 5, y + unitSize / 2 - unitSize / 5, unitSize / 8, 0, 2 * Math.PI);
        ctx.fill();

        // Add stem
        ctx.fillStyle = '#5c4033';
        ctx.beginPath();
        ctx.fillRect(x + unitSize / 2 - 2, y + 2, 4, 6);
    } else {
        // Draw red apple (slightly oval)
        ctx.fillStyle = appleColor;
        ctx.beginPath();
        ctx.ellipse(x + unitSize / 2, y + unitSize / 2, unitSize / 2, unitSize / 2 + 2, 0, 0, 2 * Math.PI);
        ctx.fill();

        // Add shine effect
        ctx.fillStyle = appleShine;
        ctx.beginPath();
        ctx.arc(x + unitSize / 2 - unitSize / 5, y + unitSize / 2 - unitSize / 5, unitSize / 8, 0, 2 * Math.PI);
        ctx.fill();

        // Add stem
        ctx.fillStyle = '#5c4033';
        ctx.beginPath();
        ctx.fillRect(x + unitSize / 2 - 2, y + 2, 4, 6);

        // Add leaf
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.ellipse(x + unitSize / 2 + 5, y + 5, 4, 3, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Reset shadow for other drawings
    ctx.shadowBlur = 0;
}

function moveSnake() {
    const head = {
        x: snake[0].x + xVelocity,
        y: snake[0].y + yVelocity
    };

    snake.unshift(head);

    // Check if snake ate an apple
    if (snake[0].x == appleX && snake[0].y == appleY) {
        score++;
        scoreDec++;
        scoreText.textContent = score;
        // Add animation to score
        scoreText.style.animation = 'none';
        setTimeout(() => {
            scoreText.style.animation = 'bounce 0.5s ease';
        }, 10);
        createApple(false);
    } else if (snake[0].x == goldX && snake[0].y == goldY) {
        score += 3;
        scoreDec += 3;
        scoreText.textContent = score;
        // Add animation to score with more emphasis
        scoreText.style.animation = 'none';
        setTimeout(() => {
            scoreText.style.animation = 'bounce 0.8s ease';
        }, 10);
        createApple(true);
    }
    else {
        snake.pop();
    }
};

function drawSnake() {
    // Draw snake body parts first (in reverse to ensure head is on top)
    for (let i = snake.length - 1; i >= 0; i--) {
        const snakePart = snake[i];
        const isHead = i === 0;
        const isTail = i === snake.length - 1;

        // Determine direction for head orientation
        let direction = 'right'; // default
        if (isHead) {
            if (xVelocity < 0) direction = 'left';
            else if (xVelocity > 0) direction = 'right';
            else if (yVelocity < 0) direction = 'up';
            else if (yVelocity > 0) direction = 'down';
        }

        // Draw body segment
        if (isHead) {
            drawSnakeHead(snakePart.x, snakePart.y, direction);
        } else if (isTail) {
            drawSnakeTail(snakePart.x, snakePart.y, snake[i - 1]);
        } else {
            drawSnakeBody(snakePart.x, snakePart.y, i);
        }
    }
};

function drawSnakeHead(x, y, direction) {
    // Base head shape
    ctx.fillStyle = snakeHeadColor;
    ctx.strokeStyle = snakeBorder;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = snakeHeadColor;

    // Draw slightly larger head
    ctx.beginPath();
    ctx.roundRect(x - 2, y - 2, unitSize + 4, unitSize + 4, 8);
    ctx.fill();
    ctx.stroke();

    // Draw eyes based on direction
    ctx.fillStyle = snakeEyeColor;
    ctx.shadowBlur = 0;

    if (direction === 'right') {
        // Right-facing eyes
        ctx.beginPath();
        ctx.arc(x + unitSize - 5, y + 8, 3, 0, 2 * Math.PI);
        ctx.arc(x + unitSize - 5, y + unitSize - 8, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x + unitSize - 4, y + 8, 1.5, 0, 2 * Math.PI);
        ctx.arc(x + unitSize - 4, y + unitSize - 8, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    } else if (direction === 'left') {
        // Left-facing eyes
        ctx.beginPath();
        ctx.arc(x + 5, y + 8, 3, 0, 2 * Math.PI);
        ctx.arc(x + 5, y + unitSize - 8, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x + 4, y + 8, 1.5, 0, 2 * Math.PI);
        ctx.arc(x + 4, y + unitSize - 8, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    } else if (direction === 'up') {
        // Up-facing eyes
        ctx.beginPath();
        ctx.arc(x + 8, y + 5, 3, 0, 2 * Math.PI);
        ctx.arc(x + unitSize - 8, y + 5, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x + 8, y + 4, 1.5, 0, 2 * Math.PI);
        ctx.arc(x + unitSize - 8, y + 4, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    } else { // down
        // Down-facing eyes
        ctx.beginPath();
        ctx.arc(x + 8, y + unitSize - 5, 3, 0, 2 * Math.PI);
        ctx.arc(x + unitSize - 8, y + unitSize - 5, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x + 8, y + unitSize - 4, 1.5, 0, 2 * Math.PI);
        ctx.arc(x + unitSize - 8, y + unitSize - 4, 1.5, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Reset
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
}

function drawSnakeBody(x, y, index) {
    // Create gradient for body segments
    const gradientFactor = 1 - (index / snake.length) * 0.3;

    // Main body
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    ctx.beginPath();
    ctx.roundRect(x, y, unitSize, unitSize, 5);
    ctx.fill();
    ctx.stroke();

    // Add pattern to body (scales)
    if (index % 2 === 0) {
        ctx.fillStyle = snakePatternColor;
        ctx.beginPath();
        ctx.arc(x + unitSize / 2, y + unitSize / 2, unitSize / 5, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function drawSnakeTail(x, y, prevSegment) {
    // Determine tail direction based on previous segment
    let tailDirection = 'right';
    if (prevSegment.x < x) tailDirection = 'left';
    else if (prevSegment.x > x) tailDirection = 'right';
    else if (prevSegment.y < y) tailDirection = 'up';
    else if (prevSegment.y > y) tailDirection = 'down';

    // Draw tail
    ctx.fillStyle = snakeColor;
    ctx.strokeStyle = snakeBorder;
    ctx.beginPath();

    // Draw a slightly tapered tail
    if (tailDirection === 'right') {
        ctx.roundRect(x + 2, y + 2, unitSize - 4, unitSize - 4, 5);
    } else if (tailDirection === 'left') {
        ctx.roundRect(x + 2, y + 2, unitSize - 4, unitSize - 4, 5);
    } else if (tailDirection === 'up') {
        ctx.roundRect(x + 2, y + 2, unitSize - 4, unitSize - 4, 5);
    } else { // down
        ctx.roundRect(x + 2, y + 2, unitSize - 4, unitSize - 4, 5);
    }

    ctx.fill();
    ctx.stroke();
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
    let isGameOver = false;

    // Check wall collisions
    if (snake[0].x < 0 || snake[0].x >= gameWidth || snake[0].y < 0 || snake[0].y >= gameHeight) {
        isGameOver = true;
    }

    // Check self collision
    for (let i = 1; i < snake.length; i += 1) {
        if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
            isGameOver = true;
        }
    }

    if (isGameOver) {
        running = false;
        // Add shake animation to the game board
        gameBoard.classList.add('shake');
        setTimeout(() => {
            gameBoard.classList.remove('shake');
        }, 500);
    }
};

function displayGameOver() {
    // Create gradient for game over text
    const gradient = ctx.createLinearGradient(0, gameHeight / 2 - 30, 0, gameHeight / 2 + 30);
    gradient.addColorStop(0, "#ef4444");
    gradient.addColorStop(1, "#b91c1c");

    ctx.font = "bold 50px Permanent Marker";
    ctx.fillStyle = gradient;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Draw text with animation effect
    let size = 0;
    const animateText = () => {
        if (size < 50) {
            clearBoard();
            drawApple(appleColor, appleX, appleY);
            drawApple(goldColor, goldX, goldY);
            drawSnake();

            size += 2;
            ctx.font = `bold ${size}px Permanent Marker`;
            ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
            requestAnimationFrame(animateText);
        }
    };

    animateText();
    running = false;
};

function resetGame() {
    // Reset game state
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

    // Add reset animation
    gameBoard.style.transform = "scale(0.95)";
    gameBoard.style.opacity = "0.8";

    setTimeout(() => {
        gameBoard.style.transform = "scale(1)";
        gameBoard.style.opacity = "1";
        gameStart();
    }, 300);
};