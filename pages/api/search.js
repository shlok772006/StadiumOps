/**
 * pages/api/search.js
 * -----------------------------------------------------------------------
 * Smart entity search endpoint. Searches across gates, seating sections,
 * amenities, and transport options using a sanitized query string.
 * Returns matched results with category, title, details, and navigation URL.
 * -----------------------------------------------------------------------
 */

const { GATES, SECTIONS, AMENITIES, TRANSPORT_OPTIONS } = require("../../lib/stadiumData");
const { API_LIMITS } = require("../../lib/constants");

/**
 * Handle GET requests for smart stadium entity search.
 * @param {import('next').NextApiRequest} req - Next.js API request
 * @param {import('next').NextApiResponse} res - Next.js API response
 * @returns {void}
 */
function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const { q } = req.query || {};
  if (!q || !q.trim()) {
    return res.status(200).json({ results: [] });
  }

  // Sanitize the query parameters to prevent XSS / Injection
  const query = q.trim().toLowerCase().replace(/[^a-z0-9\s\-\_]/g, "").slice(0, API_LIMITS.MAX_SEARCH_QUERY_LENGTH);
  const results = [];

  // Search Gates
  GATES.forEach((g) => {
    if (g.name.toLowerCase().includes(query) || g.id.toLowerCase() === query) {
      results.push({
        id: `gate-${g.id}`,
        title: g.name,
        category: "Gate",
        url: `/dashboard?gate=${g.id}`,
        details: `Zone: ${g.zone} · Base Capacity: ${g.baseCapacity.toLocaleString()}`,
      });
    }
  });

  // Search Seating Sections
  SECTIONS.forEach((s) => {
    if (s.name.toLowerCase().includes(query) || s.id.toLowerCase() === query) {
      results.push({
        id: `section-${s.id}`,
        title: `${s.id}: ${s.name}`,
        category: "Section",
        url: `/crowd`,
        details: `${s.tier} Tier · Nearest Gate: Gate ${s.nearestGate} · Capacity: ${s.capacity.toLocaleString()}`,
      });
    }
  });

  // Search Amenities
  AMENITIES.forEach((a) => {
    if (a.name.toLowerCase().includes(query) || a.type.toLowerCase().includes(query)) {
      results.push({
        id: `amenity-${a.id}`,
        title: `${a.icon} ${a.name}`,
        category: "Amenity",
        url: `/dashboard`,
        details: `Type: ${a.type} · Located near Gate ${a.near}`,
      });
    }
  });

  // Search Transport
  TRANSPORT_OPTIONS.forEach((t) => {
    if (t.mode.toLowerCase().includes(query) || t.line.toLowerCase().includes(query)) {
      results.push({
        id: `transit-${t.mode}-${t.line}`,
        title: `${t.mode}: ${t.line}`,
        category: "Transport",
        url: `/analytics`,
        details: `Nearest Gate: Gate ${t.nearestGate} · Status: ${t.status} · ETA: ${t.etaMinutes}m`,
      });
    }
  });

  return res.status(200).json({ results: results.slice(0, API_LIMITS.MAX_SEARCH_RESULTS) });
}

module.exports = handler;
