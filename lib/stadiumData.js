/**
 * lib/stadiumData.js
 * -----------------------------------------------------------------------
 * Mock "digital twin" data for a FIFA World Cup 2026 stadium.
 * Enhanced data model with 8 gates, 12 sections, 10+ amenities,
 * transport options, emergency protocols, vendor data, and weather.
 * In production, swap for live IoT / transit / venue CMS feeds.
 * -----------------------------------------------------------------------
 */

const { THRESHOLDS } = require("./constants");

/**
 * @typedef {Object} Gate
 * @property {string} id - single-letter gate identifier (e.g. "A")
 * @property {string} name - human-readable gate name
 * @property {number} x - x-coordinate on the stadium map SVG
 * @property {number} y - y-coordinate on the stadium map SVG
 * @property {number} baseCapacity - maximum fan throughput capacity
 * @property {string} zone - stadium zone (North, East, South, West)
 */

/**
 * @typedef {Object} CrowdDensity
 * @property {string} gateId - gate identifier
 * @property {string} name - gate name
 * @property {string} zone - stadium zone
 * @property {number} density - current density 0-100
 * @property {number} waitMinutes - estimated wait time in minutes
 * @property {number} flowRate - current fan flow rate per hour
 * @property {"normal"|"busy"|"critical"} status - current status classification
 */

/**
 * @typedef {Object} WeatherData
 * @property {string} condition - current weather condition
 * @property {number} temperature - temperature in Celsius
 * @property {number} humidity - humidity percentage
 * @property {number} windSpeed - wind speed in km/h
 * @property {number} uvIndex - UV index value
 * @property {string} forecast - short-term forecast summary
 */

/** @type {ReadonlyArray<Gate>} */

const GATES = [
  { id: "A", name: "Gate A — North Main", x: 400, y: 30, baseCapacity: 14000, zone: "North" },
  { id: "B", name: "Gate B — East Upper", x: 720, y: 160, baseCapacity: 10000, zone: "East" },
  { id: "C", name: "Gate C — East Lower", x: 720, y: 300, baseCapacity: 10000, zone: "East" },
  { id: "D", name: "Gate D — South Main", x: 400, y: 430, baseCapacity: 14000, zone: "South" },
  { id: "E", name: "Gate E — Accessible Entry", x: 220, y: 430, baseCapacity: 4000, zone: "South" },
  { id: "F", name: "Gate F — West Lower", x: 80, y: 300, baseCapacity: 10000, zone: "West" },
  { id: "G", name: "Gate G — West Upper", x: 80, y: 160, baseCapacity: 10000, zone: "West" },
  { id: "H", name: "Gate H — VIP / Media", x: 260, y: 30, baseCapacity: 3000, zone: "North" },
];

const SECTIONS = [
  { id: "S1", name: "Lower Bowl North", tier: "Lower", nearestGate: "A", capacity: 8500 },
  { id: "S2", name: "Lower Bowl East", tier: "Lower", nearestGate: "C", capacity: 7200 },
  { id: "S3", name: "Lower Bowl South", tier: "Lower", nearestGate: "D", capacity: 8500 },
  { id: "S4", name: "Lower Bowl West", tier: "Lower", nearestGate: "F", capacity: 7200 },
  { id: "S5", name: "Upper Tier North", tier: "Upper", nearestGate: "A", capacity: 6000 },
  { id: "S6", name: "Upper Tier East", tier: "Upper", nearestGate: "B", capacity: 5500 },
  { id: "S7", name: "Upper Tier South", tier: "Upper", nearestGate: "D", capacity: 6000 },
  { id: "S8", name: "Upper Tier West", tier: "Upper", nearestGate: "G", capacity: 5500 },
  { id: "S9", name: "Accessible Seating", tier: "Lower", nearestGate: "E", capacity: 1200 },
  { id: "S10", name: "VIP Suites", tier: "Premium", nearestGate: "H", capacity: 2400 },
  { id: "S11", name: "Media Tribune", tier: "Premium", nearestGate: "H", capacity: 800 },
  { id: "S12", name: "Family Zone", tier: "Lower", nearestGate: "E", capacity: 3200 },
];

const AMENITIES = [
  { id: "med1", type: "medical", name: "First Aid Post 1 (North)", near: "A", icon: "🏥" },
  { id: "med2", type: "medical", name: "First Aid Post 2 (South)", near: "D", icon: "🏥" },
  { id: "med3", type: "medical", name: "Medical Center (East)", near: "C", icon: "🏥" },
  { id: "wash1", type: "washroom", name: "Restrooms North", near: "A", icon: "🚻" },
  { id: "wash2", type: "washroom", name: "Restrooms East", near: "B", icon: "🚻" },
  { id: "wash3", type: "washroom", name: "Restrooms South", near: "D", icon: "🚻" },
  { id: "wash4", type: "washroom", name: "Restrooms West", near: "F", icon: "🚻" },
  { id: "food1", type: "food", name: "Fan Zone Food Court", near: "B", icon: "🍔" },
  { id: "food2", type: "food", name: "South Concession Stand", near: "D", icon: "🍔" },
  { id: "food3", type: "food", name: "West Snack Bar", near: "G", icon: "🍔" },
  { id: "merch1", type: "merchandise", name: "Official Fan Store", near: "A", icon: "🛍️" },
  { id: "info1", type: "info", name: "Volunteer Help Desk", near: "E", icon: "ℹ️" },
  { id: "pray1", type: "prayer", name: "Multi-faith Prayer Room", near: "F", icon: "🕌" },
  { id: "play1", type: "family", name: "Family Play Zone", near: "E", icon: "👶" },
];

const TRANSPORT_OPTIONS = [
  { mode: "Metro", line: "Blue Line", nearestGate: "A", etaMinutes: 8, status: "On time", capacity: 85 },
  { mode: "Metro", line: "Red Line", nearestGate: "D", etaMinutes: 12, status: "On time", capacity: 72 },
  { mode: "Shuttle Bus", line: "Fan Shuttle 1", nearestGate: "G", etaMinutes: 15, status: "On time", capacity: 60 },
  { mode: "Shuttle Bus", line: "Fan Shuttle 2", nearestGate: "B", etaMinutes: 10, status: "Delayed 5 min", capacity: 90 },
  { mode: "Ride-share", line: "Zone 1", nearestGate: "C", etaMinutes: 5, status: "Busy — expect delay", capacity: 95 },
  { mode: "Ride-share", line: "Zone 2", nearestGate: "F", etaMinutes: 7, status: "Available", capacity: 40 },
  { mode: "Parking", line: "Lot P1 (North)", nearestGate: "A", etaMinutes: 0, status: "82% full", capacity: 82 },
  { mode: "Parking", line: "Lot P2 (South)", nearestGate: "D", etaMinutes: 0, status: "61% full", capacity: 61 },
];

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी (Hindi)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "fr", label: "Français (French)" },
  { code: "ar", label: "العربية (Arabic)" },
  { code: "pt", label: "Português (Portuguese)" },
];

const EMERGENCY_PROTOCOLS = {
  medical: {
    label: "Medical Emergency",
    severity: "high",
    steps: [
      "Alert nearest First Aid Post and dispatch medical staff immediately",
      "Clear a 3-meter path from the incident to the nearest exit",
      "Notify stadium control room with exact location and incident timestamp",
      "Prepare stretcher and AED if cardiac symptoms reported",
    ],
  },
  overcrowding: {
    label: "Overcrowding / Crowd Crush Risk",
    severity: "critical",
    steps: [
      "Halt entry at the affected gate immediately",
      "Redirect incoming fans to the nearest low-density gate via PA and stewards",
      "Deploy additional stewards and barrier staff to affected concourse",
      "Open overflow gates if density exceeds 85% threshold",
    ],
  },
  fire: {
    label: "Fire / Smoke Report",
    severity: "critical",
    steps: [
      "Activate nearest fire alarm and suppression system",
      "Begin phased evacuation starting from the closest section",
      "Notify local fire services via emergency hotline",
      "Stadium safety officer takes incident command",
    ],
  },
  lost_person: {
    label: "Lost Person / Child",
    severity: "medium",
    steps: [
      "Broadcast description to all gate stewards and volunteer radios",
      "Direct family to nearest Volunteer Help Desk",
      "Check nearest info points, medical posts, and family zone",
      "If child under 10, escalate to security team immediately",
    ],
  },
  security: {
    label: "Security Threat",
    severity: "critical",
    steps: [
      "Alert central security command and deploy armed response unit",
      "Isolate affected zone and establish 50-meter perimeter",
      "Coordinate with local law enforcement for backup",
      "Activate stadium-wide lockdown protocol if threat confirmed",
    ],
  },
  weather: {
    label: "Severe Weather Alert",
    severity: "high",
    steps: [
      "Activate weather shelter protocol for open-air sections",
      "Direct fans under covered concourse areas",
      "Suspend match operations pending weather clearance",
      "Monitor lightning detection system continuously",
    ],
  },
};

const VENDOR_DATA = [
  { id: "v1", name: "Fan Zone Food Court", location: "B", category: "Hot Food", stock: 78, sales: 4200, peak: "Halftime" },
  { id: "v2", name: "South Concession", location: "D", category: "Beverages", stock: 45, sales: 6800, peak: "Pre-match" },
  { id: "v3", name: "West Snack Bar", location: "G", category: "Snacks", stock: 82, sales: 2100, peak: "Halftime" },
  { id: "v4", name: "Official Fan Store", location: "A", category: "Merchandise", stock: 91, sales: 3500, peak: "Pre-match" },
  { id: "v5", name: "North Beverages", location: "A", category: "Beverages", stock: 33, sales: 5200, peak: "During Match" },
  { id: "v6", name: "East Quick Bites", location: "C", category: "Hot Food", stock: 61, sales: 2800, peak: "Halftime" },
];

const TOURNAMENT_CONTEXT = {
  tournament: "FIFA World Cup 2026",
  stage: "Group Stage — Matchday 2",
  match: "Argentina vs. France",
  venue: "MetLife Stadium, East Rutherford, NJ",
  hostCities: ["New York/New Jersey", "Los Angeles", "Dallas", "Toronto", "Mexico City", "Miami"],
  kickoffLocal: "19:00 ET",
  expectedAttendance: 82500,
  currentAttendance: 0,
  volunteerShiftsOnDuty: 340,
  securityPersonnel: 1200,
  medicalTeams: 14,
};

/**
 * Deterministic-but-varied mock "live" crowd density per gate, 0-100.
 * Minute-seeded so calls in the same minute are stable for demos.
 * @returns {Array<{gateId: string, name: string, zone: string, density: number, waitMinutes: number, flowRate: number, status: "normal"|"busy"|"critical"}>}
 */
function getLiveCrowdDensity() {
  const minuteSeed = Math.floor(Date.now() / 60000);
  return GATES.map((gate, i) => {
    const seed = (minuteSeed + i * 17) % 100;
    const density = Math.round(30 + Math.abs(Math.sin(seed)) * 65);
    const waitMinutes = Math.round(1 + (density / 100) * 18);
    const flowRate = Math.round(gate.baseCapacity * (density / 100) * 0.6);
    return {
      gateId: gate.id,
      name: gate.name,
      zone: gate.zone,
      density,
      waitMinutes,
      flowRate,
      status: density > THRESHOLDS.GATE_DENSITY_CRITICAL ? "critical" : density > THRESHOLDS.GATE_DENSITY_BUSY ? "busy" : "normal",
    };
  });
}

/**
 * Simulated queue predictions for the next 60 minutes.
 * @returns {Array<{timeOffset: number, label: string, gates: Object<string, number>}>} prediction time points
 */
function getQueuePredictions() {
  const now = getLiveCrowdDensity();
  const predictions = [];
  for (let t = 0; t <= 60; t += 15) {
    const point = { timeOffset: t, label: t === 0 ? "Now" : `+${t}m`, gates: {} };
    now.forEach((g) => {
      const drift = Math.sin((t + g.density) * 0.1) * 15;
      const predicted = Math.min(100, Math.max(10, g.density + drift));
      point.gates[g.gateId] = Math.round(predicted);
    });
    predictions.push(point);
  }
  return predictions;
}

/**
 * Simulated weather data, varying by minute seed.
 * @returns {{condition: string, temperature: number, humidity: number, windSpeed: number, uvIndex: number, forecast: string}}
 */
function getWeatherData() {
  const conditions = ["Clear", "Partly Cloudy", "Cloudy", "Light Rain"];
  const minuteSeed = Math.floor(Date.now() / 60000);
  const idx = minuteSeed % conditions.length;
  return {
    condition: conditions[idx],
    temperature: 24 + (minuteSeed % 8),
    humidity: 55 + (minuteSeed % 25),
    windSpeed: 8 + (minuteSeed % 12),
    uvIndex: idx === 0 ? 7 : idx === 1 ? 5 : 2,
    forecast: "Stable conditions expected for the next 3 hours",
  };
}

/**
 * Get current attendance simulation (ramps up over time toward expected capacity).
 * @returns {number} current simulated attendance count
 */
function getCurrentAttendance() {
  const minuteSeed = Math.floor(Date.now() / 60000);
  const ramp = Math.min(1, (minuteSeed % 120) / 90);
  return Math.round(TOURNAMENT_CONTEXT.expectedAttendance * (0.15 + ramp * 0.80));
}

module.exports = {
  GATES,
  SECTIONS,
  AMENITIES,
  TRANSPORT_OPTIONS,
  SUPPORTED_LANGUAGES,
  EMERGENCY_PROTOCOLS,
  VENDOR_DATA,
  TOURNAMENT_CONTEXT,
  getLiveCrowdDensity,
  getQueuePredictions,
  getWeatherData,
  getCurrentAttendance,
};
