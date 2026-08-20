import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import "./Dashboard.css";
const LEADERBOARD = [
  { name: "Ananya R.", hours: 14.2, streak: 21 },
  { name: "Kevin S.", hours: 12.8, streak: 9 },
  { name: "You", hours: 9.4, streak: 0, isYou: true },
  { name: "Meera I.", hours: 8.1, streak: 6 },
  { name: "Tom H.", hours: 6.9, streak: 3 },
];


function ElevationChart({ data }) {
  const max = Math.max(...data.map((d) => d.units), 1);
  const width = 560;
  const height = 140;
  const padding = 20;
  const step = (width - padding * 2) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = padding + i * step;
    const y = height - padding - (d.units / max) * (height - padding * 2);
    return [x, y];
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${height - padding} L ${points[0][0]} ${height - padding} Z`;

  return (
    <div className="ss-elevation-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="ss-elevation-svg" role="img" aria-label="Weekly learning activity">
        <path d={areaPath} className="ss-elevation-area" />
        <path d={linePath} className="ss-elevation-line" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" className="ss-elevation-point" />
        ))}
      </svg>
      <div className="ss-elevation-labels">
        {data.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}

function CompletionRing({ percent }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="ss-ring">
      <circle cx="60" cy="60" r={r} className="ss-ring-track" />
      <circle
        cx="60"
        cy="60"
        r={r}
        className="ss-ring-fill"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="65" textAnchor="middle" className="ss-ring-text">{percent}%</text>
    </svg>
  );
}

// Derived, illustrative-only breakdown of weekly hours by category — the
// backend doesn't expose this yet, so it's estimated from skill progress.
function deriveTimeByCategory(skillProgress, hoursThisWeek) {
  const total = skillProgress.reduce((s, x) => s + x.percent, 0) || 1;
  return skillProgress.map((s) => ({
    skill: s.skill,
    hours: Math.max(0.3, +((s.percent / total) * hoursThisWeek).toFixed(1)),
  }));
}

export default function Analytics() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const body = await api.get("/dashboard/summary");
        setData(body);
      } catch {
        setError("Could not load analytics. Is the backend running?");
      }
    })();
  }, [token]);

  if (error) {
    return (
      <AppLayout>
        <div className="ss-dashboard">{error}</div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="ss-dashboard">Crunching your trail data...</div>
      </AppLayout>
    );
  }

  const { stats, weeklyActivity, skillProgress } = data;
  const completionPercent = Math.round((stats.unitsCompleted / stats.unitsTotal) * 100);
  const timeByCategory = deriveTimeByCategory(skillProgress, stats.hoursThisWeek);
  const maxHours = Math.max(...timeByCategory.map((t) => t.hours), 1);

  return (
    <AppLayout>
      <div className="ss-dashboard">
        <h1 className="ss-welcome" style={{ marginBottom: "0.4rem" }}>Analytics</h1>
        <p style={{ color: "var(--st-text-muted)", marginBottom: "1.75rem", fontSize: "14px" }}>
          A closer look at how — and how much — you've been climbing.
        </p>

        <div className="ss-stats-grid">
          <StatBlock label="Overall completion" value={`${completionPercent}%`} />
          <StatBlock label="Hours this week" value={stats.hoursThisWeek} />
          <StatBlock label="Courses enrolled" value={stats.coursesEnrolled} />
          <StatBlock label="Courses completed" value={stats.coursesCompleted} />
        </div>

        <section className="ss-section">
          <h2 className="ss-section-title">This week's climb</h2>
          <ElevationChart data={weeklyActivity} />
        </section>

        <div className="ss-analytics-row">
          <section className="ss-section ss-analytics-col">
            <h2 className="ss-section-title">Overall progress</h2>
            <div className="ss-ring-wrap">
              <CompletionRing percent={completionPercent} />
              <p className="ss-ring-caption">
                {stats.unitsCompleted} of {stats.unitsTotal} units completed across all enrolled routes.
              </p>
            </div>
          </section>

          <section className="ss-section ss-analytics-col">
            <h2 className="ss-section-title">Time by skill this week</h2>
            <div className="ss-time-list">
              {timeByCategory.map((t) => (
                <div className="ss-time-row" key={t.skill}>
                  <span className="ss-time-name">{t.skill}</span>
                  <div className="ss-progress-track">
                    <div className="ss-progress-fill" style={{ width: `${(t.hours / maxHours) * 100}%` }} />
                  </div>
                  <span className="ss-time-hours">{t.hours}h</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="ss-section">
          <h2 className="ss-section-title">Skill progress</h2>
          <div className="ss-skill-list">
            {skillProgress.map((s) => (
              <div key={s.skill} className="ss-skill-row">
                <span className="ss-skill-name">{s.skill}</span>
                <div className="ss-progress-track">
                  <div className="ss-progress-fill" style={{ width: `${s.percent}%` }} />
                </div>
                <span className="ss-skill-percent">{s.percent}%</span>
              </div>
            ))}
          </div>
        </section>

        <section className="ss-section">
          <h2 className="ss-section-title">This week's leaderboard</h2>
          <div className="ss-leaderboard">
            {LEADERBOARD
              .slice()
              .sort((a, b) => b.hours - a.hours)
              .map((p, i) => (
                <div key={p.name} className={`ss-lb-row ${p.isYou ? "is-you" : ""}`}>
                  <span className="ss-lb-rank">{i + 1}</span>
                  <span className="ss-lb-name">{p.name}</span>
                  <span className="ss-lb-streak">{p.streak > 0 ? `${p.streak}d streak` : "—"}</span>
                  <span className="ss-lb-hours">{p.hours}h</span>
                </div>
              ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--st-text-muted)", marginTop: 8 }}>
            Visible to others only if "Show on leaderboard" is enabled in Settings.
          </p>
        </section>
      </div>

      <style>
        {`
          .ss-analytics-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
          .ss-analytics-col { margin-bottom: 0; }
          .ss-ring-wrap { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 18px; padding: 22px; display: flex; align-items: center; gap: 20px; backdrop-filter: blur(20px) saturate(140%); box-shadow: 0 8px 30px rgba(6, 8, 30, 0.4), inset 0 1px 0 rgba(255,255,255,0.06); }
          .ss-ring-caption { font-size: 13px; color: var(--st-text-muted); line-height: 1.5; }
          .ss-ring-track { fill: none; stroke: var(--st-track); stroke-width: 9; }
          .ss-ring-fill { fill: none; stroke: #22D3EE; stroke-width: 9; stroke-linecap: round; transition: stroke-dashoffset 0.4s ease; }
          .ss-ring-text { fill: var(--st-cream); font-family: var(--font-display); font-weight: 700; font-size: 18px; }
          .ss-time-list { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 18px; padding: 18px 22px; backdrop-filter: blur(20px) saturate(140%); box-shadow: 0 8px 30px rgba(6, 8, 30, 0.4), inset 0 1px 0 rgba(255,255,255,0.06); }
          .ss-time-row { display: grid; grid-template-columns: 90px 1fr 36px; align-items: center; gap: 12px; margin-bottom: 12px; }
          .ss-time-row:last-child { margin-bottom: 0; }
          .ss-time-name { font-size: 13px; color: var(--st-cream); }
          .ss-time-hours { font-size: 12px; color: var(--st-text-muted); text-align: right; }
          @media (max-width: 800px) { .ss-analytics-row { grid-template-columns: 1fr; } }
          .ss-leaderboard { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 18px; padding: 8px 10px; backdrop-filter: blur(20px) saturate(140%); box-shadow: 0 8px 30px rgba(6, 8, 30, 0.4), inset 0 1px 0 rgba(255,255,255,0.06); }
          .ss-lb-row { display: grid; grid-template-columns: 28px 1fr 90px 60px; align-items: center; gap: 10px; padding: 10px 10px; border-radius: 10px; font-size: 13px; }
          .ss-lb-row.is-you { background: rgba(124, 108, 246, 0.12); }
          .ss-lb-rank { color: var(--st-text-muted); font-weight: 700; }
          .ss-lb-name { color: var(--st-cream); font-weight: 600; }
          .ss-lb-streak { color: var(--st-text-muted); font-size: 11.5px; }
          .ss-lb-hours { color: var(--st-sage); font-weight: 700; text-align: right; }
        `}
      </style>
    </AppLayout>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="ss-stat-card">
      <p className="ss-stat-value">{value}</p>
      <p className="ss-stat-label">{label}</p>
    </div>
  );
}
