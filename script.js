const snakeButton = document.getElementById("snakeButton");
const minesweeperButton = document.getElementById("minesweeperButton");
const climbButton = document.getElementById("climbButton");
const pacmanButton = document.getElementById("pacmanButton");
const backButton = document.getElementById("backButton");
const menu = document.getElementById("menu");
const message = document.getElementById("message");
const snakeGame = document.getElementById("snakeGame");
const minesweeperGame = document.getElementById("minesweeperGame");
const climbGame = document.getElementById("climbGame");
const pacmanGame = document.getElementById("pacmanGame");
const board = document.getElementById("board");
const context = board.getContext("2d");
const scoreDisplay = document.getElementById("score");
const mineBoard = document.getElementById("mineBoard");
const mineStatus = document.getElementById("mineStatus");
const climbBoard = document.getElementById("climbBoard");
const climbContext = climbBoard.getContext("2d");
const climbStatus = document.getElementById("climbStatus");
const climbRestartButton = document.getElementById("climbRestartButton");
const pacmanBoard = document.getElementById("pacmanBoard");
const pacmanContext = pacmanBoard.getContext("2d");
const pacmanStatus = document.getElementById("pacmanStatus");
const pacmanRestartButton = document.getElementById("pacmanRestartButton");
const emailForm = document.getElementById("emailForm");
const emailInput = document.getElementById("emailInput");
const feedbackInput = document.getElementById("feedbackInput");
const emailStatus = document.getElementById("emailStatus");

const tileSize = 20;
const tileCount = board.width / tileSize;
const mineRows = 8;
const mineColumns = 8;
const mineTotal = 10;
let snake;
let food;
let direction;
let nextDirection;
let score;
let gameTimer;
let snakeRestartTimer;
let mineCells = [];
let minesRemaining = mineTotal;
let mineGameOver = false;
let minesPlaced = false;
let climbFrame;
let climbLastFrame = 0;
let climbPlayer;
let climbBarrels;
let climbBarrelTimer;
let climbLives;
let climbFinished = false;
const climbKeys = { left: false, right: false, up: false };
let pacmanTimer;
let pacman;
let pacmanDirection;
let pacmanNextDirection;
let pacmanGhosts;
let pacmanPellets;
let pacmanScore;
let pacmanGameOver;
const pacmanMap = [
  "##########",
  "#........#",
  "#.##.##..#",
  "#........#",
  "#..##.##.#",
  "#........#",
  "#.#....#.#",
  "#.#.##.#.#",
  "#........#",
  "##########",
];
const climbPlatforms = [
  { x: 0, y: 330, width: 400 },
  { x: 0, y: 265, width: 265 },
  { x: 135, y: 200, width: 265 },
  { x: 0, y: 135, width: 265 },
  { x: 135, y: 70, width: 265 },
];
const climbLadders = climbPlatforms.slice(0, -1).map((platform, index) => ({
  x: 188,
  width: 24,
  top: climbPlatforms[index + 1].y,
  bottom: platform.y,
  bottomPlatformIndex: index,
}));

function showGame(game) {
  clearInterval(gameTimer);
  gameTimer = undefined;
  clearTimeout(snakeRestartTimer);
  snakeRestartTimer = undefined;
  clearInterval(pacmanTimer);
  pacmanTimer = undefined;
  cancelAnimationFrame(climbFrame);
  climbFrame = undefined;
  menu.hidden = true;
  snakeGame.hidden = game !== "snake";
  minesweeperGame.hidden = game !== "minesweeper";
  climbGame.hidden = game !== "climb";
  pacmanGame.hidden = game !== "pacman";
  backButton.hidden = false;

  if (game === "snake") {
    message.textContent = "Use the arrow keys or WASD to move.";
    startSnakeGame();
  } else if (game === "minesweeper") {
    message.textContent = "";
    startMinesweeperGame();
  } else if (game === "climb") {
    message.textContent = "Help your mascot reach the star!";
    startClimbGame();
  } else {
    message.textContent = "Eat every pellet and dodge the ghosts!";
    startPacmanGame();
  }
}

