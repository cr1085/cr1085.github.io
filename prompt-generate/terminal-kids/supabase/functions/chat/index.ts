// ============================================================
// supabase/functions/chat/index.ts
// Supabase Edge Function: Chat con IA educativa (Lumi)
//
// Invocación:
// POST /functions/v1/chat
// Body: {
//   message: "pregunta del estudiante",
//   history: [{role, content}],
//   systemPrompt: "prompt de configuración"
// }
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.2-90b-vision-instant';
const MAX_TOKENS = 1024;

// Tomar la API key desde las variables de entorno de Supabase
const getGroqApiKey = (): string => {
    const apiKey = Deno.env.get('GROQ_API_KEY');
    if (!apiKey) {
        throw new Error('GROQ_API_KEY no configurada en Supabase');
    }
    return apiKey;
};

serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { message, history = [], systemPrompt } = await req.json();

        if (!message?.trim()) {
            return new Response(
                JSON.stringify({ error: 'Message es requerido' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const apiKey = getGroqApiKey();

        // Construir mensajes para Groq
        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-10), // Últimos 10 mensajes del historial
            { role: 'user', content: message }
        ];

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages,
                max_tokens: MAX_TOKENS,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || 'Lo siento, tuve un problema. ¡Intenta de nuevo! 😊';

        return new Response(
            JSON.stringify({ reply }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Chat function error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});