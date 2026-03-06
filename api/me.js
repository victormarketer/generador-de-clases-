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

  // 7 días
  const age = Date.now() - ts;
  if (age > 7 * 24 * 60 * 60 * 1000) return false;

  return true;
}

export default async function handler(req, res) {
  const APP_SECRET = process.env.APP_SECRET;
  const cookies = parseCookies(req);
  const ok = verifyToken(cookies.auth_token, APP_SECRET);

  if (!ok) return res.status(401).json({ ok: false });
  return res.status(200).json({ ok: true });
}
