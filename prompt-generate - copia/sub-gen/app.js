// ════════════════════════════════════════════
// app.js — Lógica principal de la aplicación
// ════════════════════════════════════════════

(async function SubGenApp() {

// ── Auth Gate: verificar sesión de PromptLab antes de cargar la app ──
try {
  const gateScript = document.createElement('script');
  gateScript.src = 'auth-gate.js';
  document.head.appendChild(gateScript);
  await new Promise((resolve, reject) => {
    gateScript.onload = resolve;
    gateScript.onerror = reject;
  });
  const authenticated = await window.__AUTH_GATE;
  if (!authenticated) return; // auth-gate.js ya mostró la pantalla de login
} catch (e) {
  console.warn('[app.js] Auth gate no disponible, continuando sin protección:', e.message);
}

// ── Stubs para DB/Storage (cuando supabase.js no está disponible) ──
if (typeof DB === 'undefined') {
  window.DB = {
    createVideoRecord: async () => { throw new Error('Supabase no configurado'); },
    updateVideoRecord: async () => { throw new Error('Supabase no configurado'); },
    getUserVideos: async () => [],
  };
}
if (typeof Storage === 'undefined' || !Storage.uploadVideo) {
  window.Storage = {
    uploadVideo:      async () => { throw new Error('Supabase Storage no configurado'); },
    uploadSRT:        async () => { throw new Error('Supabase Storage no configurado'); },
    getPublicVideoUrl: async (p) => p,
    getItem:          (k) => localStorage.getItem(k),
    setItem:          (k, v) => localStorage.setItem(k, v),
    removeItem:       (k) => localStorage.removeItem(k),
  };
}

  const state = {
    user: null,
    selectedFile: null,
    currentVideoId: null,
    currentSRT: null,
    currentVideoUrl: null,
    videoFilename: null,
  };

  // ══════════════════════════════════════
  // INICIALIZACIÓN
  // ══════════════════════════════════════

  async function init() {
    // Esperar a que Supabase esté listo
    if (window.waitForSupabase) {
      await window.waitForSupabase();
    }

    bindUploadEvents();
    bindDashboardEvents();

    // Usuario invitado (sin login)
    state.user = { id: "guest", email: "invitado@local" };

    UI.showView("upload");
    UI.showUploadZone();
    restoreState();
  }

  // ══════════════════════════════════════
  // AUTH
  // ══════════════════════════════════════

  function bindAuthEvents() {
    // Auth removed — direct access to dashboard
  }

  function onLoginSuccess(user) {
    state.user = user;
    UI.showScreen("dashboard");
    UI.showView("upload");
    UI.showUploadZone();
    loadHistory();
  }

  function getAuthErrorMessage(msg) {
    return msg;
  }

  // Logout removed — no auth required

  // ══════════════════════════════════════
  // UPLOAD
  // ══════════════════════════════════════

  function bindUploadEvents() {
    const zone = document.getElementById("upload-zone");
    const fileInput = document.getElementById("file-input");

    // Click para abrir explorador
    document.getElementById("btn-browse").addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    zone.addEventListener("click", () => fileInput.click());

    // Drag & Drop
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("dragover");
    });

    zone.addEventListener("dragleave", () => {
      zone.classList.remove("dragover");
    });

    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("dragover");
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelected(file);
    });

    // Input change
    fileInput.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelected(file);
    });

    // Remover archivo
    document.getElementById("btn-remove-file").addEventListener("click", () => {
      state.selectedFile = null;
      state.videoFilename = null;
      fileInput.value = "";
      UI.showUploadZone();
    });

    // Botón subir y procesar
    document
      .getElementById("btn-upload")
      .addEventListener("click", startProcessing);
  }

  function handleFileSelected(file) {
    // Validar tipo
    const validTypes = [
      "video/mp4",
      "video/quicktime",
      "video/avi",
      "video/webm",
      "video/x-msvideo",
      "video/mov",
    ];
    const isValid =
      validTypes.includes(file.type) ||
      /\.(mp4|mov|avi|webm|mkv)$/i.test(file.name);

    if (!isValid) {
      UI.toast("Formato no soportado. Usa MP4, MOV, AVI o WebM.", "error");
      return;
    }

    // Validar tamaño (500 MB)
    if (file.size > 500 * 1024 * 1024) {
      UI.toast("El archivo es demasiado grande. Máximo 500 MB.", "error");
      return;
    }

    state.selectedFile = file;
    state.videoFilename = file.name;

    // Mostrar preview
    document.getElementById("preview-filename").textContent = file.name;
    document.getElementById("preview-meta").textContent =
      `${UI.formatFileSize(file.size)} · ${file.type.split("/")[1]?.toUpperCase() || "VIDEO"}`;

    const videoEl = document.getElementById("video-preview");
    videoEl.src = URL.createObjectURL(file);

    UI.showFilePreview();
  }

  // ══════════════════════════════════════
  // PROCESAMIENTO PRINCIPAL
  // ══════════════════════════════════════

  async function startProcessing() {
    console.log("[app.js] startProcessing llamada");
    if (!state.selectedFile || !state.user) {
      console.log("[app.js] No hay archivo o usuario", {
        selectedFile: !!state.selectedFile,
        user: !!state.user,
      });
      return;
    }

    const language = document.getElementById("video-language").value;
    const model = document.getElementById("whisper-model").value;

    console.log("[app.js] Mostrando panel de progreso");
    UI.showProgressPanel();

    try {
      // ── PASO 1: Subir video ──────────────
      UI.setStep("upload", "active", "Subiendo video...");
      UI.setProgress(5, "Subiendo video a la nube...");

      let storagePath;
      try {
        storagePath = await Storage.uploadVideo(
          state.selectedFile,
          state.user.id,
          (p) => UI.setProgress(5 + Math.round(p * 0.4), `Subiendo... ${p}%`),
        );
      } catch (uploadErr) {
        // Si hay error de storage, intentar sin guardado (modo demo)
        console.warn("Storage no disponible, usando modo demo:", uploadErr);
        storagePath = `demo/${Date.now()}.mp4`;
      }

      UI.setStep("upload", "done", "Video subido");
      UI.setProgress(45, "Video guardado en la nube.");

      // ── PASO 2: Guardar en BD ────────────
      let videoRecord = null;
      try {
        videoRecord = await DB.createVideoRecord({
          userId: state.user.id,
          filename: state.selectedFile.name,
          storagePath,
          language,
          model,
        });
        state.currentVideoId = videoRecord.id;
      } catch (dbErr) {
        console.warn("BD no disponible, continuando sin persistencia:", dbErr);
        state.currentVideoId = `demo-${Date.now()}`;
      }

      // ── PASO 3: Procesar audio ───────────
      UI.setStep("process", "active", "Extrayendo audio...");
      UI.setProgress(50, "Procesando el audio del video...");

      // ── PASO 4: Transcribir con Whisper ──
      UI.setStep("process", "done", "Audio extraído");
      UI.setStep("transcribe", "active", "Transcribiendo...");
      UI.setProgress(60, "Whisper está analizando el audio...");

      let srtContent;
       const videoUrl = URL.createObjectURL(state.selectedFile);
      // const videoUrl = await Storage.getPublicVideoUrl(storagePath)

      // Llamar a Edge Function (Supabase)
      srtContent = await callEdgeFunction(
        storagePath,
        language,
        model,
        videoUrl,
      );

      // Post-procesar SRT para mejor sincronización y legibilidad
      srtContent = SRT.postProcess(srtContent);

      UI.setStep("transcribe", "done", "Transcripción lista");
      UI.setProgress(85, "Generando archivo SRT...");

      // ── PASO 5: Guardar SRT ──────────────
      UI.setStep("generate", "active", "Guardando subtítulos...");

       try {
         // Skip storage and database update if we are using a demo ID (indicating DB not available)
         if (state.currentVideoId && !state.currentVideoId.startsWith('demo-')) {
           console.log("[app.js] Attempting to save SRT for videoId:", state.currentVideoId);
           
           // Validate inputs before attempting storage operations
           if (typeof srtContent !== 'string') {
             console.warn("[app.js] srtContent is not a string:", typeof srtContent, srtContent);
             srtContent = String(srtContent || '');
           }
           
           try {
             const srtPath = await Storage.uploadSRT(
               srtContent,
               state.user.id,
               state.currentVideoId,
             );
             
             if (typeof srtPath !== 'string') {
               console.warn("[app.js] srtPath is not a string:", typeof srtPath, srtPath);
               throw new Error(`Invalid srtPath returned from storage: ${srtPath}`);
             }
             
             let subtitleCount = 0;
             try {
               const parsed = SRT.parse(srtContent);
               subtitleCount = parsed.length;
               console.log("[app.js] Parsed SRT successfully, count:", subtitleCount);
             } catch (parseErr) {
               console.warn("[app.js] Failed to parse SRT content:", parseErr);
               // Continue with subtitleCount = 0
             }
             
             console.log("[app.js] Updating video record with:", {
               status: "done",
               srt_content_length: srtContent.length,
               srt_path: srtPath,
               subtitle_count: subtitleCount
             });
             
             await DB.updateVideoRecord(state.currentVideoId, {
               status: "done",
               srt_content: srtContent,
               srt_path: srtPath,
               subtitle_count: subtitleCount,
             });
             
             console.log("[app.js] Successfully updated video record");
           } catch (storageErr) {
             console.error("[app.js] Storage operation failed:", storageErr);
             throw storageErr;
           }
         } else {
           console.warn("Demo mode: skipping storage and database update for SRT");
         }
       } catch (saveErr) {
         console.warn("No se pudo guardar SRT en BD:", saveErr);
         // Don't re-throw here to allow the UI to show success even if DB storage fails
       }

      UI.setStep("generate", "done", "¡SRT generado!");
      UI.setProgress(100, "¡Proceso completado!");

      state.currentSRT = srtContent;
      state.currentVideoUrl = videoUrl;

      // Save video to IndexedDB for persistence
      if (state.selectedFile) {
        const videoKey = `video_${Date.now()}_${state.videoFilename || 'video'}`;
        console.log("[startProcessing] Saving video to IndexedDB:", videoKey, "size:", state.selectedFile.size);
        await VideoStore.save(videoKey, state.selectedFile);
        state.videoStoreKey = videoKey;
        console.log("[startProcessing] Video saved to IndexedDB successfully");
      }

      saveState();

      // Pequeña pausa para que el usuario vea el 100%
      await sleep(800);

      const parsed = SRT.parse(srtContent);
      const info = `${parsed.length} subtítulos generados`;

      UI.showResultPanel(srtContent, videoUrl, info, (editedSRT) => {
        state.currentSRT = editedSRT;
      });
      UI.toast("¡Subtítulos generados exitosamente!", "success");
      loadHistory();
    } catch (err) {
      console.error("Error en procesamiento:", err);
      UI.toast(`Error: ${err.message}`, "error");
      UI.setProgress(0, "Error en el proceso.");
      // Marcar paso con error
      ["upload", "process", "transcribe", "generate"].forEach((s) => {
        const el = document.getElementById(`step-${s}`);
        if (el?.classList.contains("active")) {
          UI.setStep(s, "error", "Error");
        }
      });
    }
  }

  /**
   * Generar subtítulos usando Whisper LOCAL (gratuito, corre en el navegador)
   * Fallback a modo demo si el navegador no soporta WebAssembly
   */
  async function callEdgeFunction(storagePath, language, model, localVideoUrl) {
    // Verificar soporte de WebAssembly (necesario para Transformers.js)
    if (!WhisperEngine.isSupported()) {
      console.warn("WebAssembly no soportado. Usando modo demo.");
      UI.toast(
        "Tu navegador no soporta Whisper local. Mostrando demo.",
        "warning",
        6000,
      );
      const duration = await getVideoDuration(localVideoUrl);
      return SRT.generateDemo(duration, language === "auto" ? "es" : language);
    }

    try {
      UI.toast(
        "Cargando modelo Whisper... (solo la primera vez puede tardar)",
        "info",
        8000,
      );

      const srt = await WhisperEngine.generateSubtitles(
        state.selectedFile,
        language,
        (progress) => {
          // Actualizar UI según la fase del proceso
          if (progress.phase === "model") {
            if (progress.status === "downloading") {
              UI.setProgress(
                60 + Math.round(progress.progress * 0.1),
                progress.message,
              );
            } else if (progress.status === "ready") {
              UI.setProgress(70, "Modelo listo. Procesando audio...");
            }
          } else if (progress.phase === "audio") {
            UI.setProgress(72, progress.message);
          } else if (progress.phase === "transcribe") {
            UI.setProgress(
              75 + Math.round((progress.progress || 0) * 0.1),
              progress.message,
            );
          }
        },
      );

      return srt;
    } catch (err) {
      console.error("[app.js] Error en Whisper local:", err);
      UI.toast(
        `Error en Whisper: ${err.message}. Mostrando demo.`,
        "warning",
        7000,
      );
      const duration = await getVideoDuration(localVideoUrl);
      return SRT.generateDemo(duration, language === "auto" ? "es" : language);
    }
  }

  /**
   * Obtiene la duración de un video en segundos
   */
  function getVideoDuration(url) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => resolve(video.duration || 30);
      video.onerror = () => resolve(30);
      video.src = url;
    });
  }

  // ══════════════════════════════════════
  // RESULT ACTIONS
  // ══════════════════════════════════════

  function bindDashboardEvents() {

    document
.getElementById("btn-share-youtube")
.addEventListener("click",()=>shareVideo("youtube"))

document
.getElementById("btn-share-tiktok")
.addEventListener("click",()=>shareVideo("tiktok"))

document
.getElementById("btn-share-instagram")
.addEventListener("click",()=>shareVideo("instagram"))

    // Quemar subtítulos con canvas (navegador)
    const burnCanvasBtn = document.getElementById("btn-burn-canvas");
    if (burnCanvasBtn) {
      burnCanvasBtn.addEventListener("click", () => {
        console.log("[burn-canvas] Botón presionado");
        if (!state.currentVideoUrl || !state.currentSRT) {
          UI.toast("Primero genera subtítulos para un video", "error");
          return;
        }
        burnSubtitlesCanvas();
      });
    }

    // Quemar subtítulos con FFmpeg
    const burnFFmpegBtn = document.getElementById("btn-burn-ffmpeg");
    if (burnFFmpegBtn) {
      burnFFmpegBtn.addEventListener("click", () => {
        console.log("[burn-ffmpeg] Botón presionado");
        if (!state.currentVideoUrl || !state.currentSRT) {
          UI.toast("Primero genera subtítulos para un video", "error");
          return;
        }
        burnSubtitlesFFmpeg();
      });
    }

    document
.getElementById("btn-download-zip")
.addEventListener("click", downloadZipPackage)

document
.getElementById("btn-download-player")
.addEventListener("click", downloadSubtitlePlayer)
    // Descargar SRT
    document
      .getElementById("btn-download-srt")
      .addEventListener("click", () => {
        const srt =
          (window.SubtitleEditor ? SubtitleEditor.exportSRT() : null) ||
          state.currentSRT;
        if (!srt || !srt.trim()) {
          UI.toast("No hay subtítulos para descargar", "error");
          return;
        }
        const name = (state.videoFilename || "subtitulos").replace(
          /\.[^.]+$/,
          "",
        );
        SRT.download(srt, name);
        UI.toast("Archivo .srt descargado ✓", "success");
      });

    // Botón inline para descargar SRT
    const btnSrtInline = document.getElementById("btn-download-srt-inline");
    if (btnSrtInline) {
      btnSrtInline.addEventListener("click", (e) => {
        e.preventDefault();
        const srt =
          (window.SubtitleEditor ? SubtitleEditor.exportSRT() : null) ||
          state.currentSRT;
        if (!srt || !srt.trim()) {
          UI.toast("No hay subtítulos para descargar", "error");
          return;
        }
        const name = (state.videoFilename || "subtitulos").replace(
          /\.[^.]+$/,
          "",
        );
        SRT.download(srt, name);
        UI.toast("Archivo .srt descargado ✓", "success");
      });
    }

    // Copiar SRT
    document
      .getElementById("btn-copy-srt")
      .addEventListener("click", async () => {
        if (!state.currentSRT) return;
        await navigator.clipboard.writeText(state.currentSRT);
        UI.toast("SRT copiado al portapapeles", "info");
      });

    // Nuevo video — limpieza completa para empezar de cero
    document.getElementById("btn-new-video").addEventListener("click", async () => {
      // Confirmar si hay subtítulos generados
      if (state.currentSRT && state.currentSRT.trim()) {
        const ok = confirm('¿Empezar con un video nuevo? Se perderán los subtítulos no descargados.');
        if (!ok) return;
      }

      // Limpiar URLs para liberar memoria
      if (state.currentVideoUrl) {
        try { URL.revokeObjectURL(state.currentVideoUrl); } catch(e) {}
      }

      // Limpiar video preview
      const previewVideo = document.getElementById('video-preview');
      if (previewVideo) { previewVideo.pause(); previewVideo.src = ''; }

      // Limpiar video de resultado
      const resultVideo = document.getElementById('result-video');
      if (resultVideo) { resultVideo.pause(); resultVideo.src = ''; }

      // Limpiar overlay de subtítulos
      const overlay = document.getElementById('subtitle-overlay');
      if (overlay) overlay.innerHTML = '';

      // Limpiar sección del editor
      const editorSection = document.getElementById('editor-section');
      if (editorSection) { editorSection.innerHTML = ''; editorSection.classList.add('hidden'); }

      // Limpiar contenido SRT preview
      const srtContent = document.getElementById('srt-content');
      if (srtContent) srtContent.textContent = '';

      // Limpiar IndexedDB del video anterior
      if (state.videoStoreKey) {
        try { await VideoStore.remove(state.videoStoreKey); } catch(e) {}
      }

      // Reset completo del estado
      state.selectedFile = null;
      state.currentSRT = null;
      state.currentVideoUrl = null;
      state.videoFilename = null;
      state.currentVideoId = null;
      state.videoStoreKey = null;

      // Reset file input
      document.getElementById("file-input").value = "";

      // Limpiar localStorage
      localStorage.removeItem("subgen_state");

      // Mostrar zona de upload limpia
      UI.showUploadZone();
      UI.toast("Listo para un nuevo video", "info");
    });

    // Navegación sidebar
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        UI.showView(item.dataset.view);
        if (item.dataset.view === "history") loadHistory();
      });
    });
  }

  // ══════════════════════════════════════
  // HISTORIAL
  // ══════════════════════════════════════

  async function loadHistory() {
    if (!state.user) return;
    try {
      const videos = await DB.getUserVideos(state.user.id);
      UI.renderHistory(videos, onDownloadFromHistory);
    } catch (err) {
      console.warn("No se pudo cargar historial:", err);
      UI.renderHistory([], () => {});
    }
  }

  function onDownloadFromHistory(video) {
    if (video.srt_content) {
      const name = (video.filename || "subtitulos").replace(/\.[^.]+$/, "");
      SRT.download(video.srt_content, name);
      UI.toast("SRT descargado", "success");
    } else {
      UI.toast("No hay SRT disponible para este video", "warning");
    }
  }

  // ══════════════════════════════════════
  // UTILS
  // ══════════════════════════════════════

  /**
   * Quema los subtítulos directamente en el video usando canvas y MediaRecorder
   * Nota: Solo recomendado para videos cortos debido a limitaciones del navegador
   */
  // async function burnSubtitlesToVideo() {
  //   if (!state.currentVideoUrl || !state.currentSRT) {
  //     UI.toast("Necesitas generar subtítulos primero", "error");
  //     return;
  //   }
  //   UI.toast("Iniciando proceso de quema de subtítulos...", "info", 5000);

  //   try {
  //     // Crear elementos temporales
  //     const video = document.createElement("video");
  //     video.src = state.currentVideoUrl;
  //     video.muted = true; // Necesario para autoplay en algunos navegadores
  //     video.playsInline = true;

  //     const canvas = document.createElement("canvas");
  //     const ctx = canvas.getContext("2d");

  //     // Esperar a que el video cargue sus metadata
  //     await new Promise((resolve) => {
  //       if (video.readyState >= 2) resolve();
  //       else video.onloadedmetadata = resolve;
  //     });

  //     // Configurar canvas con las dimensiones del video
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;

  //     // Configurar MediaRecorder para capturar el canvas
  //     const stream = canvas.captureStream();
  //     const recorder = new MediaRecorder(stream);
  //     const chunks = [];

  //     recorder.ondataavailable = (e) => chunks.push(e.data);
  //     recorder.onstop = async () => {
  //       const blob = new Blob(chunks, { type: "video/webm" });
  //       const url = URL.createObjectURL(blob);

  //       // Crear enlace de descarga
  //       const a = document.createElement("a");
  //       a.style.display = "none";
  //       a.href = url;
  //       const name =
  //         (state.videoFilename || "video").replace(/\.[^.]+$/, "") +
  //         "-subtitled.webm";
  //       a.download = name;
  //       document.body.appendChild(a);
  //       a.click();

  //       // Limpieza
  //       setTimeout(() => {
  //         document.body.removeChild(a);
  //         URL.revokeObjectURL(url);
  //       }, 100);

  //       UI.toast("Video con subtítulos quemados descargado ✓", "success");
  //     };

  //     // Iniciar grabación
  //     recorder.start();

  //     // Sincronizar reproducción y captura de frames
  //     video.play();

  //     const processFrame = () => {
  //       if (video.paused || video.ended) {
  //         recorder.stop();
  //         return;
  //       }

  //       // Dibujar frame actual del video
  //       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  //       // Dibujar subtítulos actuales (reutilizando tu lógica existente)
  //       drawSubtitlesOnCanvas(
  //         ctx,
  //         video.currentTime,
  //         canvas.width,
  //         canvas.height,
  //       );

  //       // Solicitar próximo frame
  //       requestAnimationFrame(processFrame);
  //     };

  //     // Función para dibujar subtítulos en el canvas (adaptar de tu código existente)
  //     function drawSubtitlesOnCanvas(ctx, currentTime, width, height) {
  //       // Parsear SRT si no lo tienes ya
  //       const subtitles =
  //         typeof SRT !== "undefined" ? SRT.parse(state.currentSRT) : [];

  //       // Encontrar subtítulos activos para el tiempo actual
  //       const activeSubs = subtitles.filter(
  //         (sub) => sub.startTime <= currentTime && sub.endTime >= currentTime,
  //       );

  //       if (activeSubs.length === 0) return;

  //       // Configuración de estilo (deberías obtener esto de tu editor de estilos)
  //       const fontSize = Math.max(24, Math.round(height * 0.04)); // 4% de la altura
  //       ctx.font = `bold ${fontSize}px 'Syne', sans-serif`;
  //       ctx.textAlign = "center";
  //       ctx.textBaseline = "bottom";
  //       ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Fondo semi-transparente para legibilidad
  //       ctx.strokeStyle = "white";
  //       ctx.lineWidth = 2;

  //       // Dibujar cada línea de subtítulo
  //       activeSubs.forEach((sub, index) => {
  //         const y = height - fontSize * 1.5 - index * (fontSize * 1.2); // Desde abajo hacia arriba

  //         // Fondo
  //         ctx.fillRect(0, y - fontSize, width, fontSize * 1.2);
  //         // Texto
  //         ctx.strokeText(sub.content, width / 2, y);
  //         ctx.fillText(sub.content, width / 2, y);
  //       });
  //     }

  //     // Iniciar el procesamiento de frames
  //     requestAnimationFrame(processFrame);

  //     // Manejar el final del video
  //     video.onended = () => {
  //       if (recorder.state !== "inactive") recorder.stop();
  //     };
  //   } catch (err) {
  //     console.error("Error al quemar subtítulos:", err);
  //     UI.toast(
  //       `Error: ${err.message}. Intenta con un video más corto.`,
  //       "error",
  //     );
  //   }
  // }

  // async function burnSubtitlesToVideo() {
  //   if (!state.currentVideoUrl || !state.currentSRT) {
  //     UI.toast("Necesitas generar subtítulos primero", "error");
  //     return;
  //   }

  //   try {
  //     UI.toast("Procesando video con FFmpeg...", "info", 6000);

  //     const { createFFmpeg, fetchFile } = FFmpeg;

  //     const ffmpeg = createFFmpeg({
  //       log: true,
  //     });

  //     await ffmpeg.load();

  //     const videoBlob = await fetch(state.currentVideoUrl).then((r) =>
  //       r.blob(),
  //     );

  //     ffmpeg.FS("writeFile", "video.mp4", await fetchFile(videoBlob));

  //     ffmpeg.FS(
  //       "writeFile",
  //       "subs.srt",
  //       new TextEncoder().encode(state.currentSRT),
  //     );

  //     await ffmpeg.run(
  //       "-i",
  //       "video.mp4",
  //       "-vf",
  //       "subtitles=subs.srt",
  //       "-preset",
  //       "ultrafast",
  //       "output.mp4",
  //     );

  //     const data = ffmpeg.FS("readFile", "output.mp4");

  //     const url = URL.createObjectURL(
  //       new Blob([data.buffer], { type: "video/mp4" }),
  //     );

  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "video_subtitulado.mp4";
  //     a.click();

  //     UI.toast("Video generado correctamente 🎉", "success");
  //   } catch (err) {
  //     console.error(err);
  //     UI.toast("Error generando video", "error");
  //   }
  // }



