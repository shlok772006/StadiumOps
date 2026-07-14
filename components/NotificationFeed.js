export default function NotificationFeed({ notifications = [], onDismiss }) {
  if (notifications.length === 0) return null;

  const priorityBorder = {
    critical: "var(--accent-red)",
    warning: "var(--accent-amber)",
    high: "var(--accent-amber)",
    info: "var(--accent-blue)",
    success: "var(--accent-green)",
    low: "var(--accent-cyan)",
    medium: "var(--accent-purple)",
  };

  return (
    <div className="toast-container">
      {notifications.slice(0, 5).map((n) => (
        <div
          key={n.id}
          className="toast slide-in-right"
          style={{ borderLeftColor: priorityBorder[n.priority] || priorityBorder.info }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="mono"
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: priorityBorder[n.priority] || "var(--accent-blue)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "currentColor",
                  animation: n.priority === "critical" ? "pulse-dot 1s ease-in-out infinite" : "none",
                  flexShrink: 0,
                }}
              />
              {n.title}
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: 1.4 }}>
              {n.message}
            </p>
            <span className="mono" style={{ fontSize: "0.58rem", color: "var(--text-muted)", marginTop: 4, display: "block" }}>
              {n.timestamp}
            </span>
          </div>
          <button
            onClick={() => onDismiss(n.id)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              fontSize: "0.8rem",
              padding: "2px 4px",
              flexShrink: 0,
            }}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
