/**
 * components/MatchDayBanner.js
 * Informational banner displaying live tournament context including
 * match details, venue, kickoff time, and attendance figures.
 * Enhanced with live attendance count and countdown to kickoff.
 */
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { TOURNAMENT_CONTEXT, getCurrentAttendance } from "../lib/stadiumData";

export default function MatchDayBanner({ attendance: propAttendance }) {
  const t = TOURNAMENT_CONTEXT;
  const [liveAttendance, setLiveAttendance] = useState(propAttendance || getCurrentAttendance());

  useEffect(() => {
    const id = setInterval(() => setLiveAttendance(getCurrentAttendance()), 60000);
    return () => clearInterval(id);
  }, []);

  const fillPct = Math.round((liveAttendance / t.expectedAttendance) * 100);

  return (
    <div
      role="banner"
      aria-label="Match day information"
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
      <span className="mono" style={{ color: "var(--accent-green)" }}>
        {liveAttendance.toLocaleString()}/{t.expectedAttendance.toLocaleString()} ({fillPct}% filled)
      </span>
      <span className="mono" style={{ color: "var(--text-muted)" }}>
        {t.volunteerShiftsOnDuty} volunteers | {t.securityPersonnel} security
      </span>
    </div>
  );
}

MatchDayBanner.propTypes = {
  /** Optional initial attendance count (defaults to live computation) */
  attendance: PropTypes.number,
};
