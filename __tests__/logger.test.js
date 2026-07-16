/**
 * __tests__/logger.test.js
 * Unit tests for the structured logging utility (lib/logger.js).
 */

const { logError, logWarn } = require("../lib/logger");

describe("logger utility", () => {
  let spyConsoleError;
  let spyConsoleWarn;

  beforeEach(() => {
    spyConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    spyConsoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
    spyConsoleWarn.mockRestore();
  });

  test("logError outputs properly formatted message with error instance details", () => {
    logError("test-module", "Something failed", new Error("underlying error"));
    expect(spyConsoleError).toHaveBeenCalledWith("[test-module] Something failed: underlying error");
  });

  test("logError outputs message with raw string details", () => {
    logError("test-module", "Failed again", "raw details");
    expect(spyConsoleError).toHaveBeenCalledWith("[test-module] Failed again: raw details");
  });

  test("logWarn outputs properly formatted warning", () => {
    logWarn("test-module", "Something minor", "warning details");
    expect(spyConsoleWarn).toHaveBeenCalledWith("[test-module] Something minor: warning details");
  });
});
