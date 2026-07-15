/**
 * components/LanguageSelector.js
 * Dropdown selector for choosing the AI response language.
 * Supports 6 languages used across the FIFA World Cup 2026 venues.
 */
import PropTypes from "prop-types";
import { SUPPORTED_LANGUAGES } from "../lib/stadiumData";

export default function LanguageSelector({ value, onChange }) {
  return (
    <label className="stack" style={{ gap: 4 }}>
      <span className="field-label">Language</span>
      <select
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ minWidth: 140 }}
        aria-label="Select AI response language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.label}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  );
}

LanguageSelector.propTypes = {
  /** Currently selected language label */
  value: PropTypes.string.isRequired,
  /** Callback invoked when the language selection changes */
  onChange: PropTypes.func.isRequired,
};
