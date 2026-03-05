export default async function handler(req, res) {

const apiKey = process.env.GEMINI_API_KEY;

const { prompt } = req.body;

const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
contents: [
{
parts: [{ text: prompt }]
}
]
})
}
);

const data = await response.json();

const text =
data.candidates?.[0]?.content?.parts?.[0]?.text ||
"No se pudo generar la clase.";

res.status(200).json({ text });

}