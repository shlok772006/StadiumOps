import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useApp } from "./Layout";
import { TOURNAMENT_CONTEXT } from "../lib/stadiumData";

export default function Topbar() {
  const app = useApp();
  const router = useRouter();
  const [time, setTime] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Handle click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Trigger search on query change
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setShowResults(true);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleResultClick = (result) => {
    setQuery("");
    setShowResults(false);
    app?.addNotification("Search Navigation", `Routed to: ${result.title} (${result.category})`, "info");
    router.push(result.url);
  };

  const t = TOURNAMENT_CONTEXT;
  const notifCount = app?.notifications?.length || 0;

  return (
    <header
      className="no-print"
      style={{
        height: "var(--topbar-height)",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        gap: 16,
        zIndex: 40,
        position: "relative",
      }}
    >
      {/* Match Info */}
      <div className="row" style={{ gap: 16, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="pill pill-info" style={{ fontSize: "0.65rem" }}>
            LIVE
          </span>
          <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            {t.match}
          </span>
        </div>
        <span className="mono" style={{ fontSize: "0.72rem", color: "var(--accent-amber)" }}>
          ⏱ {time}
        </span>
      </div>

      {/* Smart Search Bar */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          maxWidth: 360,
          width: "100%",
          margin: "0 16px",
        }}
      >
        <label htmlFor="topbar-search" className="sr-only">Search entities</label>
        <input
          id="topbar-search"
          type="text"
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔎 Search gates, sections, amenities..."
          style={{
            padding: "8px 12px 8px 36px",
            fontSize: "0.82rem",
            height: 36,
            background: "var(--bg-primary)",
          }}
          onFocus={() => query.trim() && setShowResults(true)}
        />
        <span style={{ position: "absolute", left: 12, top: 9, fontSize: "0.9rem", opacity: 0.5 }}>
          🔍
        </span>
        {loading && (
          <span style={{ position: "absolute", right: 12, top: 10, fontSize: "0.75rem" }}>
            ⏳
          </span>
        )}

        {/* Search Results Dropdown */}
        {showResults && results.length > 0 && (
          <div
            className="card fade-in"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              zIndex: 100,
              padding: "8px 0",
              maxHeight: 280,
              overflowY: "auto",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {results.map((res) => (
              <button
                key={res.id}
                onClick={() => handleResultClick(res)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  padding: "10px 16px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  transition: "background var(--transition-fast)",
                }}
                className="btn-ghost"
              >
                <div className="row" style={{ justifyContent: "space-between", width: "100%" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {res.title}
                  </span>
                  <span className={`pill pill-${res.category === "Gate" ? "info" : res.category === "Section" ? "purple" : "normal"}`} style={{ fontSize: "0.55rem" }}>
                    {res.category.toUpperCase()}
                  </span>
                </div>
                <span className="mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                  {res.details}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="row" style={{ gap: 12, flexShrink: 0 }}>
        {/* Theme Toggle */}
        <button
          onClick={() => app?.setTheme(app.theme === "dark" ? "light" : "dark")}
          className="btn btn-ghost btn-icon"
          aria-label="Toggle theme"
          title={`Switch to ${app?.theme === "dark" ? "light" : "dark"} mode`}
        >
          {app?.theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            className="btn btn-ghost btn-icon"
            aria-label={`${notifCount} notifications`}
            title="Notifications"
          >
            🔔
          </button>
          {notifCount > 0 && <span className="badge">{notifCount > 9 ? "9+" : notifCount}</span>}
        </div>

        {/* User */}
        <div className="row" style={{ gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-full)",
              background: "var(--accent-blue-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              border: "1px solid var(--accent-blue)",
            }}
          >
            👤
          </div>
          <div className="stack" style={{ gap: 0 }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2 }}>
              {app?.user?.name || "Operator"}
            </span>
            <span className="mono" style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>
              {app?.user?.role || "STAFF"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
