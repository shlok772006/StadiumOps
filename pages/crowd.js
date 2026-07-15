/**
 * pages/crowd.js
 * Crowd analytics page with live density heatmap, gate ranking,
 * predictive line charts, and AI-powered crowd analysis.
 */
import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import StadiumMap from "../components/StadiumMap";
import AIReasoningPanel from "../components/AIReasoningPanel";
import ChartWidget from "../components/ChartWidget";
import { getLiveCrowdDensity, getQueuePredictions, GATES } from "../lib/stadiumData";
import FormattedContent from "../components/FormattedContent";

const GATE_COLORS = {
  A: "#3b82f6",
  B: "#8b5cf6",
  C: "#06b6d4",
  D: "#10b981",
  E: "#f59e0b",
  F: "#ef4444",
  G: "#ec4899",
  H: "#94a3b8",
};

export default function CrowdAnalytics({ crowd: initialCrowd, predictions: initialPredictions }) {
  const [crowd, setCrowd] = useState(initialCrowd);
  const [predictions] = useState(initialPredictions);
  const [analysis, setAnalysis] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => {
    const id = setInterval(() => setCrowd(getLiveCrowdDensity()), 60000);
    return () => clearInterval(id);
  }, []);

  const loadAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisError("");
    try {
      const res = await fetch("/api/crowd-analysis");
      const data = await res.json();
      if (res.ok) setAnalysis(data.analysis);
      else setAnalysisError(data.error || "Failed to load analysis.");
    } catch (_e) { setAnalysisError("Network error."); }
    finally { setAnalysisLoading(false); }
  };

  const sortedByDensity = useMemo(() => [...crowd].sort((a, b) => b.density - a.density), [crowd]);
  const criticalGates = crowd.filter((c) => c.status === "critical");
  const avgDensity = Math.round(crowd.reduce((s, c) => s + c.density, 0) / crowd.length);

  const chartData = useMemo(() => {
    const timeLabels = predictions.map((p) => p.label);

    const datasets = GATES.map((g) => {
      return {
        label: `Gate ${g.id}`,
        data: predictions.map((p) => p.gates[g.id] ?? 0),
        borderColor: GATE_COLORS[g.id],
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.3,
      };
    });

    return { labels: timeLabels, datasets };
  }, [predictions]);

  return (
    <>
      <Head>
        <title>Crowd Analytics — StadiumOps Pro</title>
        <meta name="description" content="Real-time crowd density analytics with predictive gate congestion forecasting and AI-powered recommendations for stadium operations." />
      </Head>

      <div className="row fade-up" style={{ justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="card-header accent-blue">CROWD INTELLIGENCE</p>
          <h1 style={{ fontSize: "1.8rem" }}>👥 Crowd Analytics</h1>
        </div>
        <button className="btn btn-primary" onClick={loadAnalysis} disabled={analysisLoading}>
          {analysisLoading ? "🧠 Analyzing..." : "🧠 Run AI Crowd Analysis"}
        </button>
      </div>

      {/* AI Analysis */}
      {(analysis || analysisError) && (
        <div className="card glow-blue fade-up" style={{ marginBottom: 24 }}>
          <p className="card-header accent-cyan">🧠 AI CROWD ANALYSIS</p>
          {analysisError && <p style={{ color: "var(--accent-red)" }}>{analysisError}</p>}
          {analysis && (
            <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              <FormattedContent text={analysis} />
            </div>
          )}
        </div>
      )}

      {/* Map + Ranking */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card fade-up">
          <p className="card-header accent-blue">LIVE DENSITY HEATMAP</p>
          <StadiumMap crowd={crowd} />
        </div>

        <div className="card fade-up">
          <p className="card-header accent-amber">GATE DENSITY RANKING</p>
          <div className="stack" style={{ gap: 10 }}>
            {sortedByDensity.map((g, i) => (
              <div key={g.gateId} className="row" style={{ gap: 12 }}>
                <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)", width: 20 }}>
                  #{i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Gate {g.gateId}</span>
                    <span className={`pill pill-${g.status}`} style={{ fontSize: "0.6rem" }}>{g.density}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={`progress-bar-fill ${g.status === "critical" ? "red" : g.status === "busy" ? "amber" : "green"}`}
                      style={{ width: `${g.density}%` }}
                    />
                  </div>
                  <div className="mono" style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: 4 }}>
                    Wait: {g.waitMinutes}m · Flow: {g.flowRate}/hr · Zone: {g.zone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Predictive Line Chart */}
      <div className="card fade-up" style={{ marginBottom: 24 }}>
        <p className="card-header accent-purple">📈 PREDICTIVE GATE CONGESTION TRENDS (LINE PLOT)</p>
        <div style={{ marginTop: 12 }}>
          <ChartWidget type="line" data={chartData} height={280} />
        </div>
      </div>

      {/* Predictions Table */}
      <div className="card fade-up" style={{ marginBottom: 24 }}>
        <p className="card-header accent-purple">📋 PREDICTIONS DATA TABLE</p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                {GATES.map((g) => <th key={g.id}>Gate {g.id}</th>)}
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p) => (
                <tr key={p.label}>
                  <td className="mono" style={{ fontWeight: 600 }}>{p.label}</td>
                  {GATES.map((g) => {
                    const val = p.gates[g.id];
                    const color = val > 80 ? "var(--accent-red)" : val > 55 ? "var(--accent-amber)" : "var(--accent-green)";
                    return (
                      <td key={g.id} className="mono" style={{ color, fontWeight: val > 80 ? 700 : 400 }}>
                        {val}%
                      </td>
                    );
                  })}
                  <td className="mono" style={{ color: "var(--accent-cyan)", fontSize: "0.78rem" }}>
                    {p.label === "Now" ? "Measured" : p.timeOffset <= 15 ? "High" : p.timeOffset <= 30 ? "Medium" : "Projected"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="grid-2 stagger">
        <AIReasoningPanel
          metric="Overall Density Index"
          value={`${avgDensity}%`}
          status={avgDensity > 65 ? "busy" : "normal"}
          reasoning={`Average density across all ${crowd.length} gates is ${avgDensity}%. ${criticalGates.length} gates are in critical status: ${criticalGates.map(c => `Gate ${c.gateId} (${c.density}%)`).join(", ") || "none"}.`}
          recommendation={criticalGates.length > 0 ? `Immediate action: halt entry at critical gates and redirect to gates with < 50% density.` : "No action required — density is within safe parameters."}
          benefit={criticalGates.length > 0 ? `Prevent potential crowd crush at ${criticalGates.length} gate(s)` : "Maintain current flow pattern"}
        />
        <AIReasoningPanel
          metric="Prediction Confidence"
          value="High"
          status="info"
          reasoning="Predictions are based on minute-seeded crowd simulation data calibrated to historical FIFA World Cup match-day patterns."
          recommendation="Cross-reference predictions with live CCTV feed for validation. Adjust staffing 15 minutes before predicted peaks."
          benefit="15-minute early warning for congestion events"
        />
      </div>
    </>
  );
}

CrowdAnalytics.propTypes = {
  crowd: PropTypes.array.isRequired,
  predictions: PropTypes.array.isRequired,
};

export async function getServerSideProps() {
  return {
    props: {
      crowd: getLiveCrowdDensity(),
      predictions: getQueuePredictions(),
    },
  };
}
