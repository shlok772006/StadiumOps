/**
 * lib/logger.js
 * -----------------------------------------------------------------------
 * Structured logging utility for StadiumOps Pro API routes and services.
 * Provides consistent error and warning formatting with module context.
 * In production, this could be swapped for a structured logging service
 * (e.g., Winston, Pino) without changing call sites.
 * -----------------------------------------------------------------------
 */

/**
 * Log an error with structured context.
 * @param {string} module - the module or route identifier (e.g., "/api/chat")
 * @param {string} message - human-readable error description
 * @param {Error|string} [err] - the underlying error object or message
 */
function logError(module, message, err) {
  const detail = err instanceof Error ? err.message : String(err || "");
  console.error(`[${module}] ${message}${detail ? `: ${detail}` : ""}`);
}

/**
 * Log a warning with structured context.
 * @param {string} module - the module or route identifier
 * @param {string} message - human-readable warning description
 * @param {Error|string} [err] - the underlying error object or message
 */
function logWarn(module, message, err) {
  const detail = err instanceof Error ? err.message : String(err || "");
  console.warn(`[${module}] ${message}${detail ? `: ${detail}` : ""}`);
}

module.exports = { logError, logWarn };
