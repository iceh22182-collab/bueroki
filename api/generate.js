export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, style } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Keine Nachricht eingegeben." });
    }

    const styleInstruction =
      style === "Freundlich"
        ? "Schreibe freundlich, persönlich und professionell."
        : style === "Kurz & direkt"
        ? "Schreibe kurz, direkt und professionell."
        : "Schreibe professionell, höflich und klar.";

    const prompt = `
Du bist ein professioneller deutscher Büroassistent für kleine Handwerksbetriebe.

${styleInstruction}

Beantworte die folgende Kunden-E-Mail passend zum Inhalt.
Erfinde keine Termine, Preise oder Zusagen, die nicht aus der Nachricht hervorgehen.
Wenn Informationen fehlen, formuliere eine höfliche Rückfrage oder kündige eine Rückmeldung an.

Antworte ausschließlich auf Deutsch.
Keine Erklärung über deine Aufgabe.
Keine Überschrift wie "Antwort:".

Kunden-E-Mail:
${message}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.6",
        input: prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API Fehler",
      });
    }

    const answer =
      data.output
        ?.filter((item) => item.type === "message")
        ?.flatMap((item) => item.content || [])
        ?.filter((content) => content.type === "output_text")
        ?.map((content) => content.text)
        ?.join("\n") || "";

    if (!answer) {
      return res.status(500).json({
        error: "Keine Antwort von der KI erhalten.",
      });
    }

    return res.status(200).json({ answer });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Interner Serverfehler.",
    });
  }
}
