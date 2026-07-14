import Link from "next/link";
import { useRouter } from "next/router";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/ai-assistant", icon: "🤖", label: "AI Assistant" },
  { href: "/crowd", icon: "👥", label: "Crowd Analytics" },
  { href: "/emergency", icon: "🚨", label: "Emergency" },
  { href: "/analytics", icon: "📈", label: "Analytics" },
  { href: "/upload", icon: "📁", label: "Data Upload" },
  { href: "/reports", icon: "📋", label: "Reports" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar({ open, onToggle }) {
  const router = useRouter();

  return (
    <aside
      className="no-print"
      style={{
        width: open ? "var(--sidebar-width)" : "var(--sidebar-collapsed)",
        minWidth: open ? "var(--sidebar-width)" : "var(--sidebar-collapsed)",
        height: "100vh",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        transition: "width var(--transition-base), min-width var(--transition-base)",
        overflow: "hidden",
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "var(--topbar-height)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onToggle}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "1.4rem",
            padding: "4px",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          🏟️
        </button>
        {open && (
          <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: "var(--text-heading)",
              }}
            >
              STADIUMOPS
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                color: "var(--accent-blue)",
                marginLeft: 6,
                letterSpacing: "0.08em",
              }}
            >
              PRO
            </span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: open ? "10px 14px" : "10px 0",
                justifyContent: open ? "flex-start" : "center",
                borderRadius: "var(--radius-md)",
                fontSize: "0.88rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--accent-blue-bright)" : "var(--text-secondary)",
                background: isActive ? "var(--accent-blue-soft)" : "transparent",
                transition: "all var(--transition-fast)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
              title={item.label}
            >
              <span style={{ fontSize: "1.15rem", flexShrink: 0, width: 24, textAlign: "center" }}>
                {item.icon}
              </span>
              {open && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Info */}
      {open && (
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid var(--border-subtle)",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              color: "var(--text-muted)",
              letterSpacing: "0.06em",
              lineHeight: 1.6,
            }}
          >
            FIFA WORLD CUP 2026
            <br />
            COMMAND CENTER v1.0
          </div>
        </div>
      )}
    </aside>
  );
}
