import crypto from "crypto";

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};
  header.split(";").forEach(part => {
    const [k, ...v] = part.trim().split("=");
    if (!k) return;
    cookies[k] = decodeURIComponent(v.join("="));
  });
  return cookies;
}

function verifyToken(token, secret) {
  if (!token || !secret) return false;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return false;

  const payload = Buffer.from(b64, "base64url").toString("utf8");
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  if (expected !== sig) return false;

  const ts = Number(payload);
  if (!Number.isFinite(ts)) return false;

  const age = Date.now() - ts;
  if (age > 7 * 24 * 60 * 60 * 1000) return false;

  return true;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const APP_SECRET = process.env.APP_SECRET;
    const cookies = parseCookies(req);
    const authed = verifyToken(cookies.auth_token, APP_SECRET);

    if (!authed) {
      return res.status(401).json({ error: "No autorizado. Inicia sesión." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta GEMINI_API_KEY en Vercel." });
    }

    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Falta prompt en el body." });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    const rawText = await response.text();
    let data = {};

    try {
      data = JSON.parse(rawText);
    } catch (e) {
      data = { raw: rawText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Error al generar con Gemini",
        details: data
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ||
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    if (!text) {
      return res.status(500).json({
        error: "Gemini respondió, pero no devolvió texto.",
        details: data
      });
    }

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({
      error: "Error interno en /api/generate",
      details: String(e)
    });
  }
}
