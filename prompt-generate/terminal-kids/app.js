/* ══════════════════════════════════════════════
   LUMI — AGENTE EDUCATIVO INTELIGENTE
   app.js — Lógica principal
   ══════════════════════════════════════════════ */

// ══════════════════════════════════════════════
// ESTADO GLOBAL
// ══════════════════════════════════════════════
const STATE = {
  studentName: "",
  age: null,
  subject: "",
  points: 0,
  level: 1,
  xp: 0,
  conversationHistory: [],
  topicsCovered: [],
  achievements: [],
  isLoading: false,
  voiceEnabled: false,
  isRecording: false,
  recognition: null,
  synth: window.speechSynthesis || null,
  weakTopics: {},
  sessionStartTime: Date.now(),
  gameMode: "normal", // "normal" | "profesor"
};

// ══════════════════════════════════════════════
// CONFIGURACIÓN  ← SOLO CAMBIA TU API KEY AQUÍ
// ══════════════════════════════════════════════

// ══════════════════════════════════════════════
// NIVELES Y GAMIFICACIÓN
// ══════════════════════════════════════════════
const LEVELS = [
  { level: 1, name: "Semilla",      icon: "🌱", minXP: 0,   maxXP: 100 },
  { level: 2, name: "Brote",        icon: "🌿", minXP: 100, maxXP: 250 },
  { level: 3, name: "Explorador",   icon: "🔭", minXP: 250, maxXP: 500 },
  { level: 4, name: "Pensador",     icon: "💭", minXP: 500, maxXP: 800 },
  { level: 5, name: "Estrella",     icon: "⭐", minXP: 800, maxXP: 1200 },
  { level: 6, name: "Genio",        icon: "🧠", minXP: 1200, maxXP: 2000 },
  { level: 7, name: "Maestro",      icon: "🏆", minXP: 2000, maxXP: 9999 }
];

const ACHIEVEMENTS_DEF = [
  { id: "first_question", icon: "❓", name: "Primera Pregunta", desc: "¡Hiciste tu primera pregunta!", xp: 10 },
  { id: "five_correct",   icon: "✅", name: "¡5 Respuestas!", desc: "Respondiste 5 preguntas correctas", xp: 30 },
  { id: "explorer",       icon: "🔭", name: "Explorador",  desc: "Estudiaste 3 materias diferentes", xp: 50 },
  { id: "star_student",   icon: "🌟", name: "Super Estudiante", desc: "Ganaste 200 puntos", xp: 80 },
  { id: "math_wiz",       icon: "🔢", name: "Matemático",  desc: "Completaste 10 ejercicios de matemáticas", xp: 60 },
  { id: "scientist",      icon: "🔬", name: "Científico",  desc: "Exploraste ciencias naturales", xp: 40 },
  { id: "teacher_star",   icon: "🧠", name: "Profesor Estelar", desc: "Diste una explicación excelente", xp: 50 }
];

// ══════════════════════════════════════════════
// PERSONALIDAD Y PROMPTS
// ══════════════════════════════════════════════
function buildSystemPrompt() {
  const ageGroup = STATE.age <= 8 ? "muy pequeño (6-8 años)" :
                   STATE.age <= 11 ? "niño de primaria (9-11 años)" :
                   STATE.age <= 14 ? "estudiante de secundaria (12-14 años)" :
                   "adolescente avanzado (15+ años)";

  const complexityLevel = STATE.age <= 8 ? "muy simples, con palabras cortas y muchos emojis" :
                          STATE.age <= 11 ? "simples pero completas, con ejemplos cotidianos y emojis" :
                          STATE.age <= 14 ? "claras y detalladas, con ejemplos relevantes" :
                          "detalladas y con terminología académica apropiada";

  let modeInstruction = "";
  if (STATE.gameMode === "profesor") {
    modeInstruction = `
⚠️ MODO PROFESOR INVERTIDO ACTIVADO:
El estudiante ahora es el profesor. Debes:
1. Pedirle que explique un concepto
2. Evaluar su explicación con cariño
3. Reforzar lo que explicó bien: "¡Muy bien!" / "¡Excelente explicación!"
4. Mejorar suavemente lo que falte: "¡Casi! Podrías agregar que..."
5. Nunca decir "incorrecto" o "mal"
6. Otorgar puntos según calidad (10, 20 o 30 XP)
7. Hacer una pregunta de seguimiento al final

EVALÚA LA CALIDAD ASÍ:
- Explicación básica (10 XP): Explica el concepto pero sin ejemplos
- Explicación buena (20 XP): Explica con ejemplos o analogías
- Explicación excelente (30 XP): Explica con ejemplos Y hace referencia a casos reales
`;
  }

  return `Eres Lumi, un tutor educativo amigable para niños. Responde SIEMPRE en español. Sé breve y claro.

PERFIL DEL ESTUDIANTE:
- Nombre: ${STATE.studentName}
- Edad: ${STATE.age} años (${ageGroup})
- Materia actual: ${STATE.subject}
- Temas ya vistos: ${STATE.topicsCovered.slice(-5).join(", ") || "ninguno aún"}
- Nivel actual: ${LEVELS[STATE.level - 1]?.name || "Semilla"}
- Modo actual: ${STATE.gameMode === "profesor" ? "Profesor Invertido 🧠" : "Normal"}

PERSONALIDAD:
✅ Usar el nombre del estudiante de vez en cuando
✅ Usar emojis relevantes
✅ Celebrar logros: "¡Excelente!" / "¡Lo lograste!" / "¡Correcto!"
✅ Si se equivoca: "¡Casi! Intentemos juntos..." (nunca decir "Incorrecto")
✅ Frases motivadoras: "¡Vamos paso a paso!" / "¡Tú puedes!"
✅ Analogías de la vida cotidiana

FORMATO:
- Pasos numerados: 1️⃣ 2️⃣ 3️⃣
- Fórmulas entre [FORMULA] y [/FORMULA]
- Ejemplos entre [EJEMPLO] y [/EJEMPLO]
- Ejercicios terminan con ❓
- Respuestas ${complexityLevel}
- MÁXIMO 3 párrafos cortos (esto es MUY importante para ser claro)

${modeInstruction}

Materia: ${STATE.subject} | Edad: ${STATE.age} años`;
}

// ══════════════════════════════════════════════
// INICIALIZACIÓN
// ══════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  setupAgeButtons();
  setupSubjectButtons();
  loadFromLocalStorage();
  setupEyeTracking();
  initFloatingAvatar();
});

function setupAgeButtons() {
  document.querySelectorAll(".age-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".age-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      STATE.age = parseInt(btn.dataset.age) || 17;
    });
  });
}

function setupSubjectButtons() {
  document.querySelectorAll(".subject-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subject-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      STATE.subject = btn.dataset.subject;
    });
  });
}

// ══════════════════════════════════════════════
// INICIO DE SESIÓN
// ══════════════════════════════════════════════
function startSession() {
  const nameInput = document.getElementById("student-name").value.trim();
  
  if (!nameInput) {
    shakeElement("student-name");
    showToast("¡Dinos tu nombre primero! 😊");
    return;
  }
  if (!STATE.age) {
    showToast("¡Elige tu edad para continuar! 🎂");
    return;
  }
  if (!STATE.subject) {
    showToast("¡Selecciona qué quieres aprender! 📚");
    return;
  }

  STATE.studentName = nameInput;
  
  document.getElementById("welcome-screen").classList.remove("active");
  document.getElementById("chat-screen").classList.add("active");
  
  updateSidebarInfo();
  updatePointsDisplay();
  
  setTimeout(() => sendWelcomeMessage(), 300);
  
  saveToLocalStorage();
}

function sendWelcomeMessage() {
  const subjectEmojis = {
    "matemáticas": "🔢", "ciencias naturales": "🌿", "sociales": "🌍",
    "español": "📖", "inglés": "🗣️", "religión": "✝️"
  };
  const emoji = subjectEmojis[STATE.subject] || "📚";
  
  const greetings = [
    `¡Hola, <strong>${STATE.studentName}</strong>! 🎉 Soy <strong>Lumi</strong> y estoy súper emocionado de aprender contigo hoy.\n\nVeo que quieres estudiar <strong>${emoji} ${STATE.subject}</strong>. ¡Excelente elección!\n\n¿Por dónde quieres empezar? Puedes preguntarme sobre cualquier tema, pedirme que te explique algo, o que te ponga un ejercicio. ¡Tú decides! 🚀`,
    `¡Bienvenido, <strong>${STATE.studentName}</strong>! ✨ Me alegra mucho verte aquí. Hoy vamos a explorar el fascinante mundo de <strong>${emoji} ${STATE.subject}</strong> juntos.\n\n¿Hay algún tema específico que quieras entender mejor, o empezamos desde el principio? 😊`,
    `¡Hola <strong>${STATE.studentName}</strong>! 🌟 Prepárate para una aventura de aprendizaje increíble. Hoy nuestro tema es <strong>${emoji} ${STATE.subject}</strong>.\n\nRecuerda: no hay preguntas tontas. ¡Estoy aquí para ti! 💪`
  ];
  
  const msg = greetings[Math.floor(Math.random() * greetings.length)];
  addMessage("lumi", msg);
  
  if (STATE.voiceEnabled) speakText(msg.replace(/<[^>]*>/g, ""));
  setAvatarMood("happy");
}

