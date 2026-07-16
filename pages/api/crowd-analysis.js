/**
 * pages/api/crowd-analysis.js
 * -----------------------------------------------------------------------
 * Crowd analysis endpoint. Returns AI-generated analysis of current gate
 * density, predicted congestion trends, and operational recommendations.
 * Results are cached per minute to reduce LLM API calls.
 * -----------------------------------------------------------------------
 */

const { callLLM } = require("../../lib/llm");
const { buildCrowdAnalysisPrompt } = require("../../lib/orchestrator");
const { getOrCompute } = require("../../lib/cache");
const { logError } = require("../../lib/logger");
const { API_LIMITS, CACHE_CONFIG, TIMING } = require("../../lib/constants");

/**
 * Handle GET requests for AI crowd analysis.
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
    const minuteKey = `crowd-analysis:${Math.floor(Date.now() / TIMING.DATA_REFRESH_INTERVAL_MS)}:${sanitizedLang}`;

    const { value: analysis, cached } = await getOrCompute(
      minuteKey,
      async () => {
        const prompt = buildCrowdAnalysisPrompt(sanitizedLang);
        return callLLM({
          system: prompt.system,
          messages: [{ role: "user", content: prompt.user }],
          maxTokens: 800,
        });
      },
      CACHE_CONFIG.TTL_MS
    );

    return res.status(200).json({ analysis, cached });
  } catch (err) {
    logError("/api/crowd-analysis", "Failed to generate crowd analysis", err);
    return res.status(500).json({
      error: "Could not generate crowd analysis.",
      detail: err.message,
    });
  }
}

module.exports = handler;
