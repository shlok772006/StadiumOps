/**
 * pages/emergency.js
 * Emergency management module with SOS button, incident reporting form,
 * AI-generated action plans, nearest resource finder, and active incident tracker.
 */
import { useState } from "react";
import Head from "next/head";
import { GATES, EMERGENCY_PROTOCOLS, AMENITIES, getLiveCrowdDensity } from "../lib/stadiumData";
import { formatApiError } from "../lib/formatApiError";
import StadiumMap from "../components/StadiumMap";
import FormattedContent from "../components/FormattedContent";

const INCIDENT_TYPES = Object.entries(EMERGENCY_PROTOCOLS).map(([key, val]) => ({
  value: key, label: val.label, severity: val.severity,
}));

export default function Emergency({ crowd }) {
  const [incidentType, setIncidentType] = useState("medical");
  const [incidentGate, setIncidentGate] = useState(GATES[0].id);
  const [details, setDetails] = useState("");
  const [actionPlan, setActionPlan] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState("");
  const [incidents, setIncidents] = useState([]);

  const reportIncident = async (e) => {
    e.preventDefault();
    setPlanLoading(true);
    setPlanError("");
    setActionPlan("");

    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ incidentType, location: incidentGate, details }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionPlan(data.actionPlan);
        setIncidents((prev) => [
          {
            id: `inc-${Date.now()}`,
            type: data.incident,
            gate: data.nearestGate,
            time: new Date().toLocaleTimeString(),
            status: "Active",
            severity: EMERGENCY_PROTOCOLS[incidentType].severity,
          },
          ...prev,
        ]);
      } else {
        setPlanError(formatApiError(data, "Could not generate action plan."));
      }
    } catch (_e) {
      setPlanError("Network error generating action plan.");
    } finally {
      setPlanLoading(false);
    }
  };

  // Find nearest resources
  const nearestMedical = AMENITIES.filter((a) => a.type === "medical");
  const normalGates = crowd.filter((c) => c.status === "normal");

  return (
    <>
      <Head>
        <title>Emergency — StadiumOps Pro</title>
        <meta name="description" content="Emergency management console with AI-generated action plans, SOS button, incident reporting, and nearest resource finder for stadium operations." />
      </Head>

      <div className="row fade-up" style={{ justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="card-header accent-red">EMERGENCY MANAGEMENT</p>
          <h1 style={{ fontSize: "1.8rem" }}>🚨 Emergency Module</h1>
        </div>
        <button
          className="sos-btn"
          onClick={() => { setIncidentType("medical"); document.getElementById("incident-form")?.scrollIntoView({ behavior: "smooth" }); }}
          aria-label="Emergency SOS"
        >
          SOS
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Incident Report Form */}
        <div className="card glow-red" id="incident-form">
          <p className="card-header accent-red">⚠ REPORT AN INCIDENT</p>

          <form onSubmit={reportIncident} className="stack" style={{ gap: 16 }}>
            <label className="stack" style={{ gap: 6 }}>
              <span className="field-label">Incident Type</span>
              <select className="select" value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
                {INCIDENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label} ({t.severity})</option>
                ))}
              </select>
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="field-label">Nearest Gate</span>
              <select className="select" value={incidentGate} onChange={(e) => setIncidentGate(e.target.value)}>
                {GATES.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </label>

            <label className="stack" style={{ gap: 6 }}>
              <span className="field-label">Details (optional)</span>
              <textarea
                className="textarea"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="e.g. Fan collapsed near Section S1 entrance, appears unresponsive"
              />
            </label>

            <button type="submit" className="btn btn-danger btn-lg" disabled={planLoading} style={{ alignSelf: "flex-start" }}>
              {planLoading ? "🧠 Generating AI Action Plan..." : "Generate AI Action Plan"}
            </button>
          </form>

          {planError && <p role="alert" style={{ color: "var(--accent-red)", marginTop: 14, fontSize: "0.85rem" }}>{planError}</p>}

          {actionPlan && (
            <div className="card fade-up" style={{ marginTop: 18, borderColor: "var(--accent-red)", background: "var(--accent-red-soft)" }} aria-live="assertive">
              <p className="card-header accent-red">🧠 AI-GENERATED ACTION PLAN</p>
              <div style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>
                <FormattedContent text={actionPlan} />
              </div>
            </div>
          )}
        </div>

        {/* Map + Nearest Resources */}
        <div className="stack" style={{ gap: 16 }}>
          <div className="card">
            <p className="card-header accent-blue">STADIUM MAP — INCIDENT CONTEXT</p>
            <StadiumMap crowd={crowd} highlightGate={incidentGate} />
          </div>

          <div className="card">
            <p className="card-header accent-green">NEAREST RESOURCES</p>
            <div className="stack" style={{ gap: 10 }}>
              <div>
                <span className="field-label">Medical Posts</span>
                <div className="stack" style={{ gap: 4, marginTop: 4 }}>
                  {nearestMedical.map((m) => (
                    <div key={m.id} className="row" style={{ gap: 8, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                      <span>{m.icon}</span> {m.name} (near Gate {m.near})
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="field-label">Available Exit Gates (Low Density)</span>
                <div className="stack" style={{ gap: 4, marginTop: 4 }}>
                  {normalGates.length > 0 ? normalGates.map((g) => (
                    <div key={g.gateId} className="row" style={{ gap: 8, fontSize: "0.82rem" }}>
                      <span className="pill pill-normal" style={{ fontSize: "0.6rem" }}>{g.density}%</span>
                      <span style={{ color: "var(--text-secondary)" }}>Gate {g.gateId} — {g.name}</span>
                    </div>
                  )) : (
                    <span style={{ color: "var(--accent-amber)", fontSize: "0.82rem" }}>All gates elevated — consider opening auxiliary exits</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Incidents */}
      {incidents.length > 0 && (
        <div className="card fade-up" style={{ marginBottom: 24 }}>
          <p className="card-header accent-amber">ACTIVE INCIDENTS ({incidents.length})</p>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => (
                  <tr key={inc.id}>
                    <td className="mono">{inc.time}</td>
                    <td>{inc.type}</td>
                    <td>{inc.gate}</td>
                    <td>
                      <span className={`pill pill-${inc.severity === "critical" ? "critical" : inc.severity === "high" ? "busy" : "info"}`} style={{ fontSize: "0.6rem" }}>
                        {inc.severity.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="pill pill-busy" style={{ fontSize: "0.6rem" }}>{inc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export async function getServerSideProps() {
  return { props: { crowd: getLiveCrowdDensity() } };
}