// ══════════════════════════════════════════════
// ENVÍO DE MENSAJES
// ══════════════════════════════════════════════
async function sendMessage() {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if (!text || STATE.isLoading) return;
  
  input.value = "";
  autoResize(input);
  
  // Detectar comandos para activar modo profesor
  if (isTeacherModeCommand(text)) {
    if (STATE.gameMode === "profesor") {
      deactivateTeacherMode();
    } else {
      activateTeacherMode();
    }
    return;
  }
  
  addMessage("user", text);
  
  // En modo profesor no dar XP por pregunta básica
  if (STATE.gameMode !== "profesor") {
    addXP(5);
  }
  
  if (STATE.conversationHistory.length === 1 && STATE.gameMode !== "profesor") {
    unlockAchievement("first_question");
  }
  
  await getAIResponse(text);
}

function sendSuggestion(btn) {
  const text = btn.textContent.trim();
  document.getElementById("chat-input").value = text;
  sendMessage();
}

function handleKeyDown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function quickSubject(subject) {
  STATE.subject = subject;
  document.getElementById("sidebar-subject").textContent = getSubjectEmoji(subject) + " " + subject;
  const msg = `📚 Cambiamos a <strong>${STATE.subject}</strong>. ¡Perfecto, ${STATE.studentName}! ¿Qué quieres aprender sobre este tema? 🚀`;
  addMessage("lumi", msg);
  if (STATE.voiceEnabled) speakText(`Cambiamos a ${STATE.subject}. ¡Perfecto! ¿Qué quieres aprender?`);
}

// ══════════════════════════════════════════════
// LLAMADA DIRECTA A GROQ API
// ══════════════════════════════════════════════
const LOADING_MESSAGES = [
  "💭 Pensando...",
  "📚 Buscando información...",
  "🧠 Analizando tu pregunta...",
  "✨ Construyendo respuesta...",
  "🎯 Dando en el punto..."
];

let loadingInterval = null;

function startLoadingAnimation() {
  let idx = 0;
  updateStatus(LOADING_MESSAGES[0]);
  loadingInterval = setInterval(() => {
    idx = (idx + 1) % LOADING_MESSAGES.length;
    updateStatus(LOADING_MESSAGES[idx]);
  }, 2000);
}

function stopLoadingAnimation() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    loadingInterval = null;
  }
}

async function getAIResponse(userMessage) {
  STATE.isLoading = true;
  setAvatarMood("thinking");
  updateStatus("💭 Pensando...");
  
  const typingId = showTypingIndicator();
  startLoadingAnimation();
  
  // Agregar al historial
  STATE.conversationHistory.push({ role: "user", content: userMessage });

  // ── CLAVE: enviamos solo los últimos 6 mensajes (3 intercambios)
  // Esto evita que el modelo se confunda con contexto viejo y responde más rápido
  const recentHistory = STATE.conversationHistory.slice(-6);

  // Detectar si es la primera pregunta en modo profesor (pedir tema)
  const isFirstTeacherQuestion = STATE.gameMode === "profesor" && STATE.conversationHistory.length <= 2;

  try {
   const response = await fetch("https://cr1085-github-io.vercel.app/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: userMessage,
      history: recentHistory,
      systemPrompt: buildSystemPrompt()
    })
});
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Groq API Error ${response.status}: ${errData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    let aiText = data.choices?.[0]?.message?.content || "Lo siento, tuve un problema. ¡Intenta de nuevo! 😊";
    
    // En modo profesor, analizar calidad y agregar奖励
    if (STATE.gameMode === "profesor" && !isFirstTeacherQuestion && userMessage.length > 20) {
      const quality = evaluateExplanation(userMessage);
      aiText += `\n\n🎯 <strong>Puntuación: +${quality.xp} XP</strong>`;
      addXP(quality.xp);
      
      // Notificar por logro
      if (quality.level === "excelente") {
        unlockAchievement("teacher_star");
      }
    }
    
    // Guardar respuesta en historial
    STATE.conversationHistory.push({ role: "assistant", content: aiText });
    
    // Limpiar historial si crece demasiado (mantener solo últimos 20)
    if (STATE.conversationHistory.length > 20) {
      STATE.conversationHistory = STATE.conversationHistory.slice(-20);
    }
    
    removeTypingIndicator(typingId);
    stopLoadingAnimation();
    
    const formattedText = formatAIResponse(aiText);
    addMessage("lumi", formattedText);
    
    if (STATE.voiceEnabled) {
      speakText(aiText.replace(/<[^>]*>/g, "").substring(0, 300));
    }
    
    analyzeResponseForRewards(aiText, userMessage);
    extractTopics(userMessage + " " + aiText);
    
    setAvatarMood("happy");
    updateStatus("✨ Listo para aprender");
    
  } catch (error) {
    removeTypingIndicator(typingId);
    stopLoadingAnimation();
    console.error("Error al consultar Groq:", error);
    
    const fallback = getFallbackResponse(userMessage);
    addMessage("lumi", fallback);
    setAvatarMood("happy");
    updateStatus("✨ Listo para aprender");
    
    // Mostrar ayuda si la key no está configurada
    // DESPUÉS - mensaje de error genérico sin mencionar la key:
if (error.message.includes("401") || error.message.includes("403")) {
  setTimeout(() => {
    addMessage("lumi", `⚠️ Hubo un problema de autenticación con el servidor. Contacta al administrador.`);
  }, 800);
}
  } finally {
    STATE.isLoading = false;
  }
}

// ══════════════════════════════════════════════
// RESPUESTAS DE FALLBACK (sin API)
// ══════════════════════════════════════════════
const FALLBACK_RESPONSES = {
  "matemáticas": [
    `¡Las matemáticas son como un superpoder! 🔢✨\n\nVamos paso a paso:\n\n1️⃣ Primero entendemos el concepto\n2️⃣ Vemos un ejemplo real\n3️⃣ ¡Practicamos juntos!\n\n¿Sobre qué tema quieres aprender? ¿Sumas, multiplicaciones, fracciones...? 🤔`,
    `¡Las matemáticas son divertidas! 🎯\n\n[EJEMPLO] Si tienes 5 manzanas 🍎 y te dan 3 más, ¿cuántas tienes? ¡Exacto, 8! [/EJEMPLO]\n\n¿Qué operación quieres practicar? ❓`
  ],
  "ciencias naturales": [
    `¡Las ciencias naturales son increíbles! 🌿🔬\n\nEstudiamos todo lo que nos rodea:\n- 🌱 Las plantas y los animales\n- 🌍 El planeta Tierra\n- ⚡ La energía y la materia\n\n¿Qué parte te genera más curiosidad? 🤔`
  ],
  "sociales": [
    `¡Las ciencias sociales nos ayudan a entender el mundo! 🌍\n\nAprendemos sobre:\n- 📜 La historia\n- 🗺️ La geografía\n- 👥 Cómo vivimos en sociedad\n\n¿Qué tema quieres explorar hoy? 🚀`
  ],
  "default": [
    `¡Estoy aquí para ayudarte a aprender! 📚✨\n\nPuedo explicarte cualquier tema escolar de forma sencilla y divertida. ¿Por dónde empezamos? 💪`,
    `¡Qué buena pregunta! 🌟 Me encanta tu curiosidad. Vamos a explorar ese tema juntos, paso a paso. ¡Tú decides por dónde empezar! 🎯`
  ]
};

function getFallbackResponse(userMsg) {
  const subject = STATE.subject || "default";
  const responses = FALLBACK_RESPONSES[subject] || FALLBACK_RESPONSES["default"];
  return responses[Math.floor(Math.random() * responses.length)];
}

