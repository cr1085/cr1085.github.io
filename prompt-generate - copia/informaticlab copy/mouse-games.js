// ================================================
// mouse-games.js — Juegos de práctica de Mouse
// InfoMática Platform
// ================================================

const MouseGames = (function() {
  // ---- JUEGO: HUNTER (click targets) ----
  const HunterGame = (function() {
    let state = {
      isPlaying: false,
      targets: [],
      score: 0,
      timeLeft: 30,
      totalTargets: 10,
      timer: null
    };

    function start(containerId, level = 'beginner') {
      state = {
        isPlaying: true,
        targets: [],
        score: 0,
        timeLeft: level === 'easy' ? 30 : level === 'medium' ? 20 : 15,
        totalTargets: level === 'easy' ? 10 : level === 'medium' ? 15 : 20,
        timer: null,
        level
      };

      render(containerId);
      spawnTarget(containerId);
      startTimer(containerId);
    }

    function render(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div class="mouse-game hunter">
          <div class="game-header">
            <div class="game-stat">
              <span class="stat-label">Puntuación</span>
              <span class="stat-value" id="hunterScore">${state.score}</span>
            </div>
            <div class="game-stat">
              <span class="stat-label">Tiempo</span>
              <span class="stat-value" id="hunterTime">${state.timeLeft}s</span>
            </div>
            <div class="game-stat">
              <span class="stat-label">Objetivos</span>
              <span class="stat-value" id="hunterTargets">${state.targets.filter(t => t.hit).length}/${state.totalTargets}</span>
            </div>
          </div>
          <div class="game-area" id="hunterArea">
            <!-- Targets will spawn here -->
          </div>
          <div class="game-instructions">
            <p>🎯 Haz <strong>clic</strong> en los objetivos lo más rápido posible</p>
          </div>
          <button class="btn btn-ghost" onclick="HunterGame.stop()">Detener</button>
        </div>
      `;
    }

    function spawnTarget(containerId) {
      if (!state.isPlaying) return;

      const area = document.getElementById('hunterArea');
      if (!area) return;

      const target = document.createElement('div');
      target.className = 'target';
      
      // Random position within area
      const areaRect = area.getBoundingClientRect();
      const maxX = areaRect.width - 60;
      const maxY = areaRect.height - 60;
      
      target.style.left = Math.random() * maxX + 'px';
      target.style.top = Math.random() * maxY + 'px';
      target.style.animationDuration = (1 + Math.random()) + 's';
      
      target.onclick = (e) => {
        e.stopPropagation();
        hitTarget(target);
      };

      area.appendChild(target);
      state.targets.push({ el: target, hit: false });

      // Despawn after 3 seconds if not clicked
      setTimeout(() => {
        if (!target.classList.contains('hit') && state.isPlaying) {
          target.remove();
        }
      }, 3000);
    }

    function hitTarget(target) {
      if (target.classList.contains('hit')) return;
      
      target.classList.add('hit');
      state.score += 10;
      
      const targetData = state.targets.find(t => t.el === target);
      if (targetData) targetData.hit = true;
      
      updateUI();
      showXpGain(10);

      // Spawn next target
      setTimeout(() => {
        if (state.isPlaying && state.targets.filter(t => t.hit).length < state.totalTargets) {
          spawnTarget('hunterArea');
        } else if (state.targets.filter(t => t.hit).length >= state.totalTargets) {
          endGame();
        }
      }, 500);
    }

    function startTimer(containerId) {
      state.timer = setInterval(() => {
        state.timeLeft--;
        document.getElementById('hunterTime').textContent = state.timeLeft + 's';
        
        if (state.timeLeft <= 0) {
          endGame();
        }
      }, 1000);
    }

    function updateUI() {
      const scoreEl = document.getElementById('hunterScore');
      const targetsEl = document.getElementById('hunterTargets');
      if (scoreEl) scoreEl.textContent = state.score;
      if (targetsEl) targetsEl.textContent = `${state.targets.filter(t => t.hit).length}/${state.totalTargets}`;
    }

    function endGame() {
      state.isPlaying = false;
      if (state.timer) clearInterval(state.timer);

      const xp = Math.min(state.score, 100);
      Progress.addXp(xp, `Hunter: ${state.score} puntos`);

      showToast('success', '¡Juego completado!', `+${xp} XP`);

      const area = document.getElementById('hunterArea');
      if (area) {
        area.innerHTML = `
          <div class="game-over">
            <div class="results-icon">🎯</div>
            <h2>¡Tiempo!</h2>
            <div class="final-stats">
              <div class="stat"><span class="value">${state.score}</span><span>Puntos</span></div>
              <div class="stat"><span class="value">${state.targets.filter(t => t.hit).length}</span><span>Acertados</span></div>
              <div class="stat"><span class="value">${Math.round((state.targets.filter(t => t.hit).length / state.totalTargets) * 100)}%</span><span>Precisión</span></div>
            </div>
            <button class="btn btn-primary" onclick="HunterGame.start('hunterGame', '${state.level}')">🔄 Jugar de nuevo</button>
          </div>
        `;
      }
    }

    function stop() {
      state.isPlaying = false;
      if (state.timer) clearInterval(state.timer);
      showToast('info', 'Juego detenido');
    }

    return { start, stop };
  })();

  // ---- JUEGO: DRAG & DROP ----
  const DragDropGame = (function() {
    let state = {
      isPlaying: false,
      items: [],
      dropZones: [],
      score: 0,
      totalPairs: 5,
      matched: 0
    };

    const ITEMS = [
      { id: 'img1', emoji: '🐶', name: 'Perro', zone: 'animals' },
      { id: 'img2', emoji: '🐱', name: 'Gato', zone: 'animals' },
      { id: 'doc1', emoji: '📄', name: 'Informe', zone: 'documents' },
      { id: 'doc2', emoji: '📊', name: 'Gráfico', zone: 'documents' },
      { id: 'vid1', emoji: '🎬', name: 'Video', zone: 'media' },
      { id: 'aud1', emoji: '🎵', name: 'Música', zone: 'media' }
    ];

    function start(containerId, level = 'beginner') {
      state = {
        isPlaying: true,
        items: [...ITEMS].sort(() => Math.random() - 0.5).slice(0, 4),
        dropZones: ['animals', 'documents', 'media'],
        score: 0,
        totalPairs: 4,
        matched: 0,
        draggedItem: null
      };

      render(containerId);
    }

    function render(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div class="mouse-game dragdrop">
          <div class="game-header">
            <div class="game-stat">
              <span class="stat-label">Parejas</span>
              <span class="stat-value">${state.matched}/${state.totalPairs}</span>
            </div>
          </div>
          
          <div class="drag-sources">
            <h4>Arrastra los elementos a la carpeta correcta:</h4>
            <div class="items-container">
              ${state.items.map(item => `
                <div class="draggable-item" 
                     data-id="${item.id}" 
                     data-zone="${item.zone}"
                     draggable="true"
                     ondragstart="DragDropGame.handleDragStart(event, '${item.id}')">
                  <span class="item-emoji">${item.emoji}</span>
                  <span class="item-name">${item.name}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="drop-zones">
            <div class="drop-zone" 
                 data-zone="animals"
                 ondragover="DragDropGame.handleDragOver(event)"
                 ondrop="DragDropGame.handleDrop(event, 'animals')">
              <span class="zone-icon">🐾</span>
              <span class="zone-name">Animales</span>
            </div>
            <div class="drop-zone" 
                 data-zone="documents"
                 ondragover="DragDropGame.handleDragOver(event)"
                 ondrop="DragDropGame.handleDrop(event, 'documents')">
              <span class="zone-icon">📁</span>
              <span class="zone-name">Documentos</span>
            </div>
            <div class="drop-zone" 
                 data-zone="media"
                 ondragover="DragDropGame.handleDragOver(event)"
                 ondrop="DragDropGame.handleDrop(event, 'media')">
              <span class="zone-icon">🎬</span>
              <span class="zone-name">Multimedia</span>
            </div>
          </div>

          <div class="game-instructions">
            <p>🖱️ Mantén presionado, arrastra y suelta en la carpeta correcta</p>
          </div>
        </div>
      `;
    }

    function handleDragStart(event, itemId) {
      state.draggedItem = itemId;
      event.dataTransfer.setData('text/plain', itemId);
      event.target.classList.add('dragging');
    }

    function handleDragOver(event) {
      event.preventDefault();
      event.currentTarget.classList.add('drag-over');
    }

    function handleDrop(event, zone) {
      event.preventDefault();
      event.currentTarget.classList.remove('drag-over');

      const itemId = state.draggedItem;
      const item = state.items.find(i => i.id === itemId);
      
      if (!item) return;

      if (item.zone === zone) {
        // Correct!
        state.score += 25;
        state.matched++;
        
        // Remove from list
        state.items = state.items.filter(i => i.id !== itemId);
        
        showToast('success', '✓ Correcto!', '+25 XP');
        showXpGain(25);

        // Visual feedback
        event.currentTarget.classList.add('correct');
        setTimeout(() => event.currentTarget.classList.remove('correct'), 500);

        if (state.matched >= state.totalPairs) {
          endGame();
        } else {
          render('dragDropGame');
        }
      } else {
        // Wrong!
        event.currentTarget.classList.add('wrong');
        setTimeout(() => event.currentTarget.classList.remove('wrong'), 500);
        showToast('error', '✕ Incorrecto', 'Intenta de nuevo');
      }

      state.draggedItem = null;
    }

    function endGame() {
      state.isPlaying = false;
      const xp = Math.min(state.score, 100);
      Progress.addXp(xp, 'Drag & Drop completado');

      const container = document.getElementById('dragDropGame');
      if (container) {
        container.innerHTML = `
          <div class="game-over">
            <div class="results-icon">🎉</div>
            <h2>¡Completado!</h2>
            <p>Puntuación: ${state.score}</p>
            <button class="btn btn-primary" onclick="DragDropGame.start('dragDropGame')">🔄 Jugar de nuevo</button>
          </div>
        `;
      }
    }

    return { start, handleDragStart, handleDragOver, handleDrop };
  })();

  // ---- JUEGO: DOUBLE CLICK ----
  const DoubleClickGame = (function() {
    let state = {
      isPlaying: false,
      targets: [],
      score: 0,
      timeLeft: 20,
      requiredDoubles: 8,
      timer: null
    };

    function start(containerId) {
      state = {
        isPlaying: true,
        targets: [],
        score: 0,
        timeLeft: 20,
        requiredDoubles: 8,
        timer: null
      };

      render(containerId);
      spawnTarget(containerId);
      startTimer();
    }

    function render(containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;

      container.innerHTML = `
        <div class="mouse-game dblclick">
          <div class="game-header">
            <div class="game-stat">
              <span class="stat-label">Puntuación</span>
              <span class="stat-value">${state.score}</span>
            </div>
            <div class="game-stat">
              <span class="stat-label">Tiempo</span>
              <span class="stat-value">${state.timeLeft}s</span>
            </div>
          </div>
          <div class="game-area" id="dblArea">
            <!-- Targets spawn here -->
          </div>
          <div class="game-instructions">
            <p>👆 Haz <strong>doble clic</strong> en los objetivos rápidamente</p>
          </div>
        </div>
      `;
    }

    function spawnTarget(containerId) {
      if (!state.isPlaying) return;

      const area = document.getElementById('dblArea');
      if (!area) return;

      const target = document.createElement('div');
      target.className = 'target double-target';
      
      const areaRect = area.getBoundingClientRect();
      target.style.left = Math.random() * (areaRect.width - 50) + 'px';
      target.style.top = Math.random() * (areaRect.height - 50) + 'px';
      
      target.ondblclick = (e) => {
        e.stopPropagation();
        hitTarget(target);
      };

      area.appendChild(target);
      state.targets.push(target);

      setTimeout(() => {
        if (state.isPlaying && !target.classList.contains('hit')) {
          target.remove();
          if (state.isPlaying) spawnTarget('dblArea');
        }
      }, 2500);
    }

    function hitTarget(target) {
      if (target.classList.contains('hit')) return;
      
      target.classList.add('hit');
      state.score += 15;
      
      target.remove();
      
      showXpGain(15);

      if (state.score >= state.requiredDoubles * 15) {
        endGame();
      } else {
        setTimeout(() => spawnTarget('dblArea'), 300);
      }

      updateUI();
    }

    function startTimer() {
      state.timer = setInterval(() => {
        state.timeLeft--;
        updateUI();
        
        if (state.timeLeft <= 0) {
          endGame();
        }
      }, 1000);
    }

    function updateUI() {
      const timeEl = document.querySelector('.dblclick .stat-value');
      if (timeEl) timeEl.textContent = state.timeLeft + 's';
      
      const scoreEl = document.querySelector('.dblclick .game-stat:first-child .stat-value');
      if (scoreEl) scoreEl.textContent = state.score;
    }

    function endGame() {
      state.isPlaying = false;
      if (state.timer) clearInterval(state.timer);

      const xp = Math.min(state.score, 120);
      Progress.addXp(xp, 'Doble clic completado');

      const area = document.getElementById('dblArea');
      if (area) {
        area.innerHTML = `
          <div class="game-over">
            <div class="results-icon">👆</div>
            <h2>¡Excelente!</h2>
            <p>Puntuación: ${state.score}</p>
            <button class="btn btn-primary" onclick="DoubleClickGame.start('dblClickGame')">🔄 Repetir</button>
          </div>
        `;
      }
    }

    return { start };
  })();

  // ---- EXPORTS ----
  return {
    HunterGame,
    DragDropGame,
    DoubleClickGame
  };
})();

window.MouseGames = MouseGames;
window.HunterGame = MouseGames.HunterGame;
window.DragDropGame = MouseGames.DragDropGame;
window.DoubleClickGame = MouseGames.DoubleClickGame;