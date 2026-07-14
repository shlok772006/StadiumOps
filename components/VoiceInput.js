import { useState, useRef, useCallback } from "react";

/**
 * Web Speech API voice input. Falls back gracefully if unsupported.
 */
export default function VoiceInput({ onResult, disabled }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const supported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggle = useCallback(() => {
    if (!supported) return;

    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setListening(false);
      if (onResult) onResult(text);
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, onResult, supported]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`btn btn-secondary btn-icon ${listening ? "glow-blue" : ""}`}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      title={listening ? "Listening..." : "Voice input"}
      style={{
        fontSize: "1.1rem",
        borderColor: listening ? "var(--accent-blue)" : undefined,
        background: listening ? "var(--accent-blue-soft)" : undefined,
      }}
    >
      {listening ? "🔴" : "🎤"}
    </button>
  );
}

/**
 * Speak text aloud using the Speech Synthesis API.
 */
export function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
