/**
 * __tests__/llm.test.js
 * Unit tests for the provider-agnostic LLM caller (lib/llm.js).
 * Validates mock response paths, fallback scenarios, and error handling.
 */
const { callLLM } = require("../lib/llm");

describe("LLM Module", () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "your_gemini_api_key_here";
  });

  test("throws error if messages array is empty or invalid", async () => {
    await expect(callLLM({ system: "test", messages: [] })).rejects.toThrow(
      "callLLM: `messages` must be a non-empty array"
    );
    await expect(callLLM({ system: "test", messages: null })).rejects.toThrow(
      "callLLM: `messages` must be a non-empty array"
    );
  });

  test("returns dashboard briefing when system prompt contains operational intelligence", async () => {
    const response = await callLLM({
      system: "operational intelligence",
      messages: [{ role: "user", content: "hello" }],
    });
    expect(response).toContain("Gate B and Gate D");
    expect(response).toContain("Shuttle Bus Route 2");
  });

  test("returns emergency response action plan when system prompt contains decision support", async () => {
    const response = await callLLM({
      system: "real-time decision support",
      messages: [{ role: "user", content: "medical incident" }],
    });
    expect(response).toContain("Alert medical response team 2");
    expect(response).toContain("response time");
  });

  test("returns crowd analytics simulation when system prompt contains predictive analytics", async () => {
    const response = await callLLM({
      system: "predictive analytics",
      messages: [{ role: "user", content: "congestion level" }],
    });
    expect(response).toContain("Gates B, D, and F");
    expect(response).toContain("PREDICTION");
  });

  test("returns report when system prompt contains report generation", async () => {
    const response = await callLLM({
      system: "report generation",
      messages: [{ role: "user", content: "generate crowd report" }],
    });
    expect(response).toContain("MATCH DAY OPERATIONS REPORT");
    expect(response).toContain("Argentina vs. France");
  });

  test("returns data analysis when system prompt contains data analysis module", async () => {
    const response = await callLLM({
      system: "data analysis module",
      messages: [{ role: "user", content: "parse CSV" }],
    });
    expect(response).toContain("DATA SUMMARY");
    expect(response).toContain("KEY INSIGHTS");
  });

  test("handles gate, exit, staff, and vendor queries in chat simulator", async () => {
    const gateRes = await callLLM({
      system: "chat assistant",
      messages: [{ role: "user", content: "which gate is busy?" }],
    });
    expect(gateRes).toContain("Gate B and Gate D");

    const exitRes = await callLLM({
      system: "chat assistant",
      messages: [{ role: "user", content: "fastest exit route" }],
    });
    expect(exitRes).toContain("Gate C");

    const staffRes = await callLLM({
      system: "chat assistant",
      messages: [{ role: "user", content: "reallocate volunteer" }],
    });
    expect(staffRes).toContain("reallocating 3 volunteers");

    const vendorRes = await callLLM({
      system: "chat assistant",
      messages: [{ role: "user", content: "restock snack vendor" }],
    });
    expect(vendorRes).toContain("Concession South");
  });

  test("returns generic fallback assistant response for other chat inputs", async () => {
    const response = await callLLM({
      system: "chat assistant",
      messages: [{ role: "user", content: "how is the weather?" }],
    });
    expect(response).toContain("I am StadiumOps AI");
  });
});
