// ============================================================
// BLOCK BREAKER (base game)
//
// game.js  = the canvas, the ball, the paddle, and the game loop
// bricks.js     = where the bricks are and how they are drawn
// collisions.js = what happens when the ball touches things
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;   // 600
const HEIGHT = canvas.height; // 450
const MAX_LIVES = 3;
const livesDisplay = document.getElementById("lives");
const backgroundStars = [];
const blackHoleImage = new Image();
let blackHoleImageLoaded = false;
let lives = MAX_LIVES;

blackHoleImage.src = "assets/wallpapersden.com_sci-fi-black-hole-hd-glowing-space_1920x1080.jpg";
blackHoleImage.onload = function () {
  blackHoleImageLoaded = true;
};

const BLACK_HOLE = {
  x: WIDTH * 0.76,
  y: HEIGHT * 0.45,
  radius: 62
};


// ------------------------------------------------------------
// THE BALL
// x and y are the top-left corner. vx and vy are how many pixels
// the ball moves each update (vx = sideways, vy = up/down).
// A positive vy means the ball is moving DOWN the screen.
// ------------------------------------------------------------
const BALL_SPEED = 4;
let ballLaunched = false;

const ball = {
  x: 0,
  y: 0,
  width: 12,
  height: 12,
  vx: 0,
  vy: 0
};

// Put the ball on top of the paddle, centered, and wait for launch.
function resetBall() {
  ballLaunched = false;
  ball.x = paddle.x + paddle.width / 2 - ball.width / 2;
  ball.y = paddle.y - ball.height;
  ball.vx = BALL_SPEED;  // right
  ball.vy = BALL_SPEED;  // down
}

function launchBall() {
  if (ballLaunched) {
    return;
  }

  ballLaunched = true;
  ball.vx = BALL_SPEED * (Math.random() < 0.5 ? -1 : 1);
  ball.vy = -BALL_SPEED;  // up
}


// ------------------------------------------------------------
// THE PADDLE
// ------------------------------------------------------------
const paddle = {
  x: WIDTH / 2 - 45,
  y: HEIGHT - 30,
  width: 90,
  height: 12,
  speed: 6
};


// ------------------------------------------------------------
// THE BRICKS (the list is filled in by makeBricks() in bricks.js)
// ------------------------------------------------------------
let bricks = [];

function restartGame() {
  bricks = makeBricks();
  resetBall();
  paddle.x = WIDTH / 2 - paddle.width / 2;
  lives = MAX_LIVES;
  updateLivesDisplay();
}

function updateLivesDisplay() {
  for (let index = 0; index < livesDisplay.children.length; index++) {
    livesDisplay.children[index].classList.toggle("lost", index >= lives);
  }
  livesDisplay.setAttribute("aria-label", `${lives} lives remaining`);
}


// ------------------------------------------------------------
// KEYBOARD
// keys["arrowleft"] is true while the left arrow is held down.
// ------------------------------------------------------------
const keys = {};

document.addEventListener("keydown", function (event) {
  const key = event.key.toLowerCase();
  keys[key] = true;

  if (key === "r" && !event.repeat) {
    restartGame();
  }

  if (event.code === "Space" && !event.repeat) {
    launchBall();
  }

  // Stop the arrow keys from scrolling the page.
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
  }
});

document.addEventListener("keyup", function (event) {
  keys[event.key.toLowerCase()] = false;
});


// ------------------------------------------------------------
// UPDATE: runs 60 times every second. Move things, then check
// what they touched.
// ------------------------------------------------------------
function createBackgroundStars() {
  backgroundStars.length = 0;

  for (let index = 0; index < 90; index++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 45 + Math.random() * 200;

    backgroundStars.push({
      x: BLACK_HOLE.x + Math.cos(angle) * radius,
      y: BLACK_HOLE.y + Math.sin(angle) * radius * 0.75,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.8 + 0.2,
      swirl: (Math.random() - 0.5) * 0.05,
      angle: angle
    });
  }
}

function updateBackgroundStars() {
  for (const star of backgroundStars) {
    const dx = BLACK_HOLE.x - star.x;
    const dy = BLACK_HOLE.y - star.y;
    const distSq = dx * dx + dy * dy + 200;

    star.vx += (dx / distSq) * 220;
    star.vy += (dy / distSq) * 220;
    star.vx *= 0.99;
    star.vy *= 0.99;

    star.x += star.vx;
    star.y += star.vy;
    star.angle += star.swirl;

    if (star.x < -20 || star.x > WIDTH + 20 || star.y < -20 || star.y > HEIGHT + 20) {
      const angle = Math.random() * Math.PI * 2;
      star.x = BLACK_HOLE.x + Math.cos(angle) * (50 + Math.random() * 180);
      star.y = BLACK_HOLE.y + Math.sin(angle) * (50 + Math.random() * 120);
      star.vx = (Math.random() - 0.5) * 1.5;
      star.vy = (Math.random() - 0.5) * 1.5;
    }
  }
}

