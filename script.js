const SCRIPT_URL = "URL_WEB_APP_GOOGLE_SCRIPT_ANDA";

// DOM Elements
const menuScreen = document.getElementById("menu-screen");
const gameScreen = document.getElementById("game-screen");
const overScreen = document.getElementById("over-screen");
const leaderboardScreen = document.getElementById("leaderboard-screen");

const startForm = document.getElementById("start-form");
const usernameInput = document.getElementById("username");
const waInput = document.getElementById("wa");

const currentScoreDisplay = document.getElementById("current-score");
const livesDisplay = document.getElementById("lives-display");
const finalScoreDisplay = document.getElementById("final-score");
const leaderboardList = document.getElementById("leaderboard-list");

const btnMenuLeaderboard = document.getElementById("btn-menu-leaderboard");
const btnOverLeaderboard = document.getElementById("btn-over-leaderboard");
const btnBackMenu = document.getElementById("btn-back-menu");
const btnRestart = document.getElementById("btn-restart");
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// State Global
let playerInfo = { username: "", wa: "" };
let gameLoopId = null;
let isGameOver = false;
let score = 0;
let lives = 3;

// Objek Game
let jet = { x: 145, y: 320, width: 50, height: 20, speed: 6 };
let items = [];
let spawnTimer = 0;

let moveLeft = false;
let moveRight = false;

// Event Controls Keyboard
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft = true;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight = true;
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") moveLeft = false;
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") moveRight = false;
});

// Controls Tombol Layar Sentuh
function bindControl(btn, dir) {
  const start = (e) => { e.preventDefault(); if (dir === "L") moveLeft = true; else moveRight = true; };
  const stop = (e) => { e.preventDefault(); if (dir === "L") moveLeft = false; else moveRight = false; };
  
  btn.addEventListener("mousedown", start);
  btn.addEventListener("mouseup", stop);
  btn.addEventListener("touchstart", start);
  btn.addEventListener("touchend", stop);
}
bindControl(btnLeft, "L");
bindControl(btnRight, "R");

// Submit Form Registration
startForm.addEventListener("submit", (e) => {
  e.preventDefault();
  playerInfo.username = usernameInput.value.trim();
  playerInfo.wa = waInput.value.trim();

  if (playerInfo.username && playerInfo.wa) {
    menuScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    initGame();
  }
});

// Navigation Handlers
function openLeaderboard() {
  menuScreen.classList.add("hidden");
  overScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");
  fetchLeaderboard();
}

btnMenuLeaderboard.addEventListener("click", openLeaderboard);
btnOverLeaderboard.addEventListener("click", openLeaderboard);
btnBackMenu.addEventListener("click", () => {
  leaderboardScreen.classList.add("hidden");
  menuScreen.classList.remove("hidden");
});
btnRestart.addEventListener("click", () => {
  overScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  initGame();
});

// Init Game Loop
function initGame() {
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
    gameLoopId = null;
  }

  isGameOver = false;
  score = 0;
  lives = 3;
  items = [];
  spawnTimer = 0;
  moveLeft = false;
  moveRight = false;

  jet.x = (canvas.width - jet.width) / 2;
  currentScoreDisplay.textContent = "0";
  updateLivesDisplay();

  gameLoop();
}

function updateLivesDisplay() {
  let hearts = "";
  for (let i = 0; i < lives; i++) hearts += "❤️";
  livesDisplay.textContent = hearts || "🖤";
}

function spawnItem() {
  let isEnemy = Math.random() < 0.35; // 35% peluang musuh (awan petir)
  items.push({
    x: Math.random() * (canvas.width - 30) + 15,
    y: -20,
    radius: isEnemy ? 14 : 10,
    type: isEnemy ? "enemy" : "star",
    speed: Math.random() * 1.5 + (isEnemy ? 3 : 2.5)
  });
}

function update() {
  if (isGameOver) return;

  // Pergerakan Jet
  if (moveLeft && jet.x > 0) jet.x -= jet.speed;
  if (moveRight && jet.x + jet.width < canvas.width) jet.x += jet.speed;

  // Spawning Items
  spawnTimer++;
  if (spawnTimer > 40) {
    spawnItem();
    spawnTimer = 0;
  }

  // Update Item Position & Collisions
  for (let i = items.length - 1; i >= 0; i--) {
    let item = items[i];
    item.y += item.speed;

    // Collision Detection (Jet & Item)
    if (
      item.y + item.radius >= jet.y &&
      item.y - item.radius <= jet.y + jet.height &&
      item.x >= jet.x &&
      item.x <= jet.x + jet.width
    ) {
      if (item.type === "star") {
        score += 10;
        currentScoreDisplay.textContent = score;
      } else if (item.type === "enemy") {
        lives--;
        updateLivesDisplay();
        if (lives <= 0) {
          gameOver();
          return;
        }
      }
      items.splice(i, 1);
      continue;
    }

    // Hapus jika lewat bawah
    if (item.y - item.radius > canvas.height) {
      items.splice(i, 1);
    }
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Gambar Jet (Player)
  ctx.fillStyle = "#06b6d4";
  ctx.fillRect(jet.x, jet.y, jet.width, jet.height);
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(jet.x + 15, jet.y - 8, 20, 8); // Moncong pesawat

  // Gambar Items (Bintang & Musuh)
  items.forEach((item) => {
    ctx.beginPath();
    ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
    if (item.type === "star") {
      ctx.fillStyle = "#f59e0b"; // Bintang Emas
    } else {
      ctx.fillStyle = "#ef4444"; // Musuh Merah
    }
    ctx.fill();
  });
}

function gameLoop() {
  if (isGameOver) return;

  update();
  render();

  if (!isGameOver) {
    gameLoopId = requestAnimationFrame(gameLoop);
  }
}

function gameOver() {
  isGameOver = true;
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
    gameLoopId = null;
  }

  finalScoreDisplay.textContent = score;

  gameScreen.classList.add("hidden");
  overScreen.classList.remove("hidden");

  saveScore(score);
}

// Database Services (Google Sheets)
function saveScore(scoreValue) {
  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "saveScore",
      username: playerInfo.username,
      wa: playerInfo.wa,
      score: scoreValue
    })
  }).catch((err) => console.error("Gagal menyimpan:", err));
}

function fetchLeaderboard() {
  leaderboardList.innerHTML = '<li class="loading">Memuat data leaderboard...</li>';

  fetch(SCRIPT_URL)
    .then((res) => res.json())
    .then((data) => {
      leaderboardList.innerHTML = "";
      if (!data || data.length === 0) {
        leaderboardList.innerHTML = '<li class="loading">Belum ada skor tercatatkan.</li>';
        return;
      }

      data.forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = `${entry.username} — ${entry.score} Poin`;
        leaderboardList.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Gagal mengambil leaderboard:", err);
      leaderboardList.innerHTML = '<li class="loading">Gagal memuat leaderboard.</li>';
    });
    }
    
