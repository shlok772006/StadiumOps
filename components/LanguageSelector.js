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
