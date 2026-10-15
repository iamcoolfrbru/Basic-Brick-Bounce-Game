// ============================================================
// BLOCK BREAKER (base game)
//
// game.js  = the canvas, the ball, the paddle, and the game loop
// bricks.js     = where the bricks are and how they are drawn
// collisions.js = what happens when the ball touches things
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const starfieldCanvas = document.getElementById("starfield");
const starfieldCtx = starfieldCanvas.getContext("2d");

const WIDTH = canvas.width;   // 600
const HEIGHT = canvas.height; // 450
const MAX_LIVES = 3;
const livesDisplay = document.getElementById("lives");
const menuOverlay = document.getElementById("menuOverlay");
const startButton = document.getElementById("startButton");
const pauseButton = document.getElementById("pauseButton");
const resumeButton = document.getElementById("resumeButton");
const restartButton = document.getElementById("restartButton");
const startMenuActions = document.getElementById("startMenuActions");
const pauseMenuActions = document.getElementById("pauseMenuActions");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const skinOptionContainers = document.querySelectorAll("[data-skin-options]");
const wallpaperSelect = document.getElementById("wallpaperSelect");
const ballSpeedControl = document.getElementById("ballSpeedControl");
const paddleLengthControl = document.getElementById("paddleLengthControl");
const paddleSpeedControl = document.getElementById("paddleSpeedControl");
const ballSpeedValue = document.getElementById("ballSpeedValue");
const paddleLengthValue = document.getElementById("paddleLengthValue");
const paddleSpeedValue = document.getElementById("paddleSpeedValue");
const backgroundStars = [];
const blackHoleImage = new Image();
let blackHoleImageLoaded = false;
let lives = MAX_LIVES;
let gameRunning = false;
let gamePaused = false;

const settings = {
  wallpaper: "black-hole",
  ballSpeed: 4,
  paddleLength: 90,
  paddleSpeed: 6,
  paddleSkin: "neon",
  ballSkin: "classic",
  brickSkin: "classic"
};

const skinOptions = {
  paddle: [
    { id: "neon", label: "Neon", x: 22, y: 60, width: 230, height: 112 },
    { id: "galaxy", label: "Galaxy", x: 272, y: 60, width: 230, height: 112 },
    { id: "wooden", label: "Wooden", x: 522, y: 60, width: 230, height: 112 },
    { id: "cyber", label: "Cyber", x: 772, y: 60, width: 230, height: 112 },
    { id: "pizza", label: "Pizza", x: 1022, y: 60, width: 230, height: 112 },
    { id: "cat", label: "Cat", x: 1272, y: 60, width: 235, height: 112 }
  ],
  ball: [
    { id: "classic", label: "Classic", x: 30, y: 320, width: 165, height: 155 },
    { id: "fire", label: "Fire", x: 210, y: 320, width: 170, height: 155 },
    { id: "ice", label: "Ice", x: 402, y: 320, width: 170, height: 155 },
    { id: "planet", label: "Planet", x: 590, y: 320, width: 170, height: 155 },
    { id: "disco", label: "Disco", x: 780, y: 320, width: 170, height: 155 },
    { id: "toxic", label: "Toxic", x: 960, y: 320, width: 170, height: 155 },
    { id: "heart", label: "Heart", x: 1150, y: 320, width: 170, height: 155 },
    { id: "moon", label: "Moon", x: 1340, y: 320, width: 170, height: 155 }
  ],
  brick: [
    { id: "classic", label: "Classic", x: 22, y: 620, width: 235, height: 95 },
    { id: "neon", label: "Neon", x: 276, y: 620, width: 235, height: 95 },
    { id: "metal", label: "Metal", x: 530, y: 620, width: 235, height: 95 },
    { id: "glass", label: "Glass", x: 780, y: 620, width: 235, height: 95 },
    { id: "wood", label: "Wood", x: 1028, y: 620, width: 235, height: 95 },
    { id: "stone", label: "Stone", x: 1280, y: 620, width: 235, height: 95 },
    { id: "rainbow", label: "Rainbow", x: 22, y: 770, width: 235, height: 100 },
    { id: "galaxy", label: "Galaxy", x: 276, y: 770, width: 235, height: 100 },
    { id: "leaf", label: "Leaf", x: 530, y: 770, width: 235, height: 100 },
    { id: "lava", label: "Lava", x: 780, y: 770, width: 235, height: 100 },
    { id: "candy", label: "Candy", x: 1028, y: 770, width: 235, height: 100 },
    { id: "pixel", label: "Pixel", x: 1280, y: 770, width: 235, height: 100 }
  ]
};