//   async function burnSubtitlesToVideo() {

//   if (!state.currentVideoUrl || !state.currentSRT) {
//     UI.toast("Necesitas generar subtítulos primero", "error")
//     return
//   }

//   try {

//     UI.toast("Generando video con subtítulos...", "info", 5000)

//     const video = document.createElement("video")
//     video.src = state.currentVideoUrl
//     video.crossOrigin = "anonymous"
//     video.muted = true

//     await video.play().catch(()=>{})

//     const canvas = document.createElement("canvas")
//     const ctx = canvas.getContext("2d")

//     canvas.width = video.videoWidth
//     canvas.height = video.videoHeight

//     const stream = canvas.captureStream()
//     const recorder = new MediaRecorder(stream)

//     const chunks = []

//     recorder.ondataavailable = e => chunks.push(e.data)

//     recorder.onstop = () => {

//       const blob = new Blob(chunks, { type: "video/webm" })
//       const url = URL.createObjectURL(blob)

//       const a = document.createElement("a")
//       a.href = url
//       a.download = "video_subtitulado.webm"
//       a.click()

//       UI.toast("Video generado correctamente 🎉", "success")
//     }

//     recorder.start()

//     const subtitles = SRT.parse(state.currentSRT)

//     function drawFrame() {

//       if (video.ended) {
//         recorder.stop()
//         return
//       }

