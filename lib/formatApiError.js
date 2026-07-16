/**
 * lib/formatApiError.js
 * Shared API-error-to-string formatter (DRY across pages).
 */

/**
 * @param {Object|null} data - parsed JSON from the API response
 * @param {string} fallback - default message if nothing useful is in `data`
 * @returns {string}
 */
function formatApiError(data, fallback = "Something went wrong.") {
  if (!data) { return fallback; }
  if (data.detail) { return `${data.error || "Error"}: ${data.detail}`; }
  if (data.error) { return data.error; }
  return fallback;
}

module.exports = { formatApiError };
