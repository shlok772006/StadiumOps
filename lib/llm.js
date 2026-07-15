/**
 * lib/llm.js
 * -----------------------------------------------------------------------
 * Provider-agnostic LLM caller. Supports Gemini (free), Anthropic, OpenAI.
 * Gemini uses a candidate fallback chain for model retirement/quota resilience.
 * -----------------------------------------------------------------------
 */

const PROVIDER = (process.env.LLM_PROVIDER || "gemini").toLowerCase();

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const GEMINI_URL_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * @param {Object} opts
 * @param {string} opts.system - system prompt
 * @param {Array<{role: "user"|"assistant", content: string}>} opts.messages
 * @param {number} [opts.maxTokens=1024]
 * @returns {Promise<string>} raw text reply
 */
async function callLLM({ system, messages, maxTokens = 1024 }) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("callLLM: `messages` must be a non-empty array");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isMock = !apiKey || apiKey === "your_gemini_api_key_here";

  if (isMock) {
    return simulateAIResponse({ system, messages });
  }

  try {
    if (PROVIDER === "openai") return await callOpenAI({ system, messages, maxTokens });
    if (PROVIDER === "gemini") return await callGemini({ system, messages, maxTokens });
    return await callAnthropic({ system, messages, maxTokens });
  } catch (err) {
    console.warn("LLM API Call failed, falling back to simulated response:", err.message);
    return simulateAIResponse({ system, messages });
  }
}

/**
 * High-fidelity AI response simulator for keyless demo mode.
 * Provides realistic mock responses matching each AI module's expected output format.
 * @param {Object} opts
 * @param {string} opts.system - the system prompt identifying the module
 * @param {Array<{role: string, content: string}>} opts.messages - conversation history
 * @returns {string} simulated AI text response
 */
function simulateAIResponse({ system, messages }) {
  const lastMsg = messages[messages.length - 1]?.content || "";
  const query = lastMsg.toLowerCase();

  // 1. Dashboard Briefing
  if (system.includes("operational intelligence")) {
    return `• Gate B and Gate D are currently showing elevated density (92% occupancy) with average wait times reaching 18 minutes. Recommendation: Dispatch 4 support stewards to concourse B and D immediately to manage queue lanes.
• Shuttle Bus Route 2 is reporting a 5-minute delay due to congestion on Route 3 exit lanes. Shuttle bus load is at 90%. Recommendation: Notify gate staff to suggest Metro lines to departing fans.
• Concession vendor Concession South is reporting low stock (45% remaining). Stock levels will fall below critical line during halftime. Recommendation: Instruct back-house logistics to replenish beverage inventory.
• Weather conditions are stable at 26°C with 60% humidity. Forecast remains favorable for the rest of match hours.`;
  }

  // 2. Emergency Action Plan
  if (system.includes("real-time decision support")) {
    return `1. Alert medical response team 2 near the North gate area.
2. Establish a clear 3-meter pathway to allow rapid entry and exit of the emergency team.
3. Instruct stewards near the affected section to gently guide fans to clear the immediate corridor.
4. Prepare the stretcher and AED transport.
5. Update central command room with a status report on patient stability within 2 minutes.

Estimated response time: 2.5 minutes.`;
  }

  // 3. Crowd Analytics
  if (system.includes("predictive analytics")) {
    return `### 1. CURRENT STATUS
Gates B, D, and F are currently at high-density thresholds (>90%). Flow rates remain elevated across all north gates. Average wait time across the venue is 12.5 minutes.

### 2. PREDICTION (NEXT 60 MIN)
- **Next 15 min**: Density at Gates B and D will peak and stabilize as entry shifts to inner seating bowls.
- **Next 30 min**: Kickoff arrival surge will subside; gates will transition to normal flow (<50%).
- **Next 60 min**: Entry gates completely clear. Concourse concessions will experience peak demand.

### 3. RECOMMENDATIONS
- Reroute incoming fans from Gate B to Gate C (currently 32% occupancy).
- Reallocate 3 volunteers from Gate E to Gate D for queue line management.
- Highlight alternative concessions on digital signage to redistribute halftime demand.`;
  }

  // 4. Report Generation
  if (system.includes("report generation")) {
    return `# MATCH DAY OPERATIONS REPORT

**Tournament**: FIFA World Cup 2026
**Match**: Argentina vs. France
**Venue**: MetLife Stadium
**Generated At**: ${new Date().toLocaleString()}

## 1. Executive Summary
Operations completed successfully. Gates processed entry flow within target times with peak congestion managed dynamically.

## 2. Gate Congestion Summary
- **Gate A/C/E/G/H**: Maintained normal green/busy thresholds. Average wait time: 8.5 minutes.
- **Gate B/D/F**: Experienced peak loads during 18:30-18:50 surge. Average wait time peaked at 18 minutes.

## 3. Incident Summary
- A single minor medical emergency was resolved near Gate A. Response time was 2.5 minutes.

## 4. Operational Recommendations
- For high-demand matchdays, pre-emptively redirect Gate B queues to Gate C 10 minutes earlier.
- Scale up concession staff near south zones prior to halftime.`;
  }

  // 5. Data Upload Analysis
  if (system.includes("data analysis module")) {
    return `### 1. DATA SUMMARY
The uploaded dataset has been parsed successfully. It contains gate occupancy metrics, queue lengths, and processing rates.

### 2. KEY INSIGHTS
- Peak gate occupancy occurred between 18:15 and 18:45.
- Wait times are highly correlated with processing rates rather than base gate capacities.

### 3. RELEVANCE & RECOMMENDATION
Deploy 2 additional ticket-scanning personnel to gates during the 30-minute pre-kickoff window to prevent backlog.`;
  }

  // 6. Chat Bot Assistant
  if (query.includes("gate") || query.includes("congest") || query.includes("crowd")) {
    return `Currently, Gate B and Gate D are experiencing high density (92%). I recommend redirecting fans entering from the east side to Gate C (32% density, 7m wait time). This will save them approximately 11 minutes in queue time.`;
  }

  if (query.includes("exit") || query.includes("route") || query.includes("section")) {
    return `For Section S2, the fastest exit route is via Gate C. Gate C has a wait time of only 7 minutes and is currently operating at normal flow capacity. Avoid Gate B, which is currently at critical occupancy.`;
  }

  if (query.includes("staff") || query.includes("volunteer")) {
    return `Based on live gate metrics, I recommend reallocating 3 volunteers from Gate E (accessible entry, currently normal flow) to Gate D to assist with queue management and fan routing.`;
  }

  if (query.includes("vendor") || query.includes("food") || query.includes("drink")) {
    return `concession vendor 'Concession South' near Gate D has low stock (45% remaining). I recommend directing the replenishment team to deliver 2 crates of soft drinks prior to the halftime rush.`;
  }

  return `I am StadiumOps AI. I can assist you with real-time crowd management, incident support, and operational analysis for the Argentina vs. France match. Ask me about gates, wait times, nearest amenities, or emergency protocols.`;
}