//       ctx.drawImage(video,0,0,canvas.width,canvas.height)

//       const time = video.currentTime

//       const active = subtitles.filter(
//         s => time >= s.startTime && time <= s.endTime
//       )

//       if (active.length) {

//         ctx.font = "bold 36px Arial"
//         ctx.fillStyle = "white"
//         ctx.strokeStyle = "black"
//         ctx.lineWidth = 4
//         ctx.textAlign = "center"

//         const text = active[0].content

//         ctx.strokeText(text, canvas.width/2, canvas.height-60)
//         ctx.fillText(text, canvas.width/2, canvas.height-60)

//       }

//       requestAnimationFrame(drawFrame)

//     }

//     video.play()
//     drawFrame()

//   } catch(err) {

//     console.error(err)
//     UI.toast("Error generando video", "error")

//   }

// }

// ═══════════════════════════════════════════════════════════
// DEAD CODE: burnSubtitlesToVideo — reemplazado por burnSubtitlesCanvas
// Mantenido comentado por si se necesita referencia
// ═══════════════════════════════════════════════════════════
// async function burnSubtitlesToVideo() {
//   if (!state.currentVideoUrl || !state.currentSRT) {
//     UI.toast("Necesitas generar subtítulos primero", "error")
//     return
//   }
//   ... (código viejo con stroke-based rendering, ya no se usa)
// }

  // ════════════════════════════════════════
  // UTILS
  // ════════════════════════════════════════

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function _hexToBGR(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const r = hex.slice(0, 2);
    const g = hex.slice(2, 4);
    const b = hex.slice(4, 6);
    return b + g + r; // ASS uses BGR byte order
  }