// ══════════════════════════════════════════════
// FORMATO DE RESPUESTAS
// ══════════════════════════════════════════════
function formatAIResponse(text) {
  return text
    .replace(/\[FORMULA\](.*?)\[\/FORMULA\]/gs, '<div class="math-formula">$1</div>')
    .replace(/\[EJEMPLO\](.*?)\[\/EJEMPLO\]/gs, '<div class="highlight">💡 <strong>Ejemplo:</strong> $1</div>')
    .replace(/^(\d+[.)])(.+)/gm, '<div class="step-box">$1$2</div>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// ══════════════════════════════════════════════
// UI: MENSAJES
// ══════════════════════════════════════════════
function addMessage(role, text) {
  const container = document.getElementById("messages-container");
  
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;
  
  const now = new Date();
  const timeStr = now.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  
  const icon = role === "lumi" ? "✨" : "👤";
  
  wrapper.innerHTML = `
    <div class="message-icon">${icon}</div>
    <div>
      <div class="message-bubble">${text}</div>
      <div class="message-time">${timeStr}</div>
    </div>
  `;
  
  container.appendChild(wrapper);
  scrollToBottom();
  saveConversationToStorage();
}

function showTypingIndicator() {
  const container = document.getElementById("messages-container");
  const id = "typing-" + Date.now();
  const el = document.createElement("div");
  el.className = "message lumi";
  el.id = id;
  el.innerHTML = `
    <div class="message-icon">🧠</div>
    <div class="typing-indicator">
      <div class="typing-content">
        <span class="typing-text">Lumi está pensando...</span>
        <div class="progress-timer">
          <div class="progress-timer-bar"></div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(el);
  scrollToBottom();
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function scrollToBottom() {
  const container = document.getElementById("messages-container");
  setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}

// ══════════════════════════════════════════════
// GAMIFICACIÓN
// ══════════════════════════════════════════════
function addXP(amount) {
  STATE.xp += amount;
  STATE.points += amount;
  
  const currentLevelDef = LEVELS[STATE.level - 1];
  
  if (STATE.xp >= currentLevelDef.maxXP && STATE.level < LEVELS.length) {
    STATE.level++;
    const newLevel = LEVELS[STATE.level - 1];
    showLevelUp(newLevel);
  }
  
  updatePointsDisplay();
  updateXPBar();
  saveToLocalStorage();
  
  if (STATE.points >= 200) unlockAchievement("star_student");
}

function updatePointsDisplay() {
  document.getElementById("points-display").textContent = STATE.points;
}

function updateXPBar() {
  const levelDef = LEVELS[STATE.level - 1];
  const progress = ((STATE.xp - levelDef.minXP) / (levelDef.maxXP - levelDef.minXP)) * 100;
  document.getElementById("xp-bar").style.width = Math.min(progress, 100) + "%";
  document.getElementById("current-xp").textContent = STATE.xp;
  document.getElementById("max-xp").textContent = levelDef.maxXP;
  document.getElementById("level-text").textContent = `Nivel ${STATE.level} - ${levelDef.name}`;
  document.querySelector(".level-icon").textContent = levelDef.icon;
}

function showLevelUp(levelDef) {
  showReward(levelDef.icon, `¡Subiste de nivel!`, `Ahora eres: ${levelDef.name} ${levelDef.icon}`);
  celebrateAvatar();
  addMessage("lumi", `🎉 ¡¡<strong>${STATE.studentName}</strong>!! ¡Subiste al nivel <strong>${levelDef.name}</strong> ${levelDef.icon}! ¡Estás haciendo un trabajo increíble! ¡Sigue así! 🚀✨`);
}

function unlockAchievement(id) {
  if (STATE.achievements.includes(id)) return;
  
  const def = ACHIEVEMENTS_DEF.find(a => a.id === id);
  if (!def) return;
  
  STATE.achievements.push(id);
  addXP(def.xp);
  
  const grid = document.getElementById("achievements-grid");
  const idx = ACHIEVEMENTS_DEF.findIndex(a => a.id === id);
  if (grid.children[idx]) {
    grid.children[idx].classList.remove("locked");
    grid.children[idx].textContent = def.icon;
    grid.children[idx].title = def.name;
  }
  
  setTimeout(() => {
    showReward(def.icon, `¡Logro Desbloqueado!`, `${def.name}: ${def.desc}`);
    celebrateAvatar();
  }, 500);
  
  saveToLocalStorage();
}

function analyzeResponseForRewards(aiText, userMsg) {
  const lowerMsg = userMsg.toLowerCase();
  const lowerResp = aiText.toLowerCase();
  
  if (lowerResp.includes("correcto") || lowerResp.includes("excelente") ||
      lowerResp.includes("muy bien") || lowerResp.includes("lo lograste")) {
    addXP(15);
    showFloatingPoints("+15 XP ⭐");
    STATE.correctAnswers = (STATE.correctAnswers || 0) + 1;
    if (STATE.correctAnswers >= 5) unlockAchievement("five_correct");
  }
  
  if (STATE.subject === "matemáticas" && 
      (lowerMsg.includes("cuánto") || lowerMsg.includes("calcula") || lowerMsg.includes("resuelve"))) {
    unlockAchievement("math_wiz");
  }
  
  if (STATE.subject === "ciencias naturales") {
    unlockAchievement("scientist");
  }
}

function showFloatingPoints(text) {
  const area = document.querySelector(".chat-area");
  const el = document.createElement("div");
  el.textContent = text;
  el.style.cssText = `
    position: absolute; top: 50%; right: 100px;
    font-family: 'Fredoka One', cursive; font-size: 1.5rem;
    color: #FFD166; text-shadow: 0 2px 8px rgba(0,0,0,0.2);
    pointer-events: none; z-index: 50;
    animation: floatPoints 1.5s ease-out forwards;
  `;
  const style = document.createElement("style");
  style.textContent = `@keyframes floatPoints {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to { opacity: 0; transform: translateY(-80px) scale(1.3); }
  }`;
  document.head.appendChild(style);
  area.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

// ══════════════════════════════════════════════
// AVATAR EXPRESSIONS
// ══════════════════════════════════════════════
function setAvatarMood(mood) {
  const mouth = document.getElementById("avatar-mouth");
  const container = document.getElementById("avatar-container");
  if (!mouth || !container) return;
  
  container.className = "avatar-container avatar-state-" + mood;
  mouth.className = "avatar-mouth";
  
  switch(mood) {
    case "happy":       mouth.classList.add("happy"); break;
    case "thinking":    mouth.classList.add("thinking"); break;
    case "celebrating": mouth.classList.add("celebrating"); break;
    case "sad":         mouth.classList.add("sad"); break;
  }
}

function celebrateAvatar() {
  setAvatarMood("celebrating");
  launchParticles();
  setTimeout(() => setAvatarMood("happy"), 3000);
}

function launchParticles() {
  const particles = document.getElementById("particles");
  if (!particles) return;
  const emojis = ["⭐", "🎉", "✨", "🌟", "💫", "🎊", "🏆"];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = (20 + Math.random() * 60) + "%";
    p.style.top = "80%";
    p.style.animationDelay = (Math.random() * 0.5) + "s";
    particles.appendChild(p);
    setTimeout(() => p.remove(), 2000);
  }
}

function setupEyeTracking() {
  document.addEventListener("mousemove", (e) => {
    const eyes = document.querySelectorAll(".floating-avatar .eye");
    eyes.forEach(eye => {
      const rect = eye.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
      const dist = Math.min(3, Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 30);
      const pupil = eye.querySelector(".pupil");
      if (pupil) {
        pupil.style.transform = `translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)`;
      }
    });
  });
}

// ══════════════════════════════════════════════
// AVATAR FLOTANTE
// ══════════════════════════════════════════════
let idleTimeout = null;
let currentAvatarState = "idle";

function initFloatingAvatar() {
  const avatar = document.getElementById("floating-avatar");
  if (!avatar) return;
  avatar.classList.add("idle");
  positionAvatarInitially();
  startAvatarBehavior();
  setupAvatarMouseInteraction();
}

function positionAvatarInitially() {
  const avatar = document.getElementById("floating-avatar");
  const chatArea = document.querySelector(".chat-area");
  if (!avatar || !chatArea) return;
  const areaRect = chatArea.getBoundingClientRect();
  const avatarSize = 90;
  const padding = 24;
  const startX = Math.random() * (areaRect.width - avatarSize - padding * 2) + padding;
  const startY = Math.random() * (areaRect.height - avatarSize - padding * 2 - 68) + padding + 68;
  avatar.style.left = startX + "px";
  avatar.style.top = startY + "px";
}

function startAvatarBehavior() {
  scheduleNextMove();
  startIdleAnimations();
}

function scheduleNextMove() {
  const delay = 3000 + Math.random() * 5000;
  idleTimeout = setTimeout(() => {
    moveAvatarToRandomPosition();
    scheduleNextMove();
  }, delay);
}

function moveAvatarToRandomPosition() {
  const avatar = document.getElementById("floating-avatar");
  const chatArea = document.querySelector(".chat-area");
  if (!avatar || !chatArea) return;
  const areaRect = chatArea.getBoundingClientRect();
  const avatarSize = 90;
  const padding = 24;
  const headerHeight = 68;
  const maxX = areaRect.width - avatarSize - padding;
  const maxY = areaRect.height - avatarSize - padding;
  const moveToInput = Math.random() > 0.3;
  let targetX, targetY;
  if (moveToInput) {
    targetX = padding + Math.random() * (areaRect.width * 0.3);
    targetY = maxY - 50 - Math.random() * 80;
  } else {
    targetX = Math.random() * (maxX - padding) + padding;
    targetY = Math.random() * (maxY - padding - headerHeight) + padding + headerHeight;
  }
  avatar.classList.add("moving");
  avatar.classList.remove("idle");
  avatar.classList.add("exploring");
  avatar.style.left = targetX + "px";
  avatar.style.top = targetY + "px";
  setTimeout(() => {
    avatar.classList.remove("moving", "exploring");
    avatar.classList.add("idle");
  }, 3000);
}

function startIdleAnimations() {
  setInterval(() => {
    const avatar = document.getElementById("floating-avatar");
    if (!avatar || !avatar.classList.contains("idle")) return;
    const messagesContainer = document.getElementById("messages-container");
    if (!messagesContainer) return;
    const hasNewMessage = messagesContainer.querySelector(".message:not(.read)") !== null;
    if (hasNewMessage && Math.random() > 0.5) {
      setAvatarMood("listening");
      setTimeout(() => setAvatarMood("idle"), 2000);
    }
  }, 2000);
}

function setupAvatarMouseInteraction() {
  const avatar = document.getElementById("floating-avatar");
  if (!avatar) return;
  avatar.addEventListener("mouseenter", () => {
    avatar.classList.remove("idle");
    avatar.classList.add("excited");
    const mouth = document.getElementById("avatar-mouth");
    if (mouth) {
      mouth.classList.add("celebrating");
      mouth.classList.remove("happy", "thinking", "sad");
    }
  });
  avatar.addEventListener("mouseleave", () => {
    avatar.classList.remove("excited");
    avatar.classList.add("idle");
    const mouth = document.getElementById("avatar-mouth");
    if (mouth) {
      mouth.classList.add("happy");
      mouth.classList.remove("celebrating");
    }
  });
}

// Integrar avatar con mensajes
const originalAddMessage = addMessage;
addMessage = function(role, content) {
  const result = originalAddMessage.call(this, role, content);
  if (role === "lumi") setAvatarMood("listening");
  return result;
};

const originalGetAIResponse = getAIResponse;
getAIResponse = async function(text) {
  setAvatarMood("thinking");
  const result = await originalGetAIResponse.call(this, text);
  setTimeout(() => setAvatarMood("happy"), 500);
  return result;
};

// ══════════════════════════════════════════════
// TEMAS CUBIERTOS
// ══════════════════════════════════════════════
function extractTopics(text) {
  const topicKeywords = {
    "suma": "➕ Suma", "resta": "➖ Resta", "multiplicación": "✖️ Multiplicación",
    "división": "➗ División", "fracciones": "½ Fracciones", "geometría": "📐 Geometría",
    "fotosíntesis": "🌱 Fotosíntesis", "sistema solar": "🌍 Sistema Solar",
    "animales": "🐾 Animales", "plantas": "🌿 Plantas", "colombia": "🇨🇴 Colombia",
    "historia": "📜 Historia", "geografía": "🗺️ Geografía",
    "verbos": "🔤 Verbos", "sustantivos": "📝 Sustantivos"
  };
  const lowerText = text.toLowerCase();
  Object.entries(topicKeywords).forEach(([key, label]) => {
    if (lowerText.includes(key) && !STATE.topicsCovered.includes(label)) {
      STATE.topicsCovered.push(label);
      addTopicToList(label);
      addXP(10);
    }
  });
}

function addTopicToList(topic) {
  const list = document.getElementById("topics-list");
  const noTopics = list.querySelector(".no-topics");
  if (noTopics) noTopics.remove();
  const tag = document.createElement("div");
  tag.className = "topic-tag";
  tag.textContent = topic;
  list.appendChild(tag);
}

// ══════════════════════════════════════════════
// VOZ
// ══════════════════════════════════════════════
function toggleVoice() {
  STATE.voiceEnabled = !STATE.voiceEnabled;
  const btn = document.getElementById("btn-voice-toggle");
  btn.textContent = STATE.voiceEnabled ? "🔊" : "🔇";
  btn.classList.toggle("active", STATE.voiceEnabled);
  if (STATE.voiceEnabled) {
    speakText(`Hola ${STATE.studentName}, la voz está activada. ¡Escúchame!`);
  } else {
    if (STATE.synth) STATE.synth.cancel();
  }
}

function speakText(text) {
  if (!STATE.synth || !STATE.voiceEnabled) return;
  STATE.synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  utterance.volume = 0.8;
  const voices = STATE.synth.getVoices();
  const spanishVoice = voices.find(v => v.lang.startsWith("es"));
  if (spanishVoice) utterance.voice = spanishVoice;
  STATE.synth.speak(utterance);
}

function toggleSpeechInput() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast("Tu navegador no soporta reconocimiento de voz 😢");
    return;
  }
  if (STATE.isRecording) {
    if (STATE.recognition) STATE.recognition.stop();
    STATE.isRecording = false;
    document.getElementById("btn-mic").classList.remove("recording");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  STATE.recognition = new SpeechRecognition();
  STATE.recognition.lang = "es-ES";
  STATE.recognition.continuous = false;
  STATE.recognition.interimResults = false;
  STATE.recognition.onstart = () => {
    STATE.isRecording = true;
    document.getElementById("btn-mic").classList.add("recording");
    updateStatus("🎤 Escuchando...");
  };
  STATE.recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    document.getElementById("chat-input").value = transcript;
    STATE.isRecording = false;
    document.getElementById("btn-mic").classList.remove("recording");
    updateStatus("✨ Listo para aprender");
    sendMessage();
  };
  STATE.recognition.onerror = () => {
    STATE.isRecording = false;
    document.getElementById("btn-mic").classList.remove("recording");
    updateStatus("✨ Listo para aprender");
    showToast("No pude escucharte. ¿Intentamos de nuevo? 🎤");
  };
  STATE.recognition.onend = () => {
    STATE.isRecording = false;
    document.getElementById("btn-mic").classList.remove("recording");
  };
  STATE.recognition.start();
}

// ══════════════════════════════════════════════
// OVERLAY DE RECOMPENSA
// ══════════════════════════════════════════════
function showReward(emoji, title, desc) {
  document.getElementById("reward-emoji").textContent = emoji;
  document.getElementById("reward-title").textContent = title;
  document.getElementById("reward-desc").textContent = desc;
  document.getElementById("reward-overlay").classList.add("show");
  generateConfetti();
  setTimeout(closeReward, 4000);
}

function closeReward() {
  document.getElementById("reward-overlay").classList.remove("show");
}

function generateConfetti() {
  const container = document.getElementById("reward-confetti");
  container.innerHTML = "";
  const colors = ["#6C63FF", "#FF6B9D", "#FFD166", "#06D6A0", "#EF476F", "#9B94FF"];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement("div");
    piece.className = "conf-piece";
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: -10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-delay: ${Math.random() * 0.5}s;
      animation-duration: ${1.5 + Math.random()}s;
      transform: rotate(${Math.random() * 360}deg);
    `;
    container.appendChild(piece);
  }
}

