/**
 * lib/cache.js
 * TTL cache to avoid redundant LLM calls. Crowd data changes once per
 * minute, so cached briefings stay valid for the same minute window.
 */

const store = new Map();

/**
 * @param {string} key
 * @param {() => Promise<any>} computeFn
 * @param {number} ttlMs - time-to-live in milliseconds
 * @returns {Promise<{value: any, cached: boolean}>}
 */
async function getOrCompute(key, computeFn, ttlMs = 60_000) {
  const existing = store.get(key);
  if (existing && Date.now() - existing.ts < ttlMs) {
    return { value: existing.value, cached: true };
  }

  const value = await computeFn();
  store.set(key, { value, ts: Date.now() });

  // Prevent unbounded growth
  if (store.size > 100) {
    const oldest = store.keys().next().value;
    store.delete(oldest);
  }

  return { value, cached: false };
}

function clearCache() {
  store.clear();
}

module.exports = { getOrCompute, clearCache };
