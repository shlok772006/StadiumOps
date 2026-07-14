import { GATES, SECTIONS, AMENITIES, TRANSPORT_OPTIONS } from "../../lib/stadiumData";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }

  const { q } = req.query || {};
  if (!q || !q.trim()) {
    return res.status(200).json({ results: [] });
  }

  const query = q.trim().toLowerCase();
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

  return res.status(200).json({ results: results.slice(0, 10) });
}
