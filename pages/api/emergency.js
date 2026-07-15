import { callLLM } from "../../lib/llm";
import { buildEmergencyPrompt } from "../../lib/orchestrator";
import { EMERGENCY_PROTOCOLS, GATES } from "../../lib/stadiumData";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { incidentType, location, details } = req.body || {};

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
    const cleanDetails = String(details || "").replace(/<[^>]*>/g, "").slice(0, 500);

    const prompt = buildEmergencyPrompt(incidentType, location, cleanDetails);
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
    console.error("[/api/emergency] error:", err.message);
    return res.status(500).json({
      error: "Could not generate action plan. Check your API key in .env.local.",
      detail: err.message,
    });
  }
}
