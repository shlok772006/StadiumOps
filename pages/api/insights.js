/**
 * pages/api/insights.js
 * -----------------------------------------------------------------------
 * Operational insights endpoint. Returns an AI-generated control-room
 * briefing summarizing current gate status, transport, vendor alerts,
 * and weather conditions. Results are cached per minute via TTL cache.
 * -----------------------------------------------------------------------
 */

const { callLLM } = require("../../lib/llm");
const { getOrCompute } = require("../../lib/cache");
const { buildBriefingPrompt } = require("../../lib/orchestrator");
const { logError } = require("../../lib/logger");
const { API_LIMITS, CACHE_CONFIG, TIMING } = require("../../lib/constants");

/**
 * Handle GET requests for AI operational insights briefing.
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 * @returns {Promise<void>}
 */
async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  try {
    const { lang } = req.query || {};
    const sanitizedLang = String(lang || "English").replace(/[^a-zA-Z\s\(\)\u0080-\u9fff]/g, "").slice(0, API_LIMITS.MAX_LANGUAGE_LENGTH);
    const minuteKey = `insights:${Math.floor(Date.now() / TIMING.DATA_REFRESH_INTERVAL_MS)}:${sanitizedLang}`;

    const { value: briefing, cached } = await getOrCompute(
      minuteKey,
      async () => {
        const prompt = buildBriefingPrompt(sanitizedLang);
        return callLLM({
          system: prompt.system,
          messages: [{ role: "user", content: prompt.user }],
          maxTokens: 800,
        });
      },
      CACHE_CONFIG.TTL_MS
    );

    return res.status(200).json({
      briefing,
      generatedAt: new Date().toISOString(),
      cached,
    });
  } catch (err) {
    logError("/api/insights", "Failed to generate insights", err);
    return res.status(500).json({
      error: "Could not generate insights. Check your API key in .env.local.",
      detail: err.message,
    });
  }
}

module.exports = handler;
