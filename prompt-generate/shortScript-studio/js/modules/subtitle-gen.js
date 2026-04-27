/**
 * subtitle-gen.js
 * Converts narration text into timed subtitle lines (SRT + plain array).
 * Splits text into short chunks optimized for video captions.
 */

export class SubtitleGen {
  /**
   * @param {string} narration — full narration text
   * @param {number} durationSecs — target video duration
   * @returns {Array<{index, start, end, text}>}
   */
  generate(narration, durationSecs = 30) {
    if (!narration) return [];

    const lines   = this._splitIntoLines(narration);
    const total   = lines.length;
    const secPer  = durationSecs / total;
    const subtitles = [];

    lines.forEach((text, i) => {
      const start = i * secPer;
      const end   = start + secPer - 0.1;
      subtitles.push({
        index: i + 1,
        start: this._formatTC(start),
        end:   this._formatTC(end),
        text:  text.trim(),
      });
    });

    return subtitles;
  }

  /**
   * Export as SRT string
   */
  toSRT(subtitles) {
    return subtitles.map(s =>
      `${s.index}\n${s.start} --> ${s.end}\n${s.text}\n`
    ).join('\n');
  }

  /**
   * Export as VTT string (for web players)
   */
  toVTT(subtitles) {
    const lines = ['WEBVTT\n'];
    subtitles.forEach(s => {
      lines.push(`${s.start.replace(',','.')} --> ${s.end.replace(',','.')}\n${s.text}\n`);
    });
    return lines.join('\n');
  }

  /** Split narration into subtitle chunks (max ~6 words per line) */
  _splitIntoLines(text, maxWords = 6) {
    // Split on sentence boundaries first
    const sentences = text.replace(/([.!?])\s+/g, '$1|').split('|');
    const lines = [];

    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      let chunk = [];

      words.forEach(word => {
        chunk.push(word);
        if (chunk.length >= maxWords) {
          lines.push(chunk.join(' '));
          chunk = [];
        }
      });

      if (chunk.length) lines.push(chunk.join(' '));
    });

    return lines.filter(l => l.length > 0);
  }

  /** Format seconds to SRT timecode: HH:MM:SS,mmm */
  _formatTC(seconds) {
    const h  = Math.floor(seconds / 3600);
    const m  = Math.floor((seconds % 3600) / 60);
    const s  = Math.floor(seconds % 60);
    const ms = Math.round((seconds % 1) * 1000);

    return [
      String(h).padStart(2, '0'),
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0'),
    ].join(':') + ',' + String(ms).padStart(3, '0');
  }
}