function returnToMenu() {
  clearInterval(gameTimer);
  gameTimer = undefined;
  clearTimeout(snakeRestartTimer);
  snakeRestartTimer = undefined;
  clearInterval(pacmanTimer);
  pacmanTimer = undefined;
  cancelAnimationFrame(climbFrame);
  climbFrame = undefined;
  climbKeys.left = false;
  climbKeys.right = false;
  climbKeys.up = false;
  snakeGame.hidden = true;
  minesweeperGame.hidden = true;
  climbGame.hidden = true;
  pacmanGame.hidden = true;
  backButton.hidden = true;
  menu.hidden = false;
  message.textContent = "Select a game to play.";
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
}

function drawGame() {
  context.fillStyle = "#f1f5f9";
  context.fillRect(0, 0, board.width, board.height);

  context.fillStyle = "#ef4444";
  context.fillRect(food.x * tileSize, food.y * tileSize, tileSize, tileSize);

  context.fillStyle = "#16a34a";
  snake.slice(1).forEach((segment) => {
    context.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize - 1, tileSize - 1);
  });

  const head = snake[0];
  const centerX = head.x * tileSize + tileSize / 2;
  const centerY = head.y * tileSize + tileSize / 2;
  context.beginPath();
  context.arc(centerX, centerY, tileSize * 0.48, 0, Math.PI * 2);
  context.fill();

  const perpendicular = { x: -direction.y, y: direction.x };
  for (const side of [-1, 1]) {
    const eyeX = centerX + direction.x * 4 + perpendicular.x * side * 4;
    const eyeY = centerY + direction.y * 4 + perpendicular.y * side * 4;
    context.beginPath();
    context.arc(eyeX, eyeY, 2, 0, Math.PI * 2);
    context.fillStyle = "#fff";
    context.fill();
    context.beginPath();
    context.arc(eyeX + direction.x, eyeY + direction.y, 1, 0, Math.PI * 2);
    context.fillStyle = "#0f172a";
    context.fill();
  }
  context.strokeStyle = "#ef4444";
  context.lineWidth = 1.5;
  context.beginPath();
  context.moveTo(centerX + direction.x * 8, centerY + direction.y * 8);
  context.lineTo(centerX + direction.x * 11, centerY + direction.y * 11);
  context.stroke();
  context.lineWidth = 1;
  context.fillStyle = "#16a34a";
}

function endGame() {
  clearInterval(gameTimer);
  gameTimer = undefined;
  message.textContent = `Game over! Final score: ${score}. Restarting...`;
  snakeRestartTimer = setTimeout(() => {
    snakeRestartTimer = undefined;
    if (!snakeGame.hidden) {
      startSnakeGame();
    }
  }, 1500);
}

function moveSnake() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };
  const willGrow = head.x === food.x && head.y === food.y;

  if (
    head.x < 0 ||
    head.x >= tileCount ||
    head.y < 0 ||
    head.y >= tileCount ||
    snake.some((segment, index) => {
      if (!willGrow && index === snake.length - 1) {
        return false;
      }
      return segment.x === head.x && segment.y === head.y;
    })
  ) {
    endGame();
    return;
  }

  snake.unshift(head);
  if (willGrow) {
    score += 1;
    scoreDisplay.textContent = `Score: ${score}`;
    placeFood();
  } else {
    snake.pop();
  }

  drawGame();
}

