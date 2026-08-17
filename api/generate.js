import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {

  // فقط POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const {
      message,
      style = "Professionell",
      language = "Deutsch"
    } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Bitte geben Sie eine Nachricht ein."
      });
    }

    const prompt = `
Du bist ein professioneller digitaler Büroassistent
für einen kleinen Handwerksbetrieb in Deutschland.

Deine Aufgabe ist es, Kundenkommunikation professionell
und natürlich zu formulieren.

Sprache: ${language}
Antwortstil: ${style}

Kundennachricht:
${message}

Erstelle eine passende fertige Antwort.

Regeln:
- Schreibe direkt die fertige Antwort.
- Keine Erklärung vor der Antwort.
- Keine erfundenen Termine, Preise oder Zusagen.
- Wenn Informationen fehlen, formuliere vorsichtig.
- Bei professionellen Antworten freundlich und seriös bleiben.
`;

    const response = await client.responses.create({
      model: "gpt-5.6",
      input: prompt
    });

    const text = response.output_text || "";

    return res.status(200).json({
      text: text
    });

  } catch (error) {

    console.error("OpenAI API Error:", error);

    return res.status(500).json({
      error: "Die KI konnte nicht erreicht werden."
    });
  }
}
