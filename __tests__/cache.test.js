const { getOrCompute, clearCache } = require("../lib/cache");

describe("Cache", () => {
  beforeEach(() => clearCache());

  test("computes value on first call", async () => {
    const result = await getOrCompute("key1", () => Promise.resolve("hello"), 60000);
    expect(result.value).toBe("hello");
    expect(result.cached).toBe(false);
  });

  test("returns cached value on second call", async () => {
    await getOrCompute("key2", () => Promise.resolve("first"), 60000);
    const result = await getOrCompute("key2", () => Promise.resolve("second"), 60000);
    expect(result.value).toBe("first");
    expect(result.cached).toBe(true);
  });

  test("recomputes after TTL expires", async () => {
    await getOrCompute("key3", () => Promise.resolve("first"), 1);
    await new Promise((r) => setTimeout(r, 5));
    const result = await getOrCompute("key3", () => Promise.resolve("second"), 1);
    expect(result.value).toBe("second");
    expect(result.cached).toBe(false);
  });

  test("clearCache removes all entries", async () => {
    await getOrCompute("key4", () => Promise.resolve("data"), 60000);
    clearCache();
    const result = await getOrCompute("key4", () => Promise.resolve("new"), 60000);
    expect(result.value).toBe("new");
    expect(result.cached).toBe(false);
  });
});