function drawBackground() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const spaceGlow = ctx.createRadialGradient(
    BLACK_HOLE.x,
    BLACK_HOLE.y,
    15,
    BLACK_HOLE.x,
    BLACK_HOLE.y,
    240
  );
  spaceGlow.addColorStop(0, "rgba(255,255,255,0.20)");
  spaceGlow.addColorStop(0.12, "rgba(255,255,255,0.08)");
  spaceGlow.addColorStop(0.28, "rgba(50,50,70,0.16)");
  spaceGlow.addColorStop(1, "rgba(0,0,0,0.96)");
  ctx.fillStyle = spaceGlow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (blackHoleImageLoaded) {
    const imageWidth = 580;
    const imageHeight = 430;
    const imageX = BLACK_HOLE.x - imageWidth / 2;
    const imageY = BLACK_HOLE.y - imageHeight / 2 + 10;

    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.drawImage(blackHoleImage, imageX, imageY, imageWidth, imageHeight);
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(BLACK_HOLE.x, BLACK_HOLE.y);

    const blackHole = ctx.createRadialGradient(0, 0, 10, 0, 0, BLACK_HOLE.radius + 30);
    blackHole.addColorStop(0, "rgba(0,0,0,1)");
    blackHole.addColorStop(0.22, "rgba(0,0,0,0.96)");
    blackHole.addColorStop(0.7, "rgba(10,10,18,0.35)");
    blackHole.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = blackHole;
    ctx.beginPath();
    ctx.arc(0, 0, BLACK_HOLE.radius + 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, BLACK_HOLE.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, BLACK_HOLE.radius + 18, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.stroke();
    ctx.restore();
  }

  for (const star of backgroundStars) {
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function update() {
  updateBackgroundStars();
  movePaddle();

  if (!ballLaunched) {
    ball.x = paddle.x + paddle.width / 2 - ball.width / 2;
    ball.y = paddle.y - ball.height;
  } else {
    moveBall();

    bounceOffWalls();   // collisions.js
    bounceOffPaddle();  // collisions.js
    bounceOffBricks();  // collisions.js

    // The ball fell off the bottom: back to the center.
    if (ball.y > HEIGHT) {
      lives--;
      if (lives === 0) {
        restartGame();
      } else {
        updateLivesDisplay();
        resetBall();
      }
    }
  }
}

function movePaddle() {
  if (keys["arrowleft"] || keys["a"]) {
    paddle.x = paddle.x - paddle.speed;
  }
  if (keys["arrowright"] || keys["d"]) {
    paddle.x = paddle.x + paddle.speed;
  }

  // Keep the paddle on the screen.
  if (paddle.x < 0) {
    paddle.x = 0;
  }
  if (paddle.x + paddle.width > WIDTH) {
    paddle.x = WIDTH - paddle.width;
  }
}

function moveBall() {
  ball.x = ball.x + ball.vx;
  ball.y = ball.y + ball.vy;
}


// ------------------------------------------------------------
// DRAW: paints everything on the canvas. Black background,
// white shapes.
// ------------------------------------------------------------
function draw() {
  drawBackground();

  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.fillRect(ball.x, ball.y, ball.width, ball.height);

  drawBricks();  // bricks.js
}


// ------------------------------------------------------------
// THE GAME LOOP
// The browser calls frame() every time it is ready to draw.
// Some screens are faster than others, so we make sure update()
// always runs exactly 60 times per second on every computer.
// ------------------------------------------------------------
const STEP = 1000 / 60;
let lastTime = 0;
let leftover = 0;

function frame(now) {
  leftover = leftover + (now - lastTime);
  lastTime = now;

  // If the tab was hidden for a while, don't try to catch up.
  if (leftover > 250) {
    leftover = 250;
  }

  while (leftover >= STEP) {
    update();
    leftover = leftover - STEP;
  }

  draw();
  requestAnimationFrame(frame);
}

function start() {
  createBackgroundStars();
  restartGame();
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

// Wait until all three script files have loaded, then start.
window.addEventListener("load", start);
