import { useId, useMemo, memo } from "react";
import { GATES, AMENITIES } from "../lib/stadiumData";

const STATUS_COLOR = { normal: "#10b981", busy: "#f59e0b", critical: "#ef4444" };
const STATUS_LABEL = { normal: "Normal flow", busy: "Busy", critical: "Critical — reroute" };

function StadiumMap({ crowd = [], highlightGate, showLegend = true, compact = false }) {
  const gradientId = useId();

  const crowdByGate = useMemo(() => {
    const map = new Map();
    crowd.forEach((c) => map.set(c.gateId, c));
    return map;
  }, [crowd]);

  const d = (gateId) => crowdByGate.get(gateId) || { density: 30, status: "normal", waitMinutes: 2 };

  const vb = compact ? "20 0 760 460" : "0 0 800 460";

  return (
    <div>
      <svg viewBox={vb} role="img" aria-label="Live stadium map showing gate crowd levels" style={{ width: "100%", height: "auto" }}>
        <defs>
          <radialGradient id={`${gradientId}-pitch`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${gradientId}-field`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Stadium structure */}
        <ellipse cx="400" cy="230" rx="260" ry="170" fill="none" stroke="var(--border-default)" strokeWidth="2" opacity="0.5" />
        <ellipse cx="400" cy="230" rx="230" ry="150" fill="none" stroke="var(--border-default)" strokeWidth="1" opacity="0.25" strokeDasharray="3 8" />
        <ellipse cx="400" cy="230" rx="200" ry="128" fill={`url(#${gradientId}-pitch)`} />

        {/* Pitch */}
        <ellipse cx="400" cy="230" rx="155" ry="90" fill={`url(#${gradientId}-field)`} />
        <ellipse cx="400" cy="230" rx="155" ry="90" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.35" />
        <line x1="400" y1="140" x2="400" y2="320" stroke="#10b981" strokeWidth="1" opacity="0.25" />
        <circle cx="400" cy="230" r="28" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.25" />
        <text x="400" y="236" textAnchor="middle" fontFamily="var(--font-display)" fontSize="14" fill="var(--text-muted)" letterSpacing="3" opacity="0.6">
          PITCH
        </text>

        {/* Render amenities near gates */}
        {!compact &&
          AMENITIES.map((amenity, idx) => {
            const gate = GATES.find((g) => g.id === amenity.near);
            if (!gate) return null;

            // Stagger amenities around the gate using different angles
            const angle = (idx * 2 * Math.PI) / 5;
            const dist = 32;
            const ax = gate.x + Math.cos(angle) * dist;
            const ay = gate.y + Math.sin(angle) * dist;

            return (
              <g key={amenity.id} style={{ cursor: "pointer" }}>
                <title>{`${amenity.name} (${amenity.type})`}</title>
                <circle cx={ax} cy={ay} r="9.5" fill="var(--bg-tertiary)" stroke="var(--border-default)" strokeWidth="1" />
                <text x={ax} y={ay + 3} textAnchor="middle" fontSize="9">
                  {amenity.icon}
                </text>
              </g>
            );
          })}

        {/* Gates */}
        {GATES.map((gate) => {
          const info = d(gate.id);
          const color = STATUS_COLOR[info.status] || STATUS_COLOR.normal;
          const ringR = 14 + (info.density / 100) * 22;
          const isHighlighted = highlightGate === gate.id;
          const labelBelow = gate.y >= 230;

          return (
            <g key={gate.id} style={{ cursor: "pointer" }}>
              <title>
                {gate.name} — {info.density}% ({STATUS_LABEL[info.status]}) | Wait: {info.waitMinutes}min
              </title>

              {/* Pulse ring */}
              <circle cx={gate.x} cy={gate.y} r={ringR} fill={color} opacity="0.12">
                <animate attributeName="r" values={`${ringR};${ringR + 8};${ringR}`} dur="2.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.12;0.04;0.12" dur="2.8s" repeatCount="indefinite" />
              </circle>

              {/* Highlight ring for selected gate */}
              {isHighlighted && (
                <circle cx={gate.x} cy={gate.y} r={ringR + 14} fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 6">
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${gate.x} ${gate.y}`} to={`360 ${gate.x} ${gate.y}`} dur="8s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Gate dot */}
              <circle cx={gate.x} cy={gate.y} r="14" fill={isHighlighted ? "#f59e0b" : "var(--bg-primary)"} stroke={color} strokeWidth="2.5" />
              <text x={gate.x} y={gate.y + 4.5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11.5" fontWeight="700" fill={isHighlighted ? "var(--bg-primary)" : "var(--text-primary)"}>
                {gate.id}
              </text>

              {/* Density label */}
              <text x={gate.x} y={gate.y + (labelBelow ? 34 : -22)} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={color} fontWeight="600">
                {info.density}%
              </text>

              {/* Wait time */}
              {!compact && (
                <text x={gate.x} y={gate.y + (labelBelow ? 46 : -34)} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--text-muted)">
                  {info.waitMinutes}min wait
                </text>
              )}
            </g>
          );
        })}

        {/* Zone labels */}
        {!compact && (
          <>
            <text x="400" y="14" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-muted)" letterSpacing="2" opacity="0.5">NORTH</text>
            <text x="400" y="456" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-muted)" letterSpacing="2" opacity="0.5">SOUTH</text>
            <text x="12" y="234" textAnchor="start" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-muted)" letterSpacing="2" opacity="0.5">WEST</text>
            <text x="788" y="234" textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-muted)" letterSpacing="2" opacity="0.5">EAST</text>
          </>
        )}
      </svg>

      {showLegend && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10, justifyContent: "center" }}>
          {Object.entries(STATUS_LABEL).map(([status, label]) => (
            <span key={status} className="row" style={{ gap: 6, fontSize: "0.72rem", color: "var(--text-muted)" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[status], display: "inline-block" }} />
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(StadiumMap);
