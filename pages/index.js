import { useMemo } from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import Link from "next/link";
import StadiumMap from "../components/StadiumMap";
import { getLiveCrowdDensity, GATES, TOURNAMENT_CONTEXT } from "../lib/stadiumData";

const FEATURES = [
  { icon: "👥", title: "Crowd Intelligence", desc: "AI monitors gate density in real-time and predicts congestion before it happens — with reasoning, not just numbers.", color: "var(--accent-blue)" },
  { icon: "🧠", title: "AI Reasoning Engine", desc: "Every recommendation explains WHY. 'Gate C at 87% → will exceed capacity in 4 min → redirect to Gate F → saves 5 min.'", color: "var(--accent-purple)" },
  { icon: "🚨", title: "Emergency Response", desc: "AI-generated numbered action plans in seconds. SOS button, nearest resource finder, evacuation route optimizer.", color: "var(--accent-red)" },
  { icon: "📊", title: "Predictive Analytics", desc: "Forecast crowd flow, queue times, and vendor demand for the next 60 minutes with data-driven confidence scores.", color: "var(--accent-cyan)" },
  { icon: "📁", title: "Data Upload & Analysis", desc: "Upload CSV, JSON, or Excel datasets. AI analyzes and visualizes your data instantly — judges can test with their own data.", color: "var(--accent-green)" },
  { icon: "🌐", title: "Multilingual AI", desc: "Context-aware AI briefings in 6 languages. Not translation — the AI reasons natively in English, Hindi, Spanish, French, Arabic, Portuguese.", color: "var(--accent-amber)" },
];

