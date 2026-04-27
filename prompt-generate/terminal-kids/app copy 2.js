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
  sessionStartTime: Date.now()
};

// ══════════════════════════════════════════════
// CONFIGURACIÓN
// ══════════════════════════════════════════════
const CONFIG = {
  GROQ_API_URL: "https://rvgaozmexpocgxtlomkh.supabase.co/functions/v1/chat",
  MODEL: "llama-3.3-70b-versatile",
  temperature: 0.5,
  MAX_TOKENS: 400
};

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
  { id: "scientist",      icon: "🔬", name: "Científico",  desc: "Exploraste ciencias naturales", xp: 40 }
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

  return `Eres Lumi, un tutor educativo amigable para niños.

PERFIL DEL ESTUDIANTE:
- Nombre: ${STATE.studentName}
- Edad: ${STATE.age} años (${ageGroup})
- Materia actual: ${STATE.subject}
- Temas ya vistos: ${STATE.topicsCovered.join(", ") || "ninguno aún"}
- Nivel actual: ${LEVELS[STATE.level - 1]?.name || "Semilla"}

PERSONALIDAD OBLIGATORIA:
✅ Siempre comenzar con el nombre del estudiante de vez en cuando
✅ Usar emojis relevantes para hacer las explicaciones visuales
✅ Celebrar los logros: "¡Excelente, ${STATE.studentName}!" / "¡Lo lograste!" / "¡Eso es correcto!"
✅ Si el estudiante se equivoca, decir: "¡Casi! Intentemos juntos..." nunca decir "Incorrecto" directamente
✅ Frases motivadoras: "¡Vamos paso a paso!" / "¡Tú puedes!" / "¡Lo estás haciendo genial!"
✅ Usar analogías de la vida cotidiana
✅ Dar explicaciones en pasos numerados cuando enseñes un concepto
✅ Si el estudiante parece confundido, ofrecer explicar de otra forma

FORMATO DE RESPUESTAS:
- Explicaciones paso a paso: usar numeración clara (1️⃣ 2️⃣ 3️⃣)
- Fórmulas matemáticas: ponerlas entre [FORMULA] y [/FORMULA]
- Ejemplos importantes: entre [EJEMPLO] y [/EJEMPLO]  
- Si es un ejercicio para practicar, terminar con ❓ y una pregunta
- Respuestas en español (a menos que se enseñe inglés)
- Respuestas ${complexityLevel}

REGLAS IMPORTANTES:
- Explica paso a paso
- Usa ejemplos simples
- Usa emojis
- Motiva siempre
- No des respuestas largas (máx 4 párrafos)
- Si hay error, guía sin decir "incorrecto"

Habla según edad: ${STATE.age}
Materia: ${STATE.subject}

Materias que puedes enseñar: matemáticas, ciencias naturales, sociales, español, inglés, religión, historia, geografía y cualquier materia escolar.`;
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
  
  // Transición a pantalla de chat
  document.getElementById("welcome-screen").classList.remove("active");
  document.getElementById("chat-screen").classList.add("active");
  
  // Actualizar UI con datos del estudiante
  updateSidebarInfo();
  updatePointsDisplay();
  
  // Mensaje de bienvenida de Lumi
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
    `¡Hola <strong>${STATE.studentName}</strong>! 🌟 Prepárate para una aventura de aprendizaje increíble. Hoy nuestro tema es <strong>${emoji} ${STATE.subject}</strong>.\n\nRecuerda: no hay preguntas tontas. Puedes preguntarme lo que quieras, cuantas veces necesites. ¡Estoy aquí para ti! 💪`
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
  
  addMessage("user", text);
  addXP(5); // XP por participar
  
  // Verificar logro primera pregunta
  if (STATE.conversationHistory.length === 1) {
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
// LLAMADA A LA API DE IA
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
  
  // Mostrar typing indicator
  const typingId = showTypingIndicator();
  
  // Animación de mensajes progresivos
  startLoadingAnimation();
  
  // Construir historial de conversación
  STATE.conversationHistory.push({
    role: "user",
    content: userMessage
  });
  
  try {
    const response = await fetch(CONFIG.GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2Fvem1leHBvY3h0bG9ta2giLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQ2MTIwMCwiZXhwIjoxOTU5MDM3MjAwfQ.rW93Y9b-T7B18ZT8aWPsBcjDVMq3v1oS2p_hR8g4MVU",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2Fvem1leHBvY3h0bG9ta2giLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQ2MTIwMCwiZXhwIjoxOTU5MDM3MjAwfQ.rW93Y9b-T7B18ZT8aWPsBcjDVMq3v1oS2p_hR8g4MVU"
      },
      body: JSON.stringify({
        message: userMessage,
        history: STATE.conversationHistory.slice(-4),
        systemPrompt: buildSystemPrompt()
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiText = data.reply || "Lo siento, tuve un problema. ¡Intenta de nuevo! 😊";
    
    // Guardar respuesta en historial
    STATE.conversationHistory.push({
      role: "assistant",
      content: aiText
    });
    
    // Quitar typing indicator
    removeTypingIndicator(typingId);
    stopLoadingAnimation();
    
    // Procesar y mostrar respuesta
    const formattedText = formatAIResponse(aiText);
    addMessage("lumi", formattedText);
    
    // Text-to-speech
    if (STATE.voiceEnabled) {
      speakText(aiText.replace(/<[^>]*>/g, "").substring(0, 300));
    }
    
    // Analizar respuesta para gamificación
    analyzeResponseForRewards(aiText, userMessage);
    
    // Extraer temas del diálogo
    extractTopics(userMessage + " " + aiText);
    
    setAvatarMood("happy");
    updateStatus("✨ Listo para aprender");
    
  } catch (error) {
    removeTypingIndicator(typingId);
    stopLoadingAnimation();
    console.error("Error al consultar la IA:", error);
    
    // Respuesta de fallback educativa
    const fallback = getFallbackResponse(userMessage);
    addMessage("lumi", fallback);
    setAvatarMood("happy");
    updateStatus("✨ Listo para aprender");
    
    // Si el error es de API, mostrar instrucción
    if (error.message.includes("401") || error.message.includes("403")) {
      setTimeout(() => {
        addMessage("lumi", `⚙️ <strong>Nota de configuración:</strong> Hay un problema con la conexión al servicio de IA. Por favor verifica la configuración del servidor.<br><br>Por ahora estoy usando respuestas de demostración. ¡Pero sigo siendo tu amigo! 😊`);
      }, 1000);
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
    `¡Hola, ${() => STATE.studentName}! Las matemáticas son como un superpoder 🔢✨\n\nVamos a aprender paso a paso:\n\n1️⃣ Primero entendemos el concepto\n2️⃣ Vemos un ejemplo real\n3️⃣ ¡Practicamos juntos!\n\n¿Sobre qué tema específico de matemáticas quieres aprender? ¿Sumas, multiplicaciones, fracciones, geometría...? 🤔`,
    `¡Las matemáticas son divertidas cuando las entendemos! 🎯\n\n[EJEMPLO] Si tienes 5 manzanas 🍎 y te dan 3 más, ¿cuántas tienes? ¡Exacto, 8! [/EJEMPLO]\n\nAsí funcionan las operaciones básicas. ¿Qué operación quieres practicar? ❓`
  ],
  "ciencias naturales": [
    `¡Las ciencias naturales son increíbles! 🌿🔬\n\nEstudiamos todo lo que nos rodea:\n- 🌱 Las plantas y los animales\n- 🌍 El planeta Tierra\n- ⚡ La energía y la materia\n\n¿Qué parte de las ciencias te genera más curiosidad? 🤔`,
  ],
  "sociales": [
    `¡Las ciencias sociales nos ayudan a entender el mundo! 🌍\n\nAprendemos sobre:\n- 📜 La historia de nuestros antepasados\n- 🗺️ La geografía del planeta\n- 👥 Cómo vivimos en sociedad\n\n¿Qué tema de sociales quieres explorar hoy? 🚀`,
  ],
  "default": [
    `¡Hola! Estoy aquí para ayudarte a aprender 📚✨\n\nPuedo explicarte cualquier tema escolar de forma sencilla y divertida. ¿Por dónde empezamos? Cuéntame qué quieres aprender y lo veremos juntos, paso a paso. 💪`,
    `¡Qué buena pregunta! 🌟 Me encanta tu curiosidad. Vamos a explorar ese tema juntos. ¿Tienes algún libro o apunte sobre esto? También podemos partir desde cero. ¡Tú decides! 🎯`
  ]
};

function getFallbackResponse(userMsg) {
  const subject = STATE.subject || "default";
  const responses = FALLBACK_RESPONSES[subject] || FALLBACK_RESPONSES["default"];
  const r = responses[Math.floor(Math.random() * responses.length)];
  return typeof r === "function" ? r() : r.replace(/\$\{.*?\}/g, STATE.studentName);
}

// ══════════════════════════════════════════════
// FORMATO DE RESPUESTAS
// ══════════════════════════════════════════════
function formatAIResponse(text) {
  return text
    // Fórmulas matemáticas
    .replace(/\[FORMULA\](.*?)\[\/FORMULA\]/gs, '<div class="math-formula">$1</div>')
    // Ejemplos destacados
    .replace(/\[EJEMPLO\](.*?)\[\/EJEMPLO\]/gs, '<div class="highlight">💡 <strong>Ejemplo:</strong> $1</div>')
    // Pasos numerados con emojis
    .replace(/^(\d+[.)])(.+)/gm, '<div class="step-box">$1$2</div>')
    // Saltos de línea
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
  
  // Guardar en localStorage
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
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

// ══════════════════════════════════════════════
// GAMIFICACIÓN
// ══════════════════════════════════════════════
function addXP(amount) {
  STATE.xp += amount;
  STATE.points += amount;
  
  const currentLevelDef = LEVELS[STATE.level - 1];
  
  // Verificar subida de nivel
  if (STATE.xp >= currentLevelDef.maxXP && STATE.level < LEVELS.length) {
    STATE.level++;
    const newLevel = LEVELS[STATE.level - 1];
    showLevelUp(newLevel);
  }
  
  updatePointsDisplay();
  updateXPBar();
  saveToLocalStorage();
  
  // Logro estrella estudiante
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
  
  // Actualizar visual del logro
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
  
  // Detectar respuesta correcta
  if (lowerResp.includes("correcto") || lowerResp.includes("excelente") ||
      lowerResp.includes("muy bien") || lowerResp.includes("lo lograste")) {
    addXP(15);
    showFloatingPoints("+15 XP ⭐");
    
    // Contar respuestas correctas
    STATE.correctAnswers = (STATE.correctAnswers || 0) + 1;
    if (STATE.correctAnswers >= 5) unlockAchievement("five_correct");
  }
  
  // Detectar ejercicio de matemáticas
  if ((STATE.subject === "matemáticas") && 
      (lowerMsg.includes("cuánto") || lowerMsg.includes("calcula") || lowerMsg.includes("resuelve"))) {
    unlockAchievement("math_wiz");
  }
  
  // Detectar ciencias
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
    case "happy":
      mouth.classList.add("happy");
      break;
    case "thinking":
      mouth.classList.add("thinking");
      break;
    case "celebrating":
      mouth.classList.add("celebrating");
      break;
    case "sad":
      mouth.classList.add("sad");
      break;
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

// Eye tracking (los ojos del avatar siguen el cursor)
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
// AVATAR FLOTANTE INTELIGENTE
// ══════════════════════════════════════════════
let avatarInterval = null;
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
  const minX = padding;
  const maxX = areaRect.width - avatarSize - padding;
  const minY = padding + 68;
  const maxY = areaRect.height - avatarSize - padding;

  const startX = Math.random() * (maxX - minX) + minX;
  const startY = Math.random() * (maxY - minY) + minY;

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
  const minX = padding;
  const maxX = areaRect.width - avatarSize - padding;
  const minY = padding + headerHeight;
  const maxY = areaRect.height - avatarSize - padding;

  // 70% de probabilidad de moverse hacia el área de escritura
  const moveToInput = Math.random() > 0.3;
  
  let targetX, targetY;
  
  if (moveToInput) {
    // Moverse hacia el área inferior (input)
    targetX = padding + Math.random() * (areaRect.width * 0.3);
    targetY = maxY - 50 - Math.random() * 80;
  } else {
    targetX = Math.random() * (maxX - minX) + minX;
    targetY = Math.random() * (maxY - minY) + minY;
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

function setAvatarMood(mood) {
  const avatar = document.getElementById("floating-avatar");
  if (!avatar) return;

  avatar.classList.remove("idle", "listening", "excited", "exploring");
  
  switch(mood) {
    case "thinking":
      avatar.classList.add("exploring");
      break;
    case "happy":
    case "excited":
      avatar.classList.add("excited");
      break;
    case "listening":
      avatar.classList.add("listening");
      break;
    default:
      avatar.classList.add("idle");
  }
  
  currentAvatarState = mood;
  
  if (mood !== "idle") {
    setTimeout(() => {
      avatar.classList.remove("listening", "excited", "exploring");
      avatar.classList.add("idle");
      currentAvatarState = "idle";
    }, 3000);
  }
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

// Integrar con el sistema de mensajes
const originalAddMessage = addMessage;
addMessage = function(role, content) {
  const result = originalAddMessage.call(this, role, content);
  
  if (role === "lumi") {
    setAvatarMood("listening");
  }
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
    "suma": "➕ Suma",
    "resta": "➖ Resta",
    "multiplicación": "✖️ Multiplicación",
    "división": "➗ División",
    "fracciones": "½ Fracciones",
    "geometría": "📐 Geometría",
    "fotosíntesis": "🌱 Fotosíntesis",
    "sistema solar": "🌍 Sistema Solar",
    "animales": "🐾 Animales",
    "plantas": "🌿 Plantas",
    "colombia": "🇨🇴 Colombia",
    "historia": "📜 Historia",
    "geografía": "🗺️ Geografía",
    "verbos": "🔤 Verbos",
    "sustantivos": "📝 Sustantivos"
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
// VOZ (TEXT-TO-SPEECH & SPEECH-TO-TEXT)
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
  
  // Buscar voz en español
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
  
  const overlay = document.getElementById("reward-overlay");
  overlay.classList.add("show");
  
  // Confetti
  generateConfetti();
  
  // Auto-cerrar después de 4s
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

function showLevelUp(levelDef) {
  showReward(levelDef.icon, `¡Nivel ${levelDef.level}!`, `Ahora eres: ${levelDef.name}`);
  celebrateAvatar();
  addMessage("lumi", `🎉 ¡¡<strong>${STATE.studentName}</strong>!! ¡Subiste al nivel <strong>${levelDef.name}</strong> ${levelDef.icon}! ¡Eres increíble! ¡Sigue así! 🚀✨`);
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
    STATE.conversationHistory.slice(-20) // Guardar últimos 20 mensajes
  ));
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem("lumi_state");
    if (saved) {
      const data = JSON.parse(saved);
      Object.assign(STATE, data);
      
      // Pre-llenar formulario si hay datos guardados
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

// ══════════════════════════════════════════════
// INTEGRACIÓN SUPABASE (Comentada — para activar)
// ══════════════════════════════════════════════
/*
// Para activar: npm install @supabase/supabase-js o usar CDN
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>

const supabase = window.supabase?.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

async function saveProgressToSupabase() {
  if (!supabase) return;
  const { error } = await supabase
    .from("student_progress")
    .upsert({
      student_name: STATE.studentName,
      age: STATE.age,
      subject: STATE.subject,
      points: STATE.points,
      level: STATE.level,
      xp: STATE.xp,
      achievements: STATE.achievements,
      topics_covered: STATE.topicsCovered,
      updated_at: new Date().toISOString()
    }, { onConflict: "student_name" });
  
  if (error) console.error("Error guardando en Supabase:", error);
}

async function loadProgressFromSupabase(name) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("student_progress")
    .select("*")
    .eq("student_name", name)
    .single();
  
  if (data) {
    STATE.points = data.points || 0;
    STATE.level = data.level || 1;
    STATE.xp = data.xp || 0;
    STATE.achievements = data.achievements || [];
    STATE.topicsCovered = data.topics_covered || [];
    updatePointsDisplay();
    updateXPBar();
    data.topics_covered?.forEach(t => addTopicToList(t));
  }
}

async function saveMessageToSupabase(role, content) {
  if (!supabase) return;
  await supabase.from("chat_messages").insert({
    student_name: STATE.studentName,
    role: role,
    content: content,
    subject: STATE.subject,
    created_at: new Date().toISOString()
  });
}
*/

console.log(`
╔══════════════════════════════════════╗
║   🌟 LUMI — Agente Educativo v1.0   ║
║   Listo para enseñar y aprender     ║
╚══════════════════════════════════════╝

Para activar la IA real:
1. Configura CONFIG.API_KEY con tu clave de Anthropic
2. Para producción, usa un backend proxy seguro
3. Para persistencia, configura Supabase

¡Lumi está listo! 🚀
`);
