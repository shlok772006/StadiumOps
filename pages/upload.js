/**
 * pages/upload.js
 * Data upload page supporting CSV and JSON file parsing.
 * Provides drag-and-drop interface, data preview table, and
 * AI-powered analysis of uploaded datasets.
 */
import { useState, useRef } from "react";
import Head from "next/head";
import FormattedContent from "../components/FormattedContent";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [analysis, setAnalysis] = useState("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const processFile = async (f) => {
    setError("");
    setData(null);
    setAnalysis("");
    setFile(f);

    const ext = f.name.split(".").pop().toLowerCase();

    try {
      if (ext === "json") {
        const text = await f.text();
        const parsed = JSON.parse(text);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        setHeaders(Object.keys(arr[0] || {}));
        setData(arr);
      } else if (ext === "csv") {
        const text = await f.text();
        const lines = text.trim().split("\n");
        const heads = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        setHeaders(heads);
        const rows = lines.slice(1).map((line) => {
          const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          const obj = {};
          heads.forEach((h, i) => { obj[h] = vals[i] || ""; });
          return obj;
        });
        setData(rows);
      } else {
        setError(`Unsupported file type: .${ext}. Please upload CSV or JSON.`);
      }
    } catch (e) {
      setError(`Failed to parse file: ${e.message}`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  };

  const analyzeData = async () => {
    if (!data) return;
    setAnalysisLoading(true);
    setError("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileName: file?.name, headers, sampleRows: data.slice(0, 20), totalRows: data.length }),
      });
      const result = await res.json();
      if (res.ok) setAnalysis(result.analysis);
      else setError(result.error || "Analysis failed.");
    } catch (_e) { setError("Network error during analysis."); }
    finally { setAnalysisLoading(false); }
  };

  return (
    <>
      <Head>
        <title>Data Upload — StadiumOps Pro</title>
        <meta name="description" content="Upload CSV or JSON datasets for AI-powered analysis. Get instant operational insights from your stadium data." />
      </Head>

      <div className="fade-up" style={{ marginBottom: 24 }}>
        <p className="card-header accent-green">DATA MANAGEMENT</p>
        <h1 style={{ fontSize: "1.8rem" }}>📁 Data Upload</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginTop: 8 }}>
          Upload CSV or JSON datasets. The AI will analyze and provide insights from your data.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone fade-up ${dragOver ? "dragover" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload a file"
        style={{ marginBottom: 24 }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.json,.xlsx,.xls"
          style={{ display: "none" }}
          onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
        />
        <div className="upload-icon">📂</div>
        <p style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
          Drop your file here or click to browse
        </p>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
          Supports CSV, JSON • Max 10MB
        </p>
        {file && (
          <div className="pill pill-info" style={{ marginTop: 12, fontSize: "0.72rem" }}>
            📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      {error && (
        <div className="card" style={{ marginBottom: 24, borderColor: "var(--accent-red)", padding: "14px 20px" }}>
          <p style={{ color: "var(--accent-red)", fontSize: "0.85rem", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Data Preview */}
      {data && (
        <div className="card fade-up" style={{ marginBottom: 24 }}>
          <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <p className="card-header accent-blue">DATA PREVIEW</p>
              <span className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                {data.length} rows · {headers.length} columns
              </span>
            </div>
            <button className="btn btn-primary" onClick={analyzeData} disabled={analysisLoading}>
              {analysisLoading ? "🧠 Analyzing..." : "🧠 Analyze with AI"}
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  {headers.map((h) => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 20).map((row, i) => (
                  <tr key={i}>
                    <td className="mono">{i + 1}</td>
                    {headers.map((h) => <td key={h}>{String(row[h] ?? "")}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.length > 20 && (
            <p className="mono" style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>
              Showing 20 of {data.length} rows
            </p>
          )}
        </div>
      )}

      {/* AI Analysis */}
      {analysis && (
        <div className="card glow-blue fade-up">
          <p className="card-header accent-cyan">🧠 AI DATA ANALYSIS</p>
          <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>
            <FormattedContent text={analysis} />
          </div>
        </div>
      )}
    </>
  );
}