// ══════════════════════════════════════════════
// UTILIDADES UI
// ══════════════════════════════════════════════
function updateSidebarInfo() {
  document.getElementById("sidebar-name").textContent = STATE.studentName;
  document.getElementById("sidebar-subject").textContent = getSubjectEmoji(STATE.subject) + " " + STATE.subject;
  updateXPBar();
}

function updateStatus(text) {
  document.getElementById("header-status").textContent = text;
}

function getSubjectEmoji(subject) {
  const map = {
    "matemáticas": "🔢", "ciencias naturales": "🌿", "sociales": "🌍",
    "español": "📖", "inglés": "🗣️", "religión": "✝️"
  };
  return map[subject] || "📚";
}

function autoResize(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
}

function shakeElement(id) {
  const el = document.getElementById(id);
  el.style.animation = "shake 0.4s ease";
  el.addEventListener("animationend", () => el.style.animation = "", { once: true });
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
    background: #2D2A4A; color: white; padding: 12px 24px;
    border-radius: 20px; font-family: 'Nunito', sans-serif; font-weight: 700;
    font-size: 0.9rem; z-index: 999; box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    animation: toastAnim 0.3s cubic-bezier(0.34,1.56,0.64,1);
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function goBack() {
  document.getElementById("chat-screen").classList.remove("active");
  document.getElementById("welcome-screen").classList.add("active");
  if (STATE.synth) STATE.synth.cancel();
}

// ══════════════════════════════════════════════
// PERSISTENCIA LOCAL
// ══════════════════════════════════════════════
function saveToLocalStorage() {
  const data = {
    studentName: STATE.studentName,
    age: STATE.age,
    subject: STATE.subject,
    points: STATE.points,
    level: STATE.level,
    xp: STATE.xp,
    achievements: STATE.achievements,
    topicsCovered: STATE.topicsCovered
  };
  localStorage.setItem("lumi_state", JSON.stringify(data));
}

function saveConversationToStorage() {
  localStorage.setItem("lumi_conversation", JSON.stringify(
    STATE.conversationHistory.slice(-20)
  ));
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem("lumi_state");
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(STATE, data);
      if (STATE.studentName) {
        const nameInput = document.getElementById("student-name");
        if (nameInput) nameInput.value = STATE.studentName;
      }
      if (STATE.age) {
        const ageBtn = document.querySelector(`.age-btn[data-age="${STATE.age}"]`);
        if (ageBtn) ageBtn.classList.add("selected");
      }
      if (STATE.subject) {
        const subjectBtn = document.querySelector(`.subject-btn[data-subject="${STATE.subject}"]`);
        if (subjectBtn) subjectBtn.classList.add("selected");
      }
    }
  } catch (e) {
    console.warn("Error cargando estado guardado:", e);
  }
}