const skinSheet = new Image();
const transparentSkinSheet = document.createElement("canvas");
let transparentSkinSheetReady = false;
skinSheet.addEventListener("load", function () {
  transparentSkinSheet.width = skinSheet.naturalWidth;
  transparentSkinSheet.height = skinSheet.naturalHeight;
  const sheetContext = transparentSkinSheet.getContext("2d", { willReadFrequently: true });
  sheetContext.drawImage(skinSheet, 0, 0);

  const imageData = sheetContext.getImageData(
    0,
    0,
    transparentSkinSheet.width,
    transparentSkinSheet.height
  );
  for (let index = 0; index < imageData.data.length; index += 4) {
    const red = imageData.data[index];
    const green = imageData.data[index + 1];
    const blue = imageData.data[index + 2];
    if (Math.max(red, green, blue) < 48) {
      imageData.data[index + 3] = 0;
    }
  }
  sheetContext.putImageData(imageData, 0, 0);
  transparentSkinSheetReady = true;
  refreshSkinPreviews();
});
skinSheet.src = "assets/Designer.png";

const wallpaperOptions = [
  {
    id: "black-hole",
    label: "Black Hole",
    src: "assets/wallpapersden.com_sci-fi-black-hole-hd-glowing-space_1920x1080.jpg"
  },
  {
    id: "nebula",
    label: "Nebula",
    src: "assets/wp4816769.jpg"
  },
  {
    id: "crimson",
    label: "Crimson Drift",
    src: "assets/thumb-1920-1007640.jpg"
  },
  {
    id: "midnight",
    label: "Midnight",
    src: "assets/midnight-sunrise-4k-b1.jpg"
  }
];

const wallpapers = {
  "black-hole": {
    glow: "rgba(255,255,255,0.20)",
    dark: "#000000",
    accents: ["#8be9fd", "#c4a7ff"]
  },
  nebula: {
    glow: "rgba(75, 120, 255, 0.20)",
    dark: "#040713",
    accents: ["#a78bfa", "#67e8f9"]
  },
  crimson: {
    glow: "rgba(255, 100, 80, 0.18)",
    dark: "#140606",
    accents: ["#fb7185", "#c084fc"]
  },
  midnight: {
    glow: "rgba(180, 180, 255, 0.16)",
    dark: "#01030b",
    accents: ["#60a5fa", "#a5b4fc"]
  }
};

const wallpaperImages = new Map();

for (const entry of wallpaperOptions) {
  const image = new Image();
  image.src = entry.src;
  wallpaperImages.set(entry.id, image);
}

blackHoleImage.src = wallpaperOptions[0].src;
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
let ballLaunched = false;

const ball = {
  x: 0,
  y: 0,
  width: 20,
  height: 20,
  vx: 0,
  vy: 0
};

// Put the ball on top of the paddle, centered, and wait for launch.
function resetBall() {
  ballLaunched = false;
  ball.x = paddle.x + paddle.width / 2 - ball.width / 2;
  ball.y = paddle.y - ball.height;
  ball.vx = settings.ballSpeed;
  ball.vy = settings.ballSpeed;
}

function launchBall() {
  if (!gameRunning || ballLaunched) {
    return;
  }

  ballLaunched = true;
  ball.vx = settings.ballSpeed * (Math.random() < 0.5 ? -1 : 1);
  ball.vy = -settings.ballSpeed;
}


// ------------------------------------------------------------
// THE PADDLE
// ------------------------------------------------------------
const paddle = {
  x: WIDTH / 2 - 45,
  y: HEIGHT - 42,
  width: 90,
  height: 24,
  speed: 6
};

function applySettings() {
  paddle.width = settings.paddleLength;
  paddle.speed = settings.paddleSpeed;
  ballSpeedValue.textContent = settings.ballSpeed;
  paddleLengthValue.textContent = settings.paddleLength;
  paddleSpeedValue.textContent = settings.paddleSpeed;

  const selectedWallpaper = wallpapers[settings.wallpaper] || wallpapers["black-hole"];

  if (selectedWallpaper) {
    BLACK_HOLE.x = WIDTH * 0.76;
    BLACK_HOLE.y = HEIGHT * 0.45;
  }

  if (paddle.x + paddle.width > WIDTH) {
    paddle.x = WIDTH - paddle.width;
  }

  if (!ballLaunched) {
    ball.x = paddle.x + paddle.width / 2 - ball.width / 2;
    ball.y = paddle.y - ball.height;
  }
}

function drawSkinImage(context, category, skinId, x, y, width, height) {
  const skin = skinOptions[category].find((option) => option.id === skinId);
  if (!skin || !transparentSkinSheetReady) {
    return;
  }

  context.save();
  context.globalCompositeOperation = "screen";
  context.drawImage(
    transparentSkinSheet,
    skin.x,
    skin.y,
    skin.width,
    skin.height,
    x,
    y,
    width,
    height
  );
  context.restore();
}