function startSnakeGame() {
  clearInterval(gameTimer);
  clearTimeout(snakeRestartTimer);
  snakeRestartTimer = undefined;
  snake = [
    { x: 7, y: 8 },
    { x: 6, y: 8 },
    { x: 5, y: 8 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  scoreDisplay.textContent = "Score: 0";
  message.textContent = "Use the arrow keys or WASD to move.";
  placeFood();
  drawGame();
  gameTimer = setInterval(moveSnake, 140);
}

function startClimbGame() {
  cancelAnimationFrame(climbFrame);
  climbFrame = undefined;
  climbLastFrame = 0;
  climbFinished = false;
  climbLives = 3;
  climbPlayer = { x: 18, y: 296, width: 24, height: 34, vx: 0, vy: 0, onGround: false };
  climbBarrels = [];
  climbBarrelTimer = 0;
  climbKeys.left = false;
  climbKeys.right = false;
  climbKeys.up = false;
  climbRestartButton.hidden = true;
  climbStatus.textContent = `Lives: ${climbLives}. Use Left/Right or A/D to move; Up or W climbs a ladder.`;
  climbFrame = requestAnimationFrame(runClimbFrame);
}

function runClimbFrame(timestamp) {
  if (!climbLastFrame) {
    climbLastFrame = timestamp;
  }
  const delta = Math.min((timestamp - climbLastFrame) / 1000, 0.04);
  climbLastFrame = timestamp;
  updateClimbGame(delta);
  drawClimbGame();
  if (!climbFinished) {
    climbFrame = requestAnimationFrame(runClimbFrame);
  }
}

function updateClimbGame(delta) {
  const player = climbPlayer;
  player.vx = (Number(climbKeys.right) - Number(climbKeys.left)) * 190;
  player.x = Math.max(0, Math.min(climbBoard.width - player.width, player.x + player.vx * delta));

  const previousBottom = player.y + player.height;
  const ladder = climbLadders.find((candidate) =>
    player.x + player.width > candidate.x &&
    player.x < candidate.x + candidate.width &&
    player.y < candidate.bottom &&
    previousBottom > candidate.top
  );

  if (climbKeys.up && ladder) {
    player.y -= 150 * delta;
    player.vy = 0;
    player.onGround = false;
    if (player.y + player.height <= ladder.top) {
      player.y = ladder.top - player.height;
      player.vy = 0;
      player.onGround = true;
      climbKeys.up = false;
    }
  } else {
    player.vy += 1250 * delta;
    player.y += player.vy * delta;
    player.onGround = false;

    if (player.vy >= 0) {
      for (const platform of climbPlatforms) {
        const bottom = player.y + player.height;
        if (
          previousBottom <= platform.y &&
          bottom >= platform.y &&
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width
        ) {
          player.y = platform.y - player.height;
          player.vy = 0;
          player.onGround = true;
          break;
        }
      }
    }
  }

  climbBarrelTimer -= delta;
  if (climbBarrelTimer <= 0) {
    const topPlatform = climbPlatforms[4];
    climbBarrels.push({
      x: 215,
      y: topPlatform.y - 13,
      vx: -145,
      vy: -190,
      platformIndex: 4,
      onGround: false,
      ladderDrop: false,
    });
    climbBarrelTimer = 1.8;
  }

  climbBarrels = climbBarrels.filter((barrel) => {
    const radius = 13;
    const previousBottom = barrel.y + radius;
    const previousX = barrel.x;
    barrel.x += barrel.vx * delta;

    if (barrel.onGround) {
      const platform = climbPlatforms[barrel.platformIndex];
      const ladder = climbLadders.find((candidate) => {
        if (candidate.bottomPlatformIndex + 1 !== barrel.platformIndex) {
          return false;
        }
        const ladderCenter = candidate.x + candidate.width / 2;
        return barrel.vx < 0
          ? previousX > ladderCenter && barrel.x <= ladderCenter
          : previousX < ladderCenter && barrel.x >= ladderCenter;
      });
      if (ladder && Math.random() < 0.01) {
        barrel.onGround = false;
        barrel.ladderDrop = true;
        barrel.vx = 0;
      }

      if (!barrel.ladderDrop) {
        const beyondEdge = barrel.vx < 0
          ? barrel.x + radius < platform.x
          : barrel.x - radius > platform.x + platform.width;
        if (beyondEdge) {
          if (barrel.platformIndex === 0) {
            return false;
          }
          barrel.onGround = false;
          barrel.platformIndex -= 1;
          barrel.vy = 0;
        }
      }
    }

    if (barrel.ladderDrop) {
      const lowerPlatform = climbPlatforms[barrel.platformIndex - 1];
      barrel.y += 120 * delta;
      if (barrel.y + radius >= lowerPlatform.y) {
        barrel.y = lowerPlatform.y - radius;
        barrel.platformIndex -= 1;
        barrel.ladderDrop = false;
        barrel.onGround = true;
        barrel.vx = (barrel.platformIndex % 2 === 0 ? -1 : 1) * 145;
      }
    } else if (!barrel.onGround) {
      barrel.vy += 900 * delta;
      barrel.y += barrel.vy * delta;
      const platform = climbPlatforms[barrel.platformIndex];
      if (
        barrel.vy >= 0 &&
        previousBottom <= platform.y &&
        barrel.y + radius >= platform.y &&
        barrel.x + radius > platform.x &&
        barrel.x - radius < platform.x + platform.width
      ) {
        barrel.y = platform.y - radius;
        barrel.vy = 0;
        barrel.onGround = true;
        barrel.vx = (barrel.platformIndex % 2 === 0 ? -1 : 1) * 145;
      }
    }

    if (
      player.x < barrel.x + radius &&
      player.x + player.width > barrel.x - radius &&
      player.y < barrel.y + radius &&
      player.y + player.height > barrel.y - radius
    ) {
      climbLives -= 1;
      player.x = 18;
      player.y = 296;
      player.vx = 0;
      player.vy = 0;
      player.onGround = false;
      if (climbLives === 0) {
        finishClimbGame(false);
      } else {
        climbStatus.textContent = `Watch out! ${climbLives} ${climbLives === 1 ? "life" : "lives"} left.`;
      }
      return false;
    }
    return barrel.y < climbBoard.height + radius && barrel.platformIndex >= 0;
  });

  if (player.y < 65 && player.x + player.width > 345 && player.x < 380) {
    finishClimbGame(true);
  }
}

function finishClimbGame(won) {
  climbFinished = true;
  climbRestartButton.hidden = false;
  climbStatus.textContent = won
    ? "You reached the star! Great climbing!"
    : "Out of lives! Give it another try.";
}

function drawClimbGame() {
  const ctx = climbContext;
  ctx.clearRect(0, 0, climbBoard.width, climbBoard.height);
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, climbBoard.width, climbBoard.height);

  ctx.strokeStyle = "#dbeafe";
  ctx.lineWidth = 1;
  for (let y = 35; y < climbBoard.height; y += 35) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(climbBoard.width, y);
    ctx.stroke();
  }

  for (const platform of climbPlatforms) {
    ctx.fillStyle = "#8b5e3c";
    ctx.fillRect(platform.x, platform.y, platform.width, 10);
    ctx.fillStyle = "#a3e635";
    ctx.fillRect(platform.x, platform.y, platform.width, 4);
    ctx.fillStyle = "#6b442b";
    for (let x = platform.x + 12; x < platform.x + platform.width; x += 38) {
      ctx.fillRect(x, platform.y + 6, 18, 2);
    }
  }

  for (const ladder of climbLadders) {
    ctx.strokeStyle = "#92400e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ladder.x, ladder.top);
    ctx.lineTo(ladder.x, ladder.bottom);
    ctx.moveTo(ladder.x + ladder.width, ladder.top);
    ctx.lineTo(ladder.x + ladder.width, ladder.bottom);
    ctx.stroke();
    ctx.lineWidth = 3;
    for (let y = ladder.top + 10; y < ladder.bottom; y += 14) {
      ctx.beginPath();
      ctx.moveTo(ladder.x, y);
      ctx.lineTo(ladder.x + ladder.width, y);
      ctx.stroke();
    }
  }

  drawClimbStar(358, 44, 13);
  drawMightyJo();
  for (const barrel of climbBarrels) {
    drawBarrel(barrel);
  }
  drawStickFigure(climbPlayer);
}

