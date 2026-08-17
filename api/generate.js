export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, style = "Professionell", length = "Mittel" } =
      req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Bitte geben Sie eine Kundennachricht ein."
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY fehlt in den Vercel Environment Variables."
      });
    }

    const prompt = `
Du bist ein professioneller Büroassistent für kleine Handwerksbetriebe.

Erstelle eine passende Antwort auf diese Kundennachricht.

Sprache: Deutsch
Stil: ${style}
Länge: ${length}

Kundennachricht:
${message}

Antworte direkt mit der fertigen Nachricht.
Keine Erklärung davor.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5.6",
        input: prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI Fehler:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API Fehler"
      });
    }

    return res.status(200).json({
      text: data.output_text || "Keine Antwort erhalten."
    });

  } catch (error) {
    console.error("Server Fehler:", error);

    return res.status(500).json({
      error: error.message || "Interner Serverfehler"
    });
  }
}
