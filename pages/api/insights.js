import { callLLM } from "../../lib/llm";
import { getOrCompute } from "../../lib/cache";
import { buildBriefingPrompt } from "../../lib/orchestrator";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  try {
    const minuteKey = `insights:${Math.floor(Date.now() / 60000)}`;

    const { value: briefing, cached } = await getOrCompute(
      minuteKey,
      async () => {
        const prompt = buildBriefingPrompt();
        return callLLM({
          system: prompt.system,
          messages: [{ role: "user", content: prompt.user }],
          maxTokens: 500,
        });
      },
      60_000
    );

    return res.status(200).json({
      briefing,
      generatedAt: new Date().toISOString(),
      cached,
    });
  } catch (err) {
    console.error("[/api/insights] error:", err.message);
    return res.status(500).json({
      error: "Could not generate insights. Check your API key in .env.local.",
      detail: err.message,
    });
  }
}
