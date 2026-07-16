/**
 * pages/api/chat.js
 * -----------------------------------------------------------------------
 * AI chat endpoint. Receives a conversation history array and optional
 * language label, routes the query through the orchestrator with full
 * stadium data grounding, and returns the AI assistant's reply.
 * -----------------------------------------------------------------------
 */

const { routeQuery } = require("../../lib/orchestrator");
const { API_LIMITS } = require("../../lib/constants");
const { logError } = require("../../lib/logger");

/**
 * Handle POST requests for AI chat conversations.
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 * @returns {Promise<void>}
 */
async function handler(req, res) {
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
      if (msg.content.length > API_LIMITS.MAX_MESSAGE_LENGTH) {
        return res.status(400).json({ error: `Message content exceeds limit of ${API_LIMITS.MAX_MESSAGE_LENGTH} characters.` });
      }
      // Basic sanitization: strip HTML tags
      msg.content = msg.content.replace(/<[^>]*>/g, "");
    }

    const sanitizedLanguage = String(language || "English").replace(/[^a-zA-Z\s\(\)\u0080-\u9fff]/g, "").slice(0, API_LIMITS.MAX_LANGUAGE_LENGTH);

    // Guardrail: cap history to configured max turns
    const trimmed = messages.slice(-API_LIMITS.MAX_CHAT_HISTORY_TURNS);
    const reply = await routeQuery(trimmed, sanitizedLanguage);
    return res.status(200).json({ reply });
  } catch (err) {
    logError("/api/chat", "Failed to process chat request", err);
    return res.status(500).json({
      error: "StadiumOps AI couldn't reach the language model. Check your API key in .env.local.",
      detail: err.message,
    });
  }
}

module.exports = handler;
