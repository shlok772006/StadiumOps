/**
 * pages/dashboard.js
 * Main operations command center dashboard displaying real-time KPIs,
 * live crowd heatmap, AI operational briefing, AI reasoning panels,
 * gate status detail, and vendor low-stock alerts.
 */
import { useMemo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import StadiumMap from "../components/StadiumMap";
import AIReasoningPanel from "../components/AIReasoningPanel";
import FormattedContent from "../components/FormattedContent";
import { useApp } from "../components/Layout";
import {
  getLiveCrowdDensity, getCurrentAttendance,
  getWeatherData, VENDOR_DATA, TOURNAMENT_CONTEXT,
} from "../lib/stadiumData";

export default function Dashboard({ crowd: initialCrowd, weather: initialWeather, attendance: initialAttendance }) {
  const app = useApp();
  const [crowd, setCrowd] = useState(initialCrowd);
  const [weather, setWeather] = useState(initialWeather);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [briefing, setBriefing] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [briefingError, setBriefingError] = useState("");

  // Auto-refresh data every 60 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setCrowd(getLiveCrowdDensity());
      setWeather(getWeatherData());
      setAttendance(getCurrentAttendance());
    }, 60000);
    return () => clearInterval(id);
  }, []);

   // Fetch AI briefing
  useEffect(() => {
    let cancelled = false;
    fetch("/api/insights")
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (cancelled) return;
        if (ok) setBriefing(d.briefing);
        else setBriefingError(d.error || "Could not load briefing.");
      })
      .catch(() => !cancelled && setBriefingError("Network error loading briefing."))
      .finally(() => !cancelled && setBriefingLoading(false));
    return () => { cancelled = true; };
  }, []);

  // Proactive AI notifications for critical gates
  useEffect(() => {
    const critGates = crowd.filter((c) => c.status === "critical");
    const normalGates = crowd.filter((c) => c.status === "normal");
    critGates.forEach((g) => {
      const alt = normalGates.length > 0
        ? `Redirect to Gate ${normalGates[0].gateId} (${normalGates[0].density}% density)`
        : "All gates elevated — open auxiliary exits";
      app?.addNotification(
        `⚠ Gate ${g.gateId} Critical (${g.density}%)`,
        `Wait time: ${g.waitMinutes}min. AI recommends: ${alt}`,
        "critical"
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const critical = crowd.filter((c) => c.status === "critical");
    const busy = crowd.filter((c) => c.status === "busy");
    const avgDensity = Math.round(crowd.reduce((s, c) => s + c.density, 0) / crowd.length);
    const avgWait = Math.round(crowd.reduce((s, c) => s + c.waitMinutes, 0) / crowd.length);
    const lowStockVendors = VENDOR_DATA.filter((v) => v.stock < 50);
    return { critical, busy, avgDensity, avgWait, lowStockVendors };
  }, [crowd]);

  const t = TOURNAMENT_CONTEXT;
  const threatLevel = stats.critical.length > 0 ? "critical" : stats.busy.length > 1 ? "busy" : "normal";
  const threatLabels = { normal: "ALL CLEAR", busy: "ELEVATED", critical: "CRITICAL" };

  // Generate reasoning for each stat
  const densityReasoning = stats.avgDensity > 65
    ? `Average gate density has reached ${stats.avgDensity}%, which is above the 65% comfort threshold. ${stats.critical.length} gate(s) are in critical status.`
    : `Average gate density is ${stats.avgDensity}%, within normal operational parameters.`;

  const densityRecommendation = stats.critical.length > 0
    ? `Redirect incoming flow from ${stats.critical.map(c => `Gate ${c.gateId}`).join(", ")} to lower-density gates. Deploy additional stewards to critical zones.`
    : "No action required. Continue monitoring.";

  return (
    <>
      <Head>
        <title>Dashboard — StadiumOps Pro</title>
        <meta name="description" content="Real-time operations command center with live crowd heatmap, AI operational briefing, gate density monitoring, and vendor alerts for stadium management." />
      </Head>

      {/* Header */}
      <div className="row fade-up" style={{ justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="card-header accent-blue">OPERATIONS COMMAND CENTER</p>
          <h1 style={{ fontSize: "1.8rem" }}>Dashboard</h1>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <span className={`pill pill-${threatLevel}`} style={{ fontSize: "0.7rem" }}>
            THREAT: {threatLabels[threatLevel]}
          </span>
          <span className="pill pill-info" style={{ fontSize: "0.7rem" }}>
            {weather.condition} · {weather.temperature}°C
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        <div className="card fade-up" style={{ padding: "16px 20px" }}>
          <div className="stat-label">TOTAL ATTENDANCE</div>
          <div className="stat-value" style={{ marginTop: 4 }}>{attendance.toLocaleString()}</div>
          <div className="stat-change up" style={{ marginTop: 4 }}>
            ↑ of {t.expectedAttendance.toLocaleString()} expected
          </div>
        </div>
        <div className="card fade-up" style={{ padding: "16px 20px" }}>
          <div className="stat-label">AVG GATE DENSITY</div>
          <div className="stat-value" style={{ marginTop: 4, color: stats.avgDensity > 65 ? "var(--accent-amber)" : "var(--accent-green)" }}>
            {stats.avgDensity}%
          </div>
          <div className="stat-label" style={{ marginTop: 4 }}>
            {stats.critical.length} critical · {stats.busy.length} busy
          </div>
        </div>
        <div className="card fade-up" style={{ padding: "16px 20px" }}>
          <div className="stat-label">AVG WAIT TIME</div>
          <div className="stat-value" style={{ marginTop: 4, color: stats.avgWait > 10 ? "var(--accent-amber)" : "var(--accent-green)" }}>
            {stats.avgWait}m
          </div>
          <div className="stat-label" style={{ marginTop: 4 }}>across all gates</div>
        </div>
        <div className="card fade-up" style={{ padding: "16px 20px" }}>
          <div className="stat-label">VENDOR ALERTS</div>
          <div className="stat-value" style={{ marginTop: 4, color: stats.lowStockVendors.length > 0 ? "var(--accent-red)" : "var(--accent-green)" }}>
            {stats.lowStockVendors.length}
          </div>
          <div className="stat-label" style={{ marginTop: 4 }}>low stock warnings</div>
        </div>
      </div>

      {/* Main Grid: Map + Briefing */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Stadium Map */}
        <div className="card fade-up">
          <p className="card-header accent-blue">LIVE CROWD HEATMAP</p>
          <StadiumMap crowd={crowd} />
        </div>

        {/* AI Briefing */}
        <div className="card fade-up" style={{ animationDelay: "0.06s" }} aria-live="polite" aria-atomic="true">
          <p className="card-header accent-cyan">🧠 AI OPERATIONAL BRIEFING</p>
          {briefingLoading && (
            <div className="stack" style={{ gap: 10 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 14, width: `${95 - i * 12}%` }} />
              ))}
            </div>
          )}
          {briefingError && <p style={{ color: "var(--accent-red)", fontSize: "0.85rem" }}>{briefingError}</p>}
          {briefing && (
            <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              <FormattedContent text={briefing} />
            </div>
          )}
          {briefing && (
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
              <span className="mono" style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>
                AI-generated · Refreshes every minute · Grounded in live gate/transport/vendor data
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AI Reasoning Panels */}
      <div style={{ marginBottom: 24 }}>
        <p className="card-header accent-purple" style={{ marginBottom: 12 }}>🧠 AI REASONING INSIGHTS</p>
        <div className="grid-2 stagger">
          <AIReasoningPanel
            metric="Gate Density Index"
            value={`${stats.avgDensity}%`}
            status={stats.avgDensity > 65 ? "busy" : "normal"}
            reasoning={densityReasoning}
            recommendation={densityRecommendation}
            benefit={stats.critical.length > 0 ? `Reduce queue time by ~${Math.round(stats.avgWait * 0.3)} minutes` : "Maintain current flow patterns"}
          />
          <AIReasoningPanel
            metric="Wait Time Index"
            value={`${stats.avgWait}m`}
            status={stats.avgWait > 10 ? "busy" : "normal"}
            reasoning={`Average gate wait time is ${stats.avgWait} minutes. ${stats.avgWait > 10 ? "This exceeds the 10-minute comfort threshold for fan satisfaction." : "Within acceptable parameters for match day operations."}`}
            recommendation={stats.avgWait > 10 ? "Open auxiliary entry lanes at gates with wait > 12 minutes. Reallocate 2 volunteers per affected gate." : "Current staffing levels are adequate."}
            benefit={stats.avgWait > 10 ? "Reduce average wait by 30-40%" : "No intervention needed"}
          />
        </div>
      </div>

      {/* Gate Status Grid */}
      <div style={{ marginBottom: 24 }}>
        <p className="card-header accent-blue" style={{ marginBottom: 12 }}>GATE STATUS DETAIL</p>
        <div className="grid-4 stagger">
          {crowd.map((gate) => (
            <div key={gate.gateId} className="card fade-up" style={{ padding: "14px 18px" }}>
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <span className="display" style={{ fontSize: "1.1rem", fontWeight: 700 }}>Gate {gate.gateId}</span>
                <span className={`pill pill-${gate.status}`} style={{ fontSize: "0.6rem" }}>
                  {gate.status.toUpperCase()}
                </span>
              </div>
              <div className="stat-label" style={{ marginBottom: 4 }}>{gate.name}</div>
              <div className="progress-bar" style={{ marginBottom: 8 }}>
                <div
                  className={`progress-bar-fill ${gate.status === "critical" ? "red" : gate.status === "busy" ? "amber" : "green"}`}
                  style={{ width: `${gate.density}%` }}
                />
              </div>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {gate.density}% · {gate.waitMinutes}m wait
                </span>
                <span className="mono" style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                  {gate.flowRate}/hr
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vendor Alerts */}
      {stats.lowStockVendors.length > 0 && (
        <div className="card glow-amber fade-up" style={{ marginBottom: 24 }}>
          <p className="card-header accent-amber">⚠ VENDOR LOW STOCK ALERTS</p>
          <div className="grid-3" style={{ gap: 12 }}>
            {stats.lowStockVendors.map((v) => (
              <div key={v.id} className="card" style={{ padding: "12px 16px", background: "var(--accent-amber-soft)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{v.name}</div>
                <div className="mono" style={{ fontSize: "0.72rem", color: "var(--accent-amber)", marginTop: 4 }}>
                  {v.stock}% stock remaining · {v.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

Dashboard.propTypes = {
  crowd: PropTypes.array.isRequired,
  weather: PropTypes.object.isRequired,
  attendance: PropTypes.number.isRequired,
};

export async function getServerSideProps() {
  return {
    props: {
      crowd: getLiveCrowdDensity(),
      weather: getWeatherData(),
      attendance: getCurrentAttendance(),
    },
  };
}
