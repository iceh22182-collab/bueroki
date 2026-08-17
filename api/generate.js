export default async function handler(req, res) {
  // فقط POST مجاز است
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    // دریافت اطلاعات از سایت
    const {
      message,
      style = "Professionell",
      length = "Mittel"
    } = req.body || {};

    // بررسی پیام
    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Bitte geben Sie eine Kundennachricht ein."
      });
    }

    // بررسی API Key
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY wurde nicht gefunden."
      });
    }

    // دستور اصلی برای هوش مصنوعی
    const instructions = `
Du bist "BüroKI", ein professioneller deutscher E-Mail-Assistent
für kleine Handwerksbetriebe.

Deine Aufgabe:
Erstelle aus der Kundennachricht eine professionelle Antwort
auf Deutsch.

Regeln:
- Schreibe natürlich und menschlich.
- Sei höflich und professionell.
- Erfinde keine Termine, Preise, Zusagen oder Fakten.
- Wenn ein Termin nicht bekannt ist, formuliere vorsichtig.
- Beziehe dich direkt auf die Nachricht des Kunden.
- Keine unnötigen Erklärungen über KI.
- Gib ausschließlich die fertige E-Mail-Antwort zurück.
- Keine Markdown-Codeblöcke.

Antwortstil: ${style}
Antwortlänge: ${length}

Kundennachricht:
${message}
`;

    // OpenAI Responses API
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5.6",
          input: instructions
        })
      }
    );

    const data = await response.json();

    // خطا از OpenAI
    if (!response.ok) {
      console.error("OpenAI Error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Fehler bei der Verbindung mit OpenAI."
      });
    }

    // استخراج متن پاسخ
    const answer =
      data.output_text ||
      data.output
        ?.flatMap(item => item.content || [])
        ?.find(item => item.type === "output_text")
        ?.text ||
      "";

    if (!answer) {
      return res.status(500).json({
        error: "Keine Antwort von der KI erhalten."
      });
    }

    // ارسال جواب به سایت
    return res.status(200).json({
      answer: answer.trim()
    });

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      error: "Interner Serverfehler."
    });
  }
}
