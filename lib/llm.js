/**
 * lib/llm.js
 * -----------------------------------------------------------------------
 * Provider-agnostic LLM caller. Supports Gemini (free), Anthropic, OpenAI.
 * Gemini uses a candidate fallback chain for model retirement/quota resilience.
 * -----------------------------------------------------------------------
 */

const { simulateAIResponse } = require("./simulator");

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
