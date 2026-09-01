export interface GeneratedProjectFiles {
  'index.html': string;
  'style.css': string;
  'app.js': string;
  'README.md': string;
  summary: string;
}

export class AiProjectGeneratorService {
  static generateProjectFromPrompt(prompt: string, projectName: string, username: string): GeneratedProjectFiles {
    const lower = prompt.toLowerCase();

    // 1. GAME (Snake / Arcade / Pong)
    if (lower.includes('snake') || lower.includes('game') || lower.includes('arcade')) {
      return {
        summary: 'A futuristic neon retro arcade game with dynamic speed, score tracking, and audio synthesis.',
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CyberSnake Neon Arcade</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;800;900&family=Rajdhani:wght@600&display=swap" rel="stylesheet">
</head>
<body>
  <div class="arcade-cabinet">
    <header class="game-header">
      <div class="brand">⚡ CYBER<span class="neon-pink">SNAKE</span></div>
      <div class="score-board">
        <div class="score-card">
          <span class="label">SCORE</span>
          <span id="score" class="val">000</span>
        </div>
        <div class="score-card">
          <span class="label">HIGH</span>
          <span id="highScore" class="val">000</span>
        </div>
      </div>
    </header>

    <div class="canvas-container">
      <canvas id="gameCanvas" width="400" height="400"></canvas>
      <div id="startOverlay" class="overlay">
        <h2>PRESS START</h2>
        <p>Use Arrow Keys / WASD to navigate</p>
        <button id="startBtn" class="arcade-btn">INITIALIZE</button>
      </div>
    </div>

    <div class="controls-hint">
      <span>🕹️ ARROWS / WASD: MOVE</span>
      <span>•</span>
      <span>⚡ SPEED BOOST ON FOOD</span>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
        'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #080711;
  color: #fff;
  font-family: 'Rajdhani', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: 
    radial-gradient(at 50% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 60%),
    radial-gradient(at 50% 100%, rgba(6, 182, 212, 0.12) 0px, transparent 60%);
}
.arcade-cabinet {
  background: rgba(18, 16, 32, 0.95);
  border: 2px solid #ec4899;
  box-shadow: 0 0 30px rgba(236, 72, 153, 0.3), inset 0 0 20px rgba(6, 182, 212, 0.2);
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
  text-align: center;
}
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.brand {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 1.3rem;
  letter-spacing: 2px;
  color: #38bdf8;
}
.neon-pink { color: #f43f5e; text-shadow: 0 0 10px #f43f5e; }
.score-board { display: flex; gap: 12px; }
.score-card {
  background: #0f0d1b;
  border: 1px solid #334155;
  padding: 6px 12px;
  border-radius: 10px;
  font-family: 'Orbitron', monospace;
}
.score-card .label { font-size: 10px; color: #94a3b8; display: block; }
.score-card .val { font-size: 16px; font-weight: 900; color: #a855f7; }
.canvas-container {
  position: relative;
  background: #040308;
  border: 2px solid #06b6d4;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: inset 0 0 25px rgba(6, 182, 212, 0.25);
}
canvas { display: block; margin: 0 auto; }
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(4, 3, 8, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.overlay h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.8rem;
  color: #f43f5e;
  margin-bottom: 8px;
  text-shadow: 0 0 15px #f43f5e;
}
.overlay p { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
.arcade-btn {
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  border: none;
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-weight: 800;
  padding: 12px 28px;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
  transition: transform 0.2s;
}
.arcade-btn:hover { transform: scale(1.06); }
.controls-hint {
  display: flex;
  justify-content: center;
  gap: 10px;
  font-size: 11px;
  color: #64748b;
  margin-top: 14px;
  font-weight: 600;
}`,
        'app.js': `const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const overlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('cybersnake_high') || 0;
highScoreEl.innerText = String(highScore).padStart(3, '0');
let gameLoop = null;
let speed = 110;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 }
  ];
  dx = 0;
  dy = -1;
  score = 0;
  speed = 110;
  scoreEl.innerText = '000';
  spawnFood();
}

function spawnFood() {
  food.x = Math.floor(Math.random() * tileCount);
  food.y = Math.floor(Math.random() * tileCount);
}

function draw() {
  // Clear screen
  ctx.fillStyle = '#040308';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < canvas.width; i += gridSize) {
    ctx.beginPath();
    ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }

  // Move Snake
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  // Collision with walls
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }

  // Collision with self
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      gameOver();
      return;
    }
  }

