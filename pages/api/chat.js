import { routeQuery } from "../../lib/orchestrator";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { messages, language } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "`messages` array is required." });
    }

    // Input validation & sanitization
    for (const msg of messages) {
      if (!msg || typeof msg !== "object") {
        return res.status(400).json({ error: "Invalid message format." });
      }
      if (typeof msg.content !== "string" || typeof msg.role !== "string") {
        return res.status(400).json({ error: "Message content and role must be strings." });
      }
      if (msg.content.length > 2000) {
        return res.status(400).json({ error: "Message content exceeds limit of 2000 characters." });
      }
      // Basic sanitization: strip HTML tags
      msg.content = msg.content.replace(/<[^>]*>/g, "");
    }

    const sanitizedLanguage = String(language || "English").replace(/[^a-zA-Z\s\(\)\u0080-\u9fff]/g, "").slice(0, 50);

    // Guardrail: cap history to last 10 turns
    const trimmed = messages.slice(-10);
    const reply = await routeQuery(trimmed, sanitizedLanguage);
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("[/api/chat] error:", err.message);
    return res.status(500).json({
      error: "StadiumOps AI couldn't reach the language model. Check your API key in .env.local.",
      detail: err.message,
    });
  }
}
