/**
 * pages/reports.js
 * AI report generation page with PDF and text export.
 * Supports crowd, incident, daily, and match day report types.
 */
import { useState } from "react";
import Head from "next/head";
import { jsPDF } from "jspdf";
import FormattedContent from "../components/FormattedContent";
import { useApp } from "../components/Layout";

const REPORT_TYPES = [
  { id: "crowd", label: "Crowd Management Report", icon: "👥", desc: "Density patterns, gate utilization, and crowd flow analysis" },
  { id: "incident", label: "Incident Summary Report", icon: "🚨", desc: "All incidents, response times, outcomes, and lessons" },
  { id: "daily", label: "Daily Operations Report", icon: "📊", desc: "Comprehensive match day ops summary and KPIs" },
  { id: "match", label: "Match Day Report", icon: "⚽", desc: "Full overview for tournament officials" },
];

export default function Reports() {
  const app = useApp();
  const [selectedType, setSelectedType] = useState("daily");
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateReport = async () => {
    setLoading(true);
    setError("");
    setReport("");

    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reportType: selectedType, lang: app?.language || "English" }),
      });
      const data = await res.json();
      if (res.ok) { setReport(data.report); }
      else { setError(data.error || "Failed to generate report."); }
    } catch (_e) { setError("Network error."); }
    finally { setLoading(false); }
  };

  const exportText = () => {
    if (!report) { return; }
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stadiumops_${selectedType}_report_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!report) { return; }
    try {
      const doc = new jsPDF();

      // Report Header Branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(10, 14, 26);
      doc.text("STADIUMOPS PRO — AI OPERATIONS BRIEFING", 14, 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(90, 100, 128);
      doc.text(`Report Type: ${selectedType.toUpperCase()}`, 14, 30);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 35);
      doc.text("Venue: MetLife Stadium (FIFA World Cup 2026)", 14, 40);

      // Line Separator
      doc.setDrawColor(210, 215, 230);
      doc.line(14, 45, 196, 45);

      // Format Body Content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      doc.setTextColor(30, 35, 50);

      const splitText = doc.splitTextToSize(report, 182);
      let y = 55;
      
      splitText.forEach((line) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 14, y);
        y += 6.2;
      });

      doc.save(`stadiumops_${selectedType}_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      setError(`Failed to export PDF: ${err.message}`);
    }
  };

  return (
    <>
      <Head>
        <title>Reports — StadiumOps Pro</title>
        <meta name="description" content="Generate and export AI-powered operations reports for crowd management, incidents, daily ops, and match day summaries." />
      </Head>

      <div className="fade-up" style={{ marginBottom: 24 }}>
        <p className="card-header accent-cyan">AI REPORT GENERATION</p>
        <h1 style={{ fontSize: "1.8rem" }}>📋 Reports</h1>
      </div>

      {/* Report Type Selection */}
      <div className="grid-4 stagger" style={{ marginBottom: 24 }}>
        {REPORT_TYPES.map((rt) => (
          <button
            key={rt.id}
            className="card fade-up"
            onClick={() => setSelectedType(rt.id)}
            style={{
              padding: "20px",
              cursor: "pointer",
              textAlign: "left",
              border: `1px solid ${selectedType === rt.id ? "var(--accent-blue)" : "var(--border-subtle)"}`,
              background: selectedType === rt.id ? "var(--accent-blue-soft)" : "var(--bg-card)",
              width: "100%",
            }}
          >
            <span style={{ fontSize: "1.6rem", display: "block", marginBottom: 8 }}>{rt.icon}</span>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: selectedType === rt.id ? "var(--accent-blue-bright)" : "var(--text-primary)" }}>
              {rt.label}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>{rt.desc}</div>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="row" style={{ gap: 12, marginBottom: 24 }}>
        <button className="btn btn-primary btn-lg" onClick={generateReport} disabled={loading}>
          {loading ? "🧠 Generating AI Report..." : "🧠 Generate Report"}
        </button>
        {report && (
          <>
            <button className="btn btn-secondary" onClick={exportPDF}>
              📄 Download PDF
            </button>
            <button className="btn btn-secondary" onClick={exportText}>
              📥 Export as Text
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 24, borderColor: "var(--accent-red)", padding: "14px 20px" }}>
          <p style={{ color: "var(--accent-red)", fontSize: "0.85rem", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Report Output */}
      {report && (
        <div className="card glow-blue fade-up">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <p className="card-header accent-cyan">
              🧠 AI-GENERATED {REPORT_TYPES.find((r) => r.id === selectedType)?.label.toUpperCase()}
            </p>
            <span className="mono" style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
              Generated {new Date().toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
            <FormattedContent text={report} />
          </div>
        </div>
      )}
    </>
  );
}
