import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import { SkeletonGrid } from "./Skeleton";
import "./Dashboard.css";

export default function InstructorCourseStudents() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [announcements, setAnnouncements] = useState(null);
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  const loadAnnouncements = async () => {
    try {
      const res = await api.get(`/instructor/courses/${courseId}/announcements`);
      setAnnouncements(res);
    } catch {
      // Non-critical — roster still loads without this.
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setPosting(true);
    try {
      await api.post(`/instructor/courses/${courseId}/announcements`, { message });
      showToast?.("Announcement posted", "success");
      setMessage("");
      await loadAnnouncements();
    } catch (err) {
      showToast?.(err.message || "Could not post announcement", "error");
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const body = await api.get(`/instructor/courses/${courseId}/students`);
        setData(body);
      } catch (err) {
        setError(err.message || "Could not load this roster.");
      }
    })();
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, courseId]);

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
        <div className="ss-dashboard">
          <SkeletonGrid count={3} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="ss-dashboard">
        <Link to="/instructor" className="ss-cd-back">&larr; Instructor Dashboard</Link>
        <h1 className="ss-welcome" style={{ margin: "10px 0 4px" }}>{data.course.title}</h1>
        <p style={{ color: "var(--st-text-muted)", marginBottom: "1.75rem", fontSize: 14 }}>
          {data.students.length} enrolled student{data.students.length === 1 ? "" : "s"}
        </p>

        {data.students.length === 0 ? (
          <p style={{ color: "var(--st-text-muted)", fontSize: 14 }}>No one has enrolled yet.</p>
        ) : (
          <div className="ss-roster">
            <div className="ss-roster-head">
              <span>Student</span>
              <span>Progress</span>
              <span>Last active</span>
            </div>
            {data.students.map((s) => (
              <div key={s.email} className="ss-roster-row">
                <div>
                  <p className="ss-roster-name">{s.name}</p>
                  <p className="ss-roster-email">{s.email}</p>
                </div>
                <div>
                  <div className="ss-progress-track" style={{ margin: "4px 0" }}>
                    <div className="ss-progress-fill" style={{ width: `${s.percentComplete}%` }} />
                  </div>
                  <span className="ss-roster-percent">{s.unitsCompleted}/{s.totalUnits} units &middot; {s.percentComplete}%</span>
                </div>
                <span className="ss-roster-date">
                  {s.lastAccessed ? new Date(s.lastAccessed).toLocaleDateString() : "—"}
                </span>
              </div>
            ))}
          </div>
        )}

        <section className="ss-section" style={{ marginTop: "2rem" }}>
          <h2 className="ss-section-title">Announcements</h2>
          <form onSubmit={handlePost} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input
              className="ss-instr-input"
              style={{ flex: 1 }}
              placeholder="Post an update to everyone enrolled..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button className="ss-resume-btn" disabled={posting} type="submit">
              {posting ? "Posting..." : "Post"}
            </button>
          </form>

          {announcements === null ? (
            <p style={{ color: "var(--st-text-muted)", fontSize: 13 }}>Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p style={{ color: "var(--st-text-muted)", fontSize: 13 }}>No announcements posted yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {announcements.map((a) => (
                <div key={a.id} className="ss-continue-card">
                  <p style={{ fontSize: 13, color: "var(--st-cream)" }}>{a.message}</p>
                  <p style={{ fontSize: 11, color: "var(--st-text-muted)", marginTop: 6 }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>
        {`
          .ss-roster { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 16px; overflow: hidden; }
          .ss-roster-head { display: grid; grid-template-columns: 1fr 1fr 100px; gap: 16px; padding: 12px 20px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--st-text-muted); border-bottom: 1px solid var(--st-border); }
          .ss-roster-row { display: grid; grid-template-columns: 1fr 1fr 100px; gap: 16px; align-items: center; padding: 14px 20px; border-bottom: 1px solid var(--st-border); }
          .ss-roster-row:last-child { border-bottom: none; }
          .ss-roster-name { font-size: 13.5px; color: var(--st-cream); font-weight: 600; }
          .ss-roster-email { font-size: 11.5px; color: var(--st-text-muted); margin-top: 1px; }
          .ss-roster-percent { font-size: 11px; color: var(--st-text-muted); }
          .ss-roster-date { font-size: 12px; color: var(--st-text-muted); }
          .ss-instr-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--st-border); color: var(--st-cream); border-radius: 8px; padding: 9px 12px; font-size: 13px; font-family: var(--font-body); }
          @media (max-width: 640px) { .ss-roster-head { display: none; } .ss-roster-row { grid-template-columns: 1fr; gap: 6px; } }
        `}
      </style>
    </AppLayout>
  );
}