// ══════════════════════════════════════════════
// ANIMACIONES CSS DINÁMICAS
// ══════════════════════════════════════════════
const dynamicStyles = document.createElement("style");
dynamicStyles.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-6px); }
    80% { transform: translateX(6px); }
  }
  @keyframes toastAnim {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
`;
document.head.appendChild(dynamicStyles);

console.log(`
╔══════════════════════════════════════╗
║   🌟 LUMI — Agente Educativo v2.0   ║
║   Usando Groq API directa (gratis!) ║
╚══════════════════════════════════════╝

Para activar:
1. Ve a console.groq.com → crea tu cuenta gratis
2. Genera una API Key
3. Pégala en CONFIG.GROQ_API_KEY arriba en este archivo

Modelo: llama-3.1-8b-instant (rápido y gratis)
¡Lumi está listo! 🚀
`);

// ══════════════════════════════════════════════
// SISTEMA DE EMOJIS INNOVADOR
// ══════════════════════════════════════════════
const EMOJI_DATA = {
  emociones: [
    { emoji: "😊", name: "Feliz", phrase: "¡Estoy feliz!" },
    { emoji: "😄", name: "Alegre", phrase: "¡Qué alegría!" },
    { emoji: "🤔", name: "Pensativo", phrase: "Tengo una pregunta..." },
    { emoji: "😮", name: "Sorprendido", phrase: "¡Qué sorpresa!" },
    { emoji: "😢", name: "Triste", phrase: "Estoy un poco triste" },
    { emoji: "😰", name: "Nervioso", phrase: "Estoy nervioso" },
    { emoji: "😴", name: "Cansado", phrase: "Estoy cansado" },
    { emoji: "🤩", name: "Emocionado", phrase: "¡Estoy emocionado!" },
    { emoji: "🥰", name: "Enamorado", phrase: "¡Me encanta!" },
    { emoji: "😤", name: "Frustrado", phrase: "¡Esto es difícil!" },
    { emoji: "🙃", name: "Tonto", phrase: "¡Qué tonto soy!" },
    { emoji: "😎", name: "Cool", phrase: "¡Esto es genial!" },
    { emoji: "🤓", name: "Listo", phrase: "¡Ya lo entiendo!" },
    { emoji: "😌", name: "Calmado", phrase: "Ahora entiendo" }
  ],
  aprendizaje: [
    { emoji: "❓", name: "Pregunta", phrase: "¿Qué es eso?" },
    { emoji: "💡", name: "Idea", phrase: "¡Tengo una idea!" },
    { emoji: "📚", name: "Libro", phrase: "Quiero aprender" },
    { emoji: "✅", name: "Entendido", phrase: "¡Entendido!" },
    { emoji: "❌", name: "Error", phrase: "No entiendo" },
    { emoji: "🔍", name: "Buscar", phrase: "Quiero buscar" },
    { emoji: "📝", name: "Notas", phrase: "Quiero tomar notas" },
    { emoji: "🧠", name: "Pensar", phrase: "Déjame pensar" },
    { emoji: "🔢", name: "Números", phrase: "Sobre matemáticas" },
    { emoji: "🌿", name: "Ciencias", phrase: "Sobre ciencias" },
    { emoji: "📖", name: "Leer", phrase: "Quiero leer más" },
    { emoji: "✏️", name: "Escribir", phrase: "Quiero escribir" },
    { emoji: "🧮", name: "Calcular", phrase: "Ayúdame a calcular" },
    { emoji: "🎯", name: "Objetivo", phrase: "Tengo una meta" }
  ],
  celebracion: [
    { emoji: "🎉", name: "Fiesta", phrase: "¡Fiesta!" },
    { emoji: "🏆", name: "Premio", phrase: "¡Gané un premio!" },
    { emoji: "⭐", name: "Estrella", phrase: "¡Soy una estrella!" },
    { emoji: "🌟", name: "Brillo", phrase: "¡Qué brillante!" },
    { emoji: "👏", name: "Aplausos", phrase: "¡Muy bien!" },
    { emoji: "🙌", name: "Victoria", phrase: "¡Lo logré!" },
    { emoji: "💪", name: "Fuerte", phrase: "¡Puedo hacerlo!" },
    { emoji: "🚀", name: "Cohete", phrase: "¡Vamos!" },
    { emoji: "🎊", name: "Confeti", phrase: "¡Celebremos!" },
    { emoji: "💐", name: "Flores", phrase: "¡Gracias!" },
    { emoji: "🙏", name: "Gratitud", phrase: "¡Muchas gracias!" },
    { emoji: "🥳", name: "Festejar", phrase: "¡A celebrar!" },
    { emoji: "🎈", name: "Globo", phrase: "¡Qué bueno!" },
    { emoji: "💯", name: "Perfecto", phrase: "¡Perfecto!" }
  ],
  ayuda: [
    { emoji: "🆘", name: "Socorro", phrase: "¡Necesito ayuda!" },
    { emoji: "⚠️", name: "Cuidado", phrase: "Tengo una duda" },
    { emoji: "🛑", name: "Alto", phrase: "¡Espera!" },
    { emoji: "💬", name: "Hablar", phrase: "Quiero hablar" },
    { emoji: "📞", name: "Llamar", phrase: "¿Puedes ayudarme?" },
    { emoji: "🗣️", name: "Disculpar", phrase: "Disculpa" },
    { emoji: "🤝", name: "Ayudar", phrase: "Ayúdame" },
    { emoji: "🔄", name: "Repetir", phrase: "¿Puedes repetir?" },
    { emoji: "⏸️", name: "Pausar", phrase: "Un momento" },
    { emoji: "➡️", name: "Continuar", phrase: "Continuemos" },
    { emoji: "⏹️", name: "Parar", phrase: "Necesito parar" },
    { emoji: "🔙", name: "Volver", phrase: "Volver a empezar" },
    { emoji: "💭", name: "Recordar", phrase: "Recuérdame" },
    { emoji: "🎓", name: "Explicar", phrase: "Explicar más" }
  ]
};

const EMOJI_PHRASES = [
  { text: "🤔 ¿Puedes explicarme?", emoji: "🤔" },
  { text: "❓ Tengo una pregunta", emoji: "❓" },
  { text: "💡 ¡Tengo una idea!", emoji: "💡" },
  { text: "✅ ¡Entendido!", emoji: "✅" },
  { text: "🙏 ¡Muchas gracias!", emoji: "🙏" },
  { text: "🎉 ¡Eso es genial!", emoji: "🎉" },
  { text: "😮 ¡Qué interesante!", emoji: "😮" },
  { text: "❌ No entiendo", emoji: "❌" },
  { text: "🆘 Necesito ayuda", emoji: "🆘" },
  { text: "⏰ Un momento por favor", emoji: "⏰" }
];

function toggleEmojiPanel() {
  const panel = document.getElementById("emoji-panel");
  const btn = document.getElementById("btn-emoji");
  const isOpen = panel.classList.contains("show");
  
  if (isOpen) {
    panel.classList.remove("show");
    btn.classList.remove("active");
  } else {
    panel.classList.add("show");
    btn.classList.add("active");
    filterEmojis("emociones");
    updatePhraseButtons();
  }
}

function filterEmojis(category) {
  document.querySelectorAll(".emoji-category-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
  
  const grid = document.getElementById("emoji-grid");
  grid.innerHTML = "";
  
  const emojis = EMOJI_DATA[category] || [];
  emojis.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "emoji-item";
    btn.innerHTML = `${item.emoji}<span class="emoji-tooltip">${item.name}</span>`;
    btn.onclick = () => addEmojiWithPhrase(item.emoji, item.phrase);
    grid.appendChild(btn);
  });
}

function addEmojiWithPhrase(emoji, phrase) {
  const input = document.getElementById("chat-input");
  const currentText = input.value.trim();
  
  if (currentText) {
    input.value = currentText + " " + emoji + " " + phrase;
  } else {
    input.value = emoji + " " + phrase;
  }
  
  autoResize(input);
  input.focus();
  
  // Animación de feedback
  const btn = document.getElementById("btn-emoji");
  btn.style.transform = "scale(1.2) rotate(-15deg)";
  setTimeout(() => btn.style.transform = "", 200);
  
  toggleEmojiPanel();
}

function addQuickEmoji(emoji) {
  const input = document.getElementById("chat-input");
  const currentText = input.value.trim();
  
  if (currentText) {
    input.value = currentText + " " + emoji;
  } else {
    input.value = emoji;
  }
  
  autoResize(input);
  input.focus();
}

function searchEmojis(query) {
  const grid = document.getElementById("emoji-grid");
  grid.innerHTML = "";
  
  if (!query.trim()) {
    filterEmojis("emociones");
    return;
  }
  
  const lowerQuery = query.toLowerCase();
  let allEmojis = [];
  
  Object.values(EMOJI_DATA).forEach(cat => {
    allEmojis = allEmojis.concat(cat);
  });
  
  const filtered = allEmojis.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) || 
    item.emoji.includes(query)
  );
  
  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light); font-size: 0.85rem;">No se encontraron emojis 😢</p>';
    return;
  }
  
  filtered.forEach(item => {
    const btn = document.createElement("button");
    btn.className = "emoji-item";
    btn.innerHTML = `${item.emoji}<span class="emoji-tooltip">${item.name}</span>`;
    btn.onclick = () => addEmojiWithPhrase(item.emoji, item.phrase);
    grid.appendChild(btn);
  });
}

function updatePhraseButtons() {
  const container = document.getElementById("emoji-phrase-btns");
  container.innerHTML = "";
  
  const randomPhrases = [...EMOJI_PHRASES].sort(() => Math.random() - 0.5).slice(0, 6);
  
  randomPhrases.forEach(phrase => {
    const btn = document.createElement("button");
    btn.className = "emoji-phrase-btn";
    btn.textContent = phrase.text;
    btn.onclick = () => {
      const input = document.getElementById("chat-input");
      input.value = phrase.text;
      autoResize(input);
      input.focus();
      toggleEmojiPanel();
    };
    container.appendChild(btn);
  });
}

// Cerrar panel al hacer clic fuera
document.addEventListener("click", (e) => {
  const panel = document.getElementById("emoji-panel");
  const btn = document.getElementById("btn-emoji");
  if (!panel.contains(e.target) && !btn.contains(e.target)) {
    panel.classList.remove("show");
    btn.classList.remove("active");
  }
});

// Cerrar panel con Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const panel = document.getElementById("emoji-panel");
    const btn = document.getElementById("btn-emoji");
    panel.classList.remove("show");
    btn.classList.remove("active");
  }
});

// ══════════════════════════════════════════════
// JUEGO: RETO RÁPIDO
// ══════════════════════════════════════════════
const GAME_STATE = {
  subject: "",
  score: 0,
  combo: 1,
  maxCombo: 1,
  correct: 0,
  currentRound: 0,
  totalRounds: 10,
  timer: null,
  timeLeft: 15,
  currentQuestion: null,
  bestScore: 0
};

const GAME_QUESTIONS = {
  matemáticas: [
    { q: "¿Cuánto es 5 + 3?", options: ["6", "7", "8", "9"], answer: 2, hint: "Cuenta con los dedos" },
    { q: "¿Cuánto es 12 - 4?", options: ["6", "7", "8", "9"], answer: 2, hint: "Resta los números" },
    { q: "¿Cuánto es 4 × 3?", options: ["10", "11", "12", "14"], answer: 2, hint: "Es una multiplicación" },
    { q: "¿Cuánto es 20 ÷ 4?", options: ["4", "5", "6", "8"], answer: 1, hint: "Divide el número" },
    { q: "¿Cuánto es 7 + 8?", options: ["13", "14", "15", "16"], answer: 2, hint: "Suma los números" },
    { q: "¿Cuánto es 15 - 9?", options: ["4", "5", "6", "7"], answer: 2, hint: "Resta los números" },
    { q: "¿Cuánto es 6 × 7?", options: ["36", "42", "48", "54"], answer: 1, hint: "Multiplica los números" },
    { q: "¿Cuánto es 24 ÷ 6?", options: ["3", "4", "5", "6"], answer: 1, hint: "Divide el número" },
    { q: "¿Cuánto es 9 + 9?", options: ["16", "17", "18", "19"], answer: 2, hint: "Suma los números" },
    { q: "¿Cuánto es 5 × 5?", options: ["20", "25", "30", "35"], answer: 1, hint: "Multiplicación" },
    { q: "¿Cuánto es 30 - 15?", options: ["10", "12", "15", "18"], answer: 2, hint: "Resta los números" },
    { q: "¿Cuánto es 48 ÷ 8?", options: ["5", "6", "7", "8"], answer: 1, hint: "Divide el número" },
    { q: "¿Cuánto es 11 + 7?", options: ["16", "17", "18", "19"], answer: 2, hint: "Suma los números" },
    { q: "¿Cuánto es 8 × 4?", options: ["28", "30", "32", "36"], answer: 2, hint: "Multiplicación" },
    { q: "¿Cuánto es 25 - 8?", options: ["15", "16", "17", "18"], answer: 2, hint: "Resta los números" }
  ],
  ciencias: [
    { q: "¿Qué necesitan las plantas para vivir?", options: ["Sol y agua", "Solo agua", "Solo sol", "Viento"], answer: 0, hint: "Piens en lo que riegas" },
    { q: "¿Cuántas patas tiene una araña?", options: ["4", "6", "8", "10"], answer: 2, hint: "Cuenta los patas" },
    { q: "¿Qué órgano bombea sangre?", options: ["Pulmones", "Corazón", "Estómago", "Hígado"], answer: 1, hint: "Late en tu pecho" },
    { q: "¿De qué color es el cielo?", options: ["Azul", "Verde", "Rojo", "Amarillo"], answer: 0, hint: "Mira hacia arriba" },
    { q: "¿Qué animal pone huevos?", options: ["Perro", "Gato", "Gallina", "Vaca"], answer: 2, hint: "Desayuno común" },
    { q: "¿Cuántos sentidos tenemos?", options: ["3", "4", "5", "6"], answer: 2, hint: "Ver, oír, oler, gusta, tocar" },
    { q: "¿Qué planeta conocemos como el rojo?", options: ["Venus", "Marte", "Júpiter", "Saturno"], answer: 1, hint: "El planeta rojo" },
    { q: "¿Qué parte de la planta hace la fotosíntesis?", options: ["Raíz", "Tallo", "Hojas", "Flores"], answer: 2, hint: "Donde está el verde" },
    { q: "¿Qué gas respiramos?", options: ["Oxígeno", "Nitrógeno", "Hidrógeno", "CO2"], answer: 0, hint: "El que nos mantiene vivos" },
    { q: "¿Cuántos huesos tiene el cuerpo adulto?", options: ["106", "206", "306", "406"], answer: 1, hint: "Número aproximado" },
    { q: "¿Qué animal es un mamífero?", options: ["Pez", "Ballena", "Serpiente", "Abeja"], answer: 1, hint: "Vive en el agua pero es mamífero" },
    { q: "¿Qué tipo de animal es el pingüino?", options: ["Mamífero", "Ave", "Reptil", "Anfibio"], answer: 1, hint: "Pero no vuela" }
  ],
  sociales: [
    { q: "¿Cuál es la capital de Colombia?", options: ["Medellín", "Bogotá", "Cali", "Barranquilla"], answer: 1, hint: "Ciudad principal" },
    { q: "¿En qué continente está Colombia?", options: ["Europa", "Asia", "América", "África"], answer: 2, hint: "Suramérica" },
    { q: "¿Cuántos días tiene un año?", options: ["300", "365", "366", "360"], answer: 1, hint: "Un año" },
    { q: "¿Quién descubrió América?", options: ["Magallanes", "Colón", "Américo", "Cruz"], answer: 1, hint: "Cristóbal" },
    { q: "¿Qué oceano está al oeste de Colombia?", options: ["Atlántico", "Pacífico", "Índico", "Ártico"], answer: 1, hint: "El otro lado" },
    { q: "¿Cuántos meses tiene un año?", options: ["10", "11", "12", "13"], answer: 2, hint: "Los meses" },
    { q: "¿Qué país limitan con Colombia?", options: ["México", "Perú", "Argentina", "Chile"], answer: 1, hint: "Vecino" },
    { q: "¿Cómo se llama nuestra bandera?", options: ["Tricolor", "Bicolor", "Unicolor", "Multicolor"], answer: 0, hint: "Colores" },
    { q: "¿Qué celebrar el 20 de julio?", options: ["Navidad", "Día de la Independencia", "Carnaval", "San Valentin"], answer: 1, hint: "Colombia" },
    { q: "¿Cuántos días tiene una semana?", options: ["5", "6", "7", "8"], answer: 2, hint: "Días laborables" }
  ],
  español: [
    { q: "¿Cuál es el antónimo de 'grande'?", options: ["Enorme", "Gigante", "Pequeño", "Inmenso"], answer: 2, hint: "Lo opuesto" },
    { q: "¿Cómo se dice 'house' en español?", options: ["Casa", "Perro", "Gato", "Árbol"], answer: 0, hint: "Traducción" },
    { q: "¿Cuál es una vocal?", options: ["B", "C", "A", "D"], answer: 2, hint: "Letras suaves" },
    { q: "¿Qué tipo de palabra es 'correr'?", options: ["Sustantivo", "Verbo", "Adjetivo", "Artículo"], answer: 1, hint: "Acción" },
    { q: "¿Cuál es el plural de 'libro'?", options: ["Libros", "Libres", "Libra", "Librosso"], answer: 0, hint: "Añade -s" },
    { q: "¿Qué palabra rim con 'sol'?", options: ["Mar", "Pan", "Carr", "Vol"], answer: 2, hint: "Sonido similar" },
    { q: "¿Cuál es un pronombre?", options: ["Yo", "Casa", "Azul", "Correr"], answer: 0, hint: "Pronombre personal" },
    { q: "¿Cómo se escribe correctamente?", options: ["Kasa", "Casa", "Kaza", "Caza"], answer: 1, hint: "Con C" },
    { q: "¿Qué significa 'feliz'?", options: ["Triste", "Contento", "Enojado", "Cansado"], answer: 1, hint: "Estado de ánimo" },
    { q: "¿Cuál es el sinónimo de 'rápido'?", options: ["Lento", "Veloz", "Grande", "Pequeño"], answer: 1, hint: "Lo mismo" }
  ],
  inglés: [
    { q: "How do you say 'perro' in English?", options: ["Cat", "Dog", "Bird", "Fish"], answer: 1, hint: "Mascota común" },
    { q: "What color is 'azul' in English?", options: ["Red", "Blue", "Green", "Yellow"], answer: 1, hint: "El color del cielo" },
    { q: "Choose the correct translation: 'book'", options: ["Libro", "Mesa", "Silla", "Pluma"], answer: 0, hint: "Para leer" },
    { q: "What is 'water' in Spanish?", options: ["Fuego", "Aire", "Agua", "Tierra"], answer: 2, hint: "Para beber" },
    { q: "How do you say 'hola'?", options: ["Hello", "Goodbye", "Thanks", "Please"], answer: 0, hint: "Saludo" },
    { q: "What is the opposite of 'big'?", options: ["Small", "Tall", "Fast", "New"], answer: 0, hint: "Lo opuesto" },
    { q: "How many days in a week?", options: ["5", "6", "7", "8"], answer: 2, hint: "Días" },
    { q: "What color is the sun?", options: ["Yellow", "Orange", "Red", "White"], answer: 0, hint: "Color del sol" },
    { q: "Choose the fruit:", options: ["Apple", "Table", "Car", "House"], answer: 0, hint: "Fruta roja" },
    { q: "How do you say 'gracias'?", options: ["Hello", "Goodbye", "Thanks", "Sorry"], answer: 2, hint: "Gratitud" },
    { q: "What is 5 + 3 in English?", options: ["Eight", "Seven", "Nine", "Six"], answer: 0, hint: "Matemáticas" },
    { q: "Choose the animal:", options: ["Table", "Chair", "Cat", "Book"], answer: 2, hint: "Mascota" }
  ],
  francés: [
    { q: "Comment dit-on 'perro' en français?", options: ["Chat", "Chien", "Oiseau", "Poisson"], answer: 1, hint: "Animal domesticado" },
    { q: "What is 'bonjour' in Spanish?", options: ["Adiós", "Hola", "Gracias", "Por favor"], answer: 1, hint: "Saludo" },
    { q: "Comment dit-on 'casa' en français?", options: ["Maison", "Voiture", "Livre", "Chat"], answer: 0, hint: "Lugar donde vives" },
    { q: "What does 'merci' mean?", options: ["Hola", "Adiós", "Gracias", "Por favor"], answer: 2, hint: "Gratitud" },
    { q: "Choose the fruit in French:", options: ["Pomme", "Table", "Chaise", "Maison"], answer: 0, hint: "Fruta roja" },
    { q: "How do you say 'libro'?", options: ["Livre", "Cahier", "Stylo", "Table"], answer: 0, hint: "Para leer" },
    { q: "What is 'rouge' in Spanish?", options: ["Azul", "Verde", "Rojo", "Amarillo"], answer: 2, hint: "Color" },
    { q: "Comment dit-on 'agua' en français?", options: ["Feu", "Air", "Eau", "Terre"], answer: 2, hint: "Para beber" },
    { q: "What does 'oui' mean?", options: ["No", "Sí", "Talvez", "Gracias"], answer: 1, hint: "Afirmación" },
    { q: "Choose the number 'cinq':", options: ["3", "4", "5", "6"], answer: 2, hint: "Números" }
  ],
  alemán: [
    { q: "Wie sagt man 'perro' auf Deutsch?", options: ["Katze", "Hund", "Vogel", "Fisch"], answer: 1, hint: "Animal domesticado" },
    { q: "What is 'Hallo' in Spanish?", options: ["Adiós", "Hola", "Gracias", "Por favor"], answer: 1, hint: "Saludo" },
    { q: "Wie sagt man 'casa'?", options: ["Haus", "Auto", "Buch", "Tisch"], answer: 0, hint: "Lugar donde vives" },
    { q: "What does 'Danke' mean?", options: ["Hola", "Adiós", "Gracias", "Por favor"], answer: 2, hint: "Gratitud" },
    { q: "Choose the fruit in German:", options: ["Apfel", "Tisch", "Stuhl", "Haus"], answer: 0, hint: "Fruta roja" },
    { q: "How do you say 'libro'?", options: ["Buch", "Heft", "Stift", "Tisch"], answer: 0, hint: "Para leer" },
    { q: "What is 'rot' in Spanish?", options: ["Azul", "Verde", "Rojo", "Amarillo"], answer: 2, hint: "Color" },
    { q: "Was ist 'Wasser'?", options: ["Fuego", "Aire", "Agua", "Tierra"], answer: 2, hint: "Para beber" },
    { q: "What does 'Ja' mean?", options: ["No", "Sí", "Talvez", "Gracias"], answer: 1, hint: "Afirmación" },
    { q: "Choose 'fünf':", options: ["3", "4", "5", "6"], answer: 2, hint: "Números" }
  ],
  koreano: [
    { q: "¿Cómo se dice 'perro' en coreano?", options: ["고양이", "개", "새", "물고기"], answer: 1, hint: "Mascota" },
    { q: "What is '안녕하세요'?", options: ["Adiós", "Hola", "Gracias", "Por favor"], answer: 1, hint: "Saludo" },
    { q: "¿Cómo se dice 'casa'?", options: ["집", "자동차", "책", "의자"], answer: 0, hint: "Lugar donde vives" },
    { q: "What does '감사합니다' mean?", options: ["Hola", "Adiós", "Gracias", "Por favor"], answer: 2, hint: "Gratitud" },
    { q: "Choose the fruit:", options: ["사과", "책상", "의자", "집"], answer: 0, hint: "Fruta roja" },
    { q: "How do you say 'libro'?", options: ["책", "노트", "연필", "책상"], answer: 0, hint: "Para leer" },
    { q: "What is '빨강' in Spanish?", options: ["Azul", "Verde", "Rojo", "Amarillo"], answer: 2, hint: "Color" },
    { q: "What does '네' mean?", options: ["No", "Sí", "Talvez", "Gracias"], answer: 1, hint: "Afirmación" },
    { q: "Choose '다섯' (5):", options: ["3", "4", "5", "6"], answer: 2, hint: "Números" },
    { q: "How do you say 'agua'?", options: ["불", "공기", "물", "흙"], answer: 2, hint: "Para beber" }
  ],
  chino: [
    { q: "¿Cómo se dice 'perro' en chino?", options: ["猫", "狗", "鸟", "鱼"], answer: 1, hint: "Mascota" },
    { q: "What is '你好'?", options: ["Adiós", "Hola", "Gracias", "Por favor"], answer: 1, hint: "Saludo" },
    { q: "¿Cómo se dice 'casa'?", options: ["房子", "汽车", "书", "椅子"], answer: 0, hint: "Lugar donde vives" },
    { q: "What does '谢谢' mean?", options: ["Hola", "Adiós", "Gracias", "Por favor"], answer: 2, hint: "Gratitud" },
    { q: "Choose the fruit:", options: ["苹果", "桌子", "椅子", "房子"], answer: 0, hint: "Fruta roja" },
    { q: "How do you say 'libro'?", options: ["书", "本子", "铅笔", "桌子"], answer: 0, hint: "Para leer" },
    { q: "What is '红色' in Spanish?", options: ["Azul", "Verde", "Rojo", "Amarillo"], answer: 2, hint: "Color" },
    { q: "What does '是' mean?", options: ["No", "Sí", "Talvez", "Gracias"], answer: 1, hint: "Afirmación" },
    { q: "Choose '五' (5):", options: ["3", "4", "5", "6"], answer: 2, hint: "Números" },
    { q: "How do you say 'agua'?", options: ["火", "空气", "水", "土"], answer: 2, hint: "Para beber" }
  ],
  portugués: [
    { q: "How do you say 'dog' in Portuguese?", options: ["Gato", "Cachorro", "Pássaro", "Peixe"], answer: 1, hint: "Animal domesticado" },
    { q: "What is 'Olá' in Spanish?", options: ["Adiós", "Hola", "Gracias", "Por favor"], answer: 1, hint: "Saludo" },
    { q: "How do you say 'casa'?", options: ["Casa", "Carro", "Livro", "Mesa"], answer: 0, hint: "Lugar donde vives" },
    { q: "What does 'obrigado/a' mean?", options: ["Hola", "Adiós", "Gracias", "Por favor"], answer: 2, hint: "Gratitud" },
    { q: "Choose the fruit:", options: ["Maçã", "Mesa", "Cadeira", "Casa"], answer: 0, hint: "Fruta roja" },
    { q: "How do you say 'libro'?", options: ["Livro", "Caderno", "Caneta", "Mesa"], answer: 0, hint: "Para leer" },
    { q: "What is 'vermelho' in Spanish?", options: ["Azul", "Verde", "Rojo", "Amarillo"], answer: 2, hint: "Color" },
    { q: "What does 'sim' mean?", options: ["No", "Sí", "Talvez", "Gracias"], answer: 1, hint: "Afirmación" },
    { q: "Choose 'cinco':", options: ["3", "4", "5", "6"], answer: 2, hint: "Números" },
    { q: "How do you say 'agua'?", options: ["Fogo", "Ar", "Água", "Terra"], answer: 2, hint: "Para beber" }
  ]
};

function openGame() {
  const overlay = document.getElementById("game-overlay");
  overlay.classList.add("show");
  resetGame();
  loadBestScore();
}

function closeGame() {
  const overlay = document.getElementById("game-overlay");
  overlay.classList.remove("show");
  stopTimer();
}

function resetGame() {
  GAME_STATE.score = 0;
  GAME_STATE.combo = 1;
  GAME_STATE.maxCombo = 1;
  GAME_STATE.correct = 0;
  GAME_STATE.currentRound = 0;
  
  document.getElementById("game-start-screen").style.display = "block";
  document.getElementById("game-question-screen").style.display = "none";
  document.getElementById("game-result-screen").style.display = "none";
  
  updateGameUI();
  
  document.querySelectorAll(".game-subject-btn").forEach(btn => btn.classList.remove("selected"));
  document.getElementById("game-start-btn").disabled = true;
}

function selectGameSubject(subject) {
  GAME_STATE.subject = subject;
  document.querySelectorAll(".game-subject-btn").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.subject === subject);
  });
  document.getElementById("game-start-btn").disabled = false;
}

function loadBestScore() {
  const saved = localStorage.getItem("lumi_best_score");
  if (saved) {
    GAME_STATE.bestScore = parseInt(saved);
    document.getElementById("best-score").textContent = GAME_STATE.bestScore;
  }
}

function saveBestScore() {
  if (GAME_STATE.score > GAME_STATE.bestScore) {
    GAME_STATE.bestScore = GAME_STATE.score;
    localStorage.setItem("lumi_best_score", GAME_STATE.bestScore);
    document.getElementById("best-score").textContent = GAME_STATE.bestScore;
  }
}

function startGame() {
  document.getElementById("game-start-screen").style.display = "none";
  document.getElementById("game-question-screen").style.display = "block";
  nextQuestion();
}

function nextQuestion() {
  GAME_STATE.currentRound++;
  
  if (GAME_STATE.currentRound > GAME_STATE.totalRounds) {
    endGame();
    return;
  }
  
  const questions = GAME_QUESTIONS[GAME_STATE.subject];
  GAME_STATE.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  document.getElementById("question-number").textContent = `Pregunta ${GAME_STATE.currentRound}`;
  document.getElementById("question-text").textContent = GAME_STATE.currentQuestion.q;
  document.getElementById("question-hint").textContent = "💡 " + GAME_STATE.currentQuestion.hint;
  
  const optionsContainer = document.getElementById("answer-options");
  optionsContainer.innerHTML = "";
  
  GAME_STATE.currentQuestion.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = ["A", "B", "C", "D"][idx] + ") " + opt;
    btn.onclick = () => answerQuestion(idx);
    optionsContainer.appendChild(btn);
  });
  
  updateGameUI();
  startTimer();
}

function startTimer() {
  GAME_STATE.timeLeft = 15;
  const timerBar = document.getElementById("timer-bar");
  timerBar.style.width = "100%";
  timerBar.classList.remove("urgent");
  
  clearInterval(GAME_STATE.timer);
  
  GAME_STATE.timer = setInterval(() => {
    GAME_STATE.timeLeft--;
    
    const percent = (GAME_STATE.timeLeft / 15) * 100;
    timerBar.style.width = percent + "%";
    
    document.getElementById("timer-text").textContent = "⏱️ " + GAME_STATE.timeLeft + "s";
    
    if (GAME_STATE.timeLeft <= 5) {
      timerBar.classList.add("urgent");
    }
    
    if (GAME_STATE.timeLeft <= 0) {
      stopTimer();
      handleTimeOut();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(GAME_STATE.timer);
}

function handleTimeOut() {
  const buttons = document.querySelectorAll(".answer-btn");
  buttons.forEach(btn => {
    btn.disabled = true;
    btn.classList.add("wrong");
  });
  
  GAME_STATE.combo = 1;
  updateGameUI();
  
  setTimeout(() => {
    nextQuestion();
  }, 1500);
}

function answerQuestion(selectedIdx) {
  stopTimer();
  
  const buttons = document.querySelectorAll(".answer-btn");
  const correctIdx = GAME_STATE.currentQuestion.answer;
  
  buttons.forEach(btn => btn.disabled = true);
  buttons[correctIdx].classList.add("correct");
  
  if (selectedIdx === correctIdx) {
    GAME_STATE.correct++;
    const points = 10 * GAME_STATE.combo;
    GAME_STATE.score += points;
    GAME_STATE.combo = Math.min(GAME_STATE.combo + 1, 5);
    GAME_STATE.maxCombo = Math.max(GAME_STATE.maxCombo, GAME_STATE.combo);
    
    buttons[selectedIdx].classList.add("correct");
  } else {
    buttons[selectedIdx].classList.add("wrong");
    GAME_STATE.combo = 1;
  }
  
  updateGameUI();
  
  setTimeout(() => {
    nextQuestion();
  }, 1200);
}

function updateGameUI() {
  document.getElementById("game-score").textContent = GAME_STATE.score;
  document.getElementById("game-combo").textContent = "x" + GAME_STATE.combo;
  document.getElementById("game-round").textContent = GAME_STATE.currentRound + "/" + GAME_STATE.totalRounds;
}

function endGame() {
  stopTimer();
  saveBestScore();
  
  document.getElementById("game-question-screen").style.display = "none";
  document.getElementById("game-result-screen").style.display = "block";
  
  const resultData = getGameResult();
  document.getElementById("result-emoji").textContent = resultData.emoji;
  document.getElementById("result-title").textContent = resultData.title;
  document.getElementById("final-score").textContent = GAME_STATE.score;
  document.getElementById("correct-answers").textContent = GAME_STATE.correct;
  document.getElementById("max-combo").textContent = "x" + GAME_STATE.maxCombo;
  
  addXP(GAME_STATE.score / 10);
}

function getGameResult() {
  const percent = (GAME_STATE.correct / GAME_STATE.totalRounds) * 100;
  
  if (percent >= 90) {
    return { emoji: "🏆", title: "¡Eres Increíble!" };
  } else if (percent >= 70) {
    return { emoji: "🌟", title: "¡Muy Bien!" };
  } else if (percent >= 50) {
    return { emoji: "👍", title: "¡Buen Trabajo!" };
  } else {
    return { emoji: "💪", title: "¡Sigue Practicando!" };
  }
}

function playAgain() {
  resetGame();
}

// ══════════════════════════════════════════════
// MODO PROFESOR INVERTIDO
// ══════════════════════════════════════════════

const TEACHER_TOPICS = {
  "matemáticas": [
    "¿Qué es una fracción? 🍕",
    "¿Cómo se suma con llevadas? ➕",
    "¿Qué es una multiplicación? ✖️",
    "¿Qué son los números pares? 🔢",
    "¿Qué es una división? ➗"
  ],
  "ciencias": [
    "¿Qué es la fotosíntesis? 🌱",
    "¿Por qué el cielo es azul? 🌤️",
    "¿Cómo funciona el corazón? ❤️",
    "¿Qué son los dinosaurios? 🦕",
    "¿Por qué flotan los barcos? 🚢"
  ],
  "sociales": [
    "¿Qué es la independencia? 🇨🇴",
    "¿Qué son los continentes? 🌍",
    "¿Quién fue Simón Bolívar? 🎖️",
    "¿Qué es el relieve? 🏔️",
    "¿Qué culturas existieron en Colombia? 🏛️"
  ],
  "español": [
    "¿Qué es un verbo? 🏃",
    "¿Qué es un sustantivo? 📝",
    "¿Qué es un adjetivo? 🎨",
    "¿Qué son las reglas de ortografía? ✏️",
    "¿Qué es un cuento? 📖"
  ],
  "inglés": [
    "¿Cómo se dice 'hola' en inglés? 👋",
    "¿Qué son los colores en inglés? 🎨",
    "¿Qué es un verbo en inglés? 🏃",
    "¿Cómo se cuentan los números? 🔢",
    "¿Qué son los saludos en inglés? 👋"
  ]
};

function activateTeacherMode() {
  STATE.gameMode = "profesor";
  STATE.conversationHistory = [];
  
  const topics = TEACHER_TOPICS[STATE.subject] || TEACHER_TOPICS["matemáticas"];
  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  const welcomeMsg = `🧠 <strong>¡Modo Profesor Invertido activado!</strong> 🎓
  
Ahora <strong>${STATE.studentName}</strong> es el profesor y yo soy el estudiante. 
  
${randomTopic}
  
¡Explícame este concepto como si me estuvieras enseñando! Usa ejemplos que yo pueda entender 😊`;
  
  addMessage("lumi", welcomeMsg);
  updateStatus("🧠 Modo Profesor");
  
  if (STATE.voiceEnabled) {
    speakText(`Modo Profesor Invertido activado. ${randomTopic}`);
  }
  
  setAvatarMood("excited");
  celebrateAvatar();
}

function deactivateTeacherMode() {
  STATE.gameMode = "normal";
  STATE.conversationHistory = [];
  
  const msg = `👋 <strong>¡Saliste del modo Profesor!</strong>
  
Volvimos al modo normal. ¿Qué más quieres aprender, ${STATE.studentName}? 🚀`;
  
  addMessage("lumi", msg);
  updateStatus("✨ Listo para aprender");
  
  if (STATE.voiceEnabled) {
    speakText("Salimos del modo Profesor. ¿Qué más quieres aprender?");
  }
  
  setAvatarMood("happy");
}

function evaluateExplanation(text) {
  const length = text.length;
  const words = text.split(/\s+/).length;
  const hasExample = /ejemplo|como|por ejemplo|por ejemplo|microsoft|como si|imagin|piensa/i.test(text);
  const hasDetails = text.includes("porque") || text.includes("por qué") || text.includes("significa") || text.includes("son");
  
  if (length > 150 && hasExample && hasDetails) {
    return { xp: 30, level: "excelente", feedback: "¡Explicación excelente! 🎉" };
  } else if (length > 80 && (hasExample || hasDetails)) {
    return { xp: 20, level: "buena", feedback: "¡Muy buena explicación! 👍" };
  } else {
    return { xp: 10, level: "básica", feedback: "¡Bien! Sigue practicando 💪" };
  }
}

function isTeacherModeCommand(text) {
  const commands = [
    "modo profesor", "profesor", "modoprofesor", "invertido", 
    "enseñame", "yo te enseño", "soy el profesor", "profesor invertido",
    "🧠", "🎓", "enseñar", "explicame"
  ];
  const lower = text.toLowerCase();
  return commands.some(cmd => lower.includes(cmd));
}


function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.toggle("open");
}

document.addEventListener("click", (e) => {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar.contains(e.target) && !e.target.classList.contains("btn-menu")) {
    sidebar.classList.remove("open");
  }
});