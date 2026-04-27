/* ══════════════════════════════════════════════
   LUMI — AVENTURA EDUCATIVA
   Juego tipo exploración top-down con retos educativos
   ══════════════════════════════════════════════ */

const ADVENTURE_STATE = {
  active: false,
  player: { x: 0, y: 0, direction: 'down' },
  currentZone: 'selva',
  completedChallenges: [],
  currentChallenge: null,
  mission: null,
  xpEarned: 0
};

const ZONES = {
  selva: {
    name: "Selva Mágica 🌴",
    color: "#2D5A27",
    playerColor: "#FFD93D",
    obstacles: ['árbol', 'flor', 'roca'],
    challenges: [
      { id: 'selva_1', type: 'puerta', x: 3, y: 2, question: { q: "¿Cuánto es 5 + 3?", options: ["6", "7", "8", "9"], answer: 2, hint: "Suma simple" } },
      { id: 'selva_2', type: 'rio', x: 5, y: 4, question: { q: "¿Cuánto es 12 - 5?", options: ["5", "6", "7", "8"], answer: 2, hint: "Resta" } },
      { id: 'selva_3', type: 'fogata', x: 7, y: 3, question: { q: "¿Qué necesitan las plantas?", options: ["Sol", "Agua", "Ambas", "Viento"], answer: 2, hint: "Sobre plantas" } }
    ]
  },
  ciudad: {
    name: "Ciudad del Saber 🏙️",
    color: "#4A5568",
    playerColor: "#6C63FF",
    obstacles: ['edificio', 'fuente', 'banco'],
    challenges: [
      { id: 'ciudad_1', type: 'puerta', x: 2, y: 5, question: { q: "¿Cuál es la capital de Colombia?", options: ["Medellín", "Bogotá", "Cali", "Barranquilla"], answer: 1, hint: "Ciudad principal" } },
      { id: 'ciudad_2', type: 'rio', x: 4, y: 3, question: { q: "¿Cuántos días tiene una semana?", options: ["5", "6", "7", "8"], answer: 2, hint: "Días" } },
      { id: 'ciudad_3', type: 'fogata', x: 6, y: 6, question: { q: "¿Quién descubrió América?", options: ["Magallanes", "Colón", "Américo", "Cruz"], answer: 1, hint: "Historia" } }
    ]
  },
  espacio: {
    name: "Galaxia del Conocimiento 🚀",
    color: "#1A1A2E",
    playerColor: "#06D6A0",
    obstacles: ['estrella', 'planeta', 'cometa'],
    challenges: [
      { id: 'espacio_1', type: 'puerta', x: 3, y: 4, question: { q: "¿Qué planeta es el rojo?", options: ["Venus", "Marte", "Júpiter", "Saturno"], answer: 1, hint: "Planetas" } },
      { id: 'espacio_2', type: 'rio', x: 5, y: 2, question: { q: "¿Qué gas respiramos?", options: ["Oxígeno", "Nitrógeno", "Hidrógeno", "CO2"], answer: 0, hint: "Aire" } },
      { id: 'espacio_3', type: 'fogata', x: 4, y: 6, question: { q: "¿Cuántos sentidos tenemos?", options: ["3", "4", "5", "6"], answer: 2, hint: "Sentidos" } }
    ]
  }
};

const OBSTACLE_TYPES = {
  'árbol': { emoji: '🌴', passable: false },
  'flor': { emoji: '🌸', passable: true },
  'roca': { emoji: '🪨', passable: false },
  'edificio': { emoji: '🏢', passable: false },
  'fuente': { emoji: '⛲', passable: true },
  'banco': { emoji: '🪑', passable: true },
  'estrella': { emoji: '⭐', passable: true },
  'planeta': { emoji: '🪐', passable: false },
  'cometa': { emoji: '☄️', passable: true }
};

const CHALLENGE_TYPES = {
  'puerta': { emoji: '🚪', requireCorrect: true, label: "Puerta Mágica" },
  'rio': { emoji: '🌊', requireCorrect: true, label: "Río Encantado" },
  'fogata': { emoji: '🔥', requireCorrect: true, label: "Fogata del Saber" },
  'cofre': { emoji: '📦', requireCorrect: false, label: "Cofre del Tesoro" },
  'templo': { emoji: '🏛️', requireCorrect: false, label: "Templo Final" }
};

