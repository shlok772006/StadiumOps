const { formatApiError } = require("../lib/formatApiError");

describe("formatApiError", () => {
  test("returns fallback when data is null", () => {
    expect(formatApiError(null, "fallback")).toBe("fallback");
  });

  test("returns error + detail when both present", () => {
    expect(formatApiError({ error: "Failed", detail: "timeout" })).toBe("Failed: timeout");
  });

  test("returns just error when no detail", () => {
    expect(formatApiError({ error: "Not found" })).toBe("Not found");
  });

  test("returns fallback when data has no useful fields", () => {
    expect(formatApiError({}, "oops")).toBe("oops");
  });
});
