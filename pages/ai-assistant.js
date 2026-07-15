/**
 * pages/ai-assistant.js
 * Interactive AI chat assistant page grounded in live stadium data.
 * Supports voice input (Web Speech API), read-aloud feedback, and
 * multilingual responses. Displays the live gate map alongside chat.
 */
import { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import ChatWindow from "../components/ChatWindow";
import LanguageSelector from "../components/LanguageSelector";
import VoiceInput, { speak } from "../components/VoiceInput";
import StadiumMap from "../components/StadiumMap";
import { formatApiError } from "../lib/formatApiError";
import { getLiveCrowdDensity } from "../lib/stadiumData";

const SUGGESTIONS = [
  "Which gate is least congested right now?",
  "Predict crowd levels in 30 minutes",
  "What's the fastest exit route from Section S2?",
  "Generate a staffing recommendation",
  "Which vendor needs restocking?",
  "Analyze Gate A congestion pattern",
];

export default function AIAssistant({ crowd }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text) => {
      const content = text.trim();
      if (!content || loading) return;

      setError("");
      const nextMessages = [...messages, { role: "user", content }];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: nextMessages, language }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(formatApiError(data, "Something went wrong reaching the assistant."));
          return;
        }

        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (voiceReplies) speak(data.reply);
      } catch (_e) {
        setError("Network error — please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [messages, language, loading, voiceReplies]
  );

  return (
    <>
      <Head>
        <title>AI Assistant — StadiumOps Pro</title>
        <meta name="description" content="Interactive AI assistant for stadium operations. Ask about crowd status, gate recommendations, emergencies, and staffing — powered by real-time data." />
      </Head>

      <div className="row fade-up" style={{ justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="card-header accent-purple">LIVE AI ASSISTANT</p>
          <h1 style={{ fontSize: "1.8rem" }}>🤖 Operations AI</h1>
        </div>
        <div className="row" style={{ gap: 16, flexWrap: "wrap" }}>
          <LanguageSelector value={language} onChange={setLanguage} />
          <div className="stack" style={{ gap: 4 }}>
            <span className="field-label">Accessibility</span>
            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className={`btn btn-secondary btn-sm`}
                aria-pressed={voiceReplies}
                onClick={() => setVoiceReplies((v) => !v)}
                style={{
                  borderColor: voiceReplies ? "var(--accent-blue)" : undefined,
                  background: voiceReplies ? "var(--accent-blue-soft)" : undefined,
                }}
              >
                {voiceReplies ? "🔊" : "🔈"} Read aloud
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Chat Panel */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <ChatWindow messages={messages} loading={loading} />
          <div ref={chatEndRef} />

          {error && (
            <p
              role="alert"
              aria-live="assertive"
              style={{
                color: "var(--accent-red)",
                fontSize: "0.82rem",
                margin: "8px 0 0",
                padding: "8px 12px",
                border: "1px solid var(--accent-red)",
                borderRadius: "var(--radius-sm)",
                background: "var(--accent-red-soft)",
              }}
            >
              {error}
            </p>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="row"
            style={{ gap: 10, marginTop: 14 }}
          >
            <label htmlFor="chat-input" className="sr-only">Ask StadiumOps AI a question</label>
            <input
              id="chat-input"
              className="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crowd status, gate recommendations, staffing..."
              autoComplete="off"
            />
            <VoiceInput onResult={sendMessage} disabled={loading} />
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>

          <div className="row" style={{ gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="suggestion-pill"
                onClick={() => sendMessage(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="card">
          <p className="card-header accent-blue">LIVE GATE MAP</p>
          <StadiumMap crowd={crowd} />
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
            <p className="mono" style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
              AI responses are grounded in this live gate data. Ask about any gate for detailed analysis.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

AIAssistant.propTypes = {
  crowd: PropTypes.array.isRequired,
};

export async function getServerSideProps() {
  return { props: { crowd: getLiveCrowdDensity() } };
}
