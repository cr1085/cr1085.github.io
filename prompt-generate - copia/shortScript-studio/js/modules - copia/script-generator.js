/**
 * script-generator.js
 * Orchestrates script generation.
 * - Uses OpenAI API if key is available
 * - Falls back to a deterministic local template generator
 */

export class ScriptGenerator {
  constructor(storage, toast) {
    this.storage = storage;
    this.toast   = toast;
  }

  /**
   * Main entry — generate scripts
   * @param {string} prompt — built by PromptBuilder
   * @param {object} params — original form params
   * @returns {Array<ScriptObject>}
   */
  async generate(prompt, params) {
    const key = this.storage.getKey('openai');

    if (key) {
      try {
        return await this._generateWithOpenAI(prompt, key);
      } catch (err) {
        this.toast.show(`⚠ OpenAI falló: ${err.message}. Usando modo local.`, 'warn', 5000);
        return this._generateLocally(params);
      }
    }

    // No API key — local generation
    return this._generateLocally(params);
  }

  /** ── OpenAI GPT-4 ── */
  async _generateWithOpenAI(prompt, apiKey) {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       'gpt-4o-mini',
        temperature: 0.85,
        max_tokens:  3000,
        messages: [
          { role: 'system', content: 'Eres un experto en contenido viral para redes sociales. Respondes SIEMPRE con JSON válido y nada más.' },
          { role: 'user',   content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${resp.status}`);
    }

    const data = await resp.json();
    const raw  = data.choices[0].message.content.trim();

    // Strip possible markdown fences
    const clean = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/,'').trim();

    const parsed = JSON.parse(clean);
    return this._normalizeScripts(parsed.scripts || parsed);
  }

  /** ── Local template-based generator (no API) ── */
  _generateLocally(params) {
    const scripts = [];
    const hooks   = this._getLocalHooks(params.topic, params.language);
    const facts   = this._getLocalFacts(params.topic, params.language);
    const ctas    = this._getLocalCtas(params.language);
    const hashtags = this._getLocalHashtags(params.topic, params.language);

    for (let i = 0; i < params.count; i++) {
      const hook = params.customHook || hooks[i % hooks.length];
      const fact = facts[i % facts.length];
      const cta  = params.customCta || ctas[i % ctas.length];

      const segments = this._buildSegments(params.structure, { hook, fact, cta, index: i });
      const narration = segments.map(s => s.text).join(' ');

      scripts.push({
        id:       i + 1,
        title:    `${params.topic} — ${this._getLocalTitle(i, params.language)}`,
        segments,
        narration,
        hashtags: hashtags.slice(0, 5),
      });
    }

    return scripts;
  }

  _buildSegments(structure, { hook, fact, cta, index }) {
    const maps = {
      'hook-fact-cta': [
        { label: 'HOOK',       text: hook },
        { label: 'DATO',       text: fact },
        { label: 'CTA',        text: cta  },
      ],
      'hook-story-cta': [
        { label: 'HOOK',       text: hook },
        { label: 'HISTORIA',   text: fact },
        { label: 'CTA',        text: cta  },
      ],
      'hook-tips-cta': [
        { label: 'HOOK',       text: hook },
        { label: 'TIP 1',      text: `Tip número uno relacionado con ${fact}` },
        { label: 'TIP 2',      text: 'Y el segundo punto que debes saber es...' },
        { label: 'TIP 3',      text: 'Por último, esto cambiará tu perspectiva.' },
        { label: 'CTA',        text: cta  },
      ],
      'hook-question-answer-cta': [
        { label: 'HOOK',       text: hook },
        { label: 'PREGUNTA',   text: '¿Pero sabes realmente la razón detrás de esto?' },
        { label: 'RESPUESTA',  text: fact },
        { label: 'CTA',        text: cta  },
      ],
      'hook-controversy-cta': [
        { label: 'HOOK',       text: hook },
        { label: 'CONTROVERSIA', text: fact },
        { label: 'CTA',        text: cta  },
      ],
    };

    return maps[structure] || maps['hook-fact-cta'];
  }

  /** Normalize API response to consistent shape */
  _normalizeScripts(arr) {
    return arr.map((s, i) => ({
      id:       s.id || i + 1,
      title:    s.title || `Guion ${i + 1}`,
      segments: s.segments || [{ label: 'CONTENIDO', text: s.narration }],
      narration: s.narration || s.segments?.map(x => x.text).join(' ') || '',
      hashtags:  s.hashtags || [],
    }));
  }

  // ── Local content banks ──

  _getLocalHooks(topic, lang) {
    const es = [
      `¿Sabías que ${topic} tiene un secreto que nadie te ha contado?`,
      `Esto sobre ${topic} te va a dejar sin palabras...`,
      `El 99% no sabe esto de ${topic}`,
      `Por qué ${topic} cambia todo lo que creías saber`,
      `Lo que nadie dice sobre ${topic}`,
    ];
    const en = [
      `Did you know ${topic} has a secret nobody told you?`,
      `This about ${topic} will leave you speechless...`,
      `99% of people don't know this about ${topic}`,
      `Why ${topic} changes everything you thought you knew`,
      `What nobody says about ${topic}`,
    ];
    return lang === 'en' ? en : es;
  }

  _getLocalFacts(topic, lang) {
    const es = [
      `${topic} tiene una historia oculta que muy pocos conocen. Los expertos han estudiado esto durante años y los resultados son sorprendentes.`,
      `Resulta que ${topic} funciona de una manera completamente diferente a como lo imaginamos. Y esto tiene un impacto directo en tu vida diaria.`,
      `Hay un detalle sobre ${topic} que los creadores originales nunca quisieron revelar. Hasta hoy.`,
      `La verdad detrás de ${topic} es que todo lo que pensabas era al revés. Así funciona realmente.`,
      `${topic} esconde un patrón que, una vez que lo ves, no puedes dejar de verlo en todas partes.`,
    ];
    const en = [
      `${topic} has a hidden history very few people know about. Experts have studied this for years and the results are surprising.`,
      `It turns out ${topic} works in a completely different way than we imagine. And this has a direct impact on your daily life.`,
      `There's a detail about ${topic} that its original creators never wanted to reveal. Until today.`,
      `The truth behind ${topic} is that everything you thought was the opposite. This is how it really works.`,
      `${topic} hides a pattern that, once you see it, you can't stop seeing it everywhere.`,
    ];
    return lang === 'en' ? en : es;
  }

  _getLocalCtas(lang) {
    const es = [
      'Comenta si sabías esto 👇',
      '¿Cuál es tu opinión? Déjamelo en comentarios.',
      'Sigue para más contenido como este 🔥',
      '¿Te sorprendió? Guarda este video.',
      'Etiqueta a alguien que necesita ver esto.',
    ];
    const en = [
      'Comment if you knew this 👇',
      "What's your opinion? Let me know in the comments.",
      'Follow for more content like this 🔥',
      'Were you surprised? Save this video.',
      'Tag someone who needs to see this.',
    ];
    return lang === 'en' ? en : es;
  }

  _getLocalHashtags(topic, lang) {
    const base = lang === 'en'
      ? ['#viral', '#shorts', '#reels', '#tiktok', `#${topic.replace(/\s+/g, '').toLowerCase()}`, '#fyp', '#trending', '#facts']
      : ['#viral', '#shorts', '#reels', '#tiktok', `#${topic.replace(/\s+/g, '').toLowerCase()}`, '#fyp', '#parati', '#datos'];
    return [...new Set(base)];
  }

  _getLocalTitle(i, lang) {
    const es = ['Lo que nadie te dice', 'El secreto revelado', 'Esto te sorprenderá', 'La verdad oculta', 'Lo que todos ignoran'];
    const en = ['What Nobody Tells You', 'The Revealed Secret', 'This Will Surprise You', 'The Hidden Truth', 'What Everyone Ignores'];
    const arr = lang === 'en' ? en : es;
    return arr[i % arr.length];
  }
}
