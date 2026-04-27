export default async function handler(req, res) {
  // ── CORS: permitir cualquier origen (ajusta en producción si quieres restringir)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // ── El navegador envía una petición OPTIONS antes del POST real (preflight).
  //    DEBE responder 200 inmediatamente, antes de cualquier otra lógica.
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ── Solo aceptamos POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Validar que la API key de Groq esté configurada como variable de entorno
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY no configurada en las variables de entorno de Vercel" });
  }

  try {
    const { message, history = [], systemPrompt = "" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "El campo 'message' es obligatorio" });
    }

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.4,
        max_tokens: 280,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message }
        ]
      })
    });

    // Si Groq devuelve un error, lo propagamos con su código real
    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      return res.status(groqResponse.status).json({
        error: errData?.error?.message || `Groq error ${groqResponse.status}`
      });
    }

    const data = await groqResponse.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error("Error en /api/chat:", error);
    return res.status(500).json({ error: error.message });
  }
}
