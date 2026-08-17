export default async function handler(req, res) {

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

Erstelle eine passende Antwort auf die folgende
Kundennachricht.

Sprache: ${language}
Stil: ${style}

Kundennachricht:
${message}

Regeln:
- Schreibe direkt die fertige Antwort.
- Keine Erklärung vor der Antwort.
- Keine erfundenen Termine.
- Keine erfundenen Preise.
- Keine erfundenen Zusagen.
- Wenn Informationen fehlen, formuliere vorsichtig.
- Die Antwort soll natürlich, freundlich und professionell sein.
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5.6",
          input: prompt
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {

      console.error("OpenAI Error:", data);

      return res.status(response.status).json({
        error: "OpenAI API Fehler"
      });
    }

    const text =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "";

    return res.status(200).json({
      text
    });

  } catch (error) {

    console.error("Server Error:", error);

    return res.status(500).json({
      error: "Interner Serverfehler"
    });
  }
}
