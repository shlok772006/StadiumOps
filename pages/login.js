/**
 * pages/login.js
 * Simulated authentication page with role selection.
 * No real credentials required — stores operator name and role
 * in localStorage for the command center session.
 */
import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

const ROLES = [
  { id: "staff", label: "Venue Staff", icon: "🏟️", desc: "Stadium operations commander" },
  { id: "organizer", label: "Organizer", icon: "🎫", desc: "Match day director" },
  { id: "admin", label: "Admin", icon: "🔧", desc: "System administrator" },
];

export default function Login() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);
  const [focusedRole, setFocusedRole] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!name.trim()) { return; }
    setLoading(true);

    const user = {
      name: name.trim(),
      role: role.toUpperCase(),
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem("stadiumops_user", JSON.stringify(user));

    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  };

  return (
    <>
      <Head>
        <title>Login — StadiumOps Pro</title>
        <meta name="description" content="Enter the StadiumOps Pro command center. Select your role and begin monitoring stadium operations for FIFA World Cup 2026." />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="fade-up" style={{ maxWidth: 440, width: "100%" }}>
          {/* Branding */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ fontSize: "3rem" }}>🏟️</span>
            <h1 style={{ fontSize: "1.8rem", marginTop: 12 }}>STADIUMOPS <span style={{ color: "var(--accent-blue)" }}>PRO</span></h1>
            <p className="mono" style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: 8, letterSpacing: "0.1em" }}>
              AI COMMAND CENTER · FIFA WORLD CUP 2026
            </p>
          </div>

          <form onSubmit={handleLogin} className="card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: 20, textAlign: "center" }}>
              Enter Command Center
            </h2>

            {/* Name */}
            <label className="stack" style={{ gap: 6, marginBottom: 16 }}>
              <span className="field-label">Operator Name</span>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                required
              />
            </label>

            {/* Role Selection */}
            <div style={{ marginBottom: 20 }}>
              <span className="field-label" style={{ display: "block", marginBottom: 10 }}>Select Role</span>
              <div role="radiogroup" aria-label="Select your role" className="stack" style={{ gap: 8 }}>
                {ROLES.map((r) => (
                  <label
                    key={r.id}
                    className="row"
                    style={{
                      gap: 12,
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      border: `1px solid ${role === r.id ? "var(--accent-blue)" : focusedRole === r.id ? "var(--accent-blue-bright)" : "var(--border-default)"}`,
                      boxShadow: focusedRole === r.id ? "0 0 0 2px var(--accent-blue-soft)" : "none",
                      background: role === r.id ? "var(--accent-blue-soft)" : "var(--bg-tertiary)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={role === r.id}
                      onChange={() => { setRole(r.id); }}
                      onFocus={() => { setFocusedRole(r.id); }}
                      onBlur={() => { setFocusedRole(null); }}
                      style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
                    />
                    <span style={{ fontSize: "1.4rem" }}>{r.icon}</span>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600, color: role === r.id ? "var(--accent-blue-bright)" : "var(--text-primary)" }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{r.desc}</div>
                    </div>
                    {role === r.id && (
                      <span style={{ marginLeft: "auto", color: "var(--accent-blue)", fontSize: "1.1rem" }}>✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading || !name.trim()}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {loading ? "Initializing..." : "Enter Command Center →"}
            </button>
          </form>

          <p className="mono" style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.65rem", marginTop: 20, letterSpacing: "0.06em" }}>
            SIMULATED AUTH · NO REAL CREDENTIALS REQUIRED
          </p>
        </div>
      </div>
    </>
  );
}