async function downloadZipPackage(){

  if(!state.currentVideoUrl || !state.currentSRT){
    UI.toast("No hay video o subtítulos","error")
    return
  }

  UI.toast("Preparando paquete...","info")

  const zip = new JSZip()

  const videoBlob = await fetch(state.currentVideoUrl).then(r=>r.blob())

  const videoName = state.videoFilename || "video.mp4"
  const srtName = videoName.replace(/\.[^.]+$/,"")+".srt"

  zip.file(videoName, videoBlob)
  zip.file(srtName, state.currentSRT)

  const blob = await zip.generateAsync({type:"blob"})

  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = "video_subtitles_package.zip"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  UI.toast("Paquete descargado ✓","success")
}


async function downloadSubtitlePlayer(){

  const videoBlob = await fetch(state.currentVideoUrl).then(r=>r.blob())

  const vtt = SRT.toVTT(state.currentSRT)

  const zip = new JSZip()

  zip.file("video.mp4", videoBlob)
  zip.file("subtitles.vtt", vtt)

  const playerHTML = `
<html>
<body style="background:black">
<video controls width="100%">
<source src="video.mp4" type="video/mp4">
<track src="subtitles.vtt" kind="subtitles" srclang="es" default>
</video>
</body>
</html>
`

  zip.file("player.html", playerHTML)

  const blob = await zip.generateAsync({type:"blob"})

  const a=document.createElement("a")
  a.href=URL.createObjectURL(blob)
  a.download="video_with_subtitles_player.zip"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  UI.toast("Player descargado ✓","success")
}