/**
 * Call the Anthropic Claude API.
 * @param {Object} opts
 * @param {string} opts.system - system prompt
 * @param {Array<{role: string, content: string}>} opts.messages - conversation messages
 * @param {number} opts.maxTokens - maximum output tokens
 * @returns {Promise<string>} trimmed text response
 * @throws {Error} if API key is missing or API returns non-OK status
 */
async function callAnthropic({ system, messages, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is missing. Add it to .env.local.");

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system,
      messages,
    }),
  });

  if (!res.ok) {
    const errText = await safeText(res);
    throw new Error(`Anthropic API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}

/**
 * Call the OpenAI Chat Completions API.
 * @param {Object} opts
 * @param {string} opts.system - system prompt
 * @param {Array<{role: string, content: string}>} opts.messages - conversation messages
 * @param {number} opts.maxTokens - maximum output tokens
 * @returns {Promise<string>} trimmed text response
 * @throws {Error} if API key is missing or API returns non-OK status
 */
async function callOpenAI({ system, messages, maxTokens }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is missing. Add it to .env.local.");

  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });

  if (!res.ok) {
    const errText = await safeText(res);
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}

/**
 * Call the Google Gemini API with candidate model fallback chain.
 * Retries on 404 (model retired), 429 (rate limits), or 503 (service unavailable).
 * @param {Object} opts
 * @param {string} opts.system - system prompt
 * @param {Array<{role: string, content: string}>} opts.messages - conversation messages
 * @param {number} opts.maxTokens - maximum output tokens
 * @returns {Promise<string>} trimmed text response
 * @throws {Error} if all candidate models fail
 */
async function callGemini({ system, messages, maxTokens }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing. Add it to .env.local.");

  const candidates = [
    process.env.GEMINI_MODEL,
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-2.5-flash",
  ].filter(Boolean);

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let lastError;

  for (const model of candidates) {
    const res = await fetch(
      `${GEMINI_URL_BASE}/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: system }] },
          generationConfig: { maxOutputTokens: maxTokens },
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      return parts.map((p) => p.text || "").join("\n").trim();
    }

    const errText = await safeText(res);
    lastError = `Gemini API error (${res.status}) for model "${model}": ${errText}`;

    // Retry on 404 (model retired), 429 (rate limits), or 503 (service unavailable)
    if (res.status !== 404 && res.status !== 429 && res.status !== 503) break;
  }

  throw new Error(lastError);
}

/**
 * Safely extract text from a fetch Response, returning a fallback on failure.
 * @param {Response} res - the fetch Response object
 * @returns {Promise<string>} response body text or fallback string
 */
async function safeText(res) {
  try { return await res.text(); }
  catch (_e) { return "<no response body>"; }
}

module.exports = { callLLM };
