// ════════════════════════════════════════════
// burn.js — Quemar subtítulos con FFmpeg 0.12.x
// ════════════════════════════════════════════
// Compatible con @ffmpeg/ffmpeg@0.12.x y @ffmpeg/util@0.12.x
// ════════════════════════════════════════════

/**
 * Quema subtítulos en un video usando FFmpeg.wasm (API 0.12.x)
 * @param {File} videoFile   - Archivo de video del usuario
 * @param {string} srtText   - Contenido del archivo .srt
 * @param {Function} onProgress - Callback con progreso 0-100
 * @returns {Blob} - Video MP4 con subtítulos incrustados
 */
async function burnSubtitles(videoFile, srtText, onProgress) {

  // Verificar que las librerías estén disponibles
  if (typeof FFmpegWASM === 'undefined' || !FFmpegWASM.FFmpeg) {
    throw new Error("FFmpeg no está cargado. Verifica que los scripts estén incluidos en el HTML.");
  }

  const { FFmpeg } = window.FFmpegWASM || {};
  const { fetchFile, toBlobURL } = FFmpegUtil;

  const ff = new FFmpeg();

  // Escuchar progreso
  ff.on('progress', ({ progress }) => {
    const percent = Math.round(progress * 100);
    if (typeof onProgress === 'function') {
      onProgress(percent);
    }
    const msgEl = document.getElementById('progress-message');
    if (msgEl) {
      msgEl.innerText = `Renderizando video ${Math.max(0, Math.min(100, percent))}%`;
    }
  });

  // Escuchar logs para debug
  ff.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });

  // Cargar FFmpeg (con CDN de respaldo)
  const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
  await ff.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`,    'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`,  'application/wasm'),
  });

  // Determinar extensión del archivo
  const ext = videoFile.name.split('.').pop().toLowerCase() || 'mp4';
  const inputName = `input.${ext}`;

  // Escribir archivos en el sistema virtual de FFmpeg
  await ff.writeFile(inputName, await fetchFile(videoFile));
  await ff.writeFile('subs.srt', new TextEncoder().encode(srtText));

  // Ejecutar FFmpeg para quemar subtítulos
  // force_style: usar outline (no border) para estilo TikTok limpio
  await ff.exec([
    '-i',      inputName,
    '-vf',     "subtitles=subs.srt:force_style='FontName=Arial,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1,BackColour=&H80000000,BorderStyle=1,MarginV=30'",
    '-preset', 'veryfast',
    '-crf',    '23',
    '-y',
    'output.mp4'
  ]);

  // Leer el resultado
  const data = await ff.readFile('output.mp4');

  // Limpiar archivos temporales
  try {
    await ff.deleteFile(inputName);
    await ff.deleteFile('subs.srt');
    await ff.deleteFile('output.mp4');
  } catch (e) {
    console.warn('[FFmpeg] Error limpiando archivos temporales:', e);
  }

  return new Blob([data.buffer], { type: 'video/mp4' });
}


/**
 * Función principal para quemar subtítulos y descargar el resultado.
 * Llamada desde app.js con los botones de la UI.
 * @param {File} videoFile
 * @param {string} srtContent
 */
async function burnSubtitlesAndDownload(videoFile, srtContent) {
  if (!videoFile || !srtContent) {
    console.error('[burn] Faltan parámetros: videoFile o srtContent');
    return;
  }

  const progressEl = document.getElementById('progress-message');
  if (progressEl) progressEl.innerText = 'Iniciando FFmpeg...';

  try {
    const blob = await burnSubtitles(videoFile, srtContent, (pct) => {
      console.log(`[burn] Progreso: ${pct}%`);
    });

    // Descargar el video resultante
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = 'video_con_subtitulos.mp4';
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 10_000);

    if (progressEl) progressEl.innerText = '¡Video descargado!';
    console.log('[burn] ¡Listo! Video con subtítulos descargado.');

  } catch (err) {
    console.error('[burn] Error quemando subtítulos:', err);
    if (progressEl) progressEl.innerText = 'Error: ' + err.message;
    throw err;
  }
}

// Exponer globalmente para que app.js pueda llamarlo
window.BurnSubtitles = {
  burn: burnSubtitles,
  burnAndDownload: burnSubtitlesAndDownload,
};

console.log('[burn.js] ✓ Módulo FFmpeg cargado (API 0.12.x)');
