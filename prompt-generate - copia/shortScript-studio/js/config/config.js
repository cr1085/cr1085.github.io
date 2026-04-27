/**
 * config.js — Central configuration constants
 */

export class Config {
  static TONES = [
    { label: '😂 Humor',     value: 'humor'      },
    { label: '😮 Sorpresa',  value: 'surprise'   },
    { label: '🔥 Intenso',   value: 'intense'    },
    { label: '🧠 Educativo', value: 'educational'},
    { label: '💡 Inspirador',value: 'inspiring'  },
    { label: '😤 Polémico',  value: 'controversial'},
    { label: '🎭 Dramático', value: 'dramatic'   },
    { label: '🤓 Curioso',   value: 'curious'    },
  ];

  static QUICK_NICHES = [
    'Anime', 'Finanzas', 'Fitness', 'Gaming', 'Crypto',
    'Recetas', 'Motivación', 'Historia', 'Tecnología', 'Moda',
  ];

  static STRUCTURES = {
    'hook-fact-cta': {
      label: 'Hook → Dato/Info → CTA',
      parts: ['HOOK', 'DATO', 'CTA'],
    },
    'hook-story-cta': {
      label: 'Hook → Historia → CTA',
      parts: ['HOOK', 'HISTORIA', 'CTA'],
    },
    'hook-tips-cta': {
      label: 'Hook → 3 Tips → CTA',
      parts: ['HOOK', 'TIP 1', 'TIP 2', 'TIP 3', 'CTA'],
    },
    'hook-question-answer-cta': {
      label: 'Hook → Pregunta → Respuesta → CTA',
      parts: ['HOOK', 'PREGUNTA', 'RESPUESTA', 'CTA'],
    },
    'hook-controversy-cta': {
      label: 'Hook → Controversia → CTA',
      parts: ['HOOK', 'CONTROVERSIA', 'CTA'],
    },
  };

  static WORDS_PER_SECOND = {
    es: 2.8,
    en: 3.0,
    pt: 2.8,
  };
}
