/**
 * pages/api/emergency.js
 * -----------------------------------------------------------------------
 * Emergency action plan endpoint. Receives an incident type, gate location,
 * and optional details, then generates an AI-powered numbered action plan
 * with reasoning for each step. Uses emergency protocols and live gate
 * data to ground the response.
 * -----------------------------------------------------------------------
 */

const { callLLM } = require("../../lib/llm");
const { buildEmergencyPrompt } = require("../../lib/orchestrator");
const { EMERGENCY_PROTOCOLS, GATES } = require("../../lib/stadiumData");
const { API_LIMITS } = require("../../lib/constants");
const { logError } = require("../../lib/logger");

/**
 * Handle POST requests for emergency action plan generation.
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 * @returns {Promise<void>}
 */
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { incidentType, location, details, lang } = req.body || {};

    if (!EMERGENCY_PROTOCOLS[incidentType]) {
      return res.status(400).json({
        error: `Unknown incidentType. Expected one of: ${Object.keys(EMERGENCY_PROTOCOLS).join(", ")}`,
      });
    }

    const gateIds = GATES.map(g => g.id);
    if (!location || !gateIds.includes(location)) {
      return res.status(400).json({
        error: `Invalid location. Expected one of: ${gateIds.join(", ")}`,
      });
    }

    // Clean and limit details
    const cleanDetails = String(details || "").replace(/<[^>]*>/g, "").slice(0, API_LIMITS.MAX_INCIDENT_DETAILS_LENGTH);
    const sanitizedLang = String(lang || "English").replace(/[^a-zA-Z\s\(\)\u0080-\u9fff]/g, "").slice(0, API_LIMITS.MAX_LANGUAGE_LENGTH);

    const prompt = buildEmergencyPrompt(incidentType, location, cleanDetails, sanitizedLang);
    const actionPlan = await callLLM({
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
      maxTokens: 500,
    });

    const nearestGate = GATES.find((g) => g.id === location) || GATES[0];

    return res.status(200).json({
      incident: EMERGENCY_PROTOCOLS[incidentType].label,
      nearestGate: nearestGate.name,
      actionPlan,
    });
  } catch (err) {
    logError("/api/emergency", "Failed to generate action plan", err);
    return res.status(500).json({
      error: "Could not generate action plan. Check your API key in .env.local.",
      detail: err.message,
    });
  }
}

module.exports = handler;
