import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import { SkeletonGrid } from "./Skeleton";
import "./Dashboard.css";

const FILTERS = ["All", "In progress", "Completed", "Not started"];

function statusOf(course) {
  if (course.percentComplete >= 100) return "Completed";
  if (course.percentComplete > 0) return "In progress";
  return "Not started";
}

export default function MyLearning() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const body = await api.get("/dashboard/enrollments");
        setData(body);
      } catch {
        setError("Could not load your learning. Is the backend running?");
      }
    })();
  }, [token]);

  const courses = data?.enrolledCourses || [];
  const filtered =
    filter === "All" ? courses : courses.filter((c) => statusOf(c) === filter);

  return (
    <AppLayout>
      <div className="ss-dashboard">
        <h1 className="ss-welcome" style={{ marginBottom: "0.4rem" }}>My Learning</h1>
        <p style={{ color: "var(--st-text-muted)", marginBottom: "1.75rem", fontSize: "14px" }}>
          Every route you've started, at whatever elevation you left it.
        </p>

        {error && <div className="ss-dashboard">{error}</div>}

        {!error && !data && <SkeletonGrid count={4} />}

        {data && (
          <>
            <div className="ss-learn-tabs">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  className={`ss-learn-tab ${filter === f ? "is-active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {data.continueLearning?.length > 0 && filter === "All" && (
              <section className="ss-section">
                <h2 className="ss-section-title">Pick up where you left off</h2>
                <div className="ss-continue-grid">
                  {data.continueLearning.map((c) => (
                    <div className="ss-continue-card" key={c.id}>
                      <div className="ss-continue-top">
                        <h4 className="ss-continue-title">{c.title}</h4>
                        <span className="ss-continue-last">{c.lastAccessed}</span>
                      </div>
                      <div className="ss-progress-track">
                        <div className="ss-progress-fill" style={{ width: `${c.percentComplete}%` }} />
                      </div>
                      <div className="ss-continue-bottom">
                        <span>{c.unitsCompleted}/{c.unitsTotal} units</span>
                        <Link to={`/courses/${c.courseId ?? c.id}/learn`} className="ss-resume-btn" style={{ textDecoration: "none" }}>
                          Resume trail
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="ss-section">
              <h2 className="ss-section-title">
                {filter === "All" ? "All enrolled courses" : filter}
              </h2>
              {filtered.length === 0 ? (
                <p style={{ color: "var(--st-text-muted)", fontSize: "14px" }}>
                  Nothing here yet.
                </p>
              ) : (
                <div className="ss-course-grid">
                  {filtered.map((c) => (
                    <div className="ss-course-card" key={c.id}>
                      <div className="ss-course-card-top">
                        <span className="ss-course-tag">{c.category}</span>
                        {c.percentComplete === 100 && <span className="ss-course-done">Summit reached</span>}
                      </div>
                      <h4 className="ss-course-title">{c.title}</h4>
                      <div className="ss-progress-track">
                        <div className="ss-progress-fill" style={{ width: `${c.percentComplete}%` }} />
                      </div>
                      <p className="ss-course-percent">{c.percentComplete}% complete</p>
                      <Link
                        to={`/courses/${c.courseId ?? c.id}/learn`}
                        className="ss-resume-btn"
                        style={{ marginTop: "10px", display: "block", textAlign: "center", textDecoration: "none" }}
                      >
                        {c.percentComplete === 100 ? "Review" : "Continue"}
                      </Link>
                      {c.percentComplete === 100 && (
                        <Link
                          to={`/certificate/${c.courseId ?? c.id}`}
                          style={{ display: "block", textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--st-sage)", textDecoration: "none" }}
                        >
                          🎓 View certificate
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <style>
        {`
          .ss-learn-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.75rem; flex-wrap: wrap; }
          .ss-learn-tab { font-family: var(--font-body); font-size: 0.82rem; font-weight: 600; color: var(--st-text-muted); background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 999px; padding: 0.5rem 1.1rem; transition: all 0.18s ease; }
          .ss-learn-tab:hover { color: var(--st-cream); border-color: rgba(124, 108, 246, 0.4); }
          .ss-learn-tab.is-active { color: #fff; background: linear-gradient(135deg, #7C6CF6, #22D3EE); border-color: transparent; }
        `}
      </style>
    </AppLayout>
  );
}