const MISSIONS = [
  { id: 'm1', title: "Alcanza el templo", desc: "Llega al templo al final de la aventura", target: 'templo', xp: 100 },
  { id: 'm2', title: "Explorador", desc: "Encuentra 3 fogatas", target: 'fogata', count: 3, xp: 50 },
  { id: 'm3', title: "Viajero", desc: "Cruza 2 ríos", target: 'rio', count: 2, xp: 30 }
];

const ADVENTURE_MAP = {
  width: 10,
  height: 10,
  tileSize: 48
};

let adventureCanvas = null;
let adventureCtx = null;
let adventureLoop = null;

function openAdventure() {
  const overlay = document.getElementById('adventure-overlay');
  overlay.classList.add('show');
  initAdventure();
}

function closeAdventure() {
  const overlay = document.getElementById('adventure-overlay');
  overlay.classList.remove('show');
  if (adventureLoop) {
    cancelAnimationFrame(adventureLoop);
  }
  ADVENTURE_STATE.active = false;
}

function initAdventure() {
  ADVENTURE_STATE.active = true;
  ADVENTURE_STATE.player = { x: 1, y: 1, direction: 'down' };
  ADVENTURE_STATE.currentZone = 'selva';
  ADVENTURE_STATE.completedChallenges = [];
  ADVENTURE_STATE.mission = MISSIONS[0];
  ADVENTURE_STATE.xpEarned = 0;

  const canvas = document.getElementById('adventure-canvas');
  adventureCanvas = canvas;
  adventureCtx = canvas.getContext('2d');
  
  canvas.width = ADVENTURE_MAP.width * ADVENTURE_MAP.tileSize;
  canvas.height = ADVENTURE_MAP.height * ADVENTURE_MAP.tileSize;

  generateMap();
  drawAdventure();
  startAdventureLoop();
  updateAdventureUI();
}

function generateMap() {
  const zone = ZONES[ADVENTURE_STATE.currentZone];
  ADVENTURE_STATE.map = [];

  for (let y = 0; y < ADVENTURE_MAP.height; y++) {
    ADVENTURE_STATE.map[y] = [];
    for (let x = 0; x < ADVENTURE_MAP.width; x++) {
      ADVENTURE_STATE.map[y][x] = { type: 'empty', emoji: '🟩' };
    }
  }

  zone.challenges.forEach(challenge => {
    if (ADVENTURE_STATE.map[challenge.y] && ADVENTURE_STATE.map[challenge.y][challenge.x]) {
      ADVENTURE_STATE.map[challenge.y][challenge.x] = {
        type: 'challenge',
        challengeType: challenge.type,
        challenge: challenge,
        emoji: CHALLENGE_TYPES[challenge.type].emoji
      };
    }
  });

  for (let i = 0; i < 15; i++) {
    const ox = Math.floor(Math.random() * 8) + 1;
    const oy = Math.floor(Math.random() * 8) + 1;
    const obsType = zone.obstacles[Math.floor(Math.random() * zone.obstacles.length)];
    if (ADVENTURE_STATE.map[oy][ox].type === 'empty') {
      ADVENTURE_STATE.map[oy][ox] = {
        type: 'obstacle',
        obstacleType: obsType,
        emoji: OBSTACLE_TYPES[obsType].emoji
      };
    }
  }

  ADVENTURE_STATE.map[ADVENTURE_MAP.height - 2][ADVENTURE_MAP.width - 2] = {
    type: 'templo',
    emoji: '🏛️'
  };
}

function startAdventureLoop() {
  function loop() {
    if (!ADVENTURE_STATE.active) return;
    drawAdventure();
    adventureLoop = requestAnimationFrame(loop);
  }
  adventureLoop = requestAnimationFrame(loop);
}