function drawSkinPreview(context, category, skin) {
  const canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#050a15";
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (!skinSheet.complete || !skinSheet.naturalWidth) {
    return;
  }

  const scale = Math.min(canvas.width / skin.width, canvas.height / skin.height);
  const width = skin.width * scale;
  const height = skin.height * scale;
  drawSkinImage(
    context,
    category,
    skin.id,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height
  );
}

function refreshSkinPreviews() {
  document.querySelectorAll("canvas[data-skin-preview]").forEach((preview) => {
    const category = preview.dataset.skinCategory;
    const skin = skinOptions[category].find((option) => option.id === preview.dataset.skinPreview);
    drawSkinPreview(preview.getContext("2d"), category, skin);
  });
}

function updateSkinOptionStates(category) {
  const container = document.querySelector(`[data-skin-options="${category}"]`);
  container.querySelectorAll(".skin-option").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.skin === settings[`${category}Skin`]));
  });
}

function populateSkinOptions() {
  for (const container of skinOptionContainers) {
    const category = container.dataset.skinOptions;
    for (const skin of skinOptions[category]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "skin-option";
      button.dataset.skin = skin.id;
      button.setAttribute("aria-pressed", String(settings[`${category}Skin`] === skin.id));
      button.setAttribute("aria-label", `${skin.label} ${category} skin`);

      const preview = document.createElement("canvas");
      preview.width = 180;
      preview.height = 64;
      preview.dataset.skinPreview = skin.id;
      preview.dataset.skinCategory = category;
      preview.setAttribute("aria-hidden", "true");
      drawSkinPreview(preview.getContext("2d"), category, skin);

      const label = document.createElement("span");
      label.textContent = skin.label;
      button.append(preview, label);
      button.addEventListener("click", () => {
        settings[`${category}Skin`] = skin.id;
        updateSkinOptionStates(category);
      });
      container.appendChild(button);
    }
  }
  refreshSkinPreviews();
}


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

  if (key === "escape" && !event.repeat) {
    event.preventDefault();
    if (gameRunning) {
      pauseGame();
    } else if (gamePaused) {
      resumeGame();
    }
    return;
  }

  keys[key] = true;

  if (key === "r" && !event.repeat) {
    gamePaused = false;
    gameRunning = true;
    menuOverlay.classList.add("hidden");
    pauseButton.classList.remove("hidden");
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
    backgroundStars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.2 + Math.random() * 0.4,
      size: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.8 + 0.2
    });
  }
}

function updateBackgroundStars() {
  for (const star of backgroundStars) {
    star.y -= star.speed;

    if (star.y + star.size < 0) {
      star.x = Math.random() * window.innerWidth;
      star.y = window.innerHeight + star.size;
    }
  }
}

function resizeBackgroundStars() {
  const pixelRatio = window.devicePixelRatio || 1;
  starfieldCanvas.width = Math.round(window.innerWidth * pixelRatio);
  starfieldCanvas.height = Math.round(window.innerHeight * pixelRatio);
  starfieldCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  createBackgroundStars();
}

function drawBackgroundStars() {
  starfieldCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (const star of backgroundStars) {
    starfieldCtx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    starfieldCtx.beginPath();
    starfieldCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    starfieldCtx.fill();
  }
}

function drawBackgroundImage(image, width, height) {
  if (!image || !image.width) {
    return;
  }

  ctx.drawImage(image, 0, 0, width, height);
}

