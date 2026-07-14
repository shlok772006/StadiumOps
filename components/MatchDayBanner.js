import { TOURNAMENT_CONTEXT } from "../lib/stadiumData";

export default function MatchDayBanner() {
  const t = TOURNAMENT_CONTEXT;
  return (
    <div
      style={{
        background: "var(--accent-blue-soft)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "8px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        flexWrap: "wrap",
        fontSize: "0.72rem",
      }}
    >
      <span className="mono" style={{ color: "var(--accent-blue-bright)", fontWeight: 700, letterSpacing: "0.08em" }}>
        ⚽ {t.tournament.toUpperCase()}
      </span>
      <span className="mono" style={{ color: "var(--text-secondary)" }}>{t.stage}</span>
      <span className="mono" style={{ color: "var(--text-secondary)" }}>{t.match}</span>
      <span className="mono" style={{ color: "var(--text-muted)" }}>{t.venue}</span>
      <span className="mono" style={{ color: "var(--accent-amber)" }}>Kickoff {t.kickoffLocal}</span>
      <span className="mono" style={{ color: "var(--text-muted)" }}>
        ~{t.expectedAttendance.toLocaleString()} expected | {t.volunteerShiftsOnDuty} volunteers
      </span>
    </div>
  );
}
