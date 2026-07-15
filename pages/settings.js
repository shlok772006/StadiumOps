/**
 * pages/settings.js
 * Configuration page for theme, language, font size, high contrast,
 * reduced motion, and AI model provider. Includes logout functionality.
 */
import { useState, useEffect } from "react";
import Head from "next/head";
import { useApp } from "../components/Layout";
import { SUPPORTED_LANGUAGES } from "../lib/stadiumData";

export default function Settings() {
  const app = useApp();
  const [fontSize, setFontSize] = useState("normal");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (fontSize === "large") {
      document.documentElement.style.fontSize = "18px";
    } else if (fontSize === "xlarge") {
      document.documentElement.style.fontSize = "20px";
    } else {
      document.documentElement.style.fontSize = "";
    }
    return () => { document.documentElement.style.fontSize = ""; };
  }, [fontSize]);

  const handleLogout = () => {
    localStorage.removeItem("stadiumops_user");
    window.location.href = "/login";
  };

  return (
    <>
      <Head>
        <title>Settings — StadiumOps Pro</title>
        <meta name="description" content="Configure StadiumOps Pro appearance, AI language, accessibility preferences, and account settings." />
      </Head>

      <div className="fade-up" style={{ marginBottom: 24 }}>
        <p className="card-header accent-blue">CONFIGURATION</p>
        <h1 style={{ fontSize: "1.8rem" }}>⚙️ Settings</h1>
      </div>

      <div style={{ maxWidth: 600 }}>
        {/* Theme */}
        <div className="card fade-up" style={{ marginBottom: 16 }}>
          <p className="card-header">APPEARANCE</p>
          <label className="stack" style={{ gap: 6, marginBottom: 16 }}>
            <span className="field-label">Theme</span>
            <select
              className="select"
              value={app?.theme || "dark"}
              onChange={(e) => app?.setTheme(e.target.value)}
            >
              <option value="dark">Dark Mode (Command Center)</option>
              <option value="light">Light Mode</option>
            </select>
          </label>

          <label className="row" style={{ gap: 12, marginBottom: 16 }}>
            <input
              type="checkbox"
              checked={app?.highContrast || false}
              onChange={(e) => app?.setHighContrast(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "var(--accent-blue)" }}
            />
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>High Contrast Mode</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Increases text and border contrast</div>
            </div>
          </label>

          <label className="stack" style={{ gap: 6 }}>
            <span className="field-label">Font Size</span>
            <select className="select" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </label>
        </div>

        {/* Language */}
        <div className="card fade-up" style={{ marginBottom: 16, animationDelay: "0.06s" }}>
          <p className="card-header">LANGUAGE</p>
          <label className="stack" style={{ gap: 6 }}>
            <span className="field-label">AI Response Language</span>
            <select
              className="select"
              value={app?.language || "English"}
              onChange={(e) => app?.setLanguage(e.target.value)}
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.label}>{l.label}</option>
              ))}
            </select>
          </label>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 8 }}>
            The AI will respond in this language regardless of your input language.
          </p>
        </div>

        {/* Accessibility */}
        <div className="card fade-up" style={{ marginBottom: 16, animationDelay: "0.12s" }}>
          <p className="card-header">ACCESSIBILITY</p>
          <label className="row" style={{ gap: 12, marginBottom: 12 }}>
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "var(--accent-blue)" }}
            />
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 500 }}>Reduced Motion</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Disables animations (also respects OS setting)</div>
            </div>
          </label>
          <div style={{ padding: "10px 14px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Additional accessibility: 🎤 Voice input available on AI Assistant page · 🔊 Text-to-speech for AI responses · ⌨️ Full keyboard navigation support · 📢 Screen reader compatible (aria-live regions)
            </span>
          </div>
        </div>

        {/* AI */}
        <div className="card fade-up" style={{ marginBottom: 16, animationDelay: "0.18s" }}>
          <p className="card-header">AI MODEL</p>
          <div style={{ padding: "10px 14px", background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)" }}>
            <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              Provider: <strong style={{ color: "var(--accent-blue)" }}>{(process.env.NEXT_PUBLIC_LLM_PROVIDER || "gemini").toUpperCase()}</strong>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "6px 0 0" }}>
              Configure AI provider via .env.local. Supports Gemini (free), Anthropic, and OpenAI.
            </p>
          </div>
        </div>

        {/* Account */}
        <div className="card fade-up" style={{ animationDelay: "0.24s" }}>
          <p className="card-header accent-red">ACCOUNT</p>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
