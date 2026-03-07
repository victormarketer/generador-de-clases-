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
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (expected !== sig) return false;

  const ts = Number(payload);
  if (!Number.isFinite(ts)) return false;

  const age = Date.now() - ts;
  if (age > 7 * 24 * 60 * 60 * 1000) return false;

  return true;
}

function sanitizeText(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function sanitizeCount(value, fallback = 4) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return Math.floor(num);
}

function getCantidadFinal(tipoContenido, cantidadSerie) {
  if (tipoContenido === "devocional") return 7;
  return sanitizeCount(cantidadSerie, 4);
}

function getSchemaAndPrompt({
  tema,
  tipoContenido,
  contexto,
  tono,
  textoBase,
  modoGeneracion,
  cantidadSerie
}) {
  const temaFinal = sanitizeText(tema);
  const tipoFinal = sanitizeText(tipoContenido, "celula");
  const contextoFinal = sanitizeText(contexto, "general");
  const tonoFinal = sanitizeText(tono, "pastoral");
  const modoFinal = sanitizeText(modoGeneracion, "unico");
  const textoBaseFinal = sanitizeText(
    textoBase,
    "elige un texto bíblico apropiado y fiel al tema"
  );

  const cantidadFinal = getCantidadFinal(tipoFinal, cantidadSerie);

  if (modoFinal === "serie") {
    if (tipoFinal === "celula") {
      return `
Responde ÚNICAMENTE con JSON válido.
No uses markdown.
No agregues comentarios.
No agregues texto fuera del JSON.

Eres un pastor y maestro bíblico con amplia experiencia en discipulado, formación de líderes de células y enseñanza bíblica en la iglesia local.

Debes crear una serie completa de ${cantidadFinal} clases para célula de contexto "${contextoFinal}".

Tema general:
${temaFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

Devuelve exactamente este formato:

{
  "tipo": "serie_clase",
  "titulo_serie": "string",
  "objetivo_general": "string",
  "idea_central": "string",
  "semanas": [
    {
      "semana": 1,
      "titulo": "string",
      "objetivo": "string",
      "texto_biblico_base": "string",
      "idea_central": "string",
      "dinamica_apertura": "string",
      "introduccion": "string",
      "desarrollo_biblico": ["string", "string", "string"],
      "aplicacion_practica": ["string", "string", "string"],
      "desafio_semana": "string",
      "preguntas_grupo": ["string", "string", "string", "string"],
      "oracion_final": "string"
    }
  ]
}

REGLAS:
- "semanas" debe tener exactamente ${cantidadFinal} elementos.
- "desarrollo_biblico" debe tener exactamente 3 elementos.
- "aplicacion_practica" debe tener exactamente 3 elementos.
- "preguntas_grupo" debe tener exactamente 4 elementos.
- Todo en español.
- La serie debe ser cristocéntrica, bíblica, clara, pastoral y práctica.
`;
    }

    if (tipoFinal === "sermon") {
      return `
Responde ÚNICAMENTE con JSON válido.
No uses markdown.
No agregues comentarios.
No agregues texto fuera del JSON.

Eres un predicador y maestro bíblico experimentado, con enfoque cristocéntrico, pastoral y fiel al texto.

Debes crear una serie completa de ${cantidadFinal} sermones para el contexto "${contextoFinal}".

Tema general:
${temaFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

Devuelve exactamente este formato:

{
  "tipo": "serie_sermon",
  "titulo_serie": "string",
  "objetivo_general": "string",
  "idea_central": "string",
  "semanas": [
    {
      "semana": 1,
      "titulo": "string",
      "objetivo": "string",
      "texto_biblico_base": "string",
      "idea_central": "string",
      "introduccion": "string",
      "contexto_biblico": "string",
      "desarrollo": ["string", "string", "string"],
      "aplicacion_practica": ["string", "string", "string"],
      "conclusion": "string",
      "llamado_final": "string"
    }
  ]
}

REGLAS:
- "semanas" debe tener exactamente ${cantidadFinal} elementos.
- "desarrollo" debe tener exactamente 3 elementos.
- "aplicacion_practica" debe tener exactamente 3 elementos.
- Todo en español.
- La serie debe ser bíblica, cristocéntrica, pastoral y predicable.
`;
    }

    if (tipoFinal === "devocional") {
      return `
Responde ÚNICAMENTE con JSON válido.
No uses markdown.
No agregues comentarios.
No agregues texto fuera del JSON.

Eres un pastor que escribe devocionales bíblicos, cálidos, cristocéntricos y edificantes.

Debes crear una serie devocional de ${cantidadFinal} días para el contexto "${contextoFinal}".

Tema general:
${temaFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

Devuelve exactamente este formato:

{
  "tipo": "serie_devocional",
  "titulo_serie": "string",
  "objetivo_general": "string",
  "idea_central": "string",
  "dias": [
    {
      "dia": 1,
      "titulo": "string",
      "texto_biblico_clave": "string",
      "verdad_central": "string",
      "reflexion_devocional": "string",
      "aplicacion_personal": ["string", "string", "string"],
      "oracion_final": "string"
    }
  ]
}

REGLAS:
- "dias" debe tener exactamente ${cantidadFinal} elementos.
- "aplicacion_personal" debe tener exactamente 3 elementos por día.
- Todo en español.
- Debe ser pastoral, cálido, bíblico y práctico.
`;
    }

    if (tipoFinal === "estudio") {
      return `
Responde ÚNICAMENTE con JSON válido.
No uses markdown.
No agregues comentarios.
No agregues texto fuera del JSON.

Eres un maestro bíblico con claridad doctrinal, enfoque pastoral y capacidad para enseñar de forma sencilla.

Debes crear una serie de ${cantidadFinal} estudios bíblicos para el contexto "${contextoFinal}".

Tema general:
${temaFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

Devuelve exactamente este formato:

{
  "tipo": "serie_estudio",
  "titulo_serie": "string",
  "objetivo_general": "string",
  "idea_central": "string",
  "semanas": [
    {
      "semana": 1,
      "titulo": "string",
      "objetivo_del_estudio": "string",
      "pasaje_base": "string",
      "contexto_biblico": "string",
      "explicacion_texto": ["string", "string", "string"],
      "verdades_principales": ["string", "string", "string"],
      "aplicacion_practica": ["string", "string", "string"],
      "preguntas_para_profundizar": ["string", "string", "string", "string", "string"],
      "cierre": "string"
    }
  ]
}

REGLAS:
- "semanas" debe tener exactamente ${cantidadFinal} elementos.
- "explicacion_texto" debe tener exactamente 3 elementos.
- "verdades_principales" debe tener exactamente 3 elementos.
- "aplicacion_practica" debe tener exactamente 3 elementos.
- "preguntas_para_profundizar" debe tener exactamente 5 elementos.
- Todo en español.
- Debe ser claro, bíblico, cristocéntrico y formativo.
`;
    }
  }

  if (tipoFinal === "celula") {
    return `
Responde ÚNICAMENTE con JSON válido.
No uses markdown.
No agregues comentarios.
No agregues texto fuera del JSON.

Eres un pastor y maestro bíblico con amplia experiencia en discipulado, formación de líderes de células y enseñanza bíblica en la iglesia local.

Debes crear una clase clara, bíblica, pastoral y práctica para una célula de contexto "${contextoFinal}".

Tema:
${temaFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

Devuelve exactamente este formato:

{
  "tipo": "clase",
  "titulo": "string",
  "objetivo": "string",
  "texto_biblico_base": "string",
  "idea_central": "string",
  "dinamica_apertura": "string",
  "introduccion": "string",
  "desarrollo_biblico": ["string", "string", "string"],
  "aplicacion_practica": ["string", "string", "string"],
  "desafio_semana": "string",
  "preguntas_grupo": ["string", "string", "string", "string"],
  "oracion_final": "string"
}

REGLAS:
- "desarrollo_biblico" debe tener exactamente 3 elementos.
- "aplicacion_practica" debe tener exactamente 3 elementos.
- "preguntas_grupo" debe tener exactamente 4 elementos.
- Todo en español.
- Debe ser cristocéntrica, bíblica, clara, pastoral y práctica.
`;
  }

  if (tipoFinal === "sermon") {
    return `
Responde ÚNICAMENTE con JSON válido.
No uses markdown.
No agregues comentarios.
No agregues texto fuera del JSON.

Eres un predicador y maestro bíblico experimentado, con enfoque cristocéntrico, pastoral y fiel al texto.

Debes desarrollar un sermón claro, bíblico y listo para predicar.

Tema:
${temaFinal}

Contexto:
${contextoFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

Devuelve exactamente este formato:

{
  "tipo": "sermon",
  "titulo": "string",
  "objetivo": "string",
  "texto_biblico_base": "string",
  "idea_central": "string",
  "introduccion": "string",
  "contexto_biblico": "string",
  "desarrollo": ["string", "string", "string"],
  "aplicacion_practica": ["string", "string", "string"],
  "conclusion": "string",
  "llamado_final": "string"
}

REGLAS:
- "desarrollo" debe tener exactamente 3 elementos.
- "aplicacion_practica" debe tener exactamente 3 elementos.
- Todo en español.
- Debe ser bíblico, cristocéntrico, pastoral y predicable.
`;
  }

  if (tipoFinal === "devocional") {
    return `
Responde ÚNICAMENTE con JSON válido.
No uses markdown.
No agregues comentarios.
No agregues texto fuera del JSON.

Eres un pastor que escribe devocionales bíblicos, cálidos, cristocéntricos y edificantes.

Debes escribir un devocional claro, profundo y práctico.

Tema:
${temaFinal}

Contexto:
${contextoFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

Devuelve exactamente este formato:

{
  "tipo": "devocional",
  "titulo": "string",
  "texto_biblico_clave": "string",
  "verdad_central": "string",
  "reflexion_devocional": "string",
  "aplicacion_personal": ["string", "string", "string"],
  "oracion_final": "string"
}

REGLAS:
- "aplicacion_personal" debe tener exactamente 3 elementos.
- Todo en español.
- Debe ser bíblico, cálido, pastoral, cristocéntrico y práctico.
`;
  }

  if (tipoFinal === "estudio") {
    return `
Responde ÚNICAMENTE con JSON válido.
No uses markdown.
No agregues comentarios.
No agregues texto fuera del JSON.

Eres un maestro bíblico con claridad doctrinal, enfoque pastoral y capacidad para enseñar de forma sencilla.

Debes desarrollar un estudio bíblico claro, formativo y útil para enseñar.

Tema:
${temaFinal}

Contexto:
${contextoFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

Devuelve exactamente este formato:

{
  "tipo": "estudio",
  "titulo": "string",
  "objetivo_del_estudio": "string",
  "pasaje_base": "string",
  "contexto_biblico": "string",
  "explicacion_texto": ["string", "string", "string"],
  "verdades_principales": ["string", "string", "string"],
  "aplicacion_practica": ["string", "string", "string"],
  "preguntas_para_profundizar": ["string", "string", "string", "string", "string"],
  "cierre": "string"
}

REGLAS:
- "explicacion_texto" debe tener exactamente 3 elementos.
- "verdades_principales" debe tener exactamente 3 elementos.
- "aplicacion_practica" debe tener exactamente 3 elementos.
- "preguntas_para_profundizar" debe tener exactamente 5 elementos.
- Todo en español.
- Debe ser claro, bíblico, cristocéntrico y formativo.
`;
  }

  return `
Responde ÚNICAMENTE con JSON válido.
No uses markdown.
No agregues comentarios.
No agregues texto fuera del JSON.

{
  "tipo": "contenido",
  "titulo": "string",
  "contenido": "string"
}
`;
}

function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch (err) {
      return null;
    }
  }
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

    const {
      tema,
      tipoContenido,
      contexto,
      tono,
      textoBase,
      modoGeneracion,
      cantidadSerie
    } = req.body || {};

    if (!tema || !tipoContenido || !tono) {
      return res.status(400).json({
        error: "Faltan datos. Envía tema, tipoContenido y tono."
      });
    }

    const promptFinal = getSchemaAndPrompt({
      tema,
      tipoContenido,
      contexto,
      tono,
      textoBase,
      modoGeneracion,
      cantidadSerie
    });

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
              { text: promptFinal }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
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

    const parsed = tryParseJSON(text);

    if (!parsed) {
      return res.status(500).json({
        error: "Gemini devolvió texto, pero no JSON válido.",
        raw: text
      });
    }

    return res.status(200).json({
      mode: "json",
      data: parsed
    });
  } catch (e) {
    return res.status(500).json({
      error: "Error interno en /api/generate",
      details: String(e)
    });
  }
}
