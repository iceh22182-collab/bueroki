export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message, style } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Keine Nachricht erhalten"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY fehlt"
      });
    }

    const prompt = `
Du bist ein professioneller deutscher E-Mail-Assistent für kleine Handwerksbetriebe.

Der Kunde hat folgende Nachricht geschrieben:

"${message}"

Antwortstil:
${style || "Professionell"}

Schreibe eine passende, höfliche und professionelle Antwort auf Deutsch.

Wichtig:
- Beziehe dich direkt auf die Nachricht des Kunden.
- Erfinde keine Termine, Preise oder Zusagen.
- Wenn Informationen fehlen, formuliere entsprechend vorsichtig.
- Die Antwort soll natürlich und menschlich klingen.
- Beginne direkt mit der E-Mail.
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + process.env.OPENAI_API_KEY
        },
        body: JSON.stringify({
          model: "gpt-5.6",
          input: prompt
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI API Fehler"
      });
    }

    return res.status(200).json({
      answer: data.output_text
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Serverfehler"
    });
  }
}
