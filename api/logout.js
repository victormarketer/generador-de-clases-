export default async function handler(req, res) {
  res.setHeader(
    "Set-Cookie",
    "auth_token=; Path=/; Max-Age=0; SameSite=Lax; HttpOnly; Secure"
  );
  return res.status(200).json({ ok: true });
}