function saveState() {

  const data = {
    videoUrl: state.currentVideoUrl,
    srt: state.currentSRT,
    filename: state.videoFilename,
    videoStoreKey: state.videoStoreKey
  }

  localStorage.setItem("subgen_state", JSON.stringify(data))

}

function restoreState() {

  const saved = localStorage.getItem("subgen_state")

  if(!saved) return

  try {

    const data = JSON.parse(saved)

    // If no videoStoreKey, clear old invalid state and don't restore
    if (!data.videoStoreKey) {
      console.log("[restoreState] No videoStoreKey found, clearing invalid state");
      localStorage.removeItem("subgen_state");
      return;
    }

    state.currentSRT = data.srt
    state.videoFilename = data.filename
    state.videoStoreKey = data.videoStoreKey

    // Always try to restore from IndexedDB
    console.log("[restoreState] Trying to restore video from IndexedDB:", data.videoStoreKey);
    VideoStore.load(data.videoStoreKey).then(file => {
      if (file && file.size > 0) {
        console.log("[restoreState] Video restored from IndexedDB, size:", file.size);
        state.selectedFile = file;
        state.currentVideoUrl = URL.createObjectURL(file);
        
        const parsed = SRT.parse(state.currentSRT);
        UI.showResultPanel(
          state.currentSRT,
          state.currentVideoUrl,
          (parsed.length || 0) + " subtítulos"
        );
      } else {
        console.warn("[restoreState] No file found in IndexedDB or file is empty");
        localStorage.removeItem("subgen_state");
      }
    }).catch(err => {
      console.error("[restoreState] Error loading from IndexedDB:", err);
      localStorage.removeItem("subgen_state");
    });

  } catch(e){
    console.warn("No se pudo restaurar estado")
  }

}

