export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { message, style = "professional" } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Keine Nachricht erhalten",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY fehlt",
      });
    }

    const prompt = `
Du bist ein professioneller deutscher Büroassistent für kleine Handwerksbetriebe.

Erstelle aus der folgenden Kundennachricht eine passende professionelle Antwort auf Deutsch.

Stil: ${style}

Regeln:
- Schreibe natürlich und professionell.
- Sei freundlich und höflich.
- Erfinde keine Termine, Preise oder Fakten.
- Wenn Informationen fehlen, bitte höflich um diese Informationen.
- Die Antwort soll direkt an den Kunden geschickt werden können.
- Keine Erklärungen über deine Arbeit.
- Gib nur die fertige E-Mail-Antwort zurück.

Kundennachricht:
${message}
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-5.6",
          input: prompt,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API Fehler",
      });
    }

    const answer = data.output_text;

    if (!answer) {
      return res.status(500).json({
        error: "OpenAI returned no text",
      });
    }

    return res.status(200).json({
      answer: answer.trim(),
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Interner Serverfehler",
    });
  }
}
