module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Usa POST");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta GEMINI_API_KEY en Vercel" });
    }

    const prompt = req.body?.prompt;
    if (!prompt) {
      return res.status(400).json({ error: "Falta prompt" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Error de Gemini",
        details: data,
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({
        error: "Gemini respondió sin texto",
        details: data,
      });
    }

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: "Error interno", details: String(e) });
  }
};