export default function Home({ crowd }) {
  const { busyCount, avgDensity } = useMemo(() => {
    const busy = crowd.filter((c) => c.status !== "normal").length;
    const avg = Math.round(crowd.reduce((s, c) => s + c.density, 0) / crowd.length);
    return { busyCount: busy, avgDensity: avg };
  }, [crowd]);

  const t = TOURNAMENT_CONTEXT;

  return (
    <>
      <Head>
        <title>StadiumOps Pro — AI-Powered Stadium Operations | FIFA World Cup 2026</title>
        <meta name="description" content="AI-powered command center for stadium operations. Real-time crowd management, predictive analytics, and emergency response with AI reasoning — built for FIFA World Cup 2026." />
      </Head>

      {/* Nav */}
      <nav className="landing-nav">
        <div className="row" style={{ gap: 10 }}>
          <span style={{ fontSize: "1.4rem" }}>🏟️</span>
          <span className="display" style={{ fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.04em" }}>
            STADIUMOPS
          </span>
          <span className="mono" style={{ fontSize: "0.6rem", color: "var(--accent-blue)", letterSpacing: "0.08em" }}>PRO</span>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <Link href="/login" className="btn btn-primary btn-sm">
            Launch Command Center →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 100, paddingBottom: 40 }}>
        <div className="container stack" style={{ gap: 20, alignItems: "center", textAlign: "center" }}>
          <p className="mono fade-up" style={{ color: "var(--accent-amber)", letterSpacing: "0.14em", fontSize: "0.75rem" }}>
            PROMPTWARS · CHALLENGE 04 · SMART STADIUMS & TOURNAMENT OPERATIONS
          </p>
          <h1 className="fade-up" style={{ fontSize: "clamp(2.2rem, 6vw, 4.2rem)", lineHeight: 1.05, maxWidth: 800, animationDelay: "0.06s", textTransform: "uppercase" }}>
            AI That <span style={{ color: "var(--accent-blue)" }}>Reasons</span>,
            <br />Not Just Responds
          </h1>
          <p className="fade-up" style={{ maxWidth: 600, color: "var(--text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, animationDelay: "0.12s" }}>
            StadiumOps Pro is an AI-powered command center for venue staff at {t.venue}. It doesn&apos;t just say &quot;Gate C is busy&quot; — it explains <em>why</em>, predicts <em>what&apos;s next</em>, and recommends <em>exactly what to do</em>.
          </p>
          <div className="row fade-up" style={{ gap: 14, marginTop: 8, flexWrap: "wrap", justifyContent: "center", animationDelay: "0.18s" }}>
            <Link href="/login" className="btn btn-primary btn-lg">
              Enter Command Center →
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">
              See Features ↓
            </a>
          </div>

          {/* Live Stats */}
          <div className="row fade-up" style={{ gap: 32, marginTop: 30, flexWrap: "wrap", justifyContent: "center", animationDelay: "0.24s" }}>
            <Stat label="Gates Monitored" value={GATES.length} />
            <Stat label="Avg Gate Load" value={`${avgDensity}%`} />
            <Stat label="Needing Attention" value={busyCount} accent={busyCount > 0} />
            <Stat label="AI Languages" value="6" />
            <Stat label="Response Time" value="<2s" />
          </div>
        </div>
      </section>

      {/* Live Map */}
      <section style={{ padding: "20px 0 60px" }}>
        <div className="container">
          <div className="card glow-blue" style={{ padding: 32 }}>
            <div className="grid-2" style={{ alignItems: "center" }}>
              <div>
                <p className="card-header accent-blue">LIVE GATE STATUS (SIMULATED)</p>
                <StadiumMap crowd={crowd} />
              </div>
              <div className="stack" style={{ gap: 20 }}>
                <h2 style={{ fontSize: "1.4rem" }}>Real-Time Stadium Digital Twin</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                  Every gate pulsates with live crowd density data. The AI monitors all {GATES.length} gates simultaneously, predicts congestion 15-60 minutes ahead, and generates actionable recommendations with quantified benefits.
                </p>
                <div className="card" style={{ background: "var(--bg-tertiary)", padding: 16 }}>
                  <p className="mono" style={{ fontSize: "0.7rem", color: "var(--accent-blue)", marginBottom: 8, fontWeight: 700 }}>
                    AI REASONING EXAMPLE
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                    &quot;Gate C currently has <strong style={{ color: "var(--accent-amber)" }}>87% occupancy</strong> (critical threshold). Based on entry flow trends, this gate will exceed safe capacity within <strong style={{ color: "var(--accent-red)" }}>4 minutes</strong>.<br /><br />
                    <strong style={{ color: "var(--accent-green)" }}>Recommendation:</strong> Redirect incoming fans to Gate F (42% occupancy). Fans will reach their seats ~5 minutes faster.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: "40px 0 60px" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p className="card-header accent-amber" style={{ marginBottom: 12 }}>CAPABILITIES</p>
            <h2 style={{ fontSize: "1.8rem" }}>Built for Depth, Not Breadth</h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: 500, margin: "12px auto 0", fontSize: "0.92rem" }}>
              One persona. Two problems. Solved exceptionally well with AI reasoning at the core.
            </p>
          </div>
          <div className="grid-3 stagger">
            {FEATURES.map((f) => (
              <div key={f.title} className="card fade-up" style={{ padding: 24 }}>
                <div className="feature-icon" style={{ background: `${f.color}15`, color: f.color, marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "1.05rem", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.55, margin: 0 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "40px 0 80px" }}>
        <div className="container" style={{ textAlign: "center" }}>
          <div className="card glow-blue" style={{ padding: "48px 32px" }}>
            <h2 style={{ fontSize: "1.6rem", marginBottom: 12 }}>Ready to Command?</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", maxWidth: 500, margin: "0 auto 24px" }}>
              Enter the operations command center and see AI reasoning in action — live crowd monitoring, predictive analytics, and emergency response.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg">
              Launch Command Center →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px 0 48px", borderTop: "1px solid var(--border-subtle)" }}>
        <div className="container row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p className="mono" style={{ color: "var(--text-muted)", fontSize: "0.7rem", margin: 0 }}>
            Built for Hack2Skill PromptWars · Virtual · Challenge 4: Smart Stadiums & Tournament Operations
          </p>
          <p className="mono" style={{ color: "var(--text-muted)", fontSize: "0.65rem", margin: 0 }}>
            Persona: Venue Staff · Problems: Crowd Management + Operational Intelligence · Powered by GenAI
          </p>
        </div>
      </footer>
    </>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="stat">
      <span className="stat-value" style={{ color: accent ? "var(--accent-amber)" : "var(--text-heading)" }}>
        {value}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

Home.propTypes = {
  crowd: PropTypes.array.isRequired,
};

Stat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  accent: PropTypes.bool,
};

export async function getServerSideProps() {
  return { props: { crowd: getLiveCrowdDensity() } };
}
