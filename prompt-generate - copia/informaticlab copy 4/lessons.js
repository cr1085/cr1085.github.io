// ================================================
// lessons.js — Lecciones con store reactivo
// InfoMática Platform
// ================================================

const Lessons = (function() {
  // ---- DATOS DE LECCIONES ----
  const LESSONS_DATA = [
    {
      id: 'word-01',
      module: 'word',
      order: 1,
      title: 'Conociendo Word',
      subtitle: '¿Qué es Word y para qué sirve?',
      duration: '5 min',
      xp: 20,
      content: `
        <h2>¿Qué es Microsoft Word?</h2>
        <p>Microsoft Word es un procesador de texto, es decir, un programa que nos permite <strong>escribir, dar formato y guardar documentos</strong> en nuestra computadora.</p>
        <br/>
        <p>Lo usamos para crear:</p>
        <ul style="margin-left:20px;line-height:2">
          <li>📄 Cartas y documentos formales</li>
          <li>📋 Currículos (hojas de vida)</li>
          <li>📝 Informes y tareas escolares</li>
          <li>📑 Formularios</li>
        </ul>
        <br/>
        <div style="background:rgba(79,70,229,0.1);border:1px solid rgba(79,70,229,0.3);border-radius:12px;padding:16px;margin-top:16px">
          <strong>💡 Dato curioso:</strong> Word fue creado en 1983 y es el procesador de texto más usado en el mundo.
        </div>
      `,
      quiz: {
        question: '¿Para qué sirve Microsoft Word principalmente?',
        options: [
          { text: 'Para crear hojas de cálculo con números', correct: false },
          { text: 'Para escribir y dar formato a documentos de texto', correct: true },
          { text: 'Para navegar por internet', correct: false },
          { text: 'Para editar videos', correct: false }
        ],
        explanation: '¡Correcto! Word es un procesador de texto, ideal para crear y editar documentos.'
      }
    },
    {
      id: 'word-02',
      module: 'word',
      order: 2,
      title: 'La interfaz de Word',
      subtitle: 'Conoce las partes principales',
      duration: '8 min',
      xp: 25,
      content: `
        <h2>Partes de la pantalla de Word</h2>
        <p>Cuando abres Word, verás varias partes importantes:</p>
        <br/>
        <div style="display:grid;gap:12px">
          <div style="background:rgba(79,70,229,0.1);border-radius:10px;padding:14px">
            <strong>🎀 La Cinta (Ribbon)</strong><br/>
            Barra superior con botones y herramientas organizados en pestañas (Inicio, Insertar, Diseño...).
          </div>
          <div style="background:rgba(16,185,129,0.1);border-radius:10px;padding:14px">
            <strong>📄 El Área de texto</strong><br/>
            El espacio en blanco donde escribes tu documento, como una hoja de papel digital.
          </div>
          <div style="background:rgba(245,158,11,0.1);border-radius:10px;padding:14px">
            <strong>💾 Barra de acceso rápido</strong><br/>
            Íconos pequeños en la esquina superior izquierda para Guardar, Deshacer y Rehacer.
          </div>
          <div style="background:rgba(236,72,153,0.1);border-radius:10px;padding:14px">
            <strong>📊 Barra de estado</strong><br/>
            En la parte inferior, muestra el número de páginas, palabras y el zoom actual.
          </div>
        </div>
      `,
      quiz: {
        question: '¿Cómo se llama la barra superior de Word que tiene botones organizados por pestañas?',
        options: [
          { text: 'Barra de tareas', correct: false },
          { text: 'La Cinta (Ribbon)', correct: true },
          { text: 'Panel de control', correct: false },
          { text: 'Menú flotante', correct: false }
        ],
        explanation: '¡Así es! La Cinta o Ribbon es la barra superior con todas las herramientas organizadas por pestañas.'
      }
    },
    {
      id: 'word-03',
      module: 'word',
      order: 3,
      title: 'Escribir y editar texto',
      subtitle: 'Seleccionar, borrar, mover',
      duration: '10 min',
      xp: 30,
      content: `
        <h2>Cómo escribir en Word</h2>
        <p>Para escribir en Word, simplemente haz clic en el área blanca y empieza a escribir con el teclado. Verás un cursor parpadeante que te indica dónde aparecerá el texto.</p>
        <br/>
        <h3>Teclas importantes ⌨️</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;text-align:center">
            <strong style="font-size:1.2rem">⌫ Backspace</strong><br/>
            <span style="font-size:0.8rem;color:#888">Borra el carácter anterior</span>
          </div>
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;text-align:center">
            <strong style="font-size:1.2rem">Del</strong><br/>
            <span style="font-size:0.8rem;color:#888">Borra el carácter siguiente</span>
          </div>
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;text-align:center">
            <strong style="font-size:1.2rem">Enter ↵</strong><br/>
            <span style="font-size:0.8rem;color:#888">Nueva línea/párrafo</span>
          </div>
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:12px;text-align:center">
            <strong style="font-size:1.2rem">Ctrl + Z</strong><br/>
            <span style="font-size:0.8rem;color:#888">Deshacer el último cambio</span>
          </div>
        </div>
      `,
      quiz: {
        question: '¿Qué combinación de teclas deshace el último cambio en Word?',
        options: [
          { text: 'Ctrl + S', correct: false },
          { text: 'Ctrl + X', correct: false },
          { text: 'Ctrl + Z', correct: true },
          { text: 'Alt + F4', correct: false }
        ],
        explanation: '¡Perfecto! Ctrl + Z es la combinación universal para deshacer. ¡La más importante de recordar!'
      }
    },
    {
      id: 'word-04',
      module: 'word',
      order: 4,
      title: 'Negrita, Cursiva y Subrayado',
      subtitle: 'Da estilo a tu texto',
      duration: '8 min',
      xp: 25,
      content: `
        <h2>Formatos básicos de texto</h2>
        <p>Word permite cambiar el aspecto del texto fácilmente. Los tres formatos más usados son:</p>
        <br/>
        <div style="display:grid;gap:14px">
          <div style="background:rgba(79,70,229,0.1);border-radius:10px;padding:16px;display:flex;align-items:center;gap:16px">
            <span style="font-size:2rem;font-weight:900;width:50px;text-align:center">N</span>
            <div>
              <strong>Negrita — Ctrl + N (o B en inglés)</strong><br/>
              <span style="color:#888;font-size:0.85rem">Hace el texto más grueso y llamativo. Úsalo para palabras importantes.</span><br/>
              <span style="font-weight:bold">Ejemplo: <strong>Este texto está en negrita</strong></span>
            </div>
          </div>
          <div style="background:rgba(16,185,129,0.1);border-radius:10px;padding:16px;display:flex;align-items:center;gap:16px">
            <span style="font-size:2rem;font-style:italic;width:50px;text-align:center">I</span>
            <div>
              <strong>Cursiva — Ctrl + K (o I en inglés)</strong><br/>
              <span style="color:#888;font-size:0.85rem">Inclina el texto. Se usa para títulos de libros o términos especiales.</span><br/>
              <span><em>Ejemplo: Este texto está en cursiva</em></span>
            </div>
          </div>
          <div style="background:rgba(245,158,11,0.1);border-radius:10px;padding:16px;display:flex;align-items:center;gap:16px">
            <span style="font-size:2rem;text-decoration:underline;width:50px;text-align:center">S</span>
            <div>
              <strong>Subrayado — Ctrl + S (o U en inglés)</strong><br/>
              <span style="color:#888;font-size:0.85rem">Agrega una línea debajo del texto.</span><br/>
              <span><u>Ejemplo: Este texto está subrayado</u></span>
            </div>
          </div>
        </div>
      `,
      quiz: {
        question: '¿Qué atajo de teclado aplica negrita en Word (versión en español)?',
        options: [
          { text: 'Ctrl + I', correct: false },
          { text: 'Ctrl + B', correct: false },
          { text: 'Ctrl + N', correct: true },
          { text: 'Ctrl + G', correct: false }
        ],
        explanation: '¡Correcto! En Word en español, Ctrl + N aplica negrita (N de "Negrita"). En inglés sería Ctrl + B (Bold).'
      }
    },
    {
      id: 'word-05',
      module: 'word',
      order: 5,
      title: 'Guardar tu documento',
      subtitle: '¡No pierdas tu trabajo!',
      duration: '6 min',
      xp: 20,
      content: `
        <h2>Cómo guardar en Word</h2>
        <p>Guardar frecuentemente es un hábito muy importante. Puedes perder tu trabajo si se va la luz o se cierra el programa.</p>
        <br/>
        <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:14px;margin-bottom:16px">
          ⚠️ <strong>Tip importante:</strong> Guarda cada 5-10 minutos mientras trabajas. ¡Los profesionales lo hacen siempre!
        </div>
        <h3>Formas de guardar:</h3>
        <div style="display:grid;gap:10px;margin-top:12px">
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:14px">
            <strong>💾 Ctrl + G</strong> — Guardar (sobreescribe el archivo existente)
          </div>
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:14px">
            <strong>📁 Ctrl + Shift + G</strong> — Guardar Como (crea un archivo nuevo con otro nombre)
          </div>
          <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:14px">
            <strong>🖱️ Menú Archivo → Guardar</strong> — Igual que Ctrl + G pero con el mouse
          </div>
        </div>
        <br/>
        <p style="color:#888">Los archivos de Word se guardan con extensión <strong>.docx</strong> (por defecto)</p>
      `,
      quiz: {
        question: '¿Cuál es la extensión de archivo que usa Word por defecto al guardar?',
        options: [
          { text: '.pdf', correct: false },
          { text: '.docx', correct: true },
          { text: '.xlsx', correct: false },
          { text: '.txt', correct: false }
        ],
        explanation: '¡Exacto! Los archivos de Word se guardan con la extensión .docx, que significa "Document XML".'
      }
    },
  ];

  // ---- CARGAR CAMINO DE LECCIONES ----
  function loadLessonsPath(moduleId, autoOpenFirst = true) {
    const path = document.getElementById('lessonsPath');
    if (!path) return;

    const state = Store.getState();
    const completedLessons = state.completedLessons || [];
    const currentModule = moduleId || state.currentModule || 'pc_basico';

    // Guardar en store
    Store.setState({ currentModule: currentModule });

    // Obtener módulo de Modules.js
    const module = Modules.getModule(currentModule);
    if (!module || !module.lessons) {
      path.innerHTML = '<div class="path-loading">Cargando lecciones...</div>';
      return;
    }

    // Filtrar lecciones del módulo actual
    const lessons = module.lessons;
    const moduleProgress = state.moduleProgress || {};

    // Buscar primera lección no completada
    let firstUncompletedIndex = 0;
    for (let i = 0; i < lessons.length; i++) {
      if (!completedLessons.includes(lessons[i].id)) {
        firstUncompletedIndex = i;
        break;
      }
      if (i === lessons.length - 1) {
        firstUncompletedIndex = i; // Todas completadas
      }
    }

    // Auto-abrir primera lección si es la primera vez o no hay progreso
    if (autoOpenFirst && firstUncompletedIndex < lessons.length) {
      const lesson = lessons[firstUncompletedIndex];
      // Solo abrir si no está completada
      if (!completedLessons.includes(lesson.id)) {
        setTimeout(() => openLesson(firstUncompletedIndex, currentModule), 300);
      }
    }

    path.innerHTML = '';

    lessons.forEach((lesson, index) => {
      const isCompleted = completedLessons.includes(lesson.id);
      const previousLessonCompleted = index === 0 || completedLessons.includes(lessons[index - 1].id);
      const isLocked = !previousLessonCompleted;
      const isActive = !isCompleted && !isLocked;

      // Calcular progreso del módulo
      const completedCount = lessons.filter(l => completedLessons.includes(l.id)).length;
      const progressPercent = Math.round((completedCount / lessons.length) * 100);

      // Actualizar progreso en store
      if (progressPercent > (moduleProgress[currentModule] || 0)) {
        Store.setState({
          moduleProgress: {
            ...moduleProgress,
            [currentModule]: progressPercent
          }
        });
      }

      const node = document.createElement('div');
      node.className = `lesson-node ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isActive ? 'active' : ''}`;
      node.style.animationDelay = `${index * 60}ms`;
      node.innerHTML = `
        <div class="lesson-number">${isCompleted ? '✓' : index + 1}</div>
        <div class="lesson-info">
          <div class="lesson-title">${lesson.title}</div>
          <div class="lesson-meta">${lesson.subtitle || ''} · ${lesson.duration || ''}</div>
        </div>
        <div class="lesson-xp">+${lesson.xp} XP</div>
        ${isLocked ? '<span style="font-size:1.2rem">🔒</span>' : ''}
      `;

      if (!isLocked) {
        node.addEventListener('click', () => openLesson(lesson, currentModule));
      }

      path.appendChild(node);
    });

    // Actualizar header con info del módulo
    const titleEl = document.querySelector('#section-modules .section-title');
    const subEl = document.querySelector('#section-modules .section-sub');
    if (titleEl) titleEl.textContent = `${module.icon} ${module.name}`;
    if (subEl) subEl.textContent = `${lessons.length} lecciones · ${lessons.reduce((sum, l) => sum + (parseInt(l.xp) || 0), 0)} XP totales`;
  }

  // ---- ABRIR LECCIÓN ----
  function openLesson(lessonOrIndex, moduleId = 'pc_basico') {
    const state = Store.getState();
    const currentModule = moduleId || state.currentModule || 'pc_basico';
    const module = Modules.getModule(currentModule);
    
    if (!module || !module.lessons) return;

    // Obtener índice de la lección
    let lessonIndex;
    let lesson;
    
    if (typeof lessonOrIndex === 'number') {
      lessonIndex = lessonOrIndex;
      lesson = module.lessons[lessonIndex];
    } else {
      lesson = lessonOrIndex;
      lessonIndex = module.lessons.findIndex(l => l.id === lesson.id);
    }
    
    if (!lesson) return;

    // Guardar estado actual
    Store.setState({ 
      currentModule: currentModule,
      currentLessonIndex: lessonIndex
    });
    
    const completedLessons = state.completedLessons || [];
    const isCompleted = completedLessons.includes(lesson.id);
    const totalLessons = module.lessons.length;
    const isLastLesson = lessonIndex === totalLessons - 1;

    // Cerrar modal existente
    const existing = document.getElementById('lessonModal');
    if (existing) existing.remove();

    // Determinar tipo de lección PRIMERO
    const lessonType = lesson.type || 'interactive';
    
    // Crear modal
    const modal = document.createElement('div');
    modal.id = 'lessonModal';
    modal.className = 'modal-overlay';
    
    // Determinar si es lección interactiva (fullscreen)
    const fullscreenTypes = ['typing-game', 'simulator', 'game', 'keyboard', 'drag-drop'];
    const isFullscreen = fullscreenTypes.includes(lessonType);
    // Siempre agregar clase fullscreen pero aplicar estilos solo para tipos interactivos
    const modalClass = 'modal fullscreen';
    const modalStyle = isFullscreen 
      ? 'padding:0;display:flex;flex-direction:column;height:100%;width:100vw;max-width:100vw;margin:0;border-radius:0;overflow:hidden' 
      : 'max-width:700px;padding:0;display:flex;flex-direction:column;max-height:90vh;overflow:hidden';
    
    // Determinar tipo de práctica
    let practiceArea = '';
    
    if (lessonType === 'keyboard') {
      practiceArea = `<div id="lessonPracticeArea" style="padding:20px;background:var(--bg-2);border-radius:12px;margin-top:16px"><div id="keyboardContainer"></div></div>`;
    } else if (lessonType === 'typing-game') {
      practiceArea = `
        <div id="lessonPracticeArea" style="padding:20px;background:var(--bg-2);border-radius:12px;margin-top:16px">
          <div id="typingProgressBar" style="height:8px;background:var(--bg-border);border-radius:4px;margin-bottom:16px;overflow:hidden">
            <div id="typingProgressFill" style="height:100%;background:linear-gradient(90deg, #10B981, #34D399);width:0%;transition:width 0.3s"></div>
          </div>
          <div id="typingTarget" style="font-size:1.2rem;font-weight:600;margin-bottom:12px;color:var(--text-1);line-height:1.6"></div>
          <div id="typingInputArea" contenteditable="true" style="min-height:80px;padding:16px;background:var(--bg-3);border:2px solid var(--bg-border);border-radius:8px;font-size:1.1rem;line-height:1.6;outline:none" spellcheck="false"></div>
          <div id="typingStats" style="display:flex;gap:20px;margin-top:12px;font-size:0.9rem;color:var(--text-2)">
            <span>Progreso: <strong id="typingPercent" style;color:var(--brand-primary)">0%</strong></span>
            <span>Errores: <strong id="typingErrors" style;color:#EF4444">0</strong></span>
            <span>Aciertos: <strong id="typingCorrect" style;color:#10B981">0</strong></span>
          </div>
        </div>`;
    } else if (lessonType === 'game') {
      practiceArea = `
        <div id="lessonPracticeArea" style="padding:20px;background:var(--bg-2);border-radius:12px;margin-top:16px">
          <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-weight:600">
            <span>Tiempo: <span id="hunterTime">30s</span></span>
            <span>Puntos: <span id="hunterScore">0</span></span>
            <span>Objetivos: <span id="hunterTargets">0/10</span></span>
          </div>
          <div id="hunterGameContainer"></div>
        </div>`;
    } else if (lessonType === 'drag-drop') {
      practiceArea = `<div id="lessonPracticeArea" style="padding:20px;background:var(--bg-2);border-radius:12px;margin-top:16px"><div id="dragDropContainer"></div></div>`;
    } else if (lessonType === 'simulator') {
      practiceArea = `<div id="lessonPracticeArea" style="padding:20px;background:var(--bg-2);border-radius:12px;margin-top:16px"><div id="simulatorContainer"></div></div>`;
    }

    // SIEMPRE mostrar botón Continuar - crear siempre el botón
    let btnText = 'Continuar →';
    let btnAction = `Lessons.completeLessonAndNext('${lesson.id}', '${currentModule}', ${lesson.xp}, ${lessonIndex})`;
    
    if (isCompleted) {
      btnText = '✓ Completada - Siguiente →';
      btnAction = `Lessons.completeLessonAndNext('${lesson.id}', '${currentModule}', ${lesson.xp}, ${lessonIndex})`;
    } else if (isLastLesson && lesson.quiz) {
      btnText = 'Continuar →';
      btnAction = `Lessons.completeLessonAndShowQuiz('${lesson.id}', '${currentModule}', ${lesson.xp})`;
    }
    
    // Botón siempre visible
    const actionButton = `<button class="btn btn-primary" style="min-width:150px;display:inline-block" onclick="${btnAction}">${btnText}</button>`;

    // Agregar botón toggle fullscreen SIEMPRE
    const fullscreenToggle = `<button class="modal-fullscreen-btn" onclick="Lessons.toggleFullscreen()" title="Pantalla completa">⛶</button>`;

    modal.innerHTML = `
      <div class="${modalClass}" style="${modalStyle}">
        <div style="background:var(--grad-brand);padding:20px 24px;position:relative;flex-shrink:0">
          <button onclick="document.getElementById('lessonModal').remove()" style="position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.85rem;border:none;cursor:pointer">✕</button>
          ${fullscreenToggle}
          <div style="font-size:0.7rem;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Lección ${lessonIndex + 1} de ${totalLessons}</div>
          <h2 style="color:#fff;margin:0;font-size:1.3rem">${lesson.title}</h2>
          <p style="color:rgba(255,255,255,0.75);font-size:0.8rem;margin:4px 0 0">${lesson.subtitle || ''}</p>
          <div style="position:absolute;bottom:12px;right:20px;background:rgba(255,255,255,0.2);padding:3px 10px;border-radius:999px;font-size:0.75rem;font-weight:700;color:#fff">+${lesson.xp} XP</div>
          <div style="margin-top:12px;height:4px;background:rgba(255,255,255,0.3);border-radius:2px">
            <div style="height:100%;background:#fff;border-radius:2px;width:${((lessonIndex + 1) / totalLessons) * 100}%"></div>
          </div>
        </div>
        <div style="padding:24px;overflow-y:auto;font-size:0.95rem;line-height:1.7;color:var(--text-1);max-height:60vh">
          ${lesson.content || ''}
          ${practiceArea}
        </div>
        <div style="padding:16px 24px;border-top:1px solid var(--bg-border);display:flex;gap:12px;justify-content:space-between;align-items:center;background:var(--bg-2);flex-shrink:0;position:sticky;bottom:0">
          <button class="btn btn-ghost" onclick="document.getElementById('lessonModal').remove()">Salir</button>
          ${actionButton}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Configurar listener para fullscreen y ESC
    setupFullscreenListener();

    // Aplicar fullscreen directamente si es lección interactiva
    if (isFullscreen) {
      const modalContent = document.querySelector('#lessonModal .modal');
      if (modalContent) {
        modalContent.classList.add('fullscreen');
        modalContent.style.width = '100vw';
        modalContent.style.height = '100vh';
        modalContent.style.maxWidth = '100vw';
        modalContent.style.maxHeight = '100vh';
        modalContent.style.margin = '0';
        modalContent.style.borderRadius = '0';
      }
    }

    // Inicializar práctica según tipo después de renderizar
    setTimeout(() => {
      initializeLessonPractice(lesson, lessonType);
      // Agregar botón Start para lecciones interactivas
      initLessonInteraction(lesson);
    }, 100);
  }

  // ---- INICIALIZAR PRÁCTICA SEGÚN TIPO ----
  // NOTA: No iniciamos los juegos automáticamente - solo se inicializan cuando usuario hace click en "Start"
  function initializeLessonPractice(lesson, lessonType) {
    try {
      // Para lecciones interactivas, NO iniciar automáticamente
      // El usuario debe hacer click en "Start" para comenzar
      if (lessonType === 'typing-game') {
        // KeyboardEngine se maneja en startInteractiveLesson
        return;
      } else if (lessonType === 'keyboard') {
        // El keyboard se maneja en startInteractiveLesson
        return;
      } else if (lessonType === 'game') {
        // El juego se maneja en startInteractiveLesson
        return;
      } else if (lessonType === 'drag-drop') {
        // El juego se maneja en startInteractiveLesson
        return;
      } else if (lessonType === 'simulator' && window.Simulator) {
        const container = document.getElementById('simulatorContainer');
        if (container) {
          if (lesson.simulator === 'desktop' || lesson.simulator === 'files') {
            Simulator.init();
          }
        }
      }
    } catch (e) {
      console.warn('Error initializing lesson practice:', e);
    }
  }

  // ---- INICIALIZAR INTERACCIÓN DE LECCIÓN (BOTÓN START) ----
  function initLessonInteraction(lesson) {
    const lessonType = lesson.type;
    const interactiveTypes = ['typing-game', 'game', 'keyboard', 'drag-drop'];
    
    if (!lessonType || !interactiveTypes.includes(lessonType)) {
      return; // No es una lección interactiva
    }

    // Buscar el contenedor del contenido de la lección
    const contentContainer = document.querySelector('#lessonModal .modal > div:nth-child(2)');
    if (!contentContainer) return;

    // Verificar si ya existe el botón
    const existingBtn = document.getElementById('startLessonBtn');
    if (existingBtn) {
      existingBtn.remove();
    }

    // Crear botón Start
    const startBtn = document.createElement('button');
    startBtn.id = 'startLessonBtn';
    startBtn.className = 'btn btn-primary';
    startBtn.style.marginTop = '20px';
    startBtn.style.width = '100%';
    startBtn.textContent = '▶️ Start';
    
    startBtn.onclick = function() {
      startInteractiveLesson(lesson);
      startBtn.textContent = '🔄 Reiniciar';
    };

    // Insertar después del contenido
    contentContainer.appendChild(startBtn);
  }

  // ---- INICIAR LECCIÓN INTERACTIVA ----
  function startInteractiveLesson(lesson) {
    const lessonType = lesson.type;
    
    try {
      if (lessonType === 'typing-game') {
        // Usar nuestro KeyboardEngine personalizado
        KeyboardEngine.start(lesson);
      } else if (lessonType === 'game') {
        if (window.MouseGames && window.MouseGames.HunterGame) {
          MouseGames.HunterGame.start('hunterGameContainer', 'beginner');
        } else {
          console.warn('MouseGames.HunterGame no disponible');
        }
      } else if (lessonType === 'keyboard') {
        if (window.Keyboard) {
          Keyboard.renderKeyboard('keyboardContainer', {
            showFingers: true,
            onKeyPress: (key) => {
              console.log('Tecla presionada:', key);
            }
          });
        } else {
          console.warn('Keyboard no disponible');
        }
      } else if (lessonType === 'drag-drop') {
        if (window.MouseGames && window.MouseGames.DragDropGame) {
          MouseGames.DragDropGame.start('dragDropContainer', 'beginner');
        } else {
          console.warn('MouseGames.DragDropGame no disponible');
        }
      }
    } catch (e) {
      console.warn('Error starting interactive lesson:', e);
    }
  }

  // ================================================
  // KEYBOARD ENGINE - Motor de mecanografía
  // ================================================
  const KeyboardEngine = (function() {
    let state = {
      targetText: '',
      typedText: '',
      errors: 0,
      correctChars: 0,
      isPlaying: false,
      lesson: null,
      xpReward: 0
    };

    // Texto de ejemplo según nivel
    const WORD_BANKS = {
      beginner: ['casa', 'perro', 'sol', 'agua', 'libro', 'mesa', 'verde', 'azul', 'hola', 'gracias'],
      intermediate: ['computadora', 'teclado', 'monitor', 'escritorio', 'internet', 'documento', 'trabajo', 'escuela'],
      advanced: ['inteligencia artificial', 'machine learning', 'programacion', 'desarrollo web', 'aplicaciones moviles']
    };

    function getRandomText(level = 'beginner') {
      const bank = WORD_BANKS[level] || WORD_BANKS.beginner;
      const shuffled = [...bank].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3).join(' ');
    }

    function start(lesson) {
      // Detener instancia anterior
      stop();

      // Configurar estado
      state.lesson = lesson;
      state.targetText = getRandomText(lesson.level || 'beginner');
      state.typedText = '';
      state.errors = 0;
      state.correctChars = 0;
      state.isPlaying = true;
      state.xpReward = lesson.xp || 20;

      // Renderizar UI
      render();

      // Agregar event listener
      const inputArea = document.getElementById('typingInputArea');
      if (inputArea) {
        inputArea.addEventListener('input', handleInput);
        inputArea.addEventListener('keydown', handleKeydown);
        inputArea.focus();
      }
    }

    function stop() {
      state.isPlaying = false;
      const inputArea = document.getElementById('typingInputArea');
      if (inputArea) {
        inputArea.removeEventListener('input', handleInput);
        inputArea.removeEventListener('keydown', handleKeydown);
      }
    }

    function render() {
      const targetEl = document.getElementById('typingTarget');
      const inputArea = document.getElementById('typingInputArea');
      const progressFill = document.getElementById('typingProgressFill');
      const percentEl = document.getElementById('typingPercent');
      const errorsEl = document.getElementById('typingErrors');
      const correctEl = document.getElementById('typingCorrect');

      if (targetEl) {
        targetEl.innerHTML = renderTargetText();
      }

      if (inputArea) {
        inputArea.textContent = state.typedText;
      }

      updateStats();
    }

    function renderTargetText() {
      let html = '';
      for (let i = 0; i < state.targetText.length; i++) {
        const char = state.targetText[i];
        if (i < state.typedText.length) {
          if (state.typedText[i] === char) {
            html += `<span style="color:#10B981;font-weight:600">${char}</span>`;
          } else {
            html += `<span style="color:#EF4444;background:rgba(239,68,68,0.2);border-radius:2px">${char}</span>`;
          }
        } else if (i === state.typedText.length) {
          html += `<span style="background:var(--brand-primary);color:white;padding:0 2px;border-radius:2px;animation:pulse 1s infinite">${char}</span>`;
        } else {
          html += char;
        }
      }
      return html;
    }

    function updateStats() {
      const progressFill = document.getElementById('typingProgressFill');
      const percentEl = document.getElementById('typingPercent');
      const errorsEl = document.getElementById('typingErrors');
      const correctEl = document.getElementById('typingCorrect');

      const progress = state.targetText.length > 0 
        ? Math.round((state.correctChars / state.targetText.length) * 100) 
        : 0;

      if (progressFill) progressFill.style.width = progress + '%';
      if (percentEl) percentEl.textContent = progress + '%';
      if (errorsEl) errorsEl.textContent = state.errors;
      if (correctEl) correctEl.textContent = state.correctChars;
    }

    function handleInput(e) {
      if (!state.isPlaying) return;

      const inputArea = e.target;
      let text = inputArea.textContent || '';

      // Solo permitir el mismo largo que el objetivo
      if (text.length > state.targetText.length) {
        text = text.substring(0, state.targetText.length);
        inputArea.textContent = text;
        // Mover cursor al final
        placeCursorAtEnd(inputArea);
      }

      // Calcular errores y aciertos
      state.errors = 0;
      state.correctChars = 0;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === state.targetText[i]) {
          state.correctChars++;
        } else {
          state.errors++;
        }
      }

      state.typedText = text;

      // Actualizar visualización
      const targetEl = document.getElementById('typingTarget');
      if (targetEl) {
        targetEl.innerHTML = renderTargetText();
      }

      updateStats();

      // Verificar completado
      if (state.typedText.length === state.targetText.length && state.errors === 0) {
        complete();
      }
    }

    function handleKeydown(e) {
      // Prevenir default para teclas especiales
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
      }
    }

    function placeCursorAtEnd(element) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(element);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    async function complete() {
      state.isPlaying = false;
      
      // Calcular XP basada en precisión
      const totalChars = state.targetText.length;
      const accuracy = totalChars > 0 ? Math.round((state.correctChars / totalChars) * 100) : 0;
      const xp = Math.round(state.xpReward * (accuracy / 100));

      // Mostrar mensaje de éxito
      const targetEl = document.getElementById('typingTarget');
      if (targetEl) {
        targetEl.innerHTML = `
          <div style="text-align:center;padding:20px">
            <div style="font-size:3rem;margin-bottom:12px">🎉</div>
            <div style="font-size:1.3rem;font-weight:600;color:#10B981">¡Completado!</div>
            <div style="color:var(--text-2);margin-top:8px">Precisión: ${accuracy}% | XP ganada: +${xp}</div>
          </div>`;
      }

      // Deshabilitar input
      const inputArea = document.getElementById('typingInputArea');
      if (inputArea) {
        inputArea.contentEditable = 'false';
        inputArea.style.borderColor = '#10B981';
        inputArea.style.background = 'rgba(16, 185, 129, 0.1)';
      }

      // Actualizar progreso
      if (state.lesson) {
        const progressFill = document.getElementById('typingProgressFill');
        if (progressFill) progressFill.style.width = '100%';
        const percentEl = document.getElementById('typingPercent');
        if (percentEl) percentEl.textContent = '100%';
      }
    }

    return {
      start,
      stop,
      state: () => state
    };
  })();

  // Exponer globalmente
  window.KeyboardEngine = KeyboardEngine;

  // ---- COMPLETAR LECCIÓN Y PASAR A SIGUIENTE ----
  async function completeLessonAndNext(lessonId, moduleId, xp, lessonIndex) {
    await markLessonComplete(lessonId, moduleId, xp);
    
    // Cerrar modal actual
    const modal = document.getElementById('lessonModal');
    if (modal) modal.remove();
    
    // Abrir siguiente lección
    const nextIndex = lessonIndex + 1;
    openLesson(nextIndex, moduleId);
  }

  // ---- COMPLETAR LECCIÓN Y MOSTRAR QUIZ ----
  async function completeLessonAndShowQuiz(lessonId, moduleId, xp) {
    await markLessonComplete(lessonId, moduleId, xp);
    
    // Cerrar modal
    const modal = document.getElementById('lessonModal');
    if (modal) modal.remove();
    
    // Mostrar quiz final del módulo
    startModuleQuiz(moduleId);
  }

  // ---- MARCAR LECCIÓN COMO COMPLETADA ----
  async function markLessonComplete(lessonId, moduleId, xp) {
    const state = Store.getState();
    const completedLessons = [...(state.completedLessons || [])];
    
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
      
      // Actualizar en store
      Store.setState({ completedLessons });
      
      // Guardar en DB
      if (window.Progress) {
        await Progress.updateUserProgress('lesson_complete', {
          lessonId,
          lessonTitle: 'Lección',
          xp: xp || 10,
          module: moduleId
        });
      }
      
      // Actualizar progreso del módulo
      updateModuleProgress(moduleId);
    }
  }

  // ---- ACTUALIZAR PROGRESO DEL MÓDULO ----
  function updateModuleProgress(moduleId) {
    const state = Store.getState();
    const completedLessons = state.completedLessons || [];
    
    const module = Modules.getModule(moduleId);
    if (!module || !module.lessons) return;

    const totalLessons = module.lessons.length;
    const completedInModule = module.lessons.filter(l => completedLessons.includes(l.id)).length;
    const progress = Math.round((completedInModule / totalLessons) * 100);

    const moduleProgress = { ...(state.moduleProgress || {}), [moduleId]: progress };
    Store.setState({ moduleProgress });

    // Re-renderizar roadmap
    if (window.App && window.App.renderRoadmap) {
      window.App.renderRoadmap();
    }
  }

  // ---- INICIAR QUIZ DE LECCIÓN ----
  function startQuiz(lessonId) {
    const lesson = LESSONS_DATA.find(l => l.id === lessonId);
    if (!lesson || !lesson.quiz) return;

    const modal = document.getElementById('lessonModal');
    if (modal) modal.remove();

    openSection('exercises');
    renderLessonQuiz(lesson);
  }

  // ---- RENDERIZAR QUIZ EN EJERCICIOS ----
  function renderLessonQuiz(lesson) {
    const container = document.getElementById('exerciseContainer');
    if (!container) return;

    const quiz = lesson.quiz;

    container.innerHTML = `
      <div class="quiz-question">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:16px">
          📝 Quiz — ${lesson.title}
        </div>
        <div class="quiz-q-text">${quiz.question}</div>
        <div class="quiz-options" id="quizOptions">
          ${quiz.options.map((opt, i) => `
            <button class="quiz-option" data-correct="${opt.correct}" onclick="Lessons.answerQuiz(this, '${lesson.id}', '${lesson.title}', ${lesson.xp})">
              ${opt.text}
            </button>
          `).join('')}
        </div>
        <div class="quiz-feedback hidden" id="quizFeedback"></div>
        <div class="hidden" id="quizNext" style="margin-top:16px">
          <button class="btn btn-primary" onclick="Lessons.loadPath();openSection('modules')">
            Continuar lecciones →
          </button>
        </div>
      </div>
    `;
  }

  // ---- INICIAR QUIZ DEL MÓDULO (AL COMPLETAR TODAS LAS LECCIONES) ----
  function startModuleQuiz(moduleId) {
    const module = Modules.getModule(moduleId);
    if (!module || !module.lessons) return;

    // Buscar la última lección con quiz
    let quizLesson = null;
    for (let i = module.lessons.length - 1; i >= 0; i--) {
      if (module.lessons[i].quiz) {
        quizLesson = module.lessons[i];
        break;
      }
    }

    if (!quizLesson) {
      // No hay quiz, mostrar pantalla de finalización
      showModuleComplete(moduleId);
      return;
    }

    // Cerrar modal
    const modal = document.getElementById('lessonModal');
    if (modal) modal.remove();

    // Mostrar quiz en la sección de ejercicios
    openSection('exercises');
    renderModuleQuiz(quizLesson, module);
  }

  // ---- RENDERIZAR QUIZ DEL MÓDULO ----
  function renderModuleQuiz(quizLesson, module) {
    const container = document.getElementById('exerciseContainer');
    if (!container) return;

    const quiz = quizLesson.quiz;
    const moduleTotalXp = module.lessons.reduce((sum, l) => sum + (parseInt(l.xp) || 0), 0);

    container.innerHTML = `
      <div class="quiz-question" style="max-width:600px;margin:0 auto">
        <div style="text-align:center;margin-bottom:24px">
          <div style="font-size:3rem;margin-bottom:12px">🏆</div>
          <h2 style="margin:0 0 8px">Evaluación Final</h2>
          <p style="color:var(--text-2);margin:0">Módulo: ${module.name}</p>
        </div>
        <div style="background:var(--bg-2);border-radius:16px;padding:24px;margin-bottom:24px">
          <div style="font-size:0.75rem;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:16px">
            📝 Pregunta
          </div>
          <div class="quiz-q-text" style="font-size:1.1rem;font-weight:600;margin-bottom:20px">${quiz.question}</div>
          <div class="quiz-options" id="quizOptions">
            ${quiz.options.map((opt, i) => `
              <button class="quiz-option" data-correct="${opt.correct}" onclick="Lessons.answerModuleQuiz(this, '${quizLesson.id}', '${module.id}', ${moduleTotalXp})">
                ${opt.text}
              </button>
            `).join('')}
          </div>
          <div class="quiz-feedback hidden" id="quizFeedback"></div>
          <div class="hidden" id="quizNext" style="margin-top:20px;text-align:center">
            <button class="btn btn-primary" onclick="Lessons.finishModule('${module.id}')">
              🎉 Completar Módulo
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ---- RESPONDER QUIZ DEL MÓDULO ----
  async function answerModuleQuiz(button, lessonId, moduleId, xp) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => opt.disabled = true);

    const isCorrect = button.dataset.correct === 'true';
    const feedbackEl = document.getElementById('quizFeedback');
    const nextEl = document.getElementById('quizNext');

    if (isCorrect) {
      button.classList.add('correct');
      feedbackEl.className = 'quiz-feedback correct-msg';
      feedbackEl.textContent = '✅ ¡Correcto! Has completado el módulo.';
      feedbackEl.classList.remove('hidden');

      // Guardar en DB
      await Progress.updateUserProgress('lesson_complete', {
        lessonId,
        lessonTitle: 'Evaluación Final',
        xp: xp || 50,
        module: moduleId
      });

      // Marcar módulo como 100%
      const moduleProgress = { ...(Store.getState().moduleProgress || {}), [moduleId]: 100 };
      Store.setState({ moduleProgress });

      // Re-renderizar roadmap
      if (window.App && window.App.renderRoadmap) {
        window.App.renderRoadmap();
      }
    } else {
      button.classList.add('wrong');
      options.forEach(opt => { if (opt.dataset.correct === 'true') opt.classList.add('correct'); });
      feedbackEl.className = 'quiz-feedback wrong-msg';
      feedbackEl.textContent = '❌ No es correcto. Intenta de nuevo.';
      feedbackEl.classList.remove('hidden');
    }

    nextEl.classList.remove('hidden');
  }

  // ---- MOSTRAR PANTALLA DE MÓDULO COMPLETADO ----
  function showModuleComplete(moduleId) {
    const module = Modules.getModule(moduleId);
    if (!module) return;

    const container = document.getElementById('exerciseContainer') || document.getElementById('lessonModal');
    
    // Cerrar modal si existe
    const modal = document.getElementById('lessonModal');
    if (modal) modal.remove();

    const moduleTotalXp = module.lessons.reduce((sum, l) => sum + (parseInt(l.xp) || 0), 0);

    // Mostrar confetti
    if (window.App && window.App.showConfetti) {
      window.App.showConfetti();
    }

    // Crear modal de completado
    const completeModal = document.createElement('div');
    completeModal.className = 'modal-overlay';
    completeModal.innerHTML = `
      <div class="modal" style="max-width:450px;text-align:center;padding:40px">
        <div style="font-size:4rem;margin-bottom:16px">🎉</div>
        <h2 style="margin:0 0 8px;color:var(--text-1)">¡Módulo Completado!</h2>
        <p style="color:var(--text-2);margin:0 0 24px">Has terminado ${module.name}</p>
        <div style="background:var(--bg-2);border-radius:16px;padding:24px;margin-bottom:24px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div>
              <div style="font-size:2rem;font-weight:700;color:var(--brand-primary)">+${moduleTotalXp}</div>
              <div style="font-size:0.8rem;color:var(--text-2)">XP Total</div>
            </div>
            <div>
              <div style="font-size:2rem;font-weight:700;color:#10B981">${module.lessons.length}</div>
              <div style="font-size:0.8rem;color:var(--text-2)">Lecciones</div>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" style="width:100%" onclick="Lessons.openNextModule('${moduleId}')">
          Continuar →
        </button>
      </div>
    `;
    document.body.appendChild(completeModal);
  }

  // ---- FINALIZAR MÓDULO ----
  function finishModule(moduleId) {
    showModuleComplete(moduleId);
  }

  // ---- ABRIR SIGUIENTE MÓDULO ----
  function openNextModule(currentModuleId) {
    const ROADMAP_ORDER = [
      'pc_basico',
      'mouse',
      'mecanografia',
      'internet',
      'herramientas',
      'ia_basics'
    ];
    
    const currentIndex = ROADMAP_ORDER.indexOf(currentModuleId);
    const nextIndex = currentIndex + 1;
    
    // Cerrar modal de completado
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(m => m.remove());
    
    if (nextIndex < ROADMAP_ORDER.length) {
      const nextModuleId = ROADMAP_ORDER[nextIndex];
      const nextModule = Modules.getModule(nextModuleId);
      
      if (nextModule && nextModule.external) {
        // Es un módulo externo (IA), redirigir
        window.location.href = 'https://cr1085.github.io/prompt-generate/';
      } else {
        // Abrir siguiente módulo
        App.openModule(nextModuleId);
      }
    } else {
      // No hay más módulos, volver al dashboard
      openSection('dashboard');
    }
  }

  // ---- RESPONDER QUIZ ----
  async function answerQuiz(button, lessonId, lessonTitle, xp, moduleId) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => opt.disabled = true);

    const isCorrect = button.dataset.correct === 'true';
    const feedbackEl = document.getElementById('quizFeedback');
    const nextEl = document.getElementById('quizNext');

    // Obtener módulo actual
    const state = Store.getState();
    const currentModule = moduleId || state.currentModule || 'pc_basico';

    if (isCorrect) {
      button.classList.add('correct');
      feedbackEl.className = 'quiz-feedback correct-msg';
      feedbackEl.textContent = '✅ ¡Correcto! ' + (LESSONS_DATA.find(l => l.id === lessonId)?.quiz.explanation || '');
      feedbackEl.classList.remove('hidden');

      // Usar updateUserProgress para guardar en DB
      await Progress.updateUserProgress('lesson_complete', {
        lessonId,
        lessonTitle,
        xp,
        module: currentModule
      });

      // Actualizar progreso del módulo
      updateModuleProgress(currentModule);
    } else {
      button.classList.add('wrong');
      options.forEach(opt => { if (opt.dataset.correct === 'true') opt.classList.add('correct'); });
      feedbackEl.className = 'quiz-feedback wrong-msg';
      feedbackEl.textContent = '❌ No es correcto. La respuesta correcta está marcada en verde.';
      feedbackEl.classList.remove('hidden');
    }

    nextEl.classList.remove('hidden');
  }

  // ---- ACTUALIZAR PROGRESO DEL MÓDULO ----
  async function updateModuleProgress(moduleId) {
    const state = Store.getState();
    const completedLessons = state.completedLessons || [];
    
    // Obtener módulo
    const module = Modules.getModule(moduleId);
    if (!module || !module.lessons) return;

    // Calcular progreso
    const totalLessons = module.lessons.length;
    const completedInModule = module.lessons.filter(l => completedLessons.includes(l.id)).length;
    const progress = Math.round((completedInModule / totalLessons) * 100);

    // Actualizar store
    const moduleProgress = { ...(state.moduleProgress || {}), [moduleId]: progress };
    Store.setState({ moduleProgress });

    // Guardar en Supabase si el usuario está autenticado
    if (state.currentUser && state.isAuthenticated) {
      try {
        // Guardar progreso del módulo en la tabla profiles
        await supabase
          .from('profiles')
          .update({ 
            module_progress: moduleProgress,
            xp: state.xp,
            level: state.level,
            total_lessons_completed: completedLessons.length
          })
          .eq('id', state.currentUser.id);
      } catch (e) {
        console.warn('Error guardando progreso del módulo:', e);
      }
    }

    // Re-renderizar roadmap
    if (window.App && window.App.renderRoadmap) {
      window.App.renderRoadmap();
    }
    
    // Re-renderizar continue card
    if (window.App && window.App.renderApp) {
      window.App.renderApp(Store.getState());
    }
  }

  // ---- TOGGLE FULLSCREEN MODAL ----
  function toggleFullscreen() {
    const modal = document.querySelector('#lessonModal .modal');
    if (!modal) return;

    const btn = document.querySelector('.modal-fullscreen-btn');
    
    if (!document.fullscreenElement) {
      // Entrar en fullscreen
      if (modal.requestFullscreen) {
        modal.requestFullscreen();
      } else if (modal.webkitRequestFullscreen) {
        modal.webkitRequestFullscreen();
      } else if (modal.msRequestFullscreen) {
        modal.msRequestFullscreen();
      }
      modal.classList.add('fullscreen');
      if (btn) btn.textContent = '❐';
    } else {
      // Salir de fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      modal.classList.remove('fullscreen');
      if (btn) btn.textContent = '⛶';
    }
  }

  // ---- LISTENER PARA ESC ----
  function setupFullscreenListener() {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Tecla ESC para cerrar modal
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const modal = document.getElementById('lessonModal');
        if (modal) {
          modal.remove();
        }
      }
    });
  }

  function handleFullscreenChange() {
    const modal = document.querySelector('#lessonModal .modal');
    const btn = document.querySelector('.modal-fullscreen-btn');
    
    if (!document.fullscreenElement && modal) {
      modal.classList.remove('fullscreen');
      if (btn) btn.textContent = '⛶';
    }
  }

  // ---- EXPORTS ----
  return {
    LESSONS_DATA,
    loadLessonsPath,
    openLesson,
    startQuiz,
    startModuleQuiz,
    renderLessonQuiz,
    renderModuleQuiz,
    answerQuiz,
    answerModuleQuiz,
    completeLessonAndNext,
    completeLessonAndShowQuiz,
    finishModule,
    updateModuleProgress,
    openNextModule,
    toggleFullscreen
  };
})();

// Exponer globalmente
window.Lessons = Lessons;