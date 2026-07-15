/**
 * __tests__/api.test.js
 * Unit tests for StadiumOps API handlers (e.g. search.js).
 * Uses mocked req and res objects to validate API routing and response format.
 */
const searchHandler = require("../pages/api/search");

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
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Method not allowed. Use GET." });
  });

  test("returns empty list if search query is missing or whitespace only", () => {
    mockReq.query.q = "";
    searchHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ results: [] });

    mockReq.query.q = "   ";
    searchHandler(mockReq, mockRes);
    expect(mockRes.json).toHaveBeenLastCalledWith({ results: [] });
  });

  test("returns matching gate details when query matches gate name or id", () => {
    mockReq.query.q = "Gate A";
    searchHandler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    const lastCall = mockRes.json.mock.calls[0][0];
    expect(lastCall.results.length).toBeGreaterThan(0);
    expect(lastCall.results[0].category).toBe("Gate");
    expect(lastCall.results[0].title).toContain("Gate A");
  });

  test("returns matching section details when query matches section id", () => {
    mockReq.query.q = "S1";
    searchHandler(mockReq, mockRes);
    const lastCall = mockRes.json.mock.calls[0][0];
    expect(lastCall.results.length).toBeGreaterThan(0);
    expect(lastCall.results[0].category).toBe("Section");
    expect(lastCall.results[0].title).toContain("S1");
  });

  test("returns matching amenity details when query matches amenity name or type", () => {
    mockReq.query.q = "medical";
    searchHandler(mockReq, mockRes);
    const lastCall = mockRes.json.mock.calls[0][0];
    expect(lastCall.results.length).toBeGreaterThan(0);
    expect(lastCall.results[0].category).toBe("Amenity");
    expect(lastCall.results[0].title).toContain("First Aid");
  });

  test("returns matching transit details when query matches transit mode", () => {
    mockReq.query.q = "Metro";
    searchHandler(mockReq, mockRes);
    const lastCall = mockRes.json.mock.calls[0][0];
    expect(lastCall.results.length).toBeGreaterThan(0);
    expect(lastCall.results[0].category).toBe("Transport");
  });
});