function drawBackground() {
  const wallpaper = wallpapers[settings.wallpaper] || wallpapers["black-hole"];
  ctx.fillStyle = wallpaper.dark;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const spaceGlow = ctx.createRadialGradient(
    BLACK_HOLE.x,
    BLACK_HOLE.y,
    15,
    BLACK_HOLE.x,
    BLACK_HOLE.y,
    240
  );
  spaceGlow.addColorStop(0, wallpaper.glow);
  spaceGlow.addColorStop(0.12, "rgba(255,255,255,0.08)");
  spaceGlow.addColorStop(0.28, "rgba(50,50,70,0.16)");
  spaceGlow.addColorStop(1, wallpaper.dark);
  ctx.fillStyle = spaceGlow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const selectedWallpaper = wallpaperImages.get(settings.wallpaper) || blackHoleImage;

  if (settings.wallpaper === "black-hole" && blackHoleImageLoaded) {
    ctx.save();
    ctx.globalAlpha = 0.96;
    drawBackgroundImage(blackHoleImage, WIDTH, HEIGHT);
    ctx.restore();
  } else if (selectedWallpaper && selectedWallpaper.width) {
    ctx.save();
    ctx.globalAlpha = 0.72;
    drawBackgroundImage(selectedWallpaper, WIDTH, HEIGHT);
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

}

function getAccentColor(time) {
  const [from, to] = (wallpapers[settings.wallpaper] || wallpapers["black-hole"]).accents;
  const amount = (1 - Math.cos((Math.PI * time) / 4000)) / 2;
  const fromRgb = from.match(/[a-f\d]{2}/gi).map((channel) => parseInt(channel, 16));
  const toRgb = to.match(/[a-f\d]{2}/gi).map((channel) => parseInt(channel, 16));
  const color = fromRgb.map((channel, index) =>
    Math.round(channel + (toRgb[index] - channel) * amount)
  );

  return `rgb(${color.join(",")})`;
}

function update() {
  updateBackgroundStars();

  if (!gameRunning) {
    return;
  }

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
// DRAW: paints the wallpaper and game objects on the canvas.
// ------------------------------------------------------------
function draw(time) {
  drawBackground();

  drawSkinImage(ctx, "paddle", settings.paddleSkin, paddle.x, paddle.y, paddle.width, paddle.height);
  drawSkinImage(ctx, "ball", settings.ballSkin, ball.x, ball.y, ball.width, ball.height);
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

  draw(now);
  drawBackgroundStars();
  requestAnimationFrame(frame);
}

function startMenu() {
  gamePaused = false;
  menuOverlay.classList.remove("hidden");
  gameRunning = false;
  pauseButton.classList.add("hidden");
  startMenuActions.classList.remove("hidden");
  pauseMenuActions.classList.add("hidden");
}

function startGame() {
  gamePaused = false;
  gameRunning = true;
  menuOverlay.classList.add("hidden");
  pauseButton.classList.remove("hidden");
  restartGame();
}

function pauseGame() {
  if (!gameRunning) {
    return;
  }

  gameRunning = false;
  gamePaused = true;
  Object.keys(keys).forEach((key) => {
    keys[key] = false;
  });
  startMenuActions.classList.add("hidden");
  pauseMenuActions.classList.remove("hidden");
  setActiveTab("main");
  menuOverlay.classList.remove("hidden");
  pauseButton.classList.add("hidden");
}

function resumeGame() {
  if (!gamePaused) {
    return;
  }

  gamePaused = false;
  gameRunning = true;
  menuOverlay.classList.add("hidden");
  pauseButton.classList.remove("hidden");
}

function restartPausedGame() {
  gamePaused = false;
  gameRunning = true;
  menuOverlay.classList.add("hidden");
  pauseButton.classList.remove("hidden");
  restartGame();
}

function setActiveTab(tabName) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tabName;
    button.classList.toggle("active", isActive);
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${tabName}Tab`);
  });
}

function populateWallpaperOptions() {
  wallpaperSelect.innerHTML = "";

  for (const option of wallpaperOptions) {
    const newOption = document.createElement("option");
    newOption.value = option.id;
    newOption.textContent = option.label;
    wallpaperSelect.appendChild(newOption);
  }

  wallpaperSelect.value = settings.wallpaper;
}

function bindMenuControls() {
  startButton.addEventListener("click", startGame);
  pauseButton.addEventListener("click", pauseGame);
  resumeButton.addEventListener("click", resumeGame);
  restartButton.addEventListener("click", restartPausedGame);

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => setActiveTab(button.dataset.tab));
  });

  wallpaperSelect.addEventListener("change", function () {
    settings.wallpaper = wallpaperSelect.value;
  });

  ballSpeedControl.addEventListener("input", function () {
    settings.ballSpeed = Number(ballSpeedControl.value);
    ballSpeedValue.textContent = settings.ballSpeed;
  });

  paddleLengthControl.addEventListener("input", function () {
    settings.paddleLength = Number(paddleLengthControl.value);
    paddleLengthValue.textContent = settings.paddleLength;
    paddle.width = settings.paddleLength;
  });

  paddleSpeedControl.addEventListener("input", function () {
    settings.paddleSpeed = Number(paddleSpeedControl.value);
    paddleSpeedValue.textContent = settings.paddleSpeed;
    paddle.speed = settings.paddleSpeed;
  });
}

function start() {
  populateWallpaperOptions();
  populateSkinOptions();
  resizeBackgroundStars();
  window.addEventListener("resize", resizeBackgroundStars);
  applySettings();
  bindMenuControls();
  setActiveTab("main");
  startMenu();
  lastTime = performance.now();
  requestAnimationFrame(frame);
}

// Wait until all three script files have loaded, then start.
window.addEventListener("load", start);
