// ════════════════════════════════════════════
// srt.js — Generación y manejo de subtítulos SRT
// ════════════════════════════════════════════

const SRT = {
  /**
   * Convierte segundos a formato timestamp SRT
   * @param {number} seconds - Tiempo en segundos (puede ser decimal)
   * @returns {string} - Formato HH:MM:SS,mmm
   */
  secondsToTimestamp(seconds) {
    const ms   = Math.round((seconds % 1) * 1000);
    const secs = Math.floor(seconds) % 60;
    const mins = Math.floor(seconds / 60) % 60;
    const hrs  = Math.floor(seconds / 3600);

    return [
      String(hrs).padStart(2, '0'),
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].join(':') + ',' + String(ms).padStart(3, '0');
  },

  /**
   * Convierte timestamp SRT a segundos
   * @param {string} timestamp - Formato HH:MM:SS,mmm
   * @returns {number}
   */
  timestampToSeconds(timestamp) {
    const [time, ms] = timestamp.split(',');
    const [h, m, s]  = time.split(':').map(Number);
    return h * 3600 + m * 60 + s + Number(ms) / 1000;
  },

  /**
   * Genera contenido SRT desde array de segmentos Whisper
   * @param {Array} segments - [{ start, end, text }]
   * @returns {string} - Contenido del archivo .srt
   */
  fromSegments(segments) {
    if (!segments || segments.length === 0) {
      return '';
    }

    return segments
      .map((seg, i) => {
        const start = this.secondsToTimestamp(seg.start);
        const end   = this.secondsToTimestamp(seg.end);
        const text  = seg.text.trim();

        return `${i + 1}\n${start} --> ${end}\n${text}`;
      })
      .join('\n\n') + '\n';
  },

  /**
   * Parsea contenido SRT a array de objetos
   * @param {string} srtContent
   * @returns {Array} - [{ index, start, end, startSec, endSec, text }]
   */
  parse(srtContent) {
    if (!srtContent) return [];

    const blocks = srtContent.trim().split(/\n\n+/);

    return blocks
      .map(block => {
        const lines = block.trim().split('\n');
        if (lines.length < 3) return null;

        const index = parseInt(lines[0]);
        const times = lines[1].split(' --> ');
        if (times.length !== 2) return null;

        const start    = times[0].trim();
        const end      = times[1].trim();
        const text     = lines.slice(2).join('\n');
        const startSec = this.timestampToSeconds(start);
        const endSec   = this.timestampToSeconds(end);

        return { index, start, end, startSec, endSec, text };
      })
      .filter(Boolean);
  },

  /**
   * Post-procesa un SRT para mejorar sincronización y legibilidad
   * - Elimina alucinaciones de Whisper (repeticiones, tags, ruido)
   * - Fusiona segmentos adyacentes SOLO si gap > 0
   * - Elimina duplicados y texto repetido
   * - Divide líneas > 42 chars
   * - Normaliza duración sin solapamiento
   * @param {string} srtContent - Contenido SRT crudo de Whisper
   * @returns {string} - SRT limpio
   */
  postProcess(srtContent) {
    let segments = this.parse(srtContent);
    if (!segments.length) return srtContent;

    // ── PASO 1: Filtrar alucinaciones de Whisper ──
    segments = segments.filter(seg => {
      const t = seg.text.trim();
      const duration = seg.endSec - seg.startSec;

      // Eliminar segmentos vacíos o solo espacios
      if (!t) return false;

      // Eliminar tags de Whisper: [Music], [Applause], (Music), etc.
      if (/^\[.*\]$/.test(t) || /^\(.*\)$/.test(t)) return false;

      // Eliminar segmentos con duración irreal (< 0.3s son casi siempre ruido)
      if (duration < 0.3) return false;

      // Eliminar texto repetitivo: "y y y y" o "la la la la la"
      const words = t.split(/\s+/);
      if (words.length >= 3) {
        const uniqueRatio = new Set(words.map(w => w.toLowerCase())).size / words.length;
        if (uniqueRatio < 0.3) return false;
      }

      // Eliminar frases cortas repetidas exactas (ej: "no no no no")
      if (words.length >= 3 && words.every(w => w.toLowerCase() === words[0].toLowerCase())) {
        return false;
      }

      // Eliminar segmentos que son puro ruido reconocido
      const noisePatterns = /^(uh+|um+|ah+|eh+|mm+|hm+|\.{3,}|,{3,}|-{3,})$/i;
      if (noisePatterns.test(t.replace(/\s+/g, ''))) return false;

      return true;
    });

    if (!segments.length) return srtContent;

    // ── PASO 2: Eliminar duplicados exactos ──
    segments = segments.filter((seg, i) => {
      if (i === 0) return true;
      const prev = segments[i - 1];
      // Mismo texto que el anterior = duplicado de Whisper
      if (seg.text.trim().toLowerCase() === prev.text.trim().toLowerCase()) return false;
      return true;
    });

    // ── PASO 3: Fusionar segmentos SOLO con gap positivo y pequeño ──
    if (segments.length > 1) {
      const merged = [segments[0]];

      for (let i = 1; i < segments.length; i++) {
        const prev = merged[merged.length - 1];
        const curr = segments[i];
        const gap = curr.startSec - prev.endSec;
        const prevText = prev.text.replace(/\n/g, ' ').trim();
        const currText = curr.text.replace(/\n/g, ' ').trim();
        const combined = prevText + ' ' + currText;

        // SOLO fusionar si:
        // - gap es POSITIVO (no solapamiento)
        // - gap < 0.5s (están cerca)
        // - texto combinado < 80 chars (cabe en pantalla)
        // - el anterior no termina en puntuación fuerte
        // - el inicio del actual no es substring del final del previo (evita repetición)
        const isOverlapping = gap < 0;
        const isTooLong = combined.length > 80;
        const hasEndPunctuation = /[.!?]$/.test(prevText);
        const isRepeated = currText.toLowerCase().startsWith(
          prevText.slice(-currText.length).toLowerCase()
        );

        if (!isOverlapping && gap < 0.5 && !isTooLong && !hasEndPunctuation && !isRepeated) {
          prev.endSec = curr.endSec;
          prev.end = curr.end;
          prev.text = combined;
        } else {
          merged.push(curr);
        }
      }
      segments = merged;
    }

    // ── PASO 4: Dividir líneas largas (> 42 chars) ──
    segments = segments.map(seg => {
      const flat = seg.text.replace(/\n/g, ' ');
      if (flat.length <= 42) return seg;

      const mid = Math.floor(flat.length / 2);
      let cut = -1;
      for (let o = 0; o <= 12; o++) {
        for (const p of [mid + o, mid - o]) {
          if (p > 5 && p < flat.length - 5 && flat[p] === ' ') { cut = p; break; }
        }
        if (cut > 0) break;
      }
      if (cut > 0) {
        seg.text = flat.slice(0, cut) + '\n' + flat.slice(cut + 1);
      }
      return seg;
    });

    // ── PASO 5: Normalizar duración sin solapamiento ──
    segments = segments.map((seg, i) => {
      const nextStart = segments[i + 1]?.startSec ?? Infinity;

      // Duración mínima 0.8s
      if (seg.endSec - seg.startSec < 0.8) {
        seg.endSec = Math.min(seg.startSec + 0.8, nextStart - 0.05);
      }
      // Sin solapamiento
      if (seg.endSec > nextStart) {
        seg.endSec = nextStart - 0.05;
      }
      // Asegurar que end > start
      if (seg.endSec <= seg.startSec) {
        seg.endSec = seg.startSec + 0.5;
      }
      seg.end = this.secondsToTimestamp(seg.endSec);
      return seg;
    });

    // ── Renumerar y generar ──
    return segments
      .map((seg, i) => `${i + 1}\n${seg.start} --> ${seg.end}\n${seg.text}`)
      .join('\n\n') + '\n';
  },

  /**
   * Genera el SRT como demostración (cuando Whisper no está disponible)
   * Crea segmentos simulados para testing
   * @param {number} durationSeconds - Duración del video
   * @param {string} language - Idioma
   * @returns {string}
   */
  generateDemo(durationSeconds = 60, language = 'es') {
    const demoTexts = {
      es: [
        'Bienvenidos a este video de demostración.',
        'SubGen genera subtítulos automáticos con inteligencia artificial.',
        'El audio se procesa con el modelo Whisper de OpenAI.',
        'Los subtítulos se generan en formato SRT estándar.',
        'Puedes descargar el archivo y usarlo en cualquier editor.',
        'El proceso tarda unos segundos dependiendo del video.',
        'Soportamos múltiples idiomas automáticamente.',
        'Gracias por usar SubGen. ¡Hasta pronto!'
      ],
      en: [
        'Welcome to this demonstration video.',
        'SubGen generates automatic subtitles using AI.',
        'Audio is processed with OpenAI\'s Whisper model.',
        'Subtitles are generated in standard SRT format.',
        'Download the file and use it in any video editor.',
        'Processing takes a few seconds depending on video length.',
        'We support multiple languages automatically.',
        'Thanks for using SubGen. See you soon!'
      ]
    };

    const texts = demoTexts[language] || demoTexts.en;
    const segDuration = durationSeconds / texts.length;

    const segments = texts.map((text, i) => ({
      start: i * segDuration + 0.1,
      end:   (i + 1) * segDuration - 0.1,
      text
    }));

    return this.fromSegments(segments);
  },

  /**
   * Descarga el contenido SRT como archivo
   * @param {string} content - Contenido del SRT
   * @param {string} filename - Nombre base del archivo (sin extensión)
   */
  download(content, filename = 'subtitulos') {
    // Asegurar que el nombre siempre tenga extensión .srt
    const safeName = (filename || 'subtitulos')
      .replace(/\.[^.]+$/, '')   // quitar extensión previa si tiene
      .replace(/[^a-zA-Z0-9_\-. áéíóúñÁÉÍÓÚÑ]/g, '_') // limpiar caracteres raros
      || 'subtitulos';

    // application/octet-stream fuerza la descarga y evita que el
    // navegador o Windows cambie/elimine la extensión .srt
    const blob = new Blob(['\uFEFF' + content], {
      type: 'application/octet-stream'
    });

    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `${safeName}.srt`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Limpiar después de un momento
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  },

  /**
   * Obtener el texto del subtítulo activo en un momento dado
   * @param {Array} parsed - Array de subtítulos parseados
   * @param {number} currentTime - Tiempo actual del video en segundos
   * @returns {string|null}
   */
  getActiveSubtitle(parsed, currentTime) {
    const active = parsed.find(
      sub => currentTime >= sub.startSec && currentTime <= sub.endSec
    );
    return active ? active.text : null;
  }
};

window.SRT = SRT;


SRT.toVTT = function(srt){

  const vtt = "WEBVTT\n\n" +
  srt.replace(/,/g,".")

  return vtt
}