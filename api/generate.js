import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // فقط POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // بررسی API Key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured",
      });
    }

    const { message, style = "Professionell", length = "Mittel" } =
      req.body || {};

    // بررسی پیام
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Bitte geben Sie eine Kundennachricht ein.",
      });
    }

    const prompt = `
Du bist ein professioneller Büroassistent für kleine Handwerksbetriebe.

Erstelle eine passende Antwort auf die folgende Kundennachricht.

Sprache: Deutsch
Stil: ${style}
Länge: ${length}

Kundennachricht:
${message}

Antworte direkt mit der fertigen Nachricht.
Keine Erklärung davor.
`;

    const response = await client.responses.create({
      model: "gpt-5.6",
      input: prompt,
    });

    const text = response.output_text;

    if (!text) {
      return res.status(500).json({
        error: "OpenAI returned no text",
      });
    }

    return res.status(200).json({
      text,
      output: text,
    });
  } catch (error) {
    console.error("OPENAI ERROR:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Fehler bei der Verbindung mit der OpenAI API",
    });
  }
}
