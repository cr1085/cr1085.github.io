/**
 * community-hub.js
 * Loads and renders community-shared prompts.
 * Uses backend API when available; otherwise shows fallback examples.
 */

export class CommunityHub {
  constructor(apiClient, toast) {
    this.db    = apiClient;
    this.toast = toast;
  }

  async load() {
    const container = document.getElementById('community-prompts');
    if (!container) return;

    let prompts = [];

    try {
      if (this.db.isReady()) {
        prompts = await this.db.fetchPrompts(12);
      }
    } catch (e) {
      console.warn('Community load failed, using examples:', e);
    }

    // If no backend data or empty, show example prompts
    if (!prompts.length) {
      prompts = this._getExamples();
    }

    this._render(prompts, container);
  }

  async share({ name, niche, prompt }) {
    if (!this.db.isReady()) {
      this.toast.show('Funcionalidad de comunidad temporalmente no disponible', 'warn');
      return;
    }
    try {
      await this.db.insertPrompt({ name, niche, prompt });
      this.toast.show('Prompt compartido con la comunidad ✓', 'success');
      await this.load(); // Refresh list
    } catch (err) {
      this.toast.show('Error al compartir: ' + err.message, 'error');
    }
  }

  _render(prompts, container) {
    container.innerHTML = '';
    prompts.forEach(p => {
      const card = document.createElement('div');
      card.className = 'community-card';
      card.innerHTML = `
        <div class="flex items-start justify-between gap-2 mb-2">
          <h4>${this._esc(p.name)}</h4>
          ${p.niche ? `<span class="niche-tag">${this._esc(p.niche)}</span>` : ''}
        </div>
        <p>${this._esc(p.prompt || p.description || '')}</p>
        <button class="btn-use text-xs text-neon hover:underline">Usar este prompt →</button>
      `;
      card.querySelector('.btn-use').addEventListener('click', () => {
        const input = document.getElementById('input-topic');
        if (input) {
          input.value = p.name;
          input.scrollIntoView({ behavior: 'smooth' });
          // Pre-fill extra context with prompt
          const ctx = document.getElementById('input-extra-context');
          if (ctx) ctx.value = p.prompt || '';
        }
      });
      container.appendChild(card);
    });
  }

  _getExamples() {
    return [
      {
        name: 'Datos de One Piece que sorprenden',
        niche: 'anime',
        prompt: 'Genera hooks sobre secretos de One Piece que los fans no conocen, como detalles de la historia de Gol D. Roger o la verdad detrás del Poneglyph.',
      },
      {
        name: 'Ahorro inteligente en 30 segundos',
        niche: 'finanzas',
        prompt: 'Crea guiones de 30 segundos sobre tips de ahorro para jóvenes. Hook impactante con una estadística, tip accionable y CTA para guardar.',
      },
      {
        name: 'Mitos del gym que debes ignorar',
        niche: 'fitness',
        prompt: 'Guiones sobre mitos populares del gym que la ciencia desmiente. Tono polémico pero educativo.',
      },
      {
        name: 'Sesgos cognitivos que te controlan',
        niche: 'psicología',
        prompt: 'Videos cortos sobre sesgos cognitivos cotidianos. Hook tipo pregunta + explicación breve + reflexión final.',
      },
      {
        name: 'Historia que no te enseñaron',
        niche: 'historia',
        prompt: 'Hechos históricos que los libros omiten. Formato hook dramático + dato + "¿Sabías esto?" como CTA.',
      },
      {
        name: 'La IA cambia esto para siempre',
        niche: 'tecnología',
        prompt: 'Impacto de la IA en trabajos y vida diaria. Tono de curiosidad + dato reciente + pregunta al espectador.',
      },
    ];
  }

  _esc(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
}
