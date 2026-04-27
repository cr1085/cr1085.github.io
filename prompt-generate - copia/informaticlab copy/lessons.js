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
  function loadLessonsPath(moduleId) {
    const path = document.getElementById('lessonsPath');
    if (!path) return;

    const state = Store.getState();
    const completedLessons = state.completedLessons || [];
    const currentModule = moduleId || state.currentModule || 'pc_basico';

    // Obtener módulo de Modules.js
    const module = Modules.getModule(currentModule);
    if (!module || !module.lessons) {
      path.innerHTML = '<div class="path-loading">Cargando lecciones...</div>';
      return;
    }

    // Filtrar lecciones del módulo actual
    const lessons = module.lessons;
    const moduleProgress = state.moduleProgress || {};

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
  function openLesson(lesson, moduleId = 'pc_basico') {
    const state = Store.getState();
    const completedLessons = state.completedLessons || [];
    const isCompleted = completedLessons.includes(lesson.id);

    const existing = document.getElementById('lessonModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'lessonModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal" style="max-width:640px;padding:0;overflow:hidden">
        <div style="background:var(--grad-brand);padding:24px 28px;position:relative">
          <button onclick="document.getElementById('lessonModal').remove()" style="position:absolute;top:16px;right:16px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.85rem">✕</button>
          <div style="font-size:0.75rem;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">Lección ${lesson.order}</div>
          <h2 style="color:#fff;margin-bottom:4px">${lesson.title}</h2>
          <p style="color:rgba(255,255,255,0.75);font-size:0.85rem">${lesson.subtitle}</p>
          <div style="position:absolute;bottom:16px;right:24px;background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:999px;font-size:0.8rem;font-weight:700;color:#fff">+${lesson.xp} XP</div>
        </div>
        <div style="padding:28px;max-height:50vh;overflow-y:auto;font-size:0.95rem;line-height:1.7;color:var(--text-1)">
          ${lesson.content}
        </div>
        <div style="padding:20px 28px;border-top:1px solid var(--bg-border);display:flex;gap:12px;justify-content:flex-end">
          <button class="btn btn-ghost" onclick="document.getElementById('lessonModal').remove()">Cerrar</button>
          ${isCompleted
            ? `<button class="btn btn-success" disabled>✅ Completada</button>`
            : `<button class="btn btn-primary" onclick="Lessons.startQuiz('${lesson.id}')">Ir al quiz →</button>`
          }
        </div>
      </div>
    `;

    document.body.appendChild(modal);
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

  // ---- RESPONDER QUIZ ----
  async function answerQuiz(button, lessonId, lessonTitle, xp) {
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(opt => opt.disabled = true);

    const isCorrect = button.dataset.correct === 'true';
    const feedbackEl = document.getElementById('quizFeedback');
    const nextEl = document.getElementById('quizNext');

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
        module: 'word'
      });
    } else {
      button.classList.add('wrong');
      options.forEach(opt => { if (opt.dataset.correct === 'true') opt.classList.add('correct'); });
      feedbackEl.className = 'quiz-feedback wrong-msg';
      feedbackEl.textContent = '❌ No es correcto. La respuesta correcta está marcada en verde.';
      feedbackEl.classList.remove('hidden');
    }

    nextEl.classList.remove('hidden');
  }

  // ---- EXPORTS ----
  return {
    LESSONS_DATA,
    loadLessonsPath,
    openLesson,
    startQuiz,
    renderLessonQuiz,
    answerQuiz
  };
})();

// Exponer globalmente
window.Lessons = Lessons;