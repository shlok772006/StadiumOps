import { useMemo } from "react";
import Head from "next/head";
import ChartWidget from "../components/ChartWidget";
import { getLiveCrowdDensity, getWeatherData, VENDOR_DATA, TRANSPORT_OPTIONS, GATES } from "../lib/stadiumData";

export default function Analytics({ crowd, weather }) {
  const stats = useMemo(() => {
    const avgDensity = Math.round(crowd.reduce((s, c) => s + c.density, 0) / crowd.length);
    const avgWait = Math.round(crowd.reduce((s, c) => s + c.waitMinutes, 0) / crowd.length);
    const totalFlow = crowd.reduce((s, c) => s + c.flowRate, 0);
    const criticalCount = crowd.filter((c) => c.status === "critical").length;
    const busyCount = crowd.filter((c) => c.status === "busy").length;
    const normalCount = crowd.filter((c) => c.status === "normal").length;
    return { avgDensity, avgWait, totalFlow, criticalCount, busyCount, normalCount };
  }, [crowd]);

  const vendorStats = useMemo(() => {
    const totalSales = VENDOR_DATA.reduce((s, v) => s + v.sales, 0);
    const avgStock = Math.round(VENDOR_DATA.reduce((s, v) => s + v.stock, 0) / VENDOR_DATA.length);
    return { totalSales, avgStock };
  }, []);

  const gateChartData = useMemo(() => {
    return {
      labels: crowd.map((c) => `Gate ${c.gateId}`),
      datasets: [
        {
          label: "Live Density (%)",
          data: crowd.map((c) => c.density),
          backgroundColor: crowd.map((c) =>
            c.status === "critical"
              ? "rgba(239, 68, 68, 0.75)"
              : c.status === "busy"
              ? "rgba(245, 158, 11, 0.75)"
              : "rgba(59, 130, 246, 0.75)"
          ),
          borderColor: crowd.map((c) =>
            c.status === "critical" ? "#ef4444" : c.status === "busy" ? "#f59e0b" : "#3b82f6"
          ),
          borderWidth: 1.5,
        },
      ],
    };
  }, [crowd]);

  const vendorChartData = useMemo(() => {
    return {
      labels: VENDOR_DATA.map((v) => v.name),
      datasets: [
        {
          label: "Total Sales ($)",
          data: VENDOR_DATA.map((v) => v.sales),
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(139, 92, 246, 0.7)",
            "rgba(6, 182, 212, 0.7)",
            "rgba(16, 185, 129, 0.7)",
            "rgba(245, 158, 11, 0.7)",
            "rgba(239, 68, 68, 0.7)",
          ],
          borderColor: [
            "#3b82f6",
            "#8b5cf6",
            "#06b6d4",
            "#10b981",
            "#f59e0b",
            "#ef4444",
          ],
          borderWidth: 1,
        },
      ],
    };
  }, []);

  const transportChartData = useMemo(() => {
    const modes = [...new Set(TRANSPORT_OPTIONS.map((t) => t.mode))];
    const avgLoadPerMode = modes.map((mode) => {
      const items = TRANSPORT_OPTIONS.filter((t) => t.mode === mode);
      return Math.round(items.reduce((s, t) => s + t.capacity, 0) / items.length);
    });

    return {
      labels: modes,
      datasets: [
        {
          label: "Average Load Factor (%)",
          data: avgLoadPerMode,
          backgroundColor: [
            "rgba(59, 130, 246, 0.7)",
            "rgba(245, 158, 11, 0.7)",
            "rgba(16, 185, 129, 0.7)",
          ],
          borderColor: ["#3b82f6", "#f59e0b", "#10b981"],
          borderWidth: 1,
        },
      ],
    };
  }, []);

  return (
    <>
      <Head><title>Analytics — StadiumOps Pro</title></Head>

      <div className="fade-up" style={{ marginBottom: 24 }}>
        <p className="card-header accent-green">OPERATIONAL ANALYTICS</p>
        <h1 style={{ fontSize: "1.8rem" }}>📈 Analytics Dashboard</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        {[
          { label: "AVG DENSITY", value: `${stats.avgDensity}%`, color: stats.avgDensity > 65 ? "var(--accent-amber)" : "var(--accent-green)" },
          { label: "AVG WAIT TIME", value: `${stats.avgWait}m`, color: stats.avgWait > 10 ? "var(--accent-amber)" : "var(--accent-green)" },
          { label: "TOTAL FLOW RATE", value: `${stats.totalFlow.toLocaleString()}/hr`, color: "var(--accent-blue)" },
          { label: "GATE STATUS", value: `${stats.normalCount}N/${stats.busyCount}B/${stats.criticalCount}C`, color: stats.criticalCount > 0 ? "var(--accent-red)" : "var(--accent-green)" },
        ].map((kpi) => (
          <div key={kpi.label} className="card fade-up" style={{ padding: "16px 20px" }}>
            <div className="stat-label">{kpi.label}</div>
            <div className="stat-value" style={{ marginTop: 4, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card fade-up">
          <p className="card-header accent-blue">LIVE GATE DENSITY (%)</p>
          <div style={{ marginTop: 12 }}>
            <ChartWidget type="bar" data={gateChartData} height={260} />
          </div>
        </div>

        <div className="card fade-up">
          <p className="card-header accent-amber">VENDOR PERFORMANCE (SALES $)</p>
          <div style={{ marginTop: 12 }}>
            <ChartWidget type="bar" data={vendorChartData} height={260} />
          </div>
        </div>
      </div>

      {/* Transport + Weather */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card fade-up">
          <p className="card-header accent-cyan">AVERAGE TRANSIT LOAD FACTOR (%)</p>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
            <div style={{ maxWidth: 300, width: "100%" }}>
              <ChartWidget type="pie" data={transportChartData} height={220} />
            </div>
          </div>
        </div>

        <div className="card fade-up">
          <p className="card-header accent-green">WEATHER & ENVIRONMENT</p>
          <div className="grid-2" style={{ gap: 12, marginTop: 8 }}>
            {[
              { label: "Condition", value: weather.condition, icon: "🌤️" },
              { label: "Temperature", value: `${weather.temperature}°C`, icon: "🌡️" },
              { label: "Humidity", value: `${weather.humidity}%`, icon: "💧" },
              { label: "Wind", value: `${weather.windSpeed} km/h`, icon: "💨" },
              { label: "UV Index", value: weather.uvIndex, icon: "☀️" },
              { label: "Forecast", value: weather.forecast.split(" ").slice(0, 3).join(" "), icon: "📊" },
            ].map((w) => (
              <div key={w.label} style={{ padding: "10px 14px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)" }}>
                <div className="stat-label">{w.icon} {w.label}</div>
                <div style={{ fontSize: "0.92rem", fontWeight: 600, marginTop: 4 }}>{w.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transport detail table */}
      <div className="card fade-up" style={{ marginBottom: 24 }}>
        <p className="card-header accent-cyan">DETAILED TRANSPORT STATUS</p>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Mode</th><th>Line</th><th>Gate</th><th>ETA</th><th>Status</th><th>Load</th></tr>
            </thead>
            <tbody>
              {TRANSPORT_OPTIONS.map((t, i) => (
                <tr key={i}>
                  <td>{t.mode}</td>
                  <td className="mono">{t.line}</td>
                  <td>Gate {t.nearestGate}</td>
                  <td className="mono">{t.etaMinutes}m</td>
                  <td>
                    <span className={`pill ${t.status.includes("Delay") || t.status.includes("Busy") ? "pill-busy" : "pill-normal"}`} style={{ fontSize: "0.6rem" }}>
                      {t.status}
                    </span>
                  </td>
                  <td className="mono">{t.capacity}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  return { props: { crowd: getLiveCrowdDensity(), weather: getWeatherData() } };
}
