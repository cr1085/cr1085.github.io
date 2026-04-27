// ================================================
// exercises.js — Ejercicios con store reactivo
// InfoMática Platform
// ================================================

const Exercises = (function() {
  // ---- BANCO DE PREGUNTAS ----
  const QUIZ_BANK = [
    { q: '¿Qué tecla usas para ir a una nueva línea en Word?', options: ['Tab', 'Shift', 'Enter', 'Ctrl'], correct: 2, xp: 15 },
    { q: '¿Qué significa "Ctrl + C"?', options: ['Cortar', 'Copiar', 'Cerrar', 'Cambiar'], correct: 1, xp: 15 },
    { q: '¿Qué significa "Ctrl + V"?', options: ['Ver documento', 'Verificar', 'Pegar', 'Volver'], correct: 2, xp: 15 },
    { q: 'El ícono del disquete 💾 en Word sirve para:', options: ['Abrir archivo', 'Guardar archivo', 'Imprimir', 'Enviar por email'], correct: 1, xp: 10 },
    { q: '¿Cuál de estas NO es una alineación de texto en Word?', options: ['Izquierda', 'Diagonal', 'Centro', 'Derecha'], correct: 1, xp: 20 },
    { q: '¿Qué hace "Ctrl + A" en Word?', options: ['Agrandar texto', 'Seleccionar todo el texto', 'Abrir nuevo documento', 'Agregar imagen'], correct: 1, xp: 15 },
    { q: 'Para hacer el texto más grande en Word, ¿qué cambias?', options: ['El tipo de archivo', 'El margen', 'El tamaño de fuente', 'El color del fondo'], correct: 2, xp: 10 },
    { q: '¿Qué extensión tienen los archivos de Word?', options: ['.pdf', '.xlsx', '.docx', '.pptx'], correct: 2, xp: 10 },
  ];

  // ---- EJERCICIOS FILL-IN-THE-BLANK ----
  const FILL_EXERCISES = [
    { text: 'Para hacer el texto en <strong>___</strong>, uso Ctrl+N.', answer: 'negrita', alternatives: ['negrita', 'cursiva', 'normal', 'color'], xp: 20, hint: 'Es cuando el texto se ve más grueso y oscuro' },
    { text: 'Para guardar un documento uso la combinación <strong>Ctrl + ___</strong>.', answer: 'G', alternatives: ['G', 'S', 'A', 'Z'], xp: 15, hint: 'Es la primera letra de la palabra "Guardar"' },
    { text: 'Los archivos de Word tienen la extensión <strong>___</strong>.', answer: '.docx', alternatives: ['.docx', '.xlsx', '.pdf', '.txt'], xp: 15, hint: 'Es la extensión de "Document XML"' },
    { text: 'Para deshacer el último cambio uso <strong>Ctrl + ___</strong>.', answer: 'Z', alternatives: ['Z', 'X', 'Y', 'D'], xp: 15, hint: 'Es la última letra del abecedario' },
  ];

  // ---- MATCH PAIRS ----
  const MATCH_PAIRS = [
    { left: 'Ctrl + C', right: 'Copiar' },
    { left: 'Ctrl + V', right: 'Pegar' },
    { left: 'Ctrl + Z', right: 'Deshacer' },
    { left: 'Ctrl + G', right: 'Guardar' },
    { left: 'Ctrl + N', right: 'Negrita' },
    { left: 'Ctrl + A', right: 'Seleccionar todo' },
  ];

  // Estado del ejercicio (se mantiene en store)
  function getExerciseState() {
    return Store.get('exerciseState') || { type: null, questionIndex: 0, score: 0, answers: [] };
  }

  function setExerciseState(updates) {
    const current = getExerciseState();
    Store.setState({ exerciseState: { ...current, ...updates } });
  }

  // ---- RENDERIZAR BIENVENIDA ----
  function renderWelcome() {
    const container = document.getElementById('exerciseContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="ex-welcome">
        <span class="ex-welcome-icon">🎮</span>
        <h2>¿Listo para practicar?</h2>
        <p>Elige un tipo de ejercicio para comenzar</p>
        <div class="ex-types">
          <button class="ex-type-btn" onclick="Exercises.start('quiz')">
            <span>❓</span> Quiz
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('fill')">
            <span>✏️</span> Completar texto
          </button>
          <button class="ex-type-btn" onclick="Exercises.start('match')">
            <span>🔗</span> Unir conceptos
          </button>
        </div>
      </div>
    `;
  }

  // ---- INICIAR EJERCICIO ----
  function start(type) {
    setExerciseState({ type, questionIndex: 0, score: 0, answers: [] });

    if (type === 'quiz') renderQuiz();
    else if (type === 'fill') renderFill();
    else if (type === 'match') renderMatch();
  }

  // ==========================================
  // QUIZ MÚLTIPLE OPCIÓN
  // ==========================================
  function renderQuiz() {
    const state = getExerciseState();
    const questionIndex = state.questionIndex;
    const score = state.score;

    if (questionIndex >= QUIZ_BANK.length) {
      showQuizResults(score);
      return;
    }

    const question = QUIZ_BANK[questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((questionIndex / QUIZ_BANK.length) * 100);

    container.innerHTML = `
      <div class="ex-progress-bar">
        <div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div>
        <span class="ex-prog-label">${questionIndex + 1} / ${QUIZ_BANK.length}</span>
      </div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">
          ❓ Pregunta ${questionIndex + 1}
        </div>
        <div class="quiz-q-text">${question.q}</div>
        <div class="quiz-options" id="quizOptions">
          ${question.options.map((opt, i) => `
            <button class="quiz-option" onclick="Exercises.handleQuizAnswer(${i}, ${question.correct}, ${question.xp})">
              <span style="margin-right:8px;font-weight:700;color:var(--text-3)">${String.fromCharCode(65 + i)}.</span>
              ${opt}
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback hidden" id="quizFeedback"></div>
      </div>
    `;
  }

  async function handleQuizAnswer(selected, correct, xp) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(o => o.disabled = true);

    const state = getExerciseState();
    const feedback = document.getElementById('quizFeedback');
    const isCorrect = selected === correct;

    options[selected].classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) options[correct].classList.add('correct');

    const newScore = isCorrect ? state.score + xp : state.score;

    if (isCorrect) {
      feedback.className = 'quiz-feedback correct-msg';
      feedback.innerHTML = `✅ ¡Correcto! <span style="color:var(--brand-accent);font-weight:700">+${xp} XP</span>`;
    } else {
      feedback.className = 'quiz-feedback wrong-msg';
      feedback.innerHTML = `❌ No es correcto. La respuesta era: <strong>${QUIZ_BANK[state.questionIndex].options[correct]}</strong>`;
    }

    feedback.classList.remove('hidden');

    // Actualizar estado
    setExerciseState({ score: newScore });

    // Auto-avanzar
    setTimeout(() => {
      setExerciseState({ questionIndex: state.questionIndex + 1 });
      renderQuiz();
    }, 1800);
  }

  async function showQuizResults(score) {
    const container = document.getElementById('exerciseContainer');
    const maxScore = QUIZ_BANK.reduce((s, q) => s + q.xp, 0);
    const percent = Math.round((score / maxScore) * 100);
    const isPerfect = percent === 100;

    let emoji, msg;
    if (percent === 100) { emoji = '🏆'; msg = '¡Perfecto! Eres un maestro.'; }
    else if (percent >= 80) { emoji = '⭐'; msg = '¡Excelente trabajo!'; }
    else if (percent >= 60) { emoji = '👍'; msg = 'Buen intento. ¡Sigue practicando!'; }
    else { emoji = '💪'; msg = 'Necesitas repasar un poco más.'; }

    container.innerHTML = `
      <div style="text-align:center;padding:60px 40px;max-width:500px;margin:0 auto">
        <div style="font-size:4rem;margin-bottom:16px">${emoji}</div>
        <h2 style="margin-bottom:8px">${msg}</h2>
        <div style="font-size:3rem;font-weight:800;font-family:var(--font-display);background:var(--grad-brand);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:20px 0">
          ${percent}%
        </div>
        <p style="color:var(--text-2);margin-bottom:8px">Puntuación: <strong>${score} / ${maxScore} XP</strong></p>
        <p style="color:var(--text-2);margin-bottom:32px">${QUIZ_BANK.length} preguntas completadas</p>
        <div style="display:flex;gap:12px;justify-content:center">
          <button class="btn btn-ghost" onclick="Exercises.start('quiz')">🔄 Repetir</button>
          <button class="btn btn-primary" onclick="Exercises.claimQuizXp(${score}, ${isPerfect})">
            Cobrar +${score} XP →
          </button>
        </div>
      </div>
    `;
  }

  async function claimQuizXp(xpAmount, isPerfect) {
    const state = Store.getState();
    if (!state.currentUser || !state.isAuthenticated) {
      showToast('error', 'Debes iniciar sesión', 'Para guardar tu progreso');
      return;
    }

    await Progress.updateUserProgress('quiz_complete', { xp: xpAmount, isPerfect });
    
    renderWelcome();
  }

  // ==========================================
  // FILL IN THE BLANK
  // ==========================================
  function renderFill() {
    const state = getExerciseState();
    const questionIndex = state.questionIndex;

    if (questionIndex >= FILL_EXERCISES.length) {
      showFillResults(state.score);
      return;
    }

    const exercise = FILL_EXERCISES[questionIndex];
    const container = document.getElementById('exerciseContainer');
    const progress = Math.round((questionIndex / FILL_EXERCISES.length) * 100);

    container.innerHTML = `
      <div class="ex-progress-bar">
        <div class="ex-prog-track"><div class="ex-prog-fill" style="width:${progress}%"></div></div>
        <span class="ex-prog-label">${questionIndex + 1} / ${FILL_EXERCISES.length}</span>
      </div>
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">
          ✏️ Completa el texto
        </div>
        <div class="quiz-q-text" style="font-size:1.1rem;margin-bottom:24px">
          ${exercise.text}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px" id="fillOptions">
          ${exercise.alternatives.map((alt) => `
            <button class="quiz-option" style="text-align:center" onclick="Exercises.handleFillAnswer(this, '${alt}', '${exercise.answer}', ${exercise.xp})">
              ${alt}
            </button>
          `).join('')}
        </div>
        <div style="margin-top:16px;font-size:0.8rem;color:var(--text-3)">
          💡 Pista: ${exercise.hint}
        </div>
        <div class="quiz-feedback hidden" id="fillFeedback"></div>
      </div>
    `;
  }

  function handleFillAnswer(button, selected, correct, xp) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(o => o.disabled = true);

    const state = getExerciseState();
    const feedback = document.getElementById('fillFeedback');
    const isCorrect = selected === correct;

    button.classList.add(isCorrect ? 'correct' : 'wrong');
    if (!isCorrect) {
      options.forEach(o => { if (o.textContent.trim() === correct) o.classList.add('correct'); });
    }

    feedback.className = `quiz-feedback ${isCorrect ? 'correct-msg' : 'wrong-msg'}`;
    feedback.innerHTML = isCorrect
      ? `✅ ¡Correcto! La respuesta es <strong>${correct}</strong> <span style="color:var(--brand-accent)">+${xp} XP</span>`
      : `❌ La respuesta correcta es: <strong>${correct}</strong>`;
    feedback.classList.remove('hidden');

    const newScore = isCorrect ? state.score + xp : state.score;
    setExerciseState({ score: newScore });

    setTimeout(() => {
      setExerciseState({ questionIndex: state.questionIndex + 1 });
      renderFill();
    }, 1800);
  }

  function showFillResults(score) {
    const container = document.getElementById('exerciseContainer');
    const maxScore = FILL_EXERCISES.reduce((s, e) => s + e.xp, 0);
    const percent = Math.round((score / maxScore) * 100);

    container.innerHTML = `
      <div style="text-align:center;padding:60px 40px">
        <div style="font-size:3.5rem;margin-bottom:12px">${percent >= 75 ? '🌟' : '💪'}</div>
        <h2 style="margin-bottom:16px">${percent >= 75 ? '¡Muy bien!' : 'Buen esfuerzo'}</h2>
        <p style="color:var(--text-2);margin-bottom:28px">Puntuación: <strong>${score} / ${maxScore} XP</strong></p>
        <div style="display:flex;gap:12px;justify-content:center">
          <button class="btn btn-ghost" onclick="Exercises.start('fill')">🔄 Repetir</button>
          <button class="btn btn-primary" onclick="Exercises.claimQuizXp(${score}, false)">Cobrar +${score} XP →</button>
        </div>
      </div>
    `;
  }

  // ==========================================
  // MATCHING EXERCISE
  // ==========================================
  function renderMatch() {
    setExerciseState({ 
      matchSelectedLeft: null, 
      matchedPairs: 0 
    });

    const container = document.getElementById('exerciseContainer');
    const shuffledRight = [...MATCH_PAIRS].sort(() => Math.random() - 0.5).map(p => p.right);

    container.innerHTML = `
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">
          🔗 Une cada atajo con su función
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:8px">
          <div style="display:flex;flex-direction:column;gap:8px" id="matchLeft">
            ${MATCH_PAIRS.map((p, i) => `
              <button class="quiz-option match-left" id="left-${i}" data-pair="${i}" onclick="Exercises.selectLeft(this)" style="font-weight:700;letter-spacing:.04em">
                ${p.left}
              </button>
            `).join('')}
          </div>
          <div style="display:flex;flex-direction:column;gap:8px" id="matchRight">
            ${shuffledRight.map((r, i) => `
              <button class="quiz-option match-right" id="right-${i}" data-value="${r}" onclick="Exercises.selectRight(this)" style="font-size:0.85rem">
                ${r}
              </button>
            `).join('')}
          </div>
        </div>
        <div style="margin-top:16px;font-size:0.85rem;color:var(--text-3)">
          Emparejados: <span id="matchCount" style="font-weight:700;color:var(--brand-accent)">0</span> / ${MATCH_PAIRS.length}
        </div>
      </div>
    `;
  }

  function selectLeft(button) {
    document.querySelectorAll('.match-left').forEach(b => b.style.borderColor = '');
    if (button.disabled) return;
    
    setExerciseState({ matchSelectedLeft: button });
    button.style.borderColor = 'var(--brand-1)';
  }

  async function selectRight(button) {
    const state = getExerciseState();
    const selectedLeft = state.matchSelectedLeft;
    const matchedPairs = state.matchedPairs || 0;

    if (!selectedLeft || button.disabled) return;

    const leftIdx = parseInt(selectedLeft.dataset.pair);
    const correctRight = MATCH_PAIRS[leftIdx].right;
    const isCorrect = button.dataset.value === correctRight;

    if (isCorrect) {
      selectedLeft.classList.add('correct');
      button.classList.add('correct');
      selectedLeft.disabled = true;
      button.disabled = true;
      
      const newMatched = matchedPairs + 1;
      setExerciseState({ matchedPairs: newMatched });
      
      document.getElementById('matchCount').textContent = newMatched;
      showXpGain(15);

      if (newMatched === MATCH_PAIRS.length) {
        setTimeout(async () => {
          const totalXp = MATCH_PAIRS.length * 15;
          await Progress.addXp(totalXp, 'Ejercicio de emparejamiento completado');
          showToast('success', '¡Completado!', `+${totalXp} XP ganados`);
          renderWelcome();
        }, 1000);
      }
    } else {
      selectedLeft.classList.add('wrong');
      button.classList.add('wrong');
      setTimeout(() => {
        selectedLeft.classList.remove('wrong');
        button.classList.remove('wrong');
        document.querySelectorAll('.match-left').forEach(b => b.style.borderColor = '');
      }, 600);
    }

    setExerciseState({ matchSelectedLeft: null });
  }

  // ==========================================
  // SIMULADOR (delegado a Simulator module)
  // ==========================================
  function getSimulatorTask() {
    return Store.get('simulatorTask');
  }

  function setSimulatorTask(task) {
    Store.setState({ simulatorTask: task });
  }

  // ---- EXPORTS ----
  return {
    QUIZ_BANK,
    FILL_EXERCISES,
    MATCH_PAIRS,
    getExerciseState,
    setExerciseState,
    renderWelcome,
    start,
    renderQuiz,
    handleQuizAnswer,
    claimQuizXp,
    renderFill,
    handleFillAnswer,
    renderMatch,
    selectLeft,
    selectRight
  };
})();

// Exponer globalmente
window.Exercises = Exercises;