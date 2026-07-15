const { callLLM } = require("../../lib/llm");
const { buildReportPrompt } = require("../../lib/orchestrator");

const VALID_TYPES = ["crowd", "incident", "daily", "match"];

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { reportType } = req.body || {};
    const type = VALID_TYPES.includes(reportType) ? reportType : "daily";

    const prompt = buildReportPrompt(type);
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
    console.error("[/api/generate-report] error:", err.message);
    return res.status(500).json({
      error: "Could not generate report.",
      detail: err.message,
    });
  }
}

module.exports = handler;