function drawClimbStar(x, y, radius) {
  const ctx = climbContext;
  ctx.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + (point * Math.PI) / 5;
    const pointRadius = point % 2 === 0 ? radius : radius * 0.45;
    const pointX = x + Math.cos(angle) * pointRadius;
    const pointY = y + Math.sin(angle) * pointRadius;
    if (point === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  ctx.closePath();
  ctx.fillStyle = "#facc15";
  ctx.fill();
  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawMightyJo() {
  const ctx = climbContext;
  ctx.fillStyle = "#584268";
  ctx.beginPath();
  ctx.arc(202, 41, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(187, 41, 30, 18);
  ctx.fillStyle = "#d8cddf";
  ctx.beginPath();
  ctx.ellipse(202, 44, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#241c2a";
  ctx.beginPath();
  ctx.arc(198, 39, 1.5, 0, Math.PI * 2);
  ctx.arc(206, 39, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawBarrel(barrel) {
  const ctx = climbContext;
  ctx.save();
  ctx.translate(barrel.x, barrel.y);
  ctx.rotate(barrel.x * 0.08);
  ctx.fillStyle = "#a16207";
  ctx.strokeStyle = "#713f12";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, -9);
  ctx.lineTo(-6, 9);
  ctx.moveTo(6, -9);
  ctx.lineTo(6, 9);
  ctx.stroke();
  ctx.restore();
}

function drawStickFigure(player) {
  const ctx = climbContext;
  const centerX = player.x + player.width / 2;
  ctx.strokeStyle = "#dc2626";
  ctx.fillStyle = "#dc2626";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(centerX, player.y + 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(centerX, player.y + 12);
  ctx.lineTo(centerX, player.y + 24);
  ctx.moveTo(centerX, player.y + 15);
  ctx.lineTo(player.x + 2, player.y + 21);
  ctx.moveTo(centerX, player.y + 15);
  ctx.lineTo(player.x + player.width - 2, player.y + 21);
  ctx.moveTo(centerX, player.y + 24);
  ctx.lineTo(player.x + 4, player.y + player.height);
  ctx.moveTo(centerX, player.y + 24);
  ctx.lineTo(player.x + player.width - 4, player.y + player.height);
  ctx.stroke();
}

function isWall(x, y) {
  return !pacmanMap[y] || pacmanMap[y][x] === "#";
}

function startPacmanGame() {
  clearInterval(pacmanTimer);
  pacmanTimer = undefined;
  pacmanGameOver = false;
  pacman = { x: 1, y: 1 };
  pacmanDirection = { x: 1, y: 0 };
  pacmanNextDirection = { x: 1, y: 0 };
  pacmanScore = 0;
  pacmanPellets = [];
  for (let y = 0; y < pacmanMap.length; y += 1) {
    for (let x = 0; x < pacmanMap[y].length; x += 1) {
      if (pacmanMap[y][x] !== "#") {
        pacmanPellets.push({ x, y });
      }
    }
  }
  pacmanGhosts = [
    { x: 8, y: 1, color: "#f87171", direction: { x: -1, y: 0 } },
    { x: 8, y: 8, color: "#60a5fa", direction: { x: -1, y: 0 } },
    { x: 1, y: 8, color: "#fbbf24", direction: { x: 1, y: 0 } },
  ];
  pacmanStatus.textContent = `Score: ${pacmanScore}. Use the arrow keys or WASD to move.`;
  pacmanRestartButton.hidden = true;
  drawPacmanGame();
  pacmanTimer = setInterval(() => {
    if (pacmanGameOver) {
      return;
    }

    movePacman();
    if (pacmanGameOver) {
      return;
    }

    moveGhosts();
    if (pacmanGameOver) {
      return;
    }

    drawPacmanGame();
  }, 180);
}

function finishPacmanGame(won) {
  clearInterval(pacmanTimer);
  pacmanTimer = undefined;
  pacmanGameOver = true;
  pacmanRestartButton.hidden = false;
  pacmanStatus.textContent = won
    ? `You win! Final score: ${pacmanScore}.`
    : `A ghost caught you! Final score: ${pacmanScore}.`;
}

function movePacman() {
  const requestedX = pacman.x + pacmanNextDirection.x;
  const requestedY = pacman.y + pacmanNextDirection.y;
  if (!isWall(requestedX, requestedY)) {
    pacmanDirection = pacmanNextDirection;
  }

  const nextX = pacman.x + pacmanDirection.x;
  const nextY = pacman.y + pacmanDirection.y;
  if (!isWall(nextX, nextY)) {
    pacman.x = nextX;
    pacman.y = nextY;
  }

  const pelletIndex = pacmanPellets.findIndex((pellet) => pellet.x === pacman.x && pellet.y === pacman.y);
  if (pelletIndex !== -1) {
    pacmanPellets.splice(pelletIndex, 1);
    pacmanScore += 1;
    if (pacmanPellets.length === 0) {
      finishPacmanGame(true);
      return;
    }
  }

  pacmanStatus.textContent = `Score: ${pacmanScore}. Eat every pellet and avoid the ghosts.`;
}

function moveGhosts() {
  pacmanGhosts.forEach((ghost) => {
    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    const validDirections = directions
      .filter((direction) => !isWall(ghost.x + direction.x, ghost.y + direction.y))
      .filter((direction) => {
        const reverse = direction.x === -ghost.direction.x && direction.y === -ghost.direction.y;
        return !reverse || directions.filter((entry) => !isWall(ghost.x + entry.x, ghost.y + entry.y)).length === 1;
      });

    const chosen = validDirections
      .map((direction) => ({
        direction,
        distance: Math.abs(ghost.x + direction.x - pacman.x) + Math.abs(ghost.y + direction.y - pacman.y),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (chosen) {
      ghost.direction = chosen.direction;
      ghost.x += chosen.direction.x;
      ghost.y += chosen.direction.y;
    }

    if (ghost.x === pacman.x && ghost.y === pacman.y) {
      finishPacmanGame(false);
      return;
    }
  });
}

function drawPacmanGame() {
  const tileSize = pacmanBoard.width / pacmanMap[0].length;
  pacmanContext.clearRect(0, 0, pacmanBoard.width, pacmanBoard.height);
  pacmanContext.fillStyle = "#0f172a";
  pacmanContext.fillRect(0, 0, pacmanBoard.width, pacmanBoard.height);

  for (let y = 0; y < pacmanMap.length; y += 1) {
    for (let x = 0; x < pacmanMap[y].length; x += 1) {
      const px = x * tileSize;
      const py = y * tileSize;
      if (pacmanMap[y][x] === "#") {
        pacmanContext.fillStyle = "#1d4ed8";
        pacmanContext.fillRect(px, py, tileSize, tileSize);
      }

      if (pacmanMap[y][x] !== "#") {
        const pellet = pacmanPellets.some((item) => item.x === x && item.y === y);
        if (pellet) {
          pacmanContext.fillStyle = "#facc15";
          pacmanContext.beginPath();
          pacmanContext.arc(px + tileSize / 2, py + tileSize / 2, 4, 0, Math.PI * 2);
          pacmanContext.fill();
        }
      }
    }
  }

  pacmanContext.fillStyle = "#facc15";
  pacmanContext.beginPath();
  const centerX = pacman.x * tileSize + tileSize / 2;
  const centerY = pacman.y * tileSize + tileSize / 2;
  const angle = Math.atan2(pacmanDirection.y, pacmanDirection.x);
  pacmanContext.moveTo(centerX, centerY);
  pacmanContext.arc(centerX, centerY, tileSize * 0.28, angle - 0.8, angle + 0.8);
  pacmanContext.closePath();
  pacmanContext.fill();

  pacmanGhosts.forEach((ghost) => {
    const ghostX = ghost.x * tileSize + tileSize / 2;
    const ghostY = ghost.y * tileSize + tileSize / 2;
    pacmanContext.fillStyle = ghost.color;
    pacmanContext.beginPath();
    pacmanContext.arc(ghostX, ghostY - 4, tileSize * 0.2, Math.PI, 0);
    pacmanContext.lineTo(ghostX + tileSize * 0.22, ghostY + tileSize * 0.18);
    pacmanContext.lineTo(ghostX + tileSize * 0.14, ghostY + tileSize * 0.1);
    pacmanContext.lineTo(ghostX, ghostY + tileSize * 0.18);
    pacmanContext.lineTo(ghostX - tileSize * 0.14, ghostY + tileSize * 0.1);
    pacmanContext.lineTo(ghostX - tileSize * 0.22, ghostY + tileSize * 0.18);
    pacmanContext.closePath();
    pacmanContext.fill();
    pacmanContext.fillStyle = "#fff";
    pacmanContext.beginPath();
    pacmanContext.arc(ghostX - 6, ghostY - 2, 3, 0, Math.PI * 2);
    pacmanContext.arc(ghostX + 6, ghostY - 2, 3, 0, Math.PI * 2);
    pacmanContext.fill();
    pacmanContext.fillStyle = "#0f172a";
    pacmanContext.beginPath();
    pacmanContext.arc(ghostX - 6, ghostY - 2, 1.5, 0, Math.PI * 2);
    pacmanContext.arc(ghostX + 6, ghostY - 2, 1.5, 0, Math.PI * 2);
    pacmanContext.fill();
  });
}

function getAdjacentMines(row, column) {
  let count = 0;
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue;
      }
      const neighbor = mineCells[row + rowOffset]?.[column + columnOffset];
      if (neighbor?.mine) {
        count += 1;
      }
    }
  }
  return count;
}

function finishMinesweeper(won) {
  mineGameOver = true;
  mineCells.flat().forEach((cell) => {
    if (cell.mine) {
      cell.button.textContent = "💣";
      cell.button.classList.add("revealed");
    }
    cell.button.disabled = true;
  });
  mineStatus.textContent = won ? "You cleared the minefield!" : "Boom! You hit a mine.";
}

function revealMineCell(row, column) {
  const cell = mineCells[row]?.[column];
  if (!cell || cell.revealed || cell.flagged || mineGameOver) {
    return;
  }

  if (!minesPlaced) {
    placeMines(row, column);
  }

  cell.revealed = true;
  cell.button.classList.add("revealed");
  cell.button.disabled = true;
  cell.button.setAttribute("aria-label", `Row ${row + 1}, column ${column + 1}, revealed`);

  if (cell.mine) {
    finishMinesweeper(false);
    return;
  }

  const adjacentMines = getAdjacentMines(row, column);
  if (adjacentMines > 0) {
    cell.button.textContent = adjacentMines;
  } else {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (rowOffset !== 0 || columnOffset !== 0) {
          revealMineCell(row + rowOffset, column + columnOffset);
        }
      }
    }
  }

  const revealedSafeCells = mineCells.flat().filter((item) => item.revealed && !item.mine).length;
  if (revealedSafeCells === mineRows * mineColumns - mineTotal) {
    finishMinesweeper(true);
  }
}

function toggleMineFlag(cell) {
  if (cell.revealed || mineGameOver) {
    return;
  }

  const nextFlaggedState = !cell.flagged;
  if (nextFlaggedState && minesRemaining <= 0) {
    return;
  }

  cell.flagged = nextFlaggedState;
  cell.button.textContent = cell.flagged ? "⚑" : "";
  cell.button.classList.toggle("flagged", cell.flagged);
  cell.button.setAttribute(
    "aria-label",
    `Row ${cell.row + 1}, column ${cell.column + 1}, ${cell.flagged ? "flagged" : "hidden"}`,
  );
  minesRemaining += cell.flagged ? -1 : 1;
  mineStatus.textContent = `${minesRemaining} mines left. Right-click to flag a mine.`;
}

function startMinesweeperGame() {
  mineBoard.replaceChildren();
  mineGameOver = false;
  minesPlaced = false;
  minesRemaining = mineTotal;
  mineStatus.textContent = `${minesRemaining} mines left. Right-click to flag a mine.`;
  mineCells = Array.from({ length: mineRows }, (_, row) =>
    Array.from({ length: mineColumns }, (_, column) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "mine-cell";
      button.setAttribute("aria-label", `Row ${row + 1}, column ${column + 1}, hidden`);
      const cell = { row, column, button, mine: false, revealed: false, flagged: false };
      button.addEventListener("click", () => revealMineCell(row, column));
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        toggleMineFlag(cell);
      });
      mineBoard.append(button);
      return cell;
    }),
  );
}

function placeMines(safeRow, safeColumn) {
  let placedMines = 0;
  while (placedMines < mineTotal) {
    const row = Math.floor(Math.random() * mineRows);
    const column = Math.floor(Math.random() * mineColumns);
    const rowDistance = row - safeRow;
    const columnDistance = column - safeColumn;
    if (
      rowDistance * rowDistance + columnDistance * columnDistance > 6 &&
      !mineCells[row][column].mine
    ) {
      mineCells[row][column].mine = true;
      placedMines += 1;
    }
  }
  minesPlaced = true;
}

snakeButton.addEventListener("click", () => showGame("snake"));
minesweeperButton.addEventListener("click", () => showGame("minesweeper"));
climbButton.addEventListener("click", () => showGame("climb"));
pacmanButton.addEventListener("click", () => showGame("pacman"));
backButton.addEventListener("click", returnToMenu);
climbRestartButton.addEventListener("click", startClimbGame);
pacmanRestartButton.addEventListener("click", startPacmanGame);
emailForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = emailForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  emailStatus.textContent = "Sending…";

  try {
    const response = await fetch("https://formsubmit.co/ajax/max4theboysyt@gmail.com", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Arcade visitor",
        email: emailInput.value.trim(),
        message: feedbackInput.value.trim(),
      }),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || `Email service returned ${response.status}.`);
    }

    emailStatus.textContent = "Your request was sent. We’ll reply to the email address you provided.";
    emailForm.reset();
  } catch (error) {
    emailStatus.textContent = error instanceof Error
      ? `We couldn’t send your request: ${error.message}`
      : "We couldn’t send your request. Please try again.";
  } finally {
    submitButton.disabled = false;
  }
});

