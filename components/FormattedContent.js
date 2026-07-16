/**
 * components/FormattedContent.js
 * Renders raw AI text into structured HTML with markdown-like formatting.
 * Supports headers (h1-h4), bullet points, bold text (**text**), and
 * standard paragraphs. Used throughout the app to display AI responses.
 */
import { Fragment } from "react";
import PropTypes from "prop-types";

export default function FormattedContent({ text = "" }) {
  if (!text) { return null; }

  // Split content into lines
  const lines = text.split("\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {lines.map((line, lineIdx) => {
        const content = line.trim();
        if (!content) { return <div key={lineIdx} style={{ height: "4px" }} />; }

        // Check if header
        if (content.startsWith("### ")) {
          return (
            <h4
              key={lineIdx}
              style={{
                fontSize: "0.95rem",
                color: "var(--text-heading)",
                marginTop: "12px",
                marginBottom: "4px",
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
              }}
            >
              {parseBold(content.slice(4))}
            </h4>
          );
        }

        if (content.startsWith("## ")) {
          return (
            <h3
              key={lineIdx}
              style={{
                fontSize: "1.1rem",
                color: "var(--accent-blue-bright)",
                marginTop: "16px",
                marginBottom: "6px",
                fontFamily: "var(--font-display)",
              }}
            >
              {parseBold(content.slice(3))}
            </h3>
          );
        }

        if (content.startsWith("# ")) {
          return (
            <h2
              key={lineIdx}
              style={{
                fontSize: "1.3rem",
                color: "var(--text-heading)",
                marginTop: "20px",
                marginBottom: "8px",
                fontFamily: "var(--font-display)",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "4px",
              }}
            >
              {parseBold(content.slice(2))}
            </h2>
          );
        }

        // Check if bullet point
        const isBullet =
          content.startsWith("* ") ||
          content.startsWith("- ") ||
          content.startsWith("• ");

        if (isBullet) {
          const cleanText = content.replace(/^[\*\-•]\s+/, "");
          return (
            <div
              key={lineIdx}
              style={{
                display: "flex",
                gap: "8px",
                paddingLeft: "12px",
                lineHeight: "1.6",
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  color: "var(--accent-blue)",
                  fontSize: "1rem",
                  lineHeight: "1.3",
                }}
              >
                •
              </span>
              <span style={{ flex: 1 }}>{parseBold(cleanText)}</span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={lineIdx} style={{ margin: 0, lineHeight: "1.6" }}>
            {parseBold(content)}
          </p>
        );
      })}
    </div>
  );
}

FormattedContent.propTypes = {
  /** Raw text content (may include markdown-like formatting) to render */
  text: PropTypes.string,
};

/**
 * Parse markdown bold syntax (**text**) within a string into React elements.
 * @param {string} text - text potentially containing **bold** markers
 * @returns {Array<React.ReactElement>} array of React elements with bold spans
 */
function parseBold(text) {
  // Regex to match markdown bold syntax (**text**)
  const regex = /(\*\*.*?\*\*)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} style={{ color: "var(--text-heading)", fontWeight: 600 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={idx}>{part}</Fragment>;
  });
}