function drawAdventure() {
  if (!adventureCtx) return;
  
  const zone = ZONES[ADVENTURE_STATE.currentZone];
  const ts = ADVENTURE_MAP.tileSize;

  adventureCtx.fillStyle = zone.color;
  adventureCtx.fillRect(0, 0, adventureCanvas.width, adventureCanvas.height);

  for (let y = 0; y < ADVENTURE_MAP.height; y++) {
    for (let x = 0; x < ADVENTURE_MAP.width; x++) {
      const tile = ADVENTURE_STATE.map[y][x];
      const px = x * ts;
      const py = y * ts;

      if (tile.type === 'obstacle') {
        adventureCtx.fillStyle = 'rgba(0,0,0,0.3)';
        adventureCtx.fillRect(px, py, ts, ts);
        adventureCtx.font = '28px Arial';
        adventureCtx.textAlign = 'center';
        adventureCtx.fillText(tile.emoji, px + ts/2, py + ts/2 + 8);
      } else if (tile.type === 'challenge') {
        const isComplete = ADVENTURE_STATE.completedChallenges.includes(tile.challenge.id);
        adventureCtx.fillStyle = isComplete ? 'rgba(6,214,160,0.3)' : 'rgba(255,215,0,0.3)';
        adventureCtx.fillRect(px, py, ts, ts);
        adventureCtx.font = '28px Arial';
        adventureCtx.textAlign = 'center';
        adventureCtx.fillText(isComplete ? '✅' : tile.emoji, px + ts/2, py + ts/2 + 8);
      } else if (tile.type === 'templo') {
        adventureCtx.fillStyle = 'rgba(108,99,255,0.3)';
        adventureCtx.fillRect(px, py, ts, ts);
        adventureCtx.font = '28px Arial';
        adventureCtx.textAlign = 'center';
        adventureCtx.fillText(tile.emoji, px + ts/2, py + ts/2 + 8);
      }
    }
  }

  const player = ADVENTURE_STATE.player;
  const ppx = player.x * ts + ts/2;
  const ppy = player.y * ts + ts/2;

  adventureCtx.fillStyle = zone.playerColor;
  adventureCtx.beginPath();
  adventureCtx.arc(ppx, ppy, ts/3, 0, Math.PI * 2);
  adventureCtx.fill();

  adventureCtx.strokeStyle = '#fff';
  adventureCtx.lineWidth = 2;
  adventureCtx.beginPath();
  adventureCtx.arc(ppx, ppy, ts/3, 0, Math.PI * 2);
  adventureCtx.stroke();
}

function movePlayer(dx, dy) {
  if (!ADVENTURE_STATE.active) return;
  
  const newX = ADVENTURE_STATE.player.x + dx;
  const newY = ADVENTURE_STATE.player.y + dy;

  if (newX < 0 || newX >= ADVENTURE_MAP.width || newY < 0 || newY >= ADVENTURE_MAP.height) {
    return;
  }

  const tile = ADVENTURE_STATE.map[newY][newX];

  if (tile.type === 'obstacle' && !OBSTACLE_TYPES[tile.obstacleType].passable) {
    return;
  }

  if (tile.type === 'challenge') {
    const isComplete = ADVENTURE_STATE.completedChallenges.includes(tile.challenge.id);
    if (!isComplete) {
      showChallengeModal(tile.challenge);
      return;
    }
  }

  if (tile.type === 'templo') {
    completeMission();
    return;
  }

  ADVENTURE_STATE.player.x = newX;
  ADVENTURE_STATE.player.y = newY;
  
  if (dx > 0) ADVENTURE_STATE.player.direction = 'right';
  else if (dx < 0) ADVENTURE_STATE.player.direction = 'left';
  else if (dy > 0) ADVENTURE_STATE.player.direction = 'down';
  else if (dy < 0) ADVENTURE_STATE.player.direction = 'up';
}

