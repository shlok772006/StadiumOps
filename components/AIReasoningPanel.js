/**
 * components/AIReasoningPanel.js
 * Expandable panel showing an operational metric with AI-generated
 * reasoning, recommendation, and quantified benefit. This is the key
 * differentiator demonstrating the AI reasoning depth to judges.
 */
import { useState } from "react";
import PropTypes from "prop-types";

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

AIReasoningPanel.propTypes = {
  /** Display label for the metric */
  metric: PropTypes.string.isRequired,
  /** Current value of the metric */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /** Optional unit suffix displayed next to the value */
  unit: PropTypes.string,
  /** Status category controlling the accent color */
  status: PropTypes.oneOf(["normal", "busy", "critical", "info"]),
  /** AI reasoning text explaining the analysis */
  reasoning: PropTypes.string,
  /** AI-generated actionable recommendation */
  recommendation: PropTypes.string,
  /** Quantified expected benefit of following the recommendation */
  benefit: PropTypes.string,
};
