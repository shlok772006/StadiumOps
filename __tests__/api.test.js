/**
 * __tests__/api.test.js
 * Unit tests for StadiumOps API handlers.
 * Uses mocked req and res objects to validate API routing and response format.
 */
const searchHandler = require("../pages/api/search");
const chatHandler = require("../pages/api/chat");
const crowdAnalysisHandler = require("../pages/api/crowd-analysis");
const emergencyHandler = require("../pages/api/emergency");
const generateReportHandler = require("../pages/api/generate-report");
const insightsHandler = require("../pages/api/insights");
const uploadHandler = require("../pages/api/upload");

describe("Search API Endpoint", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = { method: "GET", query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("returns 405 Method Not Allowed for non-GET requests", () => {
    mockReq.method = "POST";
    searchHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
  });

  test("returns empty list if search query is missing or whitespace only", () => {
    mockReq.query.q = "";
    searchHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ results: [] });
  });

  test("returns matching gate details when query matches gate name or id", () => {
    mockReq.query.q = "Gate A";
    searchHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const lastCall = mockRes.json.mock.calls[0][0];
    expect(lastCall.results.length).toBeGreaterThan(0);
    expect(lastCall.results[0].category).toBe("Gate");
  });
});

describe("Chat API Endpoint", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "your_gemini_api_key_here";
    mockReq = { method: "POST", body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("returns 405 Method Not Allowed for non-POST requests", async () => {
    mockReq.method = "GET";
    await chatHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
  });

  test("returns 400 if messages list is empty or invalid", async () => {
    mockReq.body.messages = [];
    await chatHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);

    mockReq.body.messages = "invalid";
    await chatHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenLastCalledWith(400);
  });

  test("returns 400 if message content exceeds character limits", async () => {
    mockReq.body.messages = [{ role: "user", content: "a".repeat(2001) }];
    await chatHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test("successfully answers valid chat inputs in mock demo mode", async () => {
    mockReq.body.messages = [{ role: "user", content: "Where is Gate A?" }];
    await chatHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json.mock.calls[0][0]).toHaveProperty("reply");
  });
});

describe("Crowd Analysis API Endpoint", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "your_gemini_api_key_here";
    mockReq = { method: "GET" };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("returns 405 Method Not Allowed for non-GET requests", async () => {
    mockReq.method = "POST";
    await crowdAnalysisHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
  });

  test("returns crowd analysis content", async () => {
    await crowdAnalysisHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body).toHaveProperty("analysis");
    expect(body).toHaveProperty("cached");
  });
});

describe("Emergency API Endpoint", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "your_gemini_api_key_here";
    mockReq = { method: "POST", body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("returns 405 Method Not Allowed for non-POST requests", async () => {
    mockReq.method = "GET";
    await emergencyHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
  });

  test("returns 400 for unknown incident type", async () => {
    mockReq.body = { incidentType: "alien_invasion", location: "A", details: "unusual activity" };
    await emergencyHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 for invalid gate location", async () => {
    mockReq.body = { incidentType: "medical", location: "INVALID_GATE", details: "steward help" };
    await emergencyHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test("returns 200 and action plan for valid emergency payload", async () => {
    mockReq.body = { incidentType: "medical", location: "A", details: "fan fainted" };
    await emergencyHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body).toHaveProperty("incident");
    expect(body).toHaveProperty("nearestGate");
    expect(body).toHaveProperty("actionPlan");
  });
});

describe("Generate Report API Endpoint", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "your_gemini_api_key_here";
    mockReq = { method: "POST", body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("returns 405 Method Not Allowed for non-POST requests", async () => {
    mockReq.method = "GET";
    await generateReportHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
  });

  test("successfully generates operational report", async () => {
    mockReq.body = { reportType: "daily" };
    await generateReportHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body).toHaveProperty("report");
    expect(body).toHaveProperty("reportType");
  });
});

describe("Insights API Endpoint", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "your_gemini_api_key_here";
    mockReq = { method: "GET" };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("returns 405 Method Not Allowed for non-GET requests", async () => {
    mockReq.method = "POST";
    await insightsHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
  });

  test("returns operations briefing data", async () => {
    await insightsHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body).toHaveProperty("briefing");
    expect(body).toHaveProperty("cached");
  });
});

describe("Upload API Endpoint", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    process.env.GEMINI_API_KEY = "your_gemini_api_key_here";
    mockReq = { method: "POST", body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test("returns 405 Method Not Allowed for non-POST requests", async () => {
    mockReq.method = "GET";
    await uploadHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
  });

  test("returns 400 if headers or sampleRows are missing", async () => {
    mockReq.body = { totalRows: 10 };
    await uploadHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 if totalRows is negative or invalid type", async () => {
    mockReq.body = { headers: ["col1"], sampleRows: [["val1"]], totalRows: -5 };
    await uploadHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 if headers list length exceeds limits", async () => {
    mockReq.body = { headers: Array(101).fill("col"), sampleRows: [[]], totalRows: 100 };
    await uploadHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 if sampleRows length exceeds limits", async () => {
    mockReq.body = { headers: ["col"], sampleRows: Array(51).fill([]), totalRows: 100 };
    await uploadHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  test("successfully processes valid upload payloads", async () => {
    mockReq.body = { headers: ["gate", "status"], sampleRows: [{ gate: "A", status: "critical" }], totalRows: 1 };
    await uploadHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const body = mockRes.json.mock.calls[0][0];
    expect(body).toHaveProperty("analysis");
  });
});
