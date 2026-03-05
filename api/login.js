import crypto from "crypto";

function setCookie(res, name, value, options = {}) {
  const {
    httpOnly = true,
    secure = true,
    sameSite = "Lax",
    path = "/",
    maxAge = 60 * 60 * 24 * 7, // 7 días
  } = options;

  const parts = [
    `${name}=${value}`,
    `Path=${path}`,
    `Max-Age=${maxAge}`,
    `SameSite=${sameSite}`,
  ];
  if (httpOnly) parts.push("HttpOnly");
  if (secure) parts.push("Secure");

  res.setHeader("Set-Cookie", parts.join("; "));
}

function signToken(payload, secret) {
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const token = Buffer.from(payload).toString("base64url") + "." + sig;
  return token;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    const { password } = req.body || {};
    const APP_PASSWORD = process.env.APP_PASSWORD;
    const APP_SECRET = process.env.APP_SECRET;

    if (!APP_PASSWORD || !APP_SECRET) {
      return res.status(500).json({ error: "Faltan variables APP_PASSWORD o APP_SECRET en Vercel" });
    }

    if (!password || password !== APP_PASSWORD) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const ts = Date.now().toString();
    const token = signToken(ts, APP_SECRET);

    setCookie(res, "auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Error interno", details: String(e) });
  }
}