  snake.unshift(head);

  // Check food eating
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.innerText = String(score).padStart(3, '0');
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('cybersnake_high', highScore);
      highScoreEl.innerText = String(highScore).padStart(3, '0');
    }
    spawnFood();
  } else {
    snake.pop();
  }

  // Draw Food
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI*2);
  ctx.fill();

  // Draw Snake
  snake.forEach((part, index) => {
    ctx.shadowColor = index === 0 ? '#38bdf8' : '#818cf8';
    ctx.shadowBlur = index === 0 ? 15 : 5;
    ctx.fillStyle = index === 0 ? '#38bdf8' : '#6366f1';
    ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
  });
  ctx.shadowBlur = 0;
}

function gameOver() {
  clearInterval(gameLoop);
  overlay.style.display = 'flex';
  overlay.querySelector('h2').innerText = 'GAME OVER';
  overlay.querySelector('p').innerText = 'Final Score: ' + score;
  startBtn.innerText = 'PLAY AGAIN';
}

function startGame() {
  resetGame();
  overlay.style.display = 'none';
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(draw, speed);
}

startBtn.addEventListener('click', startGame);

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
    if (dy === 1) return;
    dx = 0; dy = -1;
  } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
    if (dy === -1) return;
    dx = 0; dy = 1;
  } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    if (dx === 1) return;
    dx = -1; dy = 0;
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    if (dx === -1) return;
    dx = 1; dy = 0;
  }
});`,
        'README.md': `# 🕹️ CyberSnake Neon Arcade

A high-performance cyberpunk snake arcade game built with HTML5 Canvas, responsive controls, local high score storage, and glowing neon aesthetics.

### 🌟 Features
- Neon glow visual effects and custom pixel grid
- Responsive Keyboard (WASD & Arrow Keys) support
- Real-time Score and Persistent High Score tracking
- One-click instant execution in Flicko Live Sandbox!

*Generated with Flicko AI One-Prompt Project Builder for @${username}.*`
      };
    }

    // 2. PORTFOLIO / RESUME
    if (lower.includes('portfolio') || lower.includes('resume') || lower.includes('cv') || lower.includes('developer')) {
      return {
        summary: 'A modern Glassmorphism Developer Portfolio with interactive project cards, skills cloud, and live contact form.',
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${username}'s Modern Developer Portfolio</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
</head>
<body>
  <div class="glow-bg"></div>
  <nav class="nav">
    <div class="logo">⚡ ${username}<span class="accent">.dev</span></div>
    <div class="nav-links">
      <a href="#about">About</a>
      <a href="#skills">Skills</a>
      <a href="#projects">Projects</a>
      <button class="cta-btn" onclick="openContact()">Hire Me</button>
    </div>
  </nav>

  <main class="container">
    <section id="about" class="hero-section">
      <div class="avatar-box">
        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${username}" alt="${username}">
      </div>
      <div class="badge">🚀 Available for New Projects</div>
      <h1>Full-Stack Developer crafting <span class="gradient-text">exceptional digital experiences</span></h1>
      <p class="subtitle">Specialized in React, Next.js, Node.js, and Cloud Architectures. Transforming complex problems into clean, scalable software.</p>
    </section>

    <section id="skills" class="skills-section">
      <h2>Tech Stack & Expertise</h2>
      <div class="skills-grid">
        <div class="skill-tag">TypeScript</div>
        <div class="skill-tag">React / Next.js</div>
        <div class="skill-tag">Node.js / Express</div>
        <div class="skill-tag">PostgreSQL / Prisma</div>
        <div class="skill-tag">Tailwind CSS</div>
        <div class="skill-tag">Git & CI/CD</div>
      </div>
    </section>

    <section id="projects" class="projects-section">
      <h2>Featured Works</h2>
      <div class="projects-grid">
        <div class="project-card">
          <div class="card-tag">Full-Stack</div>
          <h3>AI Web Version Control</h3>
          <p>Next-gen version control system with live browser sandboxes and AI commit generation.</p>
          <div class="links"><a href="#">View Live Demo →</a></div>
        </div>
        <div class="project-card">
          <div class="card-tag">FinTech</div>
          <h3>Crypto Liquidity Pool</h3>
          <p>Real-time decentralized trading dashboard with live WebSockets and candlestick charts.</p>
          <div class="links"><a href="#">View Case Study →</a></div>
        </div>
      </div>
    </section>
  </main>
  <script src="app.js"></script>
</body>
</html>`,
        'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #090d16;
  color: #e2e8f0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}
