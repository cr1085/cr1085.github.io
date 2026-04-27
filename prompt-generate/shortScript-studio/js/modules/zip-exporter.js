/**
 * zip-exporter.js
 * Packages all generated content into a downloadable ZIP:
 *   /scripts/    → .txt files per script
 *   /subtitles/  → .srt + .vtt files per script
 *   /audio/      → .webm/.mp3 files per script
 *   /metadata/   → titles.txt, hashtags.txt, summary.json
 *   README.md
 */

import { SubtitleGen } from './subtitle-gen.js';

export class ZipExporter {
  constructor(toast) {
    this.toast      = toast;
    this.subtitleGen = new SubtitleGen();
  }

  /**
   * @param {object} opts
   * @param {string}  opts.topic
   * @param {Array}   opts.scripts
   * @param {object}  opts.audios  — { [idx]: Blob }
   */
  async export({ topic, scripts, audios = {} }) {
    if (typeof JSZip === 'undefined') {
      this.toast.show('JSZip no disponible', 'error');
      return;
    }

    const zip     = new JSZip();
    const slug    = this._slug(topic);
    const allTags = new Set();
    const allTitles = [];

    // ── Folders ──
    const scriptFolder   = zip.folder('scripts');
    const subFolder      = zip.folder('subtitles');
    const audioFolder    = zip.folder('audio');
    const metaFolder     = zip.folder('metadata');

    // ── Process each script ──
    scripts.forEach((script, i) => {
      const num = String(i + 1).padStart(2, '0');
      const name = `guion_${num}`;

      // Script text
      const scriptTxt = this._buildScriptText(script);
      scriptFolder.file(`${name}.txt`, scriptTxt);

      // Subtitles
      const srt = this.subtitleGen.toSRT(script.subtitles || []);
      const vtt = this.subtitleGen.toVTT(script.subtitles || []);
      subFolder.file(`${name}.srt`, srt);
      subFolder.file(`${name}.vtt`, vtt);

      // Collect metadata
      allTitles.push(`${num}. ${script.title}`);
      (script.hashtags || []).forEach(h => allTags.add(h));
    });

// ── Audios ──
    for (const [idx, blob] of Object.entries(audios)) {
      if (!blob || !blob.type) continue;
      const num     = String(parseInt(idx) + 1).padStart(2, '0');
      const ext      = blob.type.includes('mpeg') ? 'mp3'
                     : blob.type.includes('wav')  ? 'wav' : 'webm';
      // Placeholder WAVs are small (< 5 KB) and silent — label them clearly
      const isReal   = ext !== 'wav' || blob.size > 5000;
      const filename = isReal
        ? `audio_${num}.${ext}`
        : `audio_${num}_PLACEHOLDER_leer_texto.${ext}`;
      const buf      = await blob.arrayBuffer();
      audioFolder.file(filename, buf);
    }

    // ── Metadata ──
    metaFolder.file('titles.txt', allTitles.join('\n'));
    metaFolder.file('hashtags.txt', [...allTags].join(' '));
    metaFolder.file('summary.json', JSON.stringify({
      topic,
      generated_at: new Date().toISOString(),
      script_count:  scripts.length,
      scripts: scripts.map(s => ({
        id: s.id,
        title: s.title,
        narration: s.narration,
        hashtags: s.hashtags,
      })),
    }, null, 2));

    // ── README ──
    zip.file('README.md', this._buildReadme(topic, scripts));

    // ── Generate & download ──
    try {
      const progressFill = document.getElementById('zip-progress-fill');
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      }, (metadata) => {
        if (progressFill) {
          progressFill.style.width = `${Math.round(metadata.percent)}%`;
        }
      });

      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `${slug}_scripts_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);

      this.toast.show(`✓ ZIP descargado con ${scripts.length} guiones`, 'success');
    } catch (err) {
      this.toast.show('Error generando ZIP: ' + err.message, 'error');
    }
  }

  _buildScriptText(script) {
    const lines = [
      `TÍTULO: ${script.title}`,
      '─'.repeat(50),
      '',
    ];

    (script.segments || []).forEach(seg => {
      lines.push(`[${seg.label}]`);
      lines.push(seg.text);
      lines.push('');
    });

    lines.push('─'.repeat(50));
    lines.push('NARRACIÓN COMPLETA:');
    lines.push(script.narration || '');
    lines.push('');
    lines.push('HASHTAGS:');
    lines.push((script.hashtags || []).join(' '));

    return lines.join('\n');
  }

  _buildReadme(topic, scripts) {
    return `# ShortScript Studio Export

## Tema: ${topic}
## Generado: ${new Date().toLocaleDateString()}
## Total de guiones: ${scripts.length}

---

## Estructura del paquete

\`\`\`
📁 scripts/      → Guiones en texto plano
📁 subtitles/    → Subtítulos en formato SRT y VTT
📁 audio/        → Archivos de audio TTS
📁 metadata/     → Títulos, hashtags y resumen JSON
README.md
\`\`\`

## Cómo usar los subtítulos

- **SRT** → Compatible con la mayoría de editores de video (Premiere, DaVinci, CapCut)
- **VTT** → Compatible con reproductores web HTML5

## Cómo usar los audios

Los archivos de audio están listos para importar en tu editor de video como narración.

---

Generado con [ShortScript Studio](https://github.com/tu-usuario/shortscript-studio)
`;
  }

  _slug(text) {
    return text.toLowerCase()
      .replace(/[áàä]/g, 'a')
      .replace(/[éèë]/g, 'e')
      .replace(/[íìï]/g, 'i')
      .replace(/[óòö]/g, 'o')
      .replace(/[úùü]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }
}
