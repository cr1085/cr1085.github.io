/**
 * hook-library.js
 * Static library of viral hooks organized by category.
 * Users can click a hook to copy it into the custom hook input.
 */

export class HookLibrary {
  static HOOKS = {
    '🔥 Shock':     [
      'El 99% de personas no sabe esto…',
      'Lo que nadie te enseñó sobre esto…',
      'Esto destruirá todo lo que creías saber…',
      'Nadie habla de esto y necesitas saberlo.',
      'Detente. Esto es importante.',
    ],
    '❓ Pregunta': [
      '¿Por qué nadie te dice la verdad sobre esto?',
      '¿Sabías que esto cambia todo?',
      '¿Qué pasaría si te dijera que estás equivocado?',
      '¿Cuánto tiempo llevas haciendo esto mal?',
      '¿Esto te ha pasado alguna vez?',
    ],
    '📖 Historia': [
      'Hace tres años hice algo que cambió mi vida…',
      'Un día descubrí algo que nadie esperaba…',
      'Me equivoqué por años hasta que vi esto…',
      'La primera vez que lo intenté, falló. Hasta que…',
    ],
    '🔢 Lista':    [
      '3 cosas que debes saber antes de seguir:',
      'Los 5 errores más comunes que todos cometen:',
      '2 datos que cambiarán tu perspectiva:',
      'Hay 4 tipos de personas. ¿Cuál eres tú?',
    ],
    '😤 Polémica': [
      'Esto que te enseñaron es completamente falso.',
      'La industria no quiere que sepas esto.',
      'Todos lo hacen mal. Aquí la verdad.',
      'Unpopular opinion: esto no funciona como te dijeron.',
    ],
  };

  render() {
    const container = document.getElementById('hook-library');
    if (!container) return;
    this._fill(container);
  }

  refresh() {
    const container = document.getElementById('hook-library');
    if (!container) return;
    container.innerHTML = '';
    this._fill(container, true);
  }

  _fill(container, shuffle = false) {
    // Flatten all hooks
    let all = [];
    for (const hooks of Object.values(HookLibrary.HOOKS)) {
      all = all.concat(hooks);
    }

    if (shuffle) {
      all = all.sort(() => Math.random() - 0.5);
    }

    // Show 8 random hooks
    all.slice(0, 8).forEach(hook => {
      const div = document.createElement('div');
      div.className   = 'hook-item';
      div.textContent = hook;
      div.title       = 'Clic para usar este hook';
      div.addEventListener('click', () => {
        const input = document.getElementById('input-custom-hook');
        if (input) {
          input.value = hook;
          // Open advanced options if hidden
          const panel = document.getElementById('advanced-options');
          if (panel && panel.classList.contains('hidden')) {
            panel.classList.remove('hidden');
            document.getElementById('btn-toggle-advanced').textContent = 'Ocultar ▴';
          }
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          input.focus();
        }
      });
      container.appendChild(div);
    });
  }
}
