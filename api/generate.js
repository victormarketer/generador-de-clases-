export default async function handler(req, res) {
  // Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Falta GEMINI_API_KEY en Vercel (Variables de entorno).",
      });
    }

    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Falta 'prompt' en el body." });
    }

    // ✅ Modelo vigente (en vez de gemini-1.5-flash)
    // Opción A: estable
    const model = "gemini-2.5-flash";
    // Opción B: alias “latest” (si querés)
    // const model = "gemini-flash-latest";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      return res.status(r.status).json({
        error: data?.error?.message || "Error en Gemini",
        details: data,
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || "")
        .join("") || "";

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Error inesperado" });
  }
}

