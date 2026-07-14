import FormattedContent from "./FormattedContent";

export default function ChatWindow({ messages = [], loading = false }) {
  return (
    <div className="chat-container" role="log" aria-label="Chat conversation" aria-live="polite">
      {messages.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🤖</div>
          <p style={{ fontSize: "0.9rem", fontWeight: 500 }}>StadiumOps AI Assistant</p>
          <p style={{ fontSize: "0.78rem", marginTop: 6 }}>
            Ask about crowd status, gate recommendations, emergencies, or operations.
          </p>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className={`chat-msg ${msg.role} fade-in`}>
          <FormattedContent text={msg.content} />
          <div className="timestamp">
            {msg.role === "user" ? "You" : "StadiumOps AI"} • {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      ))}

      {loading && (
        <div className="typing-indicator">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      )}
    </div>
  );
}
