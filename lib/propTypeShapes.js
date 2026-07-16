/**
 * lib/propTypeShapes.js
 * -----------------------------------------------------------------------
 * Shared PropTypes shape definitions for reuse across pages and components.
 * Ensures consistent, specific prop validation instead of generic
 * PropTypes.array or PropTypes.object, improving code quality and
 * catching type mismatches early.
 * -----------------------------------------------------------------------
 */

import PropTypes from "prop-types";

/**
 * Shape for a single gate crowd density data point.
 * Matches the return value of getLiveCrowdDensity() items.
 */
export const CrowdDensityShape = PropTypes.shape({
  gateId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  zone: PropTypes.string.isRequired,
  density: PropTypes.number.isRequired,
  waitMinutes: PropTypes.number.isRequired,
  flowRate: PropTypes.number.isRequired,
  status: PropTypes.oneOf(["normal", "busy", "critical"]).isRequired,
});

/**
 * Shape for the weather data object.
 * Matches the return value of getWeatherData().
 */
export const WeatherShape = PropTypes.shape({
  condition: PropTypes.string.isRequired,
  temperature: PropTypes.number.isRequired,
  humidity: PropTypes.number.isRequired,
  windSpeed: PropTypes.number.isRequired,
  uvIndex: PropTypes.number.isRequired,
  forecast: PropTypes.string.isRequired,
});

/**
 * Shape for a single queue prediction time point.
 * Matches the return value of getQueuePredictions() items.
 */
export const PredictionShape = PropTypes.shape({
  timeOffset: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  gates: PropTypes.objectOf(PropTypes.number).isRequired,
});
