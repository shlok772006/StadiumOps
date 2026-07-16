/**
 * __tests__/constants.test.js
 * Unit tests for the configurations and thresholds constants (lib/constants.js).
 */

const { API_LIMITS, THRESHOLDS, CACHE_CONFIG, TIMING } = require("../lib/constants");

describe("constants configurations", () => {
  test("constants are frozen and cannot be modified at runtime", () => {
    expect(Object.isFrozen(API_LIMITS)).toBe(true);
    expect(Object.isFrozen(THRESHOLDS)).toBe(true);
    expect(Object.isFrozen(CACHE_CONFIG)).toBe(true);
    expect(Object.isFrozen(TIMING)).toBe(true);
  });

  test("operational thresholds are correctly defined", () => {
    expect(THRESHOLDS.GATE_DENSITY_CRITICAL).toBe(80);
    expect(THRESHOLDS.GATE_DENSITY_BUSY).toBe(55);
    expect(THRESHOLDS.AVG_DENSITY_CONCERN).toBe(65);
    expect(THRESHOLDS.AVG_WAIT_CONCERN).toBe(10);
    expect(THRESHOLDS.VENDOR_LOW_STOCK).toBe(50);
  });

  test("API limits are correctly defined", () => {
    expect(API_LIMITS.MAX_MESSAGE_LENGTH).toBe(2000);
    expect(API_LIMITS.MAX_INCIDENT_DETAILS_LENGTH).toBe(500);
    expect(API_LIMITS.MAX_CHAT_HISTORY_TURNS).toBe(10);
    expect(API_LIMITS.MAX_SEARCH_RESULTS).toBe(10);
    expect(API_LIMITS.MAX_UPLOAD_SAMPLE_ROWS).toBe(50);
    expect(API_LIMITS.MAX_UPLOAD_COLUMNS).toBe(100);
  });
});
