import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import api from "../api/client";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [submissionTextMap, setSubmissionTextMap] = useState({});

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const list = await api.get("/assignments");
      setAssignments(list || []);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleSubmitAssignment = async (id) => {
    const text = submissionTextMap[id];
    if (!text || !text.trim()) {
      alert("Please enter submission notes or text.");
      return;
    }

    setSubmittingId(id);
    try {
      await api.post(`/assignments/${id}/submit`, {
        submissionText: text,
        fileUrl: `https://skillsphere.nexus/submissions/${id}_solution.pdf`,
      });
      alert("Assignment submitted successfully!");
      await loadAssignments();
    } catch (err) {
      alert(err.message || "Failed to submit assignment");
    } finally {
      setSubmittingId(null);
    }
  };

  const filtered = assignments.filter((a) => {
    if (filter === "PENDING") return a.submissionStatus === "PENDING";
    if (filter === "SUBMITTED") return a.submissionStatus === "SUBMITTED";
    return true;
  });

  const pendingCount = assignments.filter((a) => a.submissionStatus === "PENDING").length;
  const submittedCount = assignments.filter((a) => a.submissionStatus === "SUBMITTED").length;
  const reviewedCount = assignments.filter((a) => a.score !== null && a.score !== undefined).length;

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1100 }}>
        <div className="ss-header" style={{ marginBottom: "1.25rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--st-emerald)", fontWeight: 700 }}>
              MY ENROLLED COURSE ASSIGNMENTS
            </span>
            <h1 className="ss-welcome">📁 Course Assignments</h1>
            <p className="ss-streak">Assignments for your enrolled courses. Submit solutions for instructor review and grading.</p>
          </div>
        </div>

        {/* Top Summary Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.25rem" }}>
          <div className="ss-card" style={{ textAlign: "center", padding: 14 }}>
            <span style={{ fontSize: "0.75rem", color: "var(--st-text-muted)", display: "block" }}>TOTAL ASSIGNMENTS</span>
            <strong style={{ fontSize: "1.5rem" }}>{assignments.length}</strong>
          </div>
          <div className="ss-card" style={{ textAlign: "center", padding: 14 }}>
            <span style={{ fontSize: "0.75rem", color: "var(--st-text-muted)", display: "block" }}>PENDING SUBMISSION</span>
            <strong style={{ fontSize: "1.5rem", color: "#f59e0b" }}>{pendingCount}</strong>
          </div>
          <div className="ss-card" style={{ textAlign: "center", padding: 14 }}>
            <span style={{ fontSize: "0.75rem", color: "var(--st-text-muted)", display: "block" }}>SUBMITTED (UNDER REVIEW)</span>
            <strong style={{ fontSize: "1.5rem", color: "#3b82f6" }}>{submittedCount}</strong>
          </div>
          <div className="ss-card" style={{ textAlign: "center", padding: 14 }}>
            <span style={{ fontSize: "0.75rem", color: "var(--st-text-muted)", display: "block" }}>REVIEWED & GRADED</span>
            <strong style={{ fontSize: "1.5rem", color: "#10b981" }}>{reviewedCount}</strong>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: "1.25rem" }}>
          {["ALL", "PENDING", "SUBMITTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`ss-chip ${filter === f ? "is-active" : ""}`}
              style={{ padding: "6px 14px", cursor: "pointer", fontSize: "0.8rem" }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {loading ? (
          <p style={{ color: "var(--st-text-muted)" }}>Loading assignments...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--st-text-muted)" }}>No assignments found for your enrolled courses.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {filtered.map((item) => (
              <div key={item.id} className="ss-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="ss-badge-tech">Due: {new Date(item.dueDate).toLocaleString()}</span>
                  {item.submissionStatus === "SUBMITTED" ? (
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#3b82f6", color: "#fff", padding: "3px 10px", borderRadius: 999 }}>
                      {item.score !== null ? `GRADED: ${item.score}/${item.totalPoints}` : "SUBMITTED (PENDING REVIEW)"}
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "#f59e0b", color: "#fff", padding: "3px 10px", borderRadius: 999 }}>
                      ACTION REQUIRED
                    </span>
                  )}
                </div>

                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem" }}>{item.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--st-cream)", marginBottom: 8 }}>{item.description}</p>
                <p style={{ fontSize: "0.82rem", color: "var(--st-text-muted)", margin: "0 0 14px 0" }}>
                  Course: <strong>{item.courseTitle}</strong> • Total Points: <strong>{item.totalPoints}</strong>
                </p>

                {item.submissionStatus === "SUBMITTED" ? (
                  <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>📝 Submission Text: {item.submissionText}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--st-text-muted)", marginTop: 4 }}>
                      Submitted on: {new Date(item.submittedAt).toLocaleString()}
                    </div>
                    {item.feedback && (
                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(59,130,246,0.2)", color: "#10b981", fontSize: "0.85rem" }}>
                        💬 Instructor Feedback: {item.feedback}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--st-border)", paddingTop: 14 }}>
                    <textarea
                      className="ss-input"
                      rows={2}
                      placeholder="Write your assignment answer / submission text here..."
                      value={submissionTextMap[item.id] || ""}
                      onChange={(e) => setSubmissionTextMap({ ...submissionTextMap, [item.id]: e.target.value })}
                      style={{ fontSize: "0.85rem" }}
                    />
                    <button
                      className="ss-resume-btn"
                      disabled={submittingId === item.id}
                      onClick={() => handleSubmitAssignment(item.id)}
                      style={{ alignSelf: "flex-start", padding: "8px 16px", fontSize: "0.82rem" }}
                    >
                      {submittingId === item.id ? "Submitting..." : "📤 Submit Solution"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