function setClimbControl(control, pressed) {
  climbKeys[control] = pressed;
}

const climbControlButtons = document.querySelectorAll("[data-climb-control]");
climbControlButtons.forEach((button) => {
  const control = button.dataset.climbControl;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    setClimbControl(control, true);
  });
  button.addEventListener("pointerup", () => setClimbControl(control, false));
  button.addEventListener("pointercancel", () => setClimbControl(control, false));
  button.addEventListener("lostpointercapture", () => setClimbControl(control, false));
});

document.addEventListener("keydown", (event) => {
  if (climbGame.hidden) {
    return;
  }
  const keys = {
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
    arrowup: "up",
    w: "up",
  };
  const control = keys[event.key.toLowerCase()];
  if (control) {
    event.preventDefault();
    setClimbControl(control, true);
  }
});

document.addEventListener("keyup", (event) => {
  const keys = {
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
    arrowup: "up",
    w: "up",
  };
  const control = keys[event.key.toLowerCase()];
  if (control) {
    setClimbControl(control, false);
  }
});

window.addEventListener("blur", () => {
  climbKeys.left = false;
  climbKeys.right = false;
  climbKeys.up = false;
});

document.addEventListener("keydown", (event) => {
  if (!pacmanGame.hidden && pacmanTimer) {
    const key = event.key.toLowerCase();
    const directions = {
      arrowup: { x: 0, y: -1 },
      w: { x: 0, y: -1 },
      arrowdown: { x: 0, y: 1 },
      s: { x: 0, y: 1 },
      arrowleft: { x: -1, y: 0 },
      a: { x: -1, y: 0 },
      arrowright: { x: 1, y: 0 },
      d: { x: 1, y: 0 },
    };
    const requestedDirection = directions[key];

    if (requestedDirection) {
      event.preventDefault();
      pacmanNextDirection = requestedDirection;
    }
  }

  if (snakeGame.hidden || !gameTimer) {
    return;
  }

  const key = event.key.toLowerCase();
  const directions = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };
  const requestedDirection = directions[key];

  if (!requestedDirection) {
    return;
  }

  event.preventDefault();
  if (requestedDirection.x !== -direction.x || requestedDirection.y !== -direction.y) {
    nextDirection = requestedDirection;
  }
});
