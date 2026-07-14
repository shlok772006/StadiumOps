import { callLLM } from "../../lib/llm";
import { buildCrowdAnalysisPrompt } from "../../lib/orchestrator";
import { getOrCompute } from "../../lib/cache";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  try {
    const minuteKey = `crowd-analysis:${Math.floor(Date.now() / 60000)}`;

    const { value: analysis, cached } = await getOrCompute(
      minuteKey,
      async () => {
        const prompt = buildCrowdAnalysisPrompt();
        return callLLM({
          system: prompt.system,
          messages: [{ role: "user", content: prompt.user }],
          maxTokens: 800,
        });
      },
      60_000
    );

    return res.status(200).json({ analysis, cached });
  } catch (err) {
    console.error("[/api/crowd-analysis] error:", err.message);
    return res.status(500).json({
      error: "Could not generate crowd analysis.",
      detail: err.message,
    });
  }
}
