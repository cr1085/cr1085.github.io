/**
 * prompt-builder.js
 * Converts user parameters into an optimized LLM prompt
 * that returns structured JSON scripts.
 */

import { Config } from '../config/config.js';

export class PromptBuilder {
  /**
   * @param {object} params — collected from the form
   * @returns {string} — the full system+user prompt
   */
  build(params) {
    const structureDesc = this._describeStructure(params);
    const toneDesc      = params.tone.length
      ? `El tono debe ser: ${params.tone.join(', ')}.`
      : '';
    const avoidDesc     = params.avoidWords
      ? `Evita estas palabras o temas: ${params.avoidWords}.`
      : '';
    const hookDesc      = params.customHook
      ? `Hook sugerido (puedes variarlo): "${params.customHook}".`
      : 'Crea un hook original e impactante para cada guion.';
    const ctaDesc       = params.customCta
      ? `CTA: "${params.customCta}" (aplícalo en todos los guiones).`
      : 'Crea un CTA natural que incentive interacción (comentarios, likes o guardar).';
    const nicheDesc     = params.niche
      ? `La audiencia objetivo es: ${params.niche}.`
      : '';
    const extraDesc     = params.extraContext
      ? `Contexto adicional: ${params.extraContext}`
      : '';

    const wps   = Config.WORDS_PER_SECOND[params.language] || 2.8;
    const words = Math.round(params.duration * wps);

    const langMap = { es: 'español', en: 'inglés', pt: 'portugués' };
    const lang    = langMap[params.language] || 'español';

    return `Eres un experto creador de contenido viral para TikTok, Instagram Reels y YouTube Shorts.

TAREA: Genera exactamente ${params.count} guiones de video corto sobre el tema: "${params.topic}".

CONDICIONES:
- Duración objetivo: ${params.duration} segundos (~${words} palabras por guion).
- Idioma: ${lang}.
- ${nicheDesc}
- ${structureDesc}
- ${toneDesc}
- ${hookDesc}
- ${ctaDesc}
- ${avoidDesc}
- Las frases deben ser breves, claras y fáciles de subtitular (máx. 8 palabras por línea).
- Optimiza cada guion para retención máxima en los primeros 3 segundos.
- ${extraDesc}

FORMATO DE RESPUESTA — responde ÚNICAMENTE con un JSON válido, sin texto extra, con esta estructura exacta:

{
  "scripts": [
    {
      "id": 1,
      "title": "Título llamativo del video (máx 60 chars)",
      "segments": [
        { "label": "HOOK", "text": "texto del hook" },
        { "label": "CONTENIDO", "text": "texto del contenido" },
        { "label": "CTA", "text": "texto del CTA" }
      ],
      "narration": "Texto completo narrado, sin etiquetas, listo para TTS.",
      "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3", "#hashtag4", "#hashtag5"]
    }
  ]
}

Asegúrate de que cada "narration" sea el texto completo y fluido del guion, uniendo todos los segments.
Los hashtags deben ser relevantes, trending y en ${lang}.`;
  }

  _describeStructure(params) {
    if (params.structure === 'custom' && params.customStructure) {
      return `Estructura personalizada:\n${params.customStructure}`;
    }

    const structures = {
      'hook-fact-cta':          'Estructura: 1. Hook que capture atención en los primeros 3 segundos. 2. Un dato o información sorprendente que la mayoría no sabe. 3. CTA corto.',
      'hook-story-cta':         'Estructura: 1. Hook impactante. 2. Historia breve de 2-3 líneas. 3. CTA que invite a comentar.',
      'hook-tips-cta':          'Estructura: 1. Hook. 2. Tip #1. 3. Tip #2. 4. Tip #3. 5. CTA.',
      'hook-question-answer-cta':'Estructura: 1. Hook (una pregunta intrigante). 2. Desarrolla la pregunta. 3. Revela la respuesta sorprendente. 4. CTA.',
      'hook-controversy-cta':   'Estructura: 1. Hook con afirmación polémica. 2. Explica la controversia brevemente. 3. CTA que invite a opinar.',
    };

    return structures[params.structure] || structures['hook-fact-cta'];
  }
}
