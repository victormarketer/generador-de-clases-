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

function construirPrompt({
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

  let cantidadFinal = sanitizeCount(cantidadSerie, 4);

  if (tipoFinal === "devocional") {
    cantidadFinal = 7;
  } else {
    cantidadFinal = 4;
  }

  if (modoFinal === "serie") {
    if (tipoFinal === "celula") {
      return `
Actúa como un pastor y maestro bíblico con amplia experiencia en discipulado, formación de líderes de células y enseñanza bíblica en la iglesia local.

Debes crear una SERIE COMPLETA de ${cantidadFinal} clases para célula de contexto "${contextoFinal}".

Tema general de la serie:
${temaFinal}

Tono de la serie:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

INSTRUCCIONES IMPORTANTES

Escribe en TEXTO LIMPIO.
No uses Markdown.
No uses símbolos como ###, ##, **, *, ni ---.
No escribas como artículo académico.
Escribe como material pastoral, claro, práctico y fácil de enseñar.

Primero incluye:

TITULO GENERAL DE LA SERIE
OBJETIVO GENERAL DE LA SERIE
IDEA CENTRAL DE LA SERIE

Luego desarrolla ${cantidadFinal} clases consecutivas.

Cada clase debe incluir obligatoriamente:

TITULO
OBJETIVO DE LA CLASE
TEXTO BIBLICO BASE
IDEA CENTRAL
DINÁMICA DE APERTURA
INTRODUCCIÓN
DESARROLLO BÍBLICO EN 3 PUNTOS
APLICACIÓN PRÁCTICA
DESAFÍO DE LA SEMANA
PREGUNTAS PARA EL GRUPO
ORACIÓN FINAL

REGLAS IMPORTANTES

Cada clase debe avanzar de manera lógica sobre la anterior.
La progresión debe sentirse conectada, pastoral y útil para una serie real.
Incluye exactamente 4 preguntas para el grupo en cada clase.
`;
    }

    if (tipoFinal === "sermon") {
      return `
Actúa como un predicador y maestro bíblico experimentado, con enfoque cristocéntrico, pastoral y fiel al texto.

Debes crear una SERIE COMPLETA de ${cantidadFinal} sermones para el contexto "${contextoFinal}".

Tema general de la serie:
${temaFinal}

Tono de la serie:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

INSTRUCCIONES IMPORTANTES

Escribe en TEXTO LIMPIO.
No uses Markdown.
No uses símbolos como ###, ##, **, *, ni ---.
No escribas como artículo académico.
Escribe como material real para predicar.

Primero incluye:

TITULO GENERAL DE LA SERIE
OBJETIVO GENERAL DE LA SERIE
IDEA CENTRAL DE LA SERIE

Luego desarrolla ${cantidadFinal} sermones.

Cada sermón debe incluir:

TITULO
OBJETIVO DEL SERMÓN
TEXTO BÍBLICO BASE
IDEA CENTRAL
INTRODUCCIÓN
CONTEXTO BÍBLICO
DESARROLLO EN 3 PUNTOS
APLICACIÓN PRÁCTICA
CONCLUSIÓN
LLAMADO FINAL

REGLAS IMPORTANTES

Cada sermón debe avanzar sobre el anterior.
La serie debe sentirse coherente y progresiva.
Cada sermón debe ser predicable, pastoral, bíblico y práctico.
`;
    }

    if (tipoFinal === "devocional") {
      return `
Actúa como un pastor que escribe devocionales bíblicos, cálidos, cristocéntricos y edificantes.

Debes crear una SERIE DEVOCIONAL de ${cantidadFinal} días para el contexto "${contextoFinal}".

Tema general de la serie:
${temaFinal}

Tono de la serie:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

INSTRUCCIONES IMPORTANTES

Escribe en TEXTO LIMPIO.
No uses Markdown.
No uses símbolos como ###, ##, **, *, ni ---.
No escribas de forma académica.
Escribe de manera cálida, espiritual, pastoral y clara.

Primero incluye:

TITULO GENERAL DE LA SERIE
OBJETIVO GENERAL
IDEA CENTRAL DE LA SERIE

Luego desarrolla:
DÍA 1
DÍA 2
DÍA 3
hasta completar los ${cantidadFinal} días.

Cada día debe incluir:

TITULO
TEXTO BÍBLICO CLAVE
VERDAD CENTRAL
REFLEXIÓN DEVOCIONAL
APLICACIÓN PERSONAL
ORACIÓN FINAL

REGLAS IMPORTANTES

Cada día debe tener continuidad con el anterior.
La serie debe sentirse progresiva y espiritualmente conectada.
Incluye exactamente 3 aplicaciones personales por día.
`;
    }

    if (tipoFinal === "estudio") {
      return `
Actúa como un maestro bíblico con claridad doctrinal, enfoque pastoral y capacidad para enseñar de forma sencilla.

Debes crear una SERIE de ${cantidadFinal} estudios bíblicos para el contexto "${contextoFinal}".

Tema general de la serie:
${temaFinal}

Tono de la serie:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

INSTRUCCIONES IMPORTANTES

Escribe en TEXTO LIMPIO.
No uses Markdown.
No uses símbolos como ###, ##, **, *, ni ---.
No escribas como comentario académico demasiado técnico.
Escribe como un estudio bíblico claro, pastoral y formativo.

Primero incluye:

TITULO GENERAL DE LA SERIE
OBJETIVO GENERAL DE LA SERIE
IDEA CENTRAL DE LA SERIE

Luego desarrolla ${cantidadFinal} estudios bíblicos.

Cada estudio debe incluir:

TITULO
OBJETIVO DEL ESTUDIO
PASAJE BASE
CONTEXTO BÍBLICO
EXPLICACIÓN DEL TEXTO EN 3 PUNTOS
VERDADES PRINCIPALES
APLICACIÓN PRÁCTICA
PREGUNTAS PARA PROFUNDIZAR
CIERRE

REGLAS IMPORTANTES

Cada estudio debe construir sobre el anterior.
Incluye exactamente 3 verdades principales.
Incluye exactamente 3 aplicaciones prácticas.
Incluye exactamente 5 preguntas para profundizar.
`;
    }
  }

  if (tipoFinal === "celula") {
    return `
Actúa como un pastor y maestro bíblico con amplia experiencia en discipulado, formación de líderes de células y enseñanza bíblica en la iglesia local.

Debes crear una clase clara, bíblica, pastoral y práctica para una célula de contexto "${contextoFinal}".

Tema de la clase:
${temaFinal}

Tono de la enseñanza:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

INSTRUCCIONES IMPORTANTES

Escribe en TEXTO LIMPIO.
No uses Markdown.
No uses símbolos como ###, ##, **, *, ni ---.
No escribas como un artículo académico ni como un sermón demasiado largo.
Escribe como una enseñanza clara y sencilla que un líder pueda usar fácilmente en una reunión de célula.

Cada sección debe ser clara y breve.
Evita párrafos demasiado largos.
Escribe pensando en que el líder leerá y explicará el contenido.

La enseñanza debe ser:
bíblica
cristocéntrica
pastoral
clara
práctica para la vida cristiana.

Evita respuestas superficiales o repetitivas.
Mantén las secciones breves, claras y fáciles de explicar.

Antes de escribir la enseñanza, organiza internamente un bosquejo breve y luego desarrolla cada sección con claridad.

ESTRUCTURA OBLIGATORIA

TITULO
Máximo 12 palabras.

OBJETIVO DE LA CLASE
Explica en una sola frase qué transformación espiritual busca esta enseñanza.

TEXTO BIBLICO BASE
Incluye el pasaje principal y menciona brevemente el contexto bíblico.

IDEA CENTRAL
Resume en una sola frase la verdad principal de la enseñanza.

DINÁMICA DE APERTURA
Propón una dinámica breve y participativa relacionada con el tema y adecuada al público indicado.

INTRODUCCIÓN
Un párrafo breve que conecte el tema con la vida diaria de los creyentes.

DESARROLLO BÍBLICO
Explica el pasaje bíblico en máximo 3 puntos principales.
Cada punto debe ser claro, pastoral y fácil de enseñar.

APLICACIÓN PRÁCTICA
Incluye 3 aplicaciones concretas para vivir esta verdad durante la semana.

DESAFÍO DE LA SEMANA
Propón un paso práctico que cada persona pueda aplicar durante los próximos días.

PREGUNTAS PARA EL GRUPO
Incluye exactamente 4 preguntas que ayuden a reflexionar y conversar.

ORACIÓN FINAL
Escribe una oración pastoral breve basada en el tema de la enseñanza.

La clase debe sentirse pastoral, bíblica, clara y lista para ser enseñada en una célula.
`;
  }

  if (tipoFinal === "sermon") {
    return `
Actúa como un predicador y maestro bíblico experimentado, con enfoque cristocéntrico, pastoral y fiel al texto.

Debes desarrollar un sermón claro, bíblico y listo para predicar.

Tema del sermón:
${temaFinal}

Contexto o público:
${contextoFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

INSTRUCCIONES IMPORTANTES

Escribe en TEXTO LIMPIO.
No uses Markdown.
No uses símbolos como ###, ##, **, *, ni ---.
No escribas como un artículo académico.
Escribe como material real para predicar.

Cada sección debe ser clara y útil.
Evita párrafos demasiado largos.
Haz que cada punto tenga sustancia y aplicación.

El sermón debe ser:
bíblico
cristocéntrico
pastoral
claro
práctico
predicable

ESTRUCTURA OBLIGATORIA

TITULO
Máximo 12 palabras.

OBJETIVO DEL SERMÓN
Explica en una sola frase qué debe producir este mensaje en los oyentes.

TEXTO BÍBLICO BASE
Incluye el pasaje principal y menciona brevemente el contexto.

IDEA CENTRAL
Resume en una frase la verdad principal del sermón.

INTRODUCCIÓN
Breve, clara y conectada con la vida real.

CONTEXTO BÍBLICO
Explica el contexto del pasaje de forma sencilla.

DESARROLLO
Desarrolla el sermón en 3 puntos principales.
Cada punto debe tener explicación y aplicación pastoral.

APLICACIÓN PRÁCTICA
Incluye 3 aplicaciones concretas.

CONCLUSIÓN
Cierra con fuerza y claridad.

LLAMADO FINAL
Haz un llamado pastoral coherente con el tema.
`;
  }

  if (tipoFinal === "devocional") {
    return `
Actúa como un pastor que escribe devocionales bíblicos, cálidos, cristocéntricos y edificantes.

Debes escribir un devocional claro, profundo y práctico.

Tema del devocional:
${temaFinal}

Contexto o público:
${contextoFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

INSTRUCCIONES IMPORTANTES

Escribe en TEXTO LIMPIO.
No uses Markdown.
No uses símbolos como ###, ##, **, *, ni ---.
No escribas de forma académica.
Escribe de manera cálida, clara y espiritual.

El devocional debe ser:
bíblico
cristocéntrico
pastoral
edificante
práctico

ESTRUCTURA OBLIGATORIA

TITULO
Máximo 12 palabras.

TEXTO BÍBLICO CLAVE
Incluye el pasaje principal.

VERDAD CENTRAL
Resume en una frase la enseñanza principal.

REFLEXIÓN DEVOCIONAL
Desarrolla una reflexión clara y pastoral.

APLICACIÓN PERSONAL
Incluye 3 aplicaciones breves y concretas.

ORACIÓN FINAL
Escribe una oración sencilla y pastoral basada en el tema.
`;
  }

  if (tipoFinal === "estudio") {
    return `
Actúa como un maestro bíblico con claridad doctrinal, enfoque pastoral y capacidad para enseñar de forma sencilla.

Debes desarrollar un estudio bíblico claro, formativo y útil para enseñar.

Tema del estudio:
${temaFinal}

Contexto o público:
${contextoFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

INSTRUCCIONES IMPORTANTES

Escribe en TEXTO LIMPIO.
No uses Markdown.
No uses símbolos como ###, ##, **, *, ni ---.
No escribas como un comentario académico demasiado técnico.
Escribe como un estudio bíblico claro y formativo.

El estudio debe ser:
bíblico
cristocéntrico
claro
formativo
pastoral
práctico

ESTRUCTURA OBLIGATORIA

TITULO
Máximo 12 palabras.

OBJETIVO DEL ESTUDIO
Explica en una sola frase qué busca enseñar este estudio.

PASAJE BASE
Incluye el texto principal.

CONTEXTO BÍBLICO
Explica el contexto de forma sencilla.

EXPLICACIÓN DEL TEXTO
Desarrolla el contenido en 3 puntos principales.

VERDADES PRINCIPALES
Resume 3 enseñanzas claves.

APLICACIÓN PRÁCTICA
Incluye 3 aplicaciones concretas.

PREGUNTAS PARA PROFUNDIZAR
Incluye exactamente 5 preguntas.

CIERRE
Escribe un cierre breve y claro.
`;
  }

  return `
Actúa como un maestro bíblico pastoral, cristocéntrico y claro.

Tema:
${temaFinal}

Contexto:
${contextoFinal}

Tono:
${tonoFinal}

Texto bíblico base:
${textoBaseFinal}

Desarrolla un contenido bíblico claro, útil y edificante.
`;
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
      cantidadSerie,
      prompt
    } = req.body || {};

    let promptFinal = "";

    if (tema && tipoContenido && tono) {
      promptFinal = construirPrompt({
        tema,
        tipoContenido,
        contexto,
        tono,
        textoBase,
        modoGeneracion,
        cantidadSerie
      });
    } else if (prompt) {
      promptFinal = prompt;
    } else {
      return res.status(400).json({
        error: "Faltan datos. Envía tema, tipoContenido, tono y opcionalmente contexto, textoBase, modoGeneracion y cantidadSerie."
      });
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
                text: promptFinal
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
