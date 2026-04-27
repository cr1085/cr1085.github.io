// ================================================
// simulator.js — Simulador Word con validación real
// InfoMática Platform
// ================================================

const Simulator = (function() {
  // ---- TAREAS DINÁMICAS ----
  const SIM_TASKS = [
    {
      id: 'task-1',
      instruction: 'Escribe tu nombre completo, ponlo en <strong>negrita</strong> y céntralo.',
      xp: 30,
      check: (editor) => {
        const text = editor.innerText.trim();
        
        if (text.length < 3) {
          return { valid: false, message: '⚠️ Escribe algo primero en el editor.' };
        }

        // Detectar negrita REAL
        const hasBoldTag = editor.innerHTML.includes('<b>') || editor.innerHTML.includes('<strong>');
        
        // Verificar si hay estilos en línea con font-weight
        const hasBoldStyle = editor.innerHTML.includes('font-weight: bold') || 
                            editor.innerHTML.includes('font-weight: 700') ||
                            editor.innerHTML.includes('font-weight: 800') ||
                            editor.innerHTML.includes('font-weight: 900');
        
        // Verificar si la selección actual tiene negrita
        const selection = window.getSelection();
        let selectionHasBold = false;
        if (selection.rangeCount > 0) {
          const parent = selection.anchorNode?.parentElement;
          if (parent) {
            const computed = window.getComputedStyle(parent);
            selectionHasBold = computed.fontWeight >= 700 || 
                               parent.tagName === 'B' || 
                               parent.tagName === 'STRONG';
          }
        }

        const hasBold = hasBoldTag || hasBoldStyle || selectionHasBold;

        // Detectar centrado REAL
        const hasCenterStyle = editor.style.textAlign === 'center' ||
                              editor.innerHTML.includes('text-align: center') ||
                              editor.innerHTML.includes('text-align:center') ||
                              editor.innerHTML.includes('justify-content: center');

        // Verificar si el elemento hijo tiene centrado
        const children = editor.querySelectorAll('*');
        let childHasCenter = false;
        children.forEach(child => {
          const style = child.getAttribute('style') || '';
          if (style.includes('text-align: center') || style.includes('text-align:center')) {
            childHasCenter = true;
          }
        });

        const hasCenter = hasCenterStyle || childHasCenter;

        // Validar
        if (!hasBold && !hasCenter) {
          return { valid: false, message: '❌ Faltan requisitos: usa negrita y centra el texto.' };
        }
        
        if (!hasBold) {
          return { valid: false, message: '❌ Falta negrita. Usa el botón N o Ctrl+N.' };
        }
        
        if (!hasCenter) {
          return { valid: false, message: '❌ Falta centrar. Usa el botón de centrado.' };
        }

        return { 
          valid: true, 
          message: '✅ ¡Perfecto! Tu texto está en negrita y centrado.',
          xp: 30
        };
      }
    },
    {
      id: 'task-2',
      instruction: 'Escribe "Hola Mundo" y cambia el tamaño de fuente a <strong>24px</strong>.',
      xp: 25,
      check: (editor) => {
        const text = editor.innerText.trim().toLowerCase();
        
        if (text.length < 3) {
          return { valid: false, message: '⚠️ Escribe algo primero en el editor.' };
        }

        // Verificar tamaño de fuente
        const hasSize24 = editor.innerHTML.includes('font-size: 24px') ||
                         editor.innerHTML.includes('font-size:24px') ||
                         editor.style.fontSize === '24px';

        if (!hasSize24) {
          return { valid: false, message: '❌ Cambia el tamaño de fuente a 24px usando el selector.' };
        }

        return { 
          valid: true, 
          message: '✅ ¡Correcto! Tamaño de fuente cambiado a 24px.',
          xp: 25
        };
      }
    },
    {
      id: 'task-3',
      instruction: 'Escribe tu nombre y cambia el color de texto a <strong>rojo (#FF0000)</strong>.',
      xp: 20,
      check: (editor) => {
        const text = editor.innerText.trim();
        
        if (text.length < 2) {
          return { valid: false, message: '⚠️ Escribe algo primero en el editor.' };
        }

        // Verificar color rojo
        const hasRedColor = editor.innerHTML.includes('color: rgb(255, 0, 0)') ||
                           editor.innerHTML.includes('color:#ff0000') ||
                           editor.innerHTML.includes('color: #ff0000') ||
                           editor.innerHTML.includes('color:rgb(255,0,0)') ||
                           editor.innerHTML.includes('color="ff0000"');

        if (!hasRedColor) {
          return { valid: false, message: '❌ Cambia el color del texto a rojo usando el selector de color.' };
        }

        return { 
          valid: true, 
          message: '✅ ¡Color aplicado! Tu texto ahora es rojo.',
          xp: 20
        };
      }
    },
    {
      id: 'task-4',
      instruction: 'Escribe "Tarea completada" y alinéalo a la <strong>derecha</strong>.',
      xp: 20,
      check: (editor) => {
        const text = editor.innerText.trim();
        
        if (text.length < 3) {
          return { valid: false, message: '⚠️ Escribe algo primero en el editor.' };
        }

        // Verificar alineación derecha
        const hasRightAlign = editor.style.textAlign === 'right' ||
                             editor.innerHTML.includes('text-align: right') ||
                             editor.innerHTML.includes('text-align:right');

        if (!hasRightAlign) {
          return { valid: false, message: '❌ Alinea el texto a la derecha usando los botones de alineación.' };
        }

        return { 
          valid: true, 
          message: '✅ ¡Texto alineado a la derecha!',
          xp: 20
        };
      }
    },
    {
      id: 'task-5',
      instruction: 'Escribe una palabra en <strong>cursiva</strong>.',
      xp: 15,
      check: (editor) => {
        const text = editor.innerText.trim();
        
        if (text.length < 2) {
          return { valid: false, message: '⚠️ Escribe algo primero en el editor.' };
        }

        // Detectar cursiva
        const hasItalicTag = editor.innerHTML.includes('<i>') || editor.innerHTML.includes('<em>');
        const hasItalicStyle = editor.innerHTML.includes('font-style: italic') ||
                             editor.innerHTML.includes('font-style:italic');

        if (!hasItalicTag && !hasItalicStyle) {
          return { valid: false, message: '❌ Aplica cursiva usando el botón I o Ctrl+K.' };
        }

        return { 
          valid: true, 
          message: '✅ ¡Texto en cursiva!',
          xp: 15
        };
      }
    }
  ];

  let currentTaskIndex = 0;

  // ---- OBTENER TAREA ACTUAL ----
  function getCurrentTask() {
    return SIM_TASKS[currentTaskIndex % SIM_TASKS.length];
  }

  // ---- CARGAR NUEVA TAREA ----
  function loadNextTask() {
    currentTaskIndex = (currentTaskIndex + 1) % SIM_TASKS.length;
    const task = getCurrentTask();
    
    const taskBar = document.getElementById('simTaskBar');
    if (taskBar) {
      taskBar.innerHTML = `
        <span>📋 <strong>Tarea:</strong> ${task.instruction}</span>
        <span class="sim-xp-reward">+${task.xp} XP</span>
      `;
    }

    // Limpiar editor
    const editor = document.getElementById('wordEditor');
    if (editor) editor.innerHTML = '';

    // Ocultar feedback
    const feedback = document.getElementById('simFeedback');
    if (feedback) {
      feedback.classList.add('hidden');
      feedback.className = 'sim-feedback';
    }

    showToast('info', 'Nueva tarea', `Tarea ${currentTaskIndex + 1} de ${SIM_TASKS.length}`);
  }

  // ---- FORMATEAR TEXTO ----
  function simFormat(command) {
    const editor = document.getElementById('wordEditor');
    if (!editor) return;
    
    document.execCommand(command, false, null);
    editor.focus();
  }

  function simFontSize(size) {
    const editor = document.getElementById('wordEditor');
    if (!editor) return;
    
    editor.style.fontSize = size;
    editor.focus();
  }

  function simAlign(align) {
    const editor = document.getElementById('wordEditor');
    if (!editor) return;
    
    editor.style.textAlign = align;
    editor.focus();
  }

  function simFontColor(color) {
    const editor = document.getElementById('wordEditor');
    if (!editor) return;
    
    document.execCommand('foreColor', false, color);
    editor.focus();
  }

  // ---- VERIFICAR TAREA ----
  async function checkSimTask() {
    const editor = document.getElementById('wordEditor');
    const feedback = document.getElementById('simFeedback');

    if (!editor || !feedback) return;

    const task = getCurrentTask();
    const result = task.check(editor);

    if (result.valid) {
      feedback.className = 'sim-feedback success-fb';
      feedback.innerHTML = `
        ✅ ${result.message}
        <span style="float:right;font-weight:700;color:var(--brand-accent)">+${result.xp} XP</span>
      `;
      feedback.classList.remove('hidden');

      // Guardar progreso y dar XP
      await Progress.updateUserProgress('sim_task_complete', { xp: result.xp });

      // Mostrar botón para siguiente tarea
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn btn-primary btn-sm';
      nextBtn.style.marginTop = '12px';
      nextBtn.textContent = 'Siguiente tarea →';
      nextBtn.onclick = () => loadNextTask();
      feedback.appendChild(nextBtn);

    } else {
      feedback.className = 'sim-feedback error-fb';
      feedback.innerHTML = result.message;
      feedback.classList.remove('hidden');
    }
  }

  // ---- INICIALIZAR SIMULADOR ----
  function init() {
    const task = getCurrentTask();
    const taskBar = document.getElementById('simTaskBar');
    if (taskBar) {
      taskBar.innerHTML = `
        <span>📋 <strong>Tarea:</strong> ${task.instruction}</span>
        <span class="sim-xp-reward">+${task.xp} XP</span>
      `;
    }

    // Limpiar editor al inicio
    const editor = document.getElementById('wordEditor');
    if (editor) {
      editor.innerHTML = '';
      editor.addEventListener('input', () => {
        // Guardar estado localmente para persistencia visual
        localStorage.setItem('simulator_content', editor.innerHTML);
      });
    }
  }

  // ---- EXPORTS ----
  return {
    SIM_TASKS,
    getCurrentTask,
    loadNextTask,
    simFormat,
    simFontSize,
    simAlign,
    simFontColor,
    checkSimTask,
    init
  };
})();

// Exponer globalmente
window.Simulator = Simulator;