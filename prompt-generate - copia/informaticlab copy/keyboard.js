// ================================================
// keyboard.js — Teclado Virtual Interactivo + Mecanografía
// InfoMática Platform
// ================================================

const Keyboard = (function() {
  // ---- MAPA DE TECLAS ----
  const KEYBOARD_LAYOUT = [
    // Fila números
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Bksp'],
    // Fila QWERTY
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    // Fila ASDF
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
    // Fila ZXCV
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
    // Espacio
    ['Space']
  ];

  const KEYBOARD_LAYOUT_ES = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', "'", '¡', 'Bksp'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '`', '+', 'Ç'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ', '´', 'Enter'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-'],
    ['Space']
  ];

  // Teclas especiales
  const SPECIAL_KEYS = {
    'Bksp': { width: 2, label: '⌫' },
    'Enter': { width: 2, label: 'Enter' },
    'Space': { width: 6, label: '' },
    'Tab': { width: 1.5, label: 'Tab' },
    'Shift': { width: 1.5, label: '⇧' },
    'Ctrl': { width: 1.5, label: 'Ctrl' },
    'Alt': { width: 1.25, label: 'Alt' },
    'Caps': { width: 1.75, label: 'Bloq Mayús' }
  };

  // Teclas con dedo asignado (homes)
  const HOME_KEYS = {
    'A': 'left-pinky',
    'S': 'left-ring',
    'D': 'left-middle',
    'F': 'left-index',
    'J': 'right-index',
    'K': 'right-middle',
    'L': 'right-ring',
    'Ñ': 'right-pinky'
  };

  // ---- RENDERIZAR TECLADO ----
  function renderKeyboard(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { showFingers = false, onKeyPress = null } = options;
    const layout = KEYBOARD_LAYOUT_ES;

    let html = '<div class="virtual-keyboard">';
    
    layout.forEach((row, rowIndex) => {
      html += '<div class="keyboard-row">';
      
      row.forEach(key => {
        const isSpecial = SPECIAL_KEYS[key];
        const isHome = HOME_KEYS[key] && showFingers;
        const fingerClass = isHome ? HOME_KEYS[key] : '';
        const width = isSpecial ? (isSpecial.width || 1) : 1;
        
        html += `
          <button class="key ${fingerClass}" 
                  data-key="${key === 'Space' ? ' ' : key}"
                  style="--key-width: ${width}"
                  ${onKeyPress ? `onclick="Keyboard.handleKeyPress('${key === 'Space' ? ' ' : key}')"` : ''}>
            <span class="key-label">${isSpecial?.label || key}</span>
            ${showFingers && isHome ? `<span class="finger-indicator"></span>` : ''}
          </button>
        `;
      });
      
      html += '</div>';
    });
    
    html += '</div>';
    container.innerHTML = html;
  }

  // ---- MANEJO DE INPUT ----
  let inputCallback = null;
  let activeInput = null;

  function handleKeyPress(key) {
    if (!inputCallback) return;

    if (key === ' ') {
      inputCallback(' ');
    } else if (key === '⌫' || key === 'Bksp') {
      inputCallback('__BACKSPACE__');
    } else if (key === 'Enter') {
      inputCallback('__ENTER__');
    } else {
      inputCallback(key.toLowerCase());
    }

    // Animación visual
    document.querySelectorAll('.key').forEach(k => k.classList.remove('pressed'));
    const btn = document.querySelector(`[data-key="${key}"]`);
    if (btn) {
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 150);
    }
  }

  function setInputCallback(callback) {
    inputCallback = callback;
  }

  // ---- JUEGO DE MECANOGRAFÍA ----
  const TypingGame = (function() {
    let state = {
      isPlaying: false,
      currentWord: '',
      typedText: '',
      startTime: null,
      mistakes: 0,
      correctChars: 0,
      totalChars: 0,
      words: [],
      currentIndex: 0,
      wpm: 0,
      accuracy: 100
    };

    // Banco de palabras por nivel
    const WORD_BANKS = {
      beginner: [
        'casa', 'perro', 'gato', 'sol', 'agua', 'libro', 'mesa', 'silla', 'puerta', 'ventana',
        'verde', 'azul', 'rojo', 'blanco', 'negro', 'amarillo', 'naranja', 'morado', 'rosa', 'gris',
        'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
        'hola', 'adios', 'gracias', 'por favor', 'si', 'no', 'bueno', 'malo', 'grande', 'chico'
      ],
      intermediate: [
        'computadora', 'teclado', 'monitor', 'escritorio', 'carpeta', 'archivo', 'internet', 'navegador', 'busqueda', 'contraseña',
        'documento', 'presentacion', 'hoja de calculo', 'correo electronico', 'mensaje', 'whatsapp', 'instagram', 'facebook', 'youtube', 'google',
        'trabajo', 'escuela', 'estudiar', 'aprender', 'leer', 'escribir', 'hablar', 'entender', 'pensar', 'crear',
        'tiempo', 'espacio', 'persona', 'familia', 'amigo', 'comunidad', 'sociedad', 'pais', 'mundo', 'vida'
      ],
      advanced: [
        'inteligencia artificial', 'machine learning', 'deep learning', 'neuronas artificiales', 'algoritmos', 'programacion', 'desarrollo web', 'aplicaciones moviles', 'bases de datos', 'servidores cloud',
        'automatizacion', 'transformacion digital', 'blockchain', 'criptomonedas', 'realidad virtual', 'internet de las cosas', 'big data', 'analitica predictiva', 'ciberseguridad', 'proteccion de datos'
      ]
    };

    function getRandomWords(count, level = 'beginner') {
      const bank = WORD_BANKS[level] || WORD_BANKS.beginner;
      const shuffled = [...bank].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    }

    function start(containerId, level = 'beginner') {
      state = {
        isPlaying: true,
        currentWord: '',
        typedText: '',
        startTime: Date.now(),
        mistakes: 0,
        correctChars: 0,
        totalChars: 0,
        words: getRandomWords(20, level),
        currentIndex: 0,
        wpm: 0,
        accuracy: 100,
        level
      };

      state.currentWord = state.words[0];
      render(containerId);
    }

    function handleInput(char) {
      if (!state.isPlaying) return;

      if (char === '__BACKSPACE__') {
        state.typedText = state.typedText.slice(0, -1);
      } else if (char === '__ENTER__') {
        checkWord();
      } else {
        // Verificar carácter
        const expectedChar = state.currentWord[state.typedText.length];
        if (char === expectedChar) {
          state.typedText += char;
          state.correctChars++;
        } else {
          state.mistakes++;
          state.typedText += char;
        }
        state.totalChars++;
      }

      // Calcular WPM y precisión
      const elapsed = (Date.now() - state.startTime) / 1000 / 60; // minutos
      state.wpm = Math.round(state.totalChars / 5 / elapsed) || 0;
      state.accuracy = Math.round((state.correctChars / state.totalChars) * 100) || 100;

      // Verificar si completó la palabra
      if (state.typedText === state.currentWord) {
        checkWord();
      }

      renderState();
    }

    function checkWord() {
      if (state.typedText === state.currentWord) {
        showToast('success', '✓', `+${state.currentWord.length * 2} XP`);
      }

      // Siguiente palabra
      state.currentIndex++;
      if (state.currentIndex >= state.words.length) {
        endGame();
        return;
      }

      state.currentWord = state.words[state.currentIndex];
      state.typedText = '';
      renderState();
    }

    function endGame() {
      state.isPlaying = false;
      
      // Calcular XP gained
      const baseXp = state.wpm * 2;
      const accuracyBonus = Math.floor(state.accuracy / 10);
      const totalXp = baseXp + accuracyBonus;

      Progress.addXp(totalXp, `Mecanografía: ${state.wpm} PPM, ${state.accuracy}% precisión`);

      showToast('success', '¡Completado!', `${totalXp} XP ganados`);
      renderEndScreen(totalXp);
    }

    function render(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div class="typing-game">
          <div class="typing-stats">
            <div class="stat">
              <span class="stat-value">${state.wpm}</span>
              <span class="stat-label">PPM</span>
            </div>
            <div class="stat">
              <span class="stat-value">${state.accuracy}%</span>
              <span class="stat-label">Precisión</span>
            </div>
            <div class="stat">
              <span class="stat-value">${state.currentIndex}/${state.words.length}</span>
              <span class="stat-label">Palabras</span>
            </div>
          </div>

          <div class="typing-area">
            <div class="current-word">
              ${state.currentWord.split('').map((char, i) => {
                let className = 'char';
                if (i < state.typedText.length) {
                  className += state.typedText[i] === char ? ' correct' : ' incorrect';
                } else if (i === state.typedText.length) {
                  className += ' cursor';
                }
                return `<span class="${className}">${char}</span>`;
              }).join('')}
            </div>
          </div>

          <div class="typing-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(state.currentIndex / state.words.length) * 100}%"></div>
            </div>
          </div>

          <div class="keyboard-hint">
            <p>💡 Escribe las letras que aparecen. Presiona <strong>Enter</strong> para enviar la palabra.</p>
          </div>

          <button class="btn btn-ghost" onclick="TypingGame.stop()">Detener</button>
        </div>
      `;

      // Auto-focus para capturar keys
      container.addEventListener('keydown', handleKeyDown);
      container.focus();
    }

    function handleKeyDown(e) {
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleInput('__BACKSPACE__');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleInput('__ENTER__');
      } else if (e.key.length === 1 && /[a-záéíóúñA-ZÁÉÍÓÚÑ]/.test(e.key)) {
        e.preventDefault();
        handleInput(e.key.toLowerCase());
      }
    }

    function renderState() {
      const wordEl = document.querySelector('.current-word');
      const statsEl = document.querySelector('.typing-stats');
      const progressEl = document.querySelector('.progress-fill');
      
      if (wordEl) {
        wordEl.innerHTML = state.currentWord.split('').map((char, i) => {
          let className = 'char';
          if (i < state.typedText.length) {
            className += state.typedText[i] === char ? ' correct' : ' incorrect';
          } else if (i === state.typedText.length) {
            className += ' cursor';
          }
          return `<span class="${className}">${char}</span>`;
        }).join('');
      }

      if (statsEl) {
        statsEl.innerHTML = `
          <div class="stat"><span class="stat-value">${state.wpm}</span><span class="stat-label">PPM</span></div>
          <div class="stat"><span class="stat-value">${state.accuracy}%</span><span class="stat-label">Precisión</span></div>
          <div class="stat"><span class="stat-value">${state.currentIndex}/${state.words.length}</span><span class="stat-label">Palabras</span></div>
        `;
      }

      if (progressEl) {
        progressEl.style.width = `${(state.currentIndex / state.words.length) * 100}%`;
      }
    }

    function renderEndScreen(xp) {
      const container = document.querySelector('.typing-game');
      if (!container) return;

      container.innerHTML = `
        <div class="typing-results">
          <div class="results-icon">🏆</div>
          <h2>¡Ejercicio completado!</h2>
          <div class="results-stats">
            <div class="result-item">
              <span class="result-value">${state.wpm}</span>
              <span class="result-label">PPM (Palabras por minuto)</span>
            </div>
            <div class="result-item">
              <span class="result-value">${state.accuracy}%</span>
              <span class="result-label">Precisión</span>
            </div>
            <div class="result-item">
              <span class="result-value">${state.words.length}</span>
              <span class="result-label">Palabras completadas</span>
            </div>
            <div class="result-item highlight">
              <span class="result-value">+${xp}</span>
              <span class="result-label">XP Ganados</span>
            </div>
          </div>
          <div class="wpm-tier-result">
            Tu nivel: <span class="tier ${getWpmTier(state.wpm)}">${getWpmTierName(state.wpm)}</span>
          </div>
          <div class="results-actions">
            <button class="btn btn-ghost" onclick="TypingGame.start('typingGameContainer', '${state.level}')">🔄 Repetir</button>
            <button class="btn btn-primary" onclick="openSection('modules')">Continuar →</button>
          </div>
        </div>
      `;
    }

    function getWpmTier(wpm) {
      if (wpm >= 60) return 'expert';
      if (wpm >= 40) return 'advanced';
      if (wpm >= 20) return 'intermediate';
      return 'beginner';
    }

    function getWpmTierName(wpm) {
      if (wpm >= 60) return 'Experto';
      if (wpm >= 40) return 'Avanzado';
      if (wpm >= 20) return 'Intermedio';
      return 'Principiante';
    }

    function stop() {
      state.isPlaying = false;
      showToast('info', 'Ejercicio detenido');
    }

    return {
      start,
      handleInput,
      stop
    };
  })();

  // ---- EXPORTS ----
  return {
    renderKeyboard,
    handleKeyPress,
    setInputCallback,
    TypingGame
  };
})();

window.Keyboard = Keyboard;
window.TypingGame = Keyboard.TypingGame;