const {
  GATES, SECTIONS, AMENITIES, TRANSPORT_OPTIONS,
  SUPPORTED_LANGUAGES, EMERGENCY_PROTOCOLS,
  VENDOR_DATA, TOURNAMENT_CONTEXT,
  getLiveCrowdDensity, getQueuePredictions, getWeatherData, getCurrentAttendance,
} = require("../lib/stadiumData");

describe("Stadium Data Model", () => {
  test("GATES has 8 entries with valid structure", () => {
    expect(GATES).toHaveLength(8);
    GATES.forEach((gate) => {
      expect(gate).toHaveProperty("id");
      expect(gate).toHaveProperty("name");
      expect(gate).toHaveProperty("x");
      expect(gate).toHaveProperty("y");
      expect(gate).toHaveProperty("baseCapacity");
      expect(gate).toHaveProperty("zone");
      expect(gate.baseCapacity).toBeGreaterThan(0);
    });
  });

  test("SECTIONS all reference valid gates", () => {
    const gateIds = new Set(GATES.map((g) => g.id));
    SECTIONS.forEach((section) => {
      expect(gateIds.has(section.nearestGate)).toBe(true);
    });
  });

  test("AMENITIES all reference valid gates", () => {
    const gateIds = new Set(GATES.map((g) => g.id));
    AMENITIES.forEach((amenity) => {
      expect(gateIds.has(amenity.near)).toBe(true);
    });
  });

  test("TRANSPORT_OPTIONS all reference valid gates", () => {
    const gateIds = new Set(GATES.map((g) => g.id));
    TRANSPORT_OPTIONS.forEach((option) => {
      expect(gateIds.has(option.nearestGate)).toBe(true);
    });
  });

  test("SUPPORTED_LANGUAGES has at least 6 entries", () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(6);
  });

  test("EMERGENCY_PROTOCOLS has 6 types", () => {
    expect(Object.keys(EMERGENCY_PROTOCOLS)).toHaveLength(6);
    Object.values(EMERGENCY_PROTOCOLS).forEach((protocol) => {
      expect(protocol.steps.length).toBeGreaterThan(0);
      expect(protocol).toHaveProperty("label");
      expect(protocol).toHaveProperty("severity");
    });
  });

  test("getLiveCrowdDensity returns one entry per gate", () => {
    const crowd = getLiveCrowdDensity();
    expect(crowd).toHaveLength(GATES.length);
    crowd.forEach((c) => {
      expect(c.density).toBeGreaterThanOrEqual(0);
      expect(c.density).toBeLessThanOrEqual(100);
      expect(["normal", "busy", "critical"]).toContain(c.status);
      expect(c).toHaveProperty("waitMinutes");
      expect(c).toHaveProperty("flowRate");
    });
  });

  test("getLiveCrowdDensity is stable within the same minute", () => {
    const a = getLiveCrowdDensity();
    const b = getLiveCrowdDensity();
    expect(a).toEqual(b);
  });

  test("getQueuePredictions returns 5 time points", () => {
    const predictions = getQueuePredictions();
    expect(predictions.length).toBe(5);
    predictions.forEach((p) => {
      expect(p).toHaveProperty("label");
      expect(p).toHaveProperty("gates");
      expect(Object.keys(p.gates)).toHaveLength(GATES.length);
    });
  });

  test("getWeatherData returns valid structure", () => {
    const weather = getWeatherData();
    expect(weather).toHaveProperty("condition");
    expect(weather).toHaveProperty("temperature");
    expect(weather).toHaveProperty("humidity");
    expect(weather.temperature).toBeGreaterThan(0);
  });

  test("getCurrentAttendance returns a positive number", () => {
    const attendance = getCurrentAttendance();
    expect(attendance).toBeGreaterThan(0);
    expect(attendance).toBeLessThanOrEqual(TOURNAMENT_CONTEXT.expectedAttendance);
  });

  test("VENDOR_DATA has valid entries", () => {
    expect(VENDOR_DATA.length).toBeGreaterThan(0);
    VENDOR_DATA.forEach((v) => {
      expect(v.stock).toBeGreaterThanOrEqual(0);
      expect(v.stock).toBeLessThanOrEqual(100);
      expect(v.sales).toBeGreaterThanOrEqual(0);
    });
  });

  test("TOURNAMENT_CONTEXT has required fields", () => {
    expect(TOURNAMENT_CONTEXT.tournament).toBe("FIFA World Cup 2026");
    expect(TOURNAMENT_CONTEXT.expectedAttendance).toBeGreaterThan(0);
    expect(TOURNAMENT_CONTEXT.volunteerShiftsOnDuty).toBeGreaterThan(0);
  });
});
