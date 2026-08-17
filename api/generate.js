export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing"
      });
    }

    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const prompt = `
Du bist ein professioneller Büroassistent für kleine Handwerksbetriebe.

Erstelle eine passende, professionelle und freundliche Antwort auf die folgende Kundennachricht.

Antworte direkt mit der fertigen Nachricht.
Keine Erklärung davor.

Kundennachricht:
${message}
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
      console.error("OpenAI API error:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API error"
      });
    }

    const text =
      data.output_text ||
      data.output
        ?.flatMap(item => item.content || [])
        ?.filter(item => item.type === "output_text")
        ?.map(item => item.text)
        ?.join("\n") ||
      "";

    if (!text.trim()) {
      console.error("OpenAI returned no text:", data);

      return res.status(502).json({
        error: "OpenAI returned no text"
      });
    }

    return res.status(200).json({
      text: text.trim()
    });

  } catch (error) {
    console.error("Server error:", error);

    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
}
