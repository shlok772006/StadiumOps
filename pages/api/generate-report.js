/**
 * pages/api/generate-report.js
 * -----------------------------------------------------------------------
 * Report generation endpoint. Accepts a report type (crowd, incident,
 * daily, or match) and returns an AI-generated professional report
 * with data tables, executive summary, and actionable recommendations.
 * -----------------------------------------------------------------------
 */

const { callLLM } = require("../../lib/llm");
const { buildReportPrompt } = require("../../lib/orchestrator");
const { logError } = require("../../lib/logger");
const { API_LIMITS } = require("../../lib/constants");

/** @type {ReadonlyArray<string>} Valid report type identifiers */
const VALID_TYPES = ["crowd", "incident", "daily", "match"];

/**
 * Handle POST requests for AI report generation.
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 * @returns {Promise<void>}
 */
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { reportType, lang } = req.body || {};
    const type = VALID_TYPES.includes(reportType) ? reportType : "daily";
    const sanitizedLang = String(lang || "English").replace(/[^a-zA-Z\s\(\)\u0080-\u9fff]/g, "").slice(0, API_LIMITS.MAX_LANGUAGE_LENGTH);

    const prompt = buildReportPrompt(type, sanitizedLang);
    const report = await callLLM({
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
      maxTokens: 1200,
    });

    return res.status(200).json({
      report,
      reportType: type,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    logError("/api/generate-report", "Failed to generate report", err);
    return res.status(500).json({
      error: "Could not generate report.",
      detail: err.message,
    });
  }
}

module.exports = handler;