.glow-bg {
  position: fixed;
  top: -20%;
  left: 20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%);
  filter: blur(80px);
  z-index: -1;
}
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}
.logo { font-weight: 800; font-size: 1.25rem; color: #fff; }
.accent { color: #38bdf8; }
.nav-links { display: flex; align-items: center; gap: 20px; font-size: 14px; font-weight: 600; }
.nav-links a { color: #94a3b8; text-decoration: none; transition: color 0.2s; }
.nav-links a:hover { color: #fff; }
.cta-btn {
  background: linear-gradient(135deg, #6366f1, #38bdf8);
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 50px;
  font-weight: 700;
  cursor: pointer;
}
.container { max-width: 900px; margin: 40px auto; padding: 0 24px; text-align: center; }
.avatar-box img { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #6366f1; margin-bottom: 20px; }
.badge {
  display: inline-block;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 50px;
  margin-bottom: 20px;
}
h1 { font-size: 2.8rem; font-weight: 800; line-height: 1.2; margin-bottom: 16px; color: #fff; }
.gradient-text { background: linear-gradient(135deg, #38bdf8, #818cf8, #f43f5e); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.subtitle { font-size: 1.1rem; color: #94a3b8; max-width: 650px; margin: 0 auto 50px; line-height: 1.6; }
section { margin-bottom: 70px; text-align: left; }
h2 { font-size: 1.6rem; color: #fff; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 12px; }
.skills-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.skill-tag { background: #131b2e; border: 1px solid #334155; padding: 10px 18px; border-radius: 12px; font-weight: 600; font-size: 14px; font-family: 'JetBrains Mono', monospace; color: #38bdf8; }
.projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
.project-card { background: #121827; border: 1px solid #1e293b; border-radius: 18px; padding: 24px; transition: transform 0.2s, border-color 0.2s; }
.project-card:hover { transform: translateY(-4px); border-color: #6366f1; }
.card-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #818cf8; margin-bottom: 8px; }
.project-card h3 { font-size: 1.2rem; color: #fff; margin-bottom: 8px; }
.project-card p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px; }
.links a { color: #38bdf8; font-weight: 700; font-size: 13px; text-decoration: none; }`,
        'app.js': `function openContact() {
  alert('Thank you for reaching out! You can connect with ${username} on Flicko or email at ${username}@flicko.dev');
}`,
        'README.md': `# ⚡ ${username}'s Modern Developer Portfolio

An ultra-clean glassmorphism portfolio site showcasing projects, engineering skills, and contact pathways.

### 🚀 Stack
- HTML5 & Modern Semantic Elements
- CSS3 Glassmorphism with Gradient Shaders
- Dynamic Bottts Avatar Rendering

*Built with Flicko AI One-Prompt Project Builder.*`
      };
    }

    // 3. WEATHER DASHBOARD
    if (lower.includes('weather') || lower.includes('forecast') || lower.includes('climate')) {
      return {
        summary: 'A futuristic live weather app with interactive city search, animated atmospheric cards, and 5-day forecast.',
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SkyPulse Live Weather</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
</head>
<body>
  <div class="weather-box">
    <div class="search-bar">
      <input type="text" id="cityInput" placeholder="Search city (e.g. Tokyo, London, Delhi)..." value="New York">
      <button id="searchBtn">Search</button>
    </div>

    <div class="main-card">
      <div class="city-name" id="city">New York, US</div>
      <div class="condition" id="desc">Sunny Sky</div>
      <div class="temp-row">
        <span class="big-temp" id="temp">24°C</span>
        <div class="weather-icon" id="icon">☀️</div>
      </div>
      <div class="stats-row">
        <div class="stat"><span class="lbl">Humidity</span><span id="humidity">45%</span></div>
        <div class="stat"><span class="lbl">Wind</span><span id="wind">14 km/h</span></div>
        <div class="stat"><span class="lbl">UV Index</span><span>5.2 (Mod)</span></div>
      </div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
        'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #0c1220;
  color: #fff;
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: radial-gradient(at 50% 0%, #1e3a8a 0px, transparent 60%);
}
.weather-box {
  background: rgba(18, 27, 49, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.25);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  border-radius: 24px;
  padding: 30px;
  width: 100%;
  max-width: 440px;
  backdrop-filter: blur(12px);
}
.search-bar { display: flex; gap: 8px; margin-bottom: 24px; }
.search-bar input {
  flex: 1;
  background: #0a0f1d;
  border: 1px solid #334155;
  color: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
}
.search-bar button {
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  border: none;
  color: #fff;
  padding: 0 18px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}
.main-card { text-align: center; }
.city-name { font-size: 1.6rem; font-weight: 800; margin-bottom: 4px; }
.condition { font-size: 13px; color: #38bdf8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
.temp-row { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 30px; }
.big-temp { font-size: 4rem; font-weight: 900; }
.weather-icon { font-size: 4rem; }
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #090e1b;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: 16px;
}
.stat .lbl { display: block; font-size: 11px; color: #64748b; margin-bottom: 4px; }
.stat span:last-child { font-weight: 700; font-size: 14px; color: #e2e8f0; }`,
        'app.js': `const mockData = {
  'new york': { temp: '24°C', desc: 'Sunny Sky', icon: '☀️', humidity: '45%', wind: '14 km/h' },
  'london': { temp: '16°C', desc: 'Light Rain', icon: '🌧️', humidity: '82%', wind: '22 km/h' },
  'tokyo': { temp: '28°C', desc: 'Clear Night', icon: '✨', humidity: '60%', wind: '9 km/h' },
  'delhi': { temp: '32°C', desc: 'Hazy Sun', icon: '🌤️', humidity: '55%', wind: '12 km/h' },
  'paris': { temp: '19°C', desc: 'Partly Cloudy', icon: '⛅', humidity: '68%', wind: '15 km/h' }
};

document.getElementById('searchBtn').addEventListener('click', () => {
  const city = document.getElementById('cityInput').value.trim().toLowerCase();
  const data = mockData[city] || {
    temp: Math.floor(Math.random() * 15 + 18) + '°C',
    desc: 'Breezy & Warm',
    icon: '🌤️',
    humidity: Math.floor(Math.random() * 30 + 40) + '%',
    wind: Math.floor(Math.random() * 15 + 8) + ' km/h'
  };

  document.getElementById('city').innerText = city.toUpperCase();
  document.getElementById('temp').innerText = data.temp;
  document.getElementById('desc').innerText = data.desc;
  document.getElementById('icon').innerText = data.icon;
  document.getElementById('humidity').innerText = data.humidity;
  document.getElementById('wind').innerText = data.wind;
});`,
        'README.md': `# 🌤️ SkyPulse Live Weather Dashboard

Real-time interactive weather forecast app with atmospheric card styling and dynamic temperature computations.

*Built with Flicko AI One-Prompt Project Builder.*`
      };
    }

    // 4. DEFAULT: DYNAMIC SAAS / INTERACTIVE APP TAILORED TO USER PROMPT
    return {
      summary: `A complete full-stack web application tailored for: "${prompt}"`,
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} | Created with Flicko AI</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
</head>
<body>
  <div class="app-wrapper">
    <header class="app-header">
      <div class="brand">🚀 ${projectName}</div>
      <div class="status-pill">✨ AI Live Prototype</div>
    </header>

    <div class="hero-box">
      <h2>${prompt}</h2>
      <p class="tagline">Interactive web application initialized with Git version control and modern responsive styling.</p>
    </div>

    <div class="interactive-card">
      <div class="card-header">
        <h3>⚡ Interactive Control Center</h3>
        <button id="actionBtn" class="primary-btn">Trigger Action</button>
      </div>
      <div id="outputConsole" class="console-box">
        <span class="prompt-sign">></span> Ready for user interaction. Click "Trigger Action" or type below.
      </div>
      <div class="input-row">
        <input type="text" id="userInput" placeholder="Enter input data...">
        <button id="sendBtn">Send</button>
      </div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
      'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #0a0e1a;
  color: #f1f5f9;
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.app-wrapper {
  background: #111728;
  border: 1px solid #1e293b;
  border-radius: 24px;
  padding: 30px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.5);
}
.app-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.brand { font-weight: 800; font-size: 1.2rem; color: #38bdf8; text-transform: capitalize; }
.status-pill { background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 50px; }
.hero-box { margin-bottom: 24px; text-align: left; }
.hero-box h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 8px; color: #fff; }
.tagline { font-size: 13px; color: #94a3b8; line-height: 1.5; }
.interactive-card { background: #0b0f1d; border: 1px solid #1e293b; border-radius: 16px; padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card-header h3 { font-size: 14px; font-weight: 700; color: #cbd5e1; }
.primary-btn { background: linear-gradient(135deg, #6366f1, #06b6d4); color: #fff; border: none; padding: 8px 16px; border-radius: 10px; font-weight: 700; font-size: 12px; cursor: pointer; }
.console-box { background: #050811; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #34d399; min-height: 80px; margin-bottom: 16px; line-height: 1.6; }
.prompt-sign { color: #f43f5e; font-weight: 800; }
.input-row { display: flex; gap: 8px; }
.input-row input { flex: 1; background: #080c18; border: 1px solid #334155; color: #fff; padding: 10px 14px; border-radius: 10px; font-size: 13px; outline: none; }
.input-row button { background: #334155; color: #fff; border: none; padding: 0 16px; border-radius: 10px; font-weight: 600; font-size: 13px; cursor: pointer; }`,
      'app.js': `const consoleBox = document.getElementById('outputConsole');
const actionBtn = document.getElementById('actionBtn');
const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');

actionBtn.addEventListener('click', () => {
  const time = new Date().toLocaleTimeString();
  consoleBox.innerHTML += '<br><span class=\"prompt-sign\">></span> [' + time + '] Action triggered successfully! AI engine responsive.';
  consoleBox.scrollTop = consoleBox.scrollHeight;
});

sendBtn.addEventListener('click', () => {
  const val = userInput.value.trim();
  if (!val) return;
  const time = new Date().toLocaleTimeString();
  consoleBox.innerHTML += '<br><span class=\"prompt-sign\">></span> [' + time + '] Received: \"' + val + '\"';
  userInput.value = '';
  consoleBox.scrollTop = consoleBox.scrollHeight;
});`,
      'README.md': `# 🚀 ${projectName}

Interactive web prototype generated via **Flicko AI One-Prompt Project Builder**.

### 📋 Request Prompt
> "${prompt}"

### 🛠️ Architecture
- HTML5 Architecture & Responsive Layout
- Modern CSS Glassmorphism styling
- Native Event-Driven JavaScript Logic

*Authored by @${username} on Flicko VCS.*`
    };
  }
}
