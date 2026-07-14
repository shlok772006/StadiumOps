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

    // Guardrail: cap history to last 10 turns
    const trimmed = messages.slice(-10);
    const reply = await routeQuery(trimmed, language || "English");
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("[/api/chat] error:", err.message);
    return res.status(500).json({
      error: "StadiumOps AI couldn't reach the language model. Check your API key in .env.local.",
      detail: err.message,
    });
  }
}
