import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function SkillGap() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState("Frontend React Engineer");
  const [analysisText, setAnalysisText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (role) => {
    const targetRole = role || selectedRole;
    setLoading(true);
    try {
      const res = await api.post("/ai/chat", {
        prompt: `Analyze my skill gap for the position of ${targetRole} based on my real enrolled courses and completed lesson progress. Identify strengths, missing competencies, and recommended learning steps.`,
        type: "SKILL_GAP",
      });
      setAnalysisText(res.response || "Analysis complete.");
    } catch (err) {
      setAnalysisText("Could not connect to AI Assistant for skill gap analysis. Verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAnalyze("Frontend React Engineer");
  }, []);

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1100 }}>
        <div className="ss-header" style={{ marginBottom: "1.25rem" }}>
          <div>
            <span className="eyebrow" style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--st-emerald)" }}>
              ENTERPRISE COMPETENCY ANALYZER
            </span>
            <h1 className="ss-welcome">📊 Personalized AI Skill Gap Analysis</h1>
            <p className="ss-streak">Benchmark your enrolled course progress against real industry developer designations for {user?.name || "your profile"}.</p>
          </div>
        </div>

        <div className="ss-skillgap-grid">
          {/* Left Column: Target Profile Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="ss-card">
              <h3 style={{ marginTop: 0, fontSize: "1.05rem" }}>Target Profile</h3>
              <label style={{ fontSize: "0.8rem", color: "var(--st-text-muted)", display: "block", marginBottom: 6 }}>
                Target Role / Designation
              </label>
              <select
                className="ss-select"
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  handleAnalyze(e.target.value);
                }}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, marginBottom: 14 }}
              >
                <option value="Frontend React Engineer">Frontend React Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Backend Java Engineer">Backend Java Engineer</option>
                <option value="Cloud Architect">Cloud Architect</option>
              </select>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {["Frontend React Engineer", "Full Stack Developer", "Backend Java Engineer", "Cloud Architect"].map((role) => (
                  <button
                    key={role}
                    className={`ss-chip ${selectedRole === role ? "is-active" : ""}`}
                    onClick={() => {
                      setSelectedRole(role);
                      handleAnalyze(role);
                    }}
                    style={{ fontSize: "0.72rem", padding: "4px 8px", cursor: "pointer" }}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <button className="ss-resume-btn" disabled={loading} onClick={() => handleAnalyze(selectedRole)} style={{ width: "100%", padding: "10px" }}>
                {loading ? "Analyzing..." : "📊 Analyze Skill Gaps"}
              </button>
            </div>
          </div>

          {/* Right Column: AI Analysis Report */}
          <div className="ss-card">
            <h3 style={{ marginTop: 0, fontSize: "1.1rem" }}>Competency Map Report: {selectedRole}</h3>

            {loading ? (
              <p style={{ color: "var(--st-text-muted)", padding: 20 }}>Analyzing real course enrollments and calculating skill gaps...</p>
            ) : (
              <div style={{ whiteSpace: "pre-line", lineHeight: 1.6, fontSize: "0.92rem", color: "var(--st-cream)", background: "var(--st-surface)", padding: 20, borderRadius: 10, border: "1px solid var(--st-border)" }}>
                {analysisText}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ss-skillgap-grid { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; }
        @media (max-width: 800px) { .ss-skillgap-grid { grid-template-columns: 1fr; } }
      `}</style>
    </AppLayout>
  );
}
