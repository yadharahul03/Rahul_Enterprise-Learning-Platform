import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Sessions() {
  const { isInstructor, isAdmin } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionList, courseList] = await Promise.all([
        api.get("/sessions").catch(() => []),
        api.get("/courses").catch(() => []),
      ]);
      setSessions(sessionList || []);
      setCourses(courseList || []);
      if (courseList && courseList.length > 0) {
        setCourseId(courseList[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to load sessions data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!title || !startTime || !meetingUrl || !courseId) {
      alert("Please complete all required session details");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/sessions", {
        courseId: parseInt(courseId),
        title,
        description,
        startTime,
        durationMinutes: parseInt(durationMinutes),
        meetingUrl,
      });
      alert("Live session scheduled successfully!");
      setTitle("");
      setDescription("");
      setStartTime("");
      setMeetingUrl("");
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to schedule live session");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1100 }}>
        <div className="ss-header" style={{ marginBottom: "1.25rem" }}>
          <div>
            <h1 className="ss-welcome">🤝 Live Interactive Sessions</h1>
            <p className="ss-streak">Upcoming live lectures, 1-on-1 advisory meetings, and interactive workshops for your enrolled courses.</p>
          </div>
        </div>

        <div className="ss-sessions-grid">
          {/* Schedule 1-on-1 Session Column (Instructor / Admin only) */}
          {(isInstructor || isAdmin) ? (
            <div className="ss-card">
              <h3 style={{ marginTop: 0, fontSize: "1.05rem" }}>📅 Schedule Live Session</h3>
              <form onSubmit={handleSchedule} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <label style={{ fontSize: "0.8rem", color: "var(--st-text-muted)" }}>Target Course</label>
                <select className="ss-select" value={courseId} onChange={(e) => setCourseId(e.target.value)} style={{ padding: "10px 12px", borderRadius: 8 }}>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>

                <label style={{ fontSize: "0.8rem", color: "var(--st-text-muted)" }}>Session Title</label>
                <input className="ss-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="E.g. Live Q&A & Code Walkthrough" required />

                <label style={{ fontSize: "0.8rem", color: "var(--st-text-muted)" }}>Description</label>
                <textarea className="ss-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Session overview..." />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--st-text-muted)" }}>Start Date & Time</label>
                    <input type="datetime-local" className="ss-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} required style={{ width: "100%" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.8rem", color: "var(--st-text-muted)" }}>Duration (Mins)</label>
                    <input type="number" className="ss-input" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} required style={{ width: "100%" }} />
                  </div>
                </div>

                <label style={{ fontSize: "0.8rem", color: "var(--st-text-muted)" }}>Meeting URL (Zoom / Google Meet)</label>
                <input className="ss-input" value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/..." required />

                <button type="submit" className="ss-resume-btn" disabled={submitting} style={{ padding: 12, marginTop: 6 }}>
                  {submitting ? "Scheduling..." : "Schedule Live Session →"}
                </button>
              </form>
            </div>
          ) : (
            <div className="ss-card" style={{ background: "rgba(16, 185, 129, 0.05)" }}>
              <h3 style={{ marginTop: 0, fontSize: "1.05rem", color: "var(--st-emerald)" }}>💡 Live Learning Info</h3>
              <p style={{ fontSize: "0.88rem", color: "var(--st-cream)", lineHeight: 1.6 }}>
                Live interactive sessions are scheduled by course instructors. As an enrolled student, any upcoming session for your subscribed courses will automatically appear in your feed.
              </p>
            </div>
          )}

          {/* Booked / Scheduled Sessions Column */}
          <div className="ss-card">
            <h3 style={{ marginTop: 0, fontSize: "1.05rem" }}>☑️ Upcoming Course Live Sessions ({sessions.length})</h3>
            {loading ? (
              <p style={{ color: "var(--st-text-muted)" }}>Loading sessions...</p>
            ) : sessions.length === 0 ? (
              <p style={{ color: "var(--st-text-muted)" }}>No live sessions scheduled for your enrolled courses.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {sessions.map((s) => (
                  <div key={s.id} style={{ border: "1px solid var(--st-border)", borderRadius: 10, padding: 14, background: "var(--st-surface)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span className="ss-badge-tech">{s.courseTitle}</span>
                      <span style={{ fontSize: "0.78rem", color: "var(--st-text-muted)" }}>{new Date(s.startTime).toLocaleString()}</span>
                    </div>

                    <h4 style={{ margin: "4px 0 2px 0", fontSize: "1rem" }}>{s.title}</h4>
                    {s.description && <p style={{ fontSize: "0.85rem", color: "var(--st-cream)", marginBottom: 8 }}>{s.description}</p>}
                    <p style={{ margin: "0 0 12px 0", fontSize: "0.82rem", color: "var(--st-text-muted)" }}>
                      👤 Instructor: {s.instructorName} • 🕒 Duration: {s.durationMinutes} mins
                    </p>

                    {s.meetingUrl && (
                      <a href={s.meetingUrl} target="_blank" rel="noreferrer" className="ss-resume-btn" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", fontSize: "0.8rem", padding: "6px 14px" }}>
                        🎥 Join Meeting
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ss-sessions-grid { display: grid; grid-template-columns: 420px 1fr; gap: 1.5rem; }
        @media (max-width: 800px) { .ss-sessions-grid { grid-template-columns: 1fr; } }
      `}</style>
    </AppLayout>
  );
}
