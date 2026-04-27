// ════════════════════════════════════════════════════════════
// supabase/functions/process-video/index.ts
// Edge Function — Procesa video y genera subtítulos con Whisper
// ════════════════════════════════════════════════════════════
//
// Instalación:
//   supabase functions deploy process-video
//
// Variables de entorno requeridas (supabase secrets set):
//   OPENAI_API_KEY    → Para usar la API de Whisper de OpenAI
//   SUPABASE_URL      → Automática en Edge Functions
//   SUPABASE_SERVICE_ROLE_KEY → Automática en Edge Functions
// ════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Tipos ────────────────────────────────
interface RequestBody {
  storagePath: string;   // Ruta del video en Supabase Storage
  language:    string;   // Código de idioma (es, en, fr, auto)
  model:       string;   // Modelo Whisper (base, small, medium)
}

interface WhisperSegment {
  id:    number;
  start: number;
  end:   number;
  text:  string;
}

// ── CORS Headers ─────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Handler Principal ────────────────────
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405, headers: corsHeaders
    });
  }

  try {
    // 1. Verificar autenticación
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Inicializar cliente Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3. Verificar usuario desde JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 4. Parsear body
    const body: RequestBody = await req.json();
    const { storagePath, language, model } = body;

    if (!storagePath) {
      return new Response(JSON.stringify({ error: "storagePath requerido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`[process-video] User: ${user.id} | File: ${storagePath} | Lang: ${language}`);

    // 5. Descargar video desde Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("videos")
      .download(storagePath);

    if (downloadError || !fileData) {
      throw new Error(`No se pudo descargar el video: ${downloadError?.message}`);
    }

    console.log(`[process-video] Video descargado: ${fileData.size} bytes`);

    // 6. Enviar a Whisper API (OpenAI)
    const segments = await transcribeWithWhisper(fileData, language, model);

    // 7. Generar SRT desde segmentos
    const srtContent = segmentsToSRT(segments);

    console.log(`[process-video] SRT generado: ${segments.length} segmentos`);

    // 8. Devolver resultado
    return new Response(
      JSON.stringify({
        success:  true,
        segments,
        srt: srtContent,
        count: segments.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error("[process-video] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

// ══════════════════════════════════════════════════════
// TRANSCRIPCIÓN CON WHISPER (OpenAI API)
// ══════════════════════════════════════════════════════
async function transcribeWithWhisper(
  audioBlob: Blob,
  language: string,
  model: string
): Promise<WhisperSegment[]> {

  const openaiKey = Deno.env.get("OPENAI_API_KEY");

  if (!openaiKey) {
    throw new Error("OPENAI_API_KEY no configurada. Configura el secreto en Supabase.");
  }

  // Crear FormData para la API de Whisper
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.mp4");
  formData.append("model",           "whisper-1");
  formData.append("response_format", "verbose_json");  // Para obtener timestamps
  formData.append("timestamp_granularities[]", "segment");

  // Solo pasar idioma si no es "auto"
  if (language && language !== "auto") {
    formData.append("language", language);
  }

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error ${response.status}: ${error}`);
  }

  const result = await response.json();

  // Normalizar segmentos
  if (result.segments && Array.isArray(result.segments)) {
    return result.segments.map((seg: any, i: number) => ({
      id:    i + 1,
      start: seg.start,
      end:   seg.end,
      text:  seg.text.trim()
    }));
  }

  // Si no hay segmentos, crear uno solo con el texto completo
  if (result.text) {
    return [{ id: 1, start: 0, end: 30, text: result.text.trim() }];
  }

  throw new Error("No se obtuvo transcripción válida de Whisper");
}

// ══════════════════════════════════════════════════════
// ALTERNATIVA: Whisper LOCAL (Hugging Face Inference API)
// Usar si prefieres open source / sin costo
// ══════════════════════════════════════════════════════
async function transcribeWithHuggingFace(
  audioBlob: Blob,
  language: string
): Promise<WhisperSegment[]> {

  const hfToken = Deno.env.get("HF_API_TOKEN");

  const response = await fetch(
    "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
    {
      method: "POST",
      headers: {
        "Authorization":  `Bearer ${hfToken}`,
        "Content-Type":   audioBlob.type || "audio/mpeg",
      },
      body: audioBlob
    }
  );

  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.status}`);
  }

  const result = await response.json();

  // HuggingFace devuelve: { text: "...", chunks: [{timestamp: [start, end], text}] }
  if (result.chunks) {
    return result.chunks.map((chunk: any, i: number) => ({
      id:    i + 1,
      start: chunk.timestamp[0] || i * 3,
      end:   chunk.timestamp[1] || (i + 1) * 3,
      text:  chunk.text.trim()
    }));
  }

  // Fallback: solo texto sin timestamps
  if (result.text) {
    return [{ id: 1, start: 0, end: 30, text: result.text }];
  }

  throw new Error("Respuesta inválida de HuggingFace");
}

// ══════════════════════════════════════════════════════
// GENERADOR SRT
// ══════════════════════════════════════════════════════
function secondsToSRTTime(seconds: number): string {
  const ms   = Math.round((seconds % 1) * 1000);
  const secs = Math.floor(seconds) % 60;
  const mins = Math.floor(seconds / 60) % 60;
  const hrs  = Math.floor(seconds / 3600);

  return [
    String(hrs).padStart(2, "0"),
    String(mins).padStart(2, "0"),
    String(secs).padStart(2, "0")
  ].join(":") + "," + String(ms).padStart(3, "0");
}

function segmentsToSRT(segments: WhisperSegment[]): string {
  return segments
    .map((seg, i) => {
      const start = secondsToSRTTime(seg.start);
      const end   = secondsToSRTTime(seg.end);
      return `${i + 1}\n${start} --> ${end}\n${seg.text}`;
    })
    .join("\n\n") + "\n";
}
