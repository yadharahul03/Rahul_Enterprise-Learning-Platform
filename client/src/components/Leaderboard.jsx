import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import api from "../api/client";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [type, setType] = useState("weekly");
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const list = await api.get(`/leaderboard?type=${type}`);
      setLeaderboard(list || []);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [type]);

  const top3 = leaderboard.slice(0, 3);

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1050 }}>
        <div className="ss-header" style={{ marginBottom: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--st-emerald)", fontWeight: 700 }}>
              GLOBAL RANKINGS & MERIT POINTS
            </span>
            <h1 className="ss-welcome">🏆 Platform Leaderboard</h1>
            <p className="ss-streak">Real-time student rankings derived from completed units, logged hours, and earned badges.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`ss-learn-tab ${type === "weekly" ? "is-active" : ""}`}
              onClick={() => setType("weekly")}
            >
              Weekly
            </button>
            <button
              className={`ss-learn-tab ${type === "all-time" ? "is-active" : ""}`}
              onClick={() => setType("all-time")}
            >
              All-Time
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "var(--st-text-muted)" }}>Calculating leaderboard rankings...</p>
        ) : (
          <>
            {/* Podium Row */}
            {top3.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "1.5rem" }}>
                {top3[0] && (
                  <div className="ss-card" style={{ textAlign: "center", border: "1px solid #eab308", background: "rgba(234, 179, 8, 0.05)" }}>
                    <div style={{ fontSize: "2.5rem" }}>🥇</div>
                    <h3 style={{ margin: "4px 0 2px 0" }}>{top3[0].name}</h3>
                    <span style={{ fontSize: "0.8rem", color: "#eab308", fontWeight: 700 }}>1st Place Master</span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: 8 }}>⚡ {top3[0].score} XP</div>
                  </div>
                )}

                {top3[1] && (
                  <div className="ss-card" style={{ textAlign: "center", border: "1px solid #94a3b8", background: "rgba(148, 163, 184, 0.05)" }}>
                    <div style={{ fontSize: "2.5rem" }}>🥈</div>
                    <h3 style={{ margin: "4px 0 2px 0" }}>{top3[1].name}</h3>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 700 }}>2nd Place Expert</span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: 8 }}>⚡ {top3[1].score} XP</div>
                  </div>
                )}

                {top3[2] && (
                  <div className="ss-card" style={{ textAlign: "center", border: "1px solid #b45309", background: "rgba(180, 83, 9, 0.05)" }}>
                    <div style={{ fontSize: "2.5rem" }}>🥉</div>
                    <h3 style={{ margin: "4px 0 2px 0" }}>{top3[2].name}</h3>
                    <span style={{ fontSize: "0.8rem", color: "#b45309", fontWeight: 700 }}>3rd Place Achiever</span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: 8 }}>⚡ {top3[2].score} XP</div>
                  </div>
                )}
              </div>
            )}

            {/* Full Table */}
            <div className="ss-card" style={{ padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                <thead>
                  <tr style={{ background: "var(--st-surface)", borderBottom: "1px solid var(--st-border)" }}>
                    <th style={{ padding: "12px 16px" }}>Rank</th>
                    <th style={{ padding: "12px 16px" }}>Student</th>
                    <th style={{ padding: "12px 16px" }}>Units Completed</th>
                    <th style={{ padding: "12px 16px" }}>Logged Hours</th>
                    <th style={{ padding: "12px 16px" }}>Badges Earned</th>
                    <th style={{ padding: "12px 16px" }}>Total Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => (
                    <tr key={row.userId} style={{ borderBottom: "1px solid var(--st-border)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 800 }}>#{row.rank}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{row.name} ({row.role})</td>
                      <td style={{ padding: "12px 16px" }}>{row.unitsCompleted} Units</td>
                      <td style={{ padding: "12px 16px" }}>{row.hoursSpent} hrs</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className="ss-badge-tech">🏆 {row.badgeCount} Badges</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 800, color: "var(--st-emerald)" }}>⚡ {row.score} XP</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
