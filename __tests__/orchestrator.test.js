const { buildSystemPrompt, buildBriefingPrompt, buildEmergencyPrompt, buildCrowdAnalysisPrompt, buildReportPrompt } = require("../lib/orchestrator");

describe("Orchestrator", () => {
  test("buildSystemPrompt includes all 7 capability areas", () => {
    const prompt = buildSystemPrompt("English");
    expect(prompt).toContain("CROWD MANAGEMENT");
    expect(prompt).toContain("OPERATIONAL INTELLIGENCE");
    expect(prompt).toContain("REAL-TIME DECISION SUPPORT");
    expect(prompt).toContain("NAVIGATION");
    expect(prompt).toContain("TRANSPORTATION");
    expect(prompt).toContain("PREDICTIVE ANALYTICS");
    expect(prompt).toContain("MULTILINGUAL");
  });

  test("buildSystemPrompt includes AI reasoning instructions", () => {
    const prompt = buildSystemPrompt("English");
    expect(prompt).toContain("AI REASONING MODE");
    expect(prompt).toContain("CURRENT DATA");
    expect(prompt).toContain("Recommendation");
  });

  test("buildSystemPrompt includes tournament context", () => {
    const prompt = buildSystemPrompt("English");
    expect(prompt).toContain("FIFA World Cup 2026");
    expect(prompt).toContain("MetLife Stadium");
  });

  test("buildSystemPrompt includes live gate data", () => {
    const prompt = buildSystemPrompt("English");
    expect(prompt).toContain("Gate A");
    expect(prompt).toContain("Gate H");
    expect(prompt).toContain("/100");
  });

  test("buildSystemPrompt respects language parameter", () => {
    const prompt = buildSystemPrompt("हिंदी (Hindi)");
    expect(prompt).toContain("हिंदी (Hindi)");
  });

  test("buildBriefingPrompt returns system and user prompts", () => {
    const prompt = buildBriefingPrompt();
    expect(prompt).toHaveProperty("system");
    expect(prompt).toHaveProperty("user");
    expect(prompt.system).toContain("operational intelligence");
    expect(prompt.user).toContain("Gate");
  });

  test("buildEmergencyPrompt includes incident context", () => {
    const prompt = buildEmergencyPrompt("medical", "A", "Fan collapsed");
    expect(prompt.system).toContain("real-time decision support");
    expect(prompt.user).toContain("Medical Emergency");
    expect(prompt.user).toContain("Gate A");
    expect(prompt.user).toContain("Fan collapsed");
  });

  test("buildCrowdAnalysisPrompt includes gate data", () => {
    const prompt = buildCrowdAnalysisPrompt();
    expect(prompt.user).toContain("Gate");
    expect(prompt.system).toContain("predictive analytics");
  });

  test("buildReportPrompt returns valid structure", () => {
    ["crowd", "incident", "daily", "match"].forEach((type) => {
      const prompt = buildReportPrompt(type);
      expect(prompt).toHaveProperty("system");
      expect(prompt).toHaveProperty("user");
      expect(prompt.user).toContain("MetLife Stadium");
    });
  });
});