async function shareVideo(platform){

  if(!state.currentVideoUrl){
    UI.toast("No hay video para compartir","error")
    return
  }

  if (platform === "youtube") {
    UI.toast("📺 Para YouTube: Descarga el .srt y súbelo en YouTube Studio → Subtítulos", "info", 8000)
    return
  }

  if (platform === "tiktok") {
    UI.toast("🎵 TikTok no acepta subtítulos externos. Usa la función 'Captions' o agrega texto manualmente", "info", 8000)
    return
  }

  if (platform === "instagram") {
    UI.toast("📸 Instagram no acepta subtítulos externos. Agrega subtítulos como sticker de texto", "info", 8000)
    return
  }

  const videoBlob = await fetch(state.currentVideoUrl).then(r=>r.blob())

  const file = new File([videoBlob],"video.mp4",{type:"video/mp4"})

  if(navigator.canShare && navigator.canShare({files:[file]})){

    try{

      await navigator.share({
        files:[file],
        title:"Video con subtítulos generado con SubGen",
        text:"Subtitulado automáticamente"
      })

    }catch(e){
      console.log("share cancelado")
    }

  }else{

    UI.toast("Tu navegador no soporta compartir directo","warning")

  }

}

async function burnSubtitlesFFmpeg() {
  console.log("[ffmpeg] Iniciando...");
  
  if (!state.currentVideoUrl || !state.currentSRT) {
    UI.toast("Necesitas generar subtítulos primero", "error");
    return;
  }

  // Check FFmpeg availability
  if (typeof FFmpeg === 'undefined') {
    UI.toast("FFmpeg no está cargado. Recarga la página.", "error");
    return;
  }

  UI.toast("⏳ Cargando FFmpeg (puede tardar)...", "info", 10000);

  try {
    const { FFmpeg } = window.FFmpegWASM || {};
    const { fetchFile } = FFmpegUtil;
    const ff = new FFmpeg();
    
    ff.on('log', ({ message }) => console.log('[ffmpeg]', message));
    ff.on('progress', ({ progress, time }) => {
      const percent = Math.round(progress * 100);
      UI.toast(`Procesando: ${percent}%`, "info", 2000);
    });

    const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
    await ff.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    UI.toast("📹 Preparando video...", "info", 5000);

    // Fetch video
    const videoResp = await fetch(state.currentVideoUrl);
    const videoBlob = await videoResp.blob();
    const videoData = await videoBlob.arrayBuffer();
    
    const ext = state.videoFilename?.split('.').pop() || 'mp4';
    await ff.writeFile(`input.${ext}`, new Uint8Array(videoData));

    // Write subtitles
    await ff.writeFile('subs.srt', state.currentSRT);

    UI.toast("🔥 Quemando subtítulos...", "info", 8000);

    // Get style from editor — ASS force_style for TikTok-style outline
    let style = '';
    if (window.SubtitleEditor?.config) {
      const c = window.SubtitleEditor.config;
      const colorBGR = _hexToBGR(c.color || '#FFFFFF');
      style = `:force_style='FontName=Arial,FontSize=${c.fontSize||32},PrimaryColour=&H${colorBGR},OutlineColour=&H00000000,Outline=2,Shadow=1,BorderStyle=1,MarginV=30'`;
    } else {
      style = `:force_style='Outline=2,Shadow=1,BorderStyle=1,MarginV=30'`;
    }

    await ff.exec([
      '-i', `input.${ext}`,
      '-vf', `subtitles=subs.srt${style}`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-c:a', 'copy',
      'output.mp4'
    ]);

    UI.toast("✅ Video listo! Descargando...", "success", 3000);

    const data = await ff.readFile('output.mp4');
    const outBlob = new Blob([data.buffer], { type: 'video/mp4' });
    
    const url = URL.createObjectURL(outBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video_con_subtitulos.mp4';
    a.click();

    // Cleanup
    await ff.deleteFile(`input.${ext}`);
    await ff.deleteFile('subs.srt');
    await ff.deleteFile('output.mp4');

    UI.toast("🎉 Video con subtítulos descargado!", "success", 5000);

  } catch (err) {
    console.error('[ffmpeg] Error:', err);
    UI.toast("Error: " + err.message, "error", 10000);
    UI.toast("Usa Handbrake para pegar subtítulos", "info", 8000);
  }
}

// Canvas-based subtitle burning - Simple and reliable
async function burnSubtitlesCanvas() {
  if (!state.currentVideoUrl || !state.currentSRT) {
    UI.toast("Necesitas generar subtítulos primero", "error");
    return;
  }

  UI.toast("🎬 Iniciando grabación...", "info", 5000);

  try {
    // Create hidden video container
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;top:-9999px;left:0;width:100%;height:100%;z-index:9999;background:#000;';
    document.body.appendChild(container);
    
    const video = document.createElement("video");
    video.src = state.currentVideoUrl;
    video.crossOrigin = "anonymous";
    video.muted = false;
    video.playsInline = true;
    video.loop = false;
    video.style.cssText = 'width:100%;height:100%;object-fit:contain;';
    container.appendChild(video);

    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
      setTimeout(() => reject(new Error("Timeout")), 30000);
    });

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    const aspectRatio = width / height;
    
    console.log("[burn] Video:", width, "x", height, "ratio:", aspectRatio.toFixed(2));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Get stream
    let finalStream = canvas.captureStream(30);
    try {
      const vs = video.captureStream(30);
      const at = vs.getAudioTracks();
      if (at.length > 0) {
        finalStream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...at]);
      }
    } catch(e) { console.warn("[burn] No audio"); }

    const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
    
    const recorder = new MediaRecorder(finalStream, { mimeType, videoBitsPerSecond: 10000000 });
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    
    recorder.onstop = () => {
      if (container.parentNode) container.parentNode.removeChild(container);
      if (chunks.length === 0) { UI.toast("Error: No se grabó", "error"); return; }
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "video_subtitulado.webm";
      a.click();
      URL.revokeObjectURL(url);
      UI.toast("✅ Video descargado!", "success");
    };

    // Parse subtitles
    const subtitles = SRT.parse(state.currentSRT);
    if (!subtitles?.length) {
      if (container.parentNode) container.parentNode.removeChild(container);
      UI.toast("Sin subtítulos", "error");
      return;
    }
    console.log("[burn] Subs:", subtitles.length);

    // Get style - use simple values (shadow-based, no stroke)
    let style = {
      fontSize: 28,
      color: '#FFFFFF',
      stroke: 'transparent',
      strokeW: 0,
      shadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
      position: 'center',
      yAdjust: 0,
      charsPerLine: 18,
      uppercase: false
    };

    // Get from editor
    try {
      const cfg = window.SubtitleEditor?.getBurnConfig?.() || window.SubtitleEditor?.config || {};
      style = {
        fontSize: cfg.fontSize || 28,
        color: cfg.color || '#FFFFFF',
        stroke: cfg.stroke || 'transparent',
        strokeW: cfg.strokeW || 0,
        shadow: cfg.shadow || style.shadow,
        position: cfg.position || 'center',
        yAdjust: cfg.yOffset || cfg.yAdjust || 0,
        charsPerLine: cfg.charsPerLine || 18,
        uppercase: cfg.uppercase || false
      };
    } catch(e) {}

    console.log("[burn] Style:", style);

    // Detect orientation for proper scaling
    const isVertical = height > width;

    // Scale proportionally to video height (reference: 720p)
    const scale = Math.max(0.4, Math.min(2.5, height / 720));
    const fontSize = Math.max(18, Math.round(style.fontSize * scale));
    const padding = Math.round(fontSize * 0.3);

    // Calculate Y position zones (safe areas)
    const topZone = height * 0.15;
    const centerZone = height * 0.50;
    const bottomZone = height * (isVertical ? 0.82 : 0.85);
    
    // Calculate base Y based on position
    let baseY;
    if (style.position === 'top') {
      baseY = topZone + (style.yAdjust * scale);
    } else if (style.position === 'center') {
      baseY = centerZone + (style.yAdjust * scale);
    } else {
      baseY = bottomZone + (style.yAdjust * scale);
    }
    
    // Clamp to safe bounds
    baseY = Math.max(fontSize * 2, Math.min(height - fontSize * 2, baseY));
    
    console.log("[burn] Y:", baseY, "font:", fontSize, "scale:", scale.toFixed(2), "vertical:", isVertical);

    // Wrap text
    function wrapText(text, maxChars) {
      if (!text || maxChars <= 0) return [text];
      const words = text.split(' ');
      const lines = [];
      let line = '';
      for (const w of words) {
        if ((line + ' ' + w).trim().length <= maxChars) {
          line = (line + ' ' + w).trim();
        } else {
          if (line) lines.push(line);
          line = w;
        }
      }
      if (line) lines.push(line);
      return lines;
    }

    function drawFrame(time) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(video, 0, 0, width, height);

      const sub = subtitles.find(s => time >= s.startSec && time <= s.endSec);
      if (!sub?.text) return;

      let text = style.uppercase ? sub.text.toUpperCase() : sub.text;
      const lines = wrapText(text, style.charsPerLine);

      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const lineHeight = fontSize * 1.4;
      const totalHeight = lines.length * lineHeight;
      const startY = baseY - totalHeight / 2 + lineHeight / 2;

      lines.forEach((line, i) => {
        const y = startY + i * lineHeight;

        // Background box
        if (style.bgColor && style.bgColor !== 'transparent') {
          const metrics = ctx.measureText(line);
          ctx.fillStyle = style.bgColor;
          ctx.fillRect(
            width/2 - metrics.width/2 - padding,
            y - fontSize/2 - padding/2,
            metrics.width + padding * 2,
            fontSize + padding
          );
        }

        // Shadow/outline: draw text at offset positions (4-direction + optional glow)
        const shadowOffsets = [
          [2 * scale, 2 * scale],
          [-2 * scale, -2 * scale],
          [2 * scale, -2 * scale],
          [-2 * scale, 2 * scale],
        ];

        ctx.fillStyle = '#000000';
        for (const [ox, oy] of shadowOffsets) {
          ctx.fillText(line, width/2 + ox, y + oy);
        }

        // Main text fill on top
        ctx.fillStyle = style.color || '#FFFFFF';
        ctx.fillText(line, width/2, y);
      });
    }

    // Loop
    function loop() {
      if (video.ended) return;
      drawFrame(video.currentTime);
      requestAnimationFrame(loop);
    }

    // Start
    recorder.start(500);
    video.currentTime = 0;
    video.play().catch(e => console.warn("[burn] Play:", e));
    loop();

    video.onended = () => setTimeout(() => recorder.stop(), 500);
    
    const maxTime = ((video.duration || 180) * 1000) + 10000;
    setTimeout(() => { if (recorder.state === "recording") recorder.stop(); }, maxTime);

    UI.toast("🔴 Grabando... Puedes cambiar de pestaña", "info", 10000);

  } catch (err) {
    console.error("[burn] Error:", err);
    const c = document.getElementById('burn-video-container') || document.querySelector('[style*="position:fixed"]');
    if (c?.parentNode) c.parentNode.removeChild(c);
    UI.toast("Error: " + err.message, "error", 8000);
  }
}

  // Arrancar la app
  init();

})();
