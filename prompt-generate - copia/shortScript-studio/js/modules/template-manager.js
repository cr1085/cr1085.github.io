/**
 * template-manager.js
 * Pre-built content templates for popular niches.
 * Clicking a template pre-fills the form.
 */

export class TemplateManager {
  static TEMPLATES = [
    {
      icon:      '⚔️',
      label:     'Anime / Manga',
      desc:      'Datos secretos de series',
      config: {
        topic:      'One Piece',
        niche:      'fans de anime, 16-30 años',
        structure:  'hook-fact-cta',
        customHook: '¿Sabías que Oda planeó esto desde el inicio?',
        cta:        'Comenta cuál es tu personaje favorito 👇',
      },
    },
    {
      icon:      '💰',
      label:     'Finanzas Personales',
      desc:      'Tips de ahorro e inversión',
      config: {
        topic:      'ahorro e inversión',
        niche:      'jóvenes 20-35 años, principiantes',
        structure:  'hook-tips-cta',
        customHook: 'Con $50 al mes puedes cambiar tu futuro financiero.',
        cta:        'Guarda este video para recordarlo 📌',
      },
    },
    {
      icon:      '💪',
      label:     'Fitness / Salud',
      desc:      'Mitos y tips de ejercicio',
      config: {
        topic:      'ejercicio y nutrición',
        niche:      'personas que quieren mejorar su salud',
        structure:  'hook-controversy-cta',
        customHook: 'Todo lo que te dijeron sobre bajar de peso está mal.',
        cta:        '¿Estás de acuerdo? Comenta abajo.',
      },
    },
    {
      icon:      '🧠',
      label:     'Psicología / Mente',
      desc:      'Sesgos y comportamiento humano',
      config: {
        topic:      'psicología y sesgos cognitivos',
        niche:      'personas curiosas, estudiantes',
        structure:  'hook-question-answer-cta',
        customHook: '¿Por qué tomamos malas decisiones todos los días?',
        cta:        'Sigue para entender mejor tu mente.',
      },
    },
    {
      icon:      '🏛️',
      label:     'Historia',
      desc:      'Hechos históricos impactantes',
      config: {
        topic:      'hechos históricos impactantes',
        niche:      'curiosos, estudiantes, adultos',
        structure:  'hook-story-cta',
        customHook: 'Esto pasó y los libros de historia lo ignoraron.',
        cta:        '¿Conocías este hecho? Cuéntame en los comentarios.',
      },
    },
    {
      icon:      '🤖',
      label:     'Tecnología / IA',
      desc:      'Noticias y curiosidades tech',
      config: {
        topic:      'inteligencia artificial',
        niche:      'tech enthusiasts, profesionales',
        structure:  'hook-fact-cta',
        customHook: 'La IA ya puede hacer esto y nadie lo está notando.',
        cta:        '¿Te preocupa o te emociona? Comenta.',
      },
    },
  ];

  render(onApply) {
    const container = document.getElementById('template-list');
    if (!container) return;

    TemplateManager.TEMPLATES.forEach(tpl => {
      const div = document.createElement('div');
      div.className = 'template-item';
      div.innerHTML = `
        <h4>${tpl.icon} ${tpl.label}</h4>
        <p class="text-xs text-ash">${tpl.desc}</p>
      `;
      div.addEventListener('click', () => onApply(tpl.config));
      container.appendChild(div);
    });
  }
}
