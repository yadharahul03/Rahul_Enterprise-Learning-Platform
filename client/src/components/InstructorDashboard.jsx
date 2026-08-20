import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import { SkeletonGrid } from "./Skeleton";
import "./Dashboard.css";

const EMPTY_FORM = { title: "", category: "", totalUnits: "", description: "" };

export default function InstructorDashboard() {
  const { token } = useAuth();
  const { showToast } = useToast();

  const [overview, setOverview] = useState(null);
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [ovData, coursesData] = await Promise.all([
        api.get("/instructor/overview"),
        api.get("/instructor/courses"),
      ]);
      setOverview(ovData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message || "Could not load your instructor dashboard.");
    }
  };

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (course) => {
    setEditingId(course.id);
    setForm({
      title: course.title,
      category: course.category,
      totalUnits: String(course.totalUnits),
      description: course.description || "",
    });
    setShowForm(true);
  };

  const togglePublished = async (course) => {
    try {
      await api.put(`/instructor/courses/${course.id}`, { published: !course.published });
      showToast?.(course.published ? "Course set to draft" : "Course published", "success");
      await load();
    } catch (err) {
      showToast?.(err.message || "Could not update course", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/instructor/courses/${editingId}`, {
          title: form.title,
          category: form.category,
          totalUnits: Number(form.totalUnits),
          description: form.description,
        });
      } else {
        await api.post("/instructor/courses", {
          title: form.title,
          category: form.category,
          totalUnits: Number(form.totalUnits),
          description: form.description,
        });
      }
      showToast?.(editingId ? "Course updated" : "Course created", "success");
      setShowForm(false);
      await load();
    } catch (err) {
      showToast?.(err.message || "Could not save course", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.title}"? This can't be undone.`)) return;
    try {
      await api.delete(`/instructor/courses/${course.id}`);
      showToast?.("Course deleted", "success");
      await load();
    } catch (err) {
      showToast?.(err.message || "Could not delete course", "error");
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="ss-dashboard">{error}</div>
      </AppLayout>
    );
  }

  if (!overview || !courses) {
    return (
      <AppLayout>
        <div className="ss-dashboard">
          <h1 className="ss-welcome" style={{ marginBottom: "1.5rem" }}>Instructor Dashboard</h1>
          <SkeletonGrid count={3} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="ss-dashboard">
        <div className="ss-header">
          <div>
            <h1 className="ss-welcome">Instructor Dashboard</h1>
            <p className="ss-streak">Manage your courses and track student progress</p>
          </div>
          <button className="ss-resume-btn" onClick={openCreate}>+ New course</button>
        </div>

        <div className="ss-stats-grid">
          <div className="ss-stat-card">
            <p className="ss-stat-value">{overview.totalCourses}</p>
            <p className="ss-stat-label">Courses</p>
          </div>
          <div className="ss-stat-card">
            <p className="ss-stat-value">{overview.totalStudents}</p>
            <p className="ss-stat-label">Total students</p>
          </div>
          <div className="ss-stat-card">
            <p className="ss-stat-value">{overview.avgCompletion}%</p>
            <p className="ss-stat-label">Avg. completion</p>
          </div>
        </div>

        {showForm && (
          <div className="ss-instr-form-card">
            <h2 className="ss-section-title">{editingId ? "Edit course" : "Create a new course"}</h2>
            <form onSubmit={handleSubmit} className="ss-instr-form">
              <div>
                <label className="ss-instr-label">Title</label>
                <input
                  className="ss-instr-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Advanced React Patterns"
                  required
                />
              </div>
              <div>
                <label className="ss-instr-label">Category</label>
                <input
                  className="ss-instr-input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Frontend"
                  required
                />
              </div>
              <div>
                <label className="ss-instr-label">Total units</label>
                <input
                  className="ss-instr-input"
                  type="number"
                  min="1"
                  value={form.totalUnits}
                  onChange={(e) => setForm({ ...form, totalUnits: e.target.value })}
                  required
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="ss-instr-label">Description</label>
                <textarea
                  className="ss-instr-input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What will students learn in this course?"
                />
              </div>
              <div className="ss-instr-form-actions">
                <button type="submit" className="ss-resume-btn" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create course"}
                </button>
                <button type="button" className="ss-instr-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <section className="ss-section">
          <h2 className="ss-section-title">Your courses</h2>
          {courses.length === 0 ? (
            <p style={{ color: "var(--st-text-muted)", fontSize: 14 }}>
              You haven't created any courses yet. Click "New course" to get started.
            </p>
          ) : (
            <div className="ss-course-grid">
              {courses.map((c) => (
                <div key={c.id} className="ss-course-card">
                  <div className="ss-course-card-top">
                    <span className="ss-course-tag">{c.category}</span>
                    <span style={{ fontSize: 11, color: "var(--st-text-muted)" }}>{c.studentCount} students</span>
                  </div>
                  <h4 className="ss-course-title">{c.title}</h4>
                  <p className="ss-course-percent">{c.totalUnits} units</p>
                  <button
                    className="ss-instr-status-pill"
                    data-published={c.published}
                    onClick={() => togglePublished(c)}
                    title="Click to toggle"
                  >
                    {c.published ? "\u25CF Published" : "\u25CB Draft"}
                  </button>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="ss-instr-small-btn" onClick={() => openEdit(c)}>Edit</button>
                    <button className="ss-instr-small-btn ss-instr-danger" onClick={() => handleDelete(c)}>Delete</button>
                  </div>
                  <Link to={`/instructor/courses/${c.id}/students`} className="ss-course-details-link">
                    View students &rarr;
                  </Link>
                  <Link to={`/instructor/courses/${c.id}/lessons`} className="ss-course-details-link">
                    Manage lessons &rarr;
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>
        {`
          .ss-instr-form-card { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 18px; padding: 22px; margin-bottom: 2rem; backdrop-filter: blur(20px) saturate(140%); box-shadow: 0 8px 30px rgba(6,8,30,0.4); }
          .ss-instr-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; align-items: end; }
          .ss-instr-label { display: block; font-size: 12px; color: var(--st-text-muted); margin-bottom: 5px; }
          .ss-instr-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--st-border); color: var(--st-cream); border-radius: 8px; padding: 9px 12px; font-size: 13px; font-family: var(--font-body); }
          .ss-instr-form-actions { display: flex; gap: 10px; grid-column: 1 / -1; }
          .ss-instr-cancel { background: transparent; border: 1px solid var(--st-border); color: var(--st-text-muted); border-radius: 999px; padding: 8px 16px; font-size: 12.5px; }
          .ss-instr-small-btn { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid var(--st-border); color: var(--st-cream); border-radius: 8px; padding: 6px; font-size: 12px; font-weight: 600; }
          .ss-instr-small-btn:hover { border-color: rgba(124,108,246,0.4); }
          .ss-instr-danger { color: #F87171; }
          .ss-instr-danger:hover { border-color: rgba(248,113,113,0.4); }
          .ss-instr-status-pill { display: inline-block; margin-top: 6px; font-size: 10.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; border: 1px solid var(--st-border); color: var(--st-text-muted); background: transparent; }
          .ss-instr-status-pill[data-published="true"] { color: var(--st-sage); border-color: rgba(34,211,238,0.35); }
        `}
      </style>
    </AppLayout>
  );
}
