/**
 * lib/constants.js
 * -----------------------------------------------------------------------
 * Centralized named constants for StadiumOps Pro.
 * Eliminates magic numbers and provides a single source of truth for
 * thresholds, API limits, cache configuration, and timing intervals.
 * -----------------------------------------------------------------------
 */

/** @enum {number} API input validation limits */
const API_LIMITS = Object.freeze({
  /** Maximum characters allowed in a single chat message */
  MAX_MESSAGE_LENGTH: 2000,
  /** Maximum characters allowed in emergency incident details */
  MAX_INCIDENT_DETAILS_LENGTH: 500,
  /** Maximum number of chat history turns sent to the LLM */
  MAX_CHAT_HISTORY_TURNS: 10,
  /** Maximum number of search results returned per query */
  MAX_SEARCH_RESULTS: 10,
  /** Maximum number of sample rows accepted for upload analysis */
  MAX_UPLOAD_SAMPLE_ROWS: 50,
  /** Maximum number of columns accepted for upload analysis */
  MAX_UPLOAD_COLUMNS: 100,
  /** Maximum characters for sanitized file names */
  MAX_FILENAME_LENGTH: 100,
  /** Maximum characters for language label */
  MAX_LANGUAGE_LENGTH: 50,
  /** Maximum characters for search query */
  MAX_SEARCH_QUERY_LENGTH: 100,
  /** Maximum characters for header names in uploaded data */
  MAX_HEADER_LENGTH: 50,
  /** Maximum characters for cell values in uploaded data */
  MAX_CELL_VALUE_LENGTH: 200,
});

/** @enum {number} Operational thresholds for crowd and vendor monitoring */
const THRESHOLDS = Object.freeze({
  /** Gate density above this is considered "critical" (percent) */
  GATE_DENSITY_CRITICAL: 80,
  /** Gate density above this is considered "busy" (percent) */
  GATE_DENSITY_BUSY: 55,
  /** Average density above this triggers concern alerts (percent) */
  AVG_DENSITY_CONCERN: 65,
  /** Average wait time above this triggers alerts (minutes) */
  AVG_WAIT_CONCERN: 10,
  /** Vendor stock below this triggers low-stock warnings (percent) */
  VENDOR_LOW_STOCK: 50,
});

/** @enum {number} Cache configuration values */
const CACHE_CONFIG = Object.freeze({
  /** Time-to-live for cached LLM responses (milliseconds) */
  TTL_MS: 60_000,
  /** Maximum entries in the cache before FIFO eviction */
  MAX_ENTRIES: 100,
});

/** @enum {number} Timing intervals for UI data refresh */
const TIMING = Object.freeze({
  /** Interval for refreshing crowd/weather data on client (milliseconds) */
  DATA_REFRESH_INTERVAL_MS: 60_000,
  /** Clock tick interval for topbar (milliseconds) */
  CLOCK_TICK_MS: 1_000,
  /** Search debounce delay (milliseconds) */
  SEARCH_DEBOUNCE_MS: 250,
  /** Auto-dismiss timeout for notifications (milliseconds) */
  NOTIFICATION_DISMISS_MS: 8_000,
  /** Maximum notifications stored in memory */
  MAX_NOTIFICATIONS: 50,
});

module.exports = {
  API_LIMITS,
  THRESHOLDS,
  CACHE_CONFIG,
  TIMING,
};