function showChallengeModal(challenge) {
  const modal = document.getElementById('challenge-modal');
  const q = challenge.question;
  
  document.getElementById('challenge-title').textContent = CHALLENGE_TYPES[challenge.type].label + " " + CHALLENGE_TYPES[challenge.type].emoji;
  document.getElementById('challenge-question').textContent = q.q;
  document.getElementById('challenge-hint').textContent = "💡 " + q.hint;
  
  const optionsContainer = document.getElementById('challenge-options');
  optionsContainer.innerHTML = '';
  
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'challenge-option-btn';
    btn.textContent = ['A', 'B', 'C', 'D'][idx] + ') ' + opt;
    btn.onclick = () => answerChallenge(challenge, idx);
    optionsContainer.appendChild(btn);
  });

  modal.classList.add('show');
  ADVENTURE_STATE.currentChallenge = challenge;
}

function answerChallenge(challenge, selectedIdx) {
  const correctIdx = challenge.question.answer;
  const isCorrect = selectedIdx === correctIdx;
  
  const buttons = document.querySelectorAll('.challenge-option-btn');
  buttons.forEach(btn => btn.disabled = true);
  buttons[correctIdx].classList.add('correct');
  
  const modal = document.getElementById('challenge-result');
  const titleEl = document.getElementById('challenge-result-title');
  const descEl = document.getElementById('challenge-result-desc');
  
if (isCorrect) {
    titleEl.textContent = "¡Correcto!";
    document.getElementById('challenge-result-emoji').textContent = "🎉";
    descEl.textContent = "¡Puedes continuar!";
    ADVENTURE_STATE.completedChallenges.push(challenge.id);
    ADVENTURE_STATE.xpEarned += 20;
    addXP(20);
    
    updateMissionProgress(challenge.type);
  } else {
    titleEl.textContent = "¡Casi!";
    document.getElementById('challenge-result-emoji').textContent = "💪";
    descEl.textContent = "Intenta de nuevo, tú puedes!";
    buttons[selectedIdx].classList.add('wrong');
  }
  
  document.getElementById('challenge-result').classList.add('show');
  
  setTimeout(() => {
    document.getElementById('challenge-modal').classList.remove('show');
    document.getElementById('challenge-result').classList.remove('show');
    ADVENTURE_STATE.currentChallenge = null;
    drawAdventure();
    updateAdventureUI();
  }, 1500);
}

function updateMissionProgress(type) {
  if (!ADVENTURE_STATE.mission) return;
  
  const mission = ADVENTURE_STATE.mission;
  if (mission.target === type || mission.target === 'templo') {
    if (!ADVENTURE_STATE.missionProgress) ADVENTURE_STATE.missionProgress = 0;
    ADVENTURE_STATE.missionProgress++;
    
    if (mission.count && ADVENTURE_STATE.missionProgress >= mission.count) {
      completeMission();
    }
  }
}

function completeMission() {
  if (ADVENTURE_STATE.mission) {
    addXP(ADVENTURE_STATE.mission.xp);
    ADVENTURE_STATE.xpEarned += ADVENTURE_STATE.mission.xp;
    showReward(ADVENTURE_STATE.mission.emoji || "🏆", "¡Misión Completada!", ADVENTURE_STATE.mission.title);
    celebrateAvatar();
  }
}

function updateAdventureUI() {
  const zone = ZONES[ADVENTURE_STATE.currentZone];
  document.getElementById('adventure-zone-name').textContent = zone.name;
  document.getElementById('adventure-xp').textContent = "+" + ADVENTURE_STATE.xpEarned + " XP";
  
  if (ADVENTURE_STATE.mission) {
    document.getElementById('adventure-mission').textContent = "🎯 " + ADVENTURE_STATE.mission.title;
  }
}

function selectZone(zoneKey) {
  ADVENTURE_STATE.currentZone = zoneKey;
  ADVENTURE_STATE.player = { x: 1, y: 1, direction: 'down' };
  ADVENTURE_STATE.completedChallenges = [];
  ADVENTURE_STATE.xpEarned = 0;
  generateMap();
  updateAdventureUI();
}

document.addEventListener('keydown', (e) => {
  if (!ADVENTURE_STATE.active) return;
  
  switch(e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      movePlayer(0, -1);
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      movePlayer(0, 1);
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      movePlayer(-1, 0);
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      movePlayer(1, 0);
      break;
    case 'Escape':
      closeAdventure();
      break;
  }
});