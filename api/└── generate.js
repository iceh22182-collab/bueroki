export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

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
          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI Fehler:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API Fehler"
      });
    }

    const answer = data.output_text || "";

    if (!answer) {
      return res.status(500).json({
        error: "OpenAI returned no text"
      });
    }

    return res.status(200).json({
      text: answer
    });

  } catch (error) {
    console.error("Server Fehler:", error);

    return res.status(500).json({
      error: error.message || "Server Fehler"
    });
  }
}
