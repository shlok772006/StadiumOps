import { useState } from "react";

/**
 * AIReasoningPanel — the key differentiator.
 * Shows a metric with AI-generated explanation and recommendation.
 * Always expandable so judges can see the reasoning depth.
 */
export default function AIReasoningPanel({ metric, value, unit, status, reasoning, recommendation, benefit }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    normal: "var(--accent-green)",
    busy: "var(--accent-amber)",
    critical: "var(--accent-red)",
    info: "var(--accent-blue)",
  };

  const color = statusColors[status] || statusColors.info;

  return (
    <div className="card" style={{ padding: "16px 20px" }}>
      <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
        <div>
          <div className="stat-label">{metric}</div>
          <div className="row" style={{ gap: 8, marginTop: 4 }}>
            <span className="stat-value" style={{ fontSize: "1.6rem", color }}>{value}</span>
            {unit && <span className="mono" style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{unit}</span>}
          </div>
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="btn btn-ghost btn-sm"
          style={{
            fontSize: "0.72rem",
            color: "var(--accent-blue)",
            gap: 4,
          }}
          aria-expanded={expanded}
        >
          🧠 {expanded ? "Hide" : "AI"} Reasoning
          <span style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform var(--transition-fast)", display: "inline-block" }}>
            ▾
          </span>
        </button>
      </div>

      {expanded && (reasoning || recommendation) && (
        <div className="reasoning-panel fade-in" style={{ marginTop: 12 }}>
          {reasoning && (
            <div>
              <div className="reason-label">Analysis</div>
              <div className="reason-text">{reasoning}</div>
            </div>
          )}
          {recommendation && (
            <div className="recommendation">
              <div className="reason-label">Recommendation</div>
              <div className="reason-text">{recommendation}</div>
            </div>
          )}
          {benefit && (
            <div style={{ marginTop: 8 }}>
              <span
                className="pill pill-info"
                style={{ fontSize: "0.68rem" }}
              >
                Expected benefit: {benefit}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
