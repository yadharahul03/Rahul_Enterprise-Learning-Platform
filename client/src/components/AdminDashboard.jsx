import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import { SkeletonGrid } from "./Skeleton";
import "./Dashboard.css";

export default function AdminDashboard() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const [courses, setCourses] = useState([]);
  const [approvingCourseId, setApprovingCourseId] = useState(null);

  const loadAdminData = async () => {
    try {
      const [dashBody, usersBody, coursesBody] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
        api.get("/courses"),
      ]);

      setDashboard(dashBody.data || dashBody);
      setUsers(usersBody.data || usersBody);
      setCourses(Array.isArray(coursesBody) ? coursesBody : coursesBody.data || []);
    } catch {
      setError("Access denied or server unreachable. Requires ADMIN role.");
    }
  };

  useEffect(() => {
    if (token) loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const pendingInstructors = users.filter((u) => u.role === "INSTRUCTOR" && !u.active);

  const handleToggleActive = async (userId, currentActive, isInstructorPending) => {
    setTogglingId(userId);
    try {
      await api.put(`/admin/users/${userId}/toggle-active`, {});
      
      const msg = isInstructorPending
        ? "Instructor approved & activated successfully!"
        : currentActive
          ? "User account disabled"
          : "User account enabled";
      
      showToast?.(msg, "success");
      await loadAdminData();
    } catch (err) {
      showToast?.(err.message || "Failed to update user status", "error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleApproveCourse = async (courseId, currentPublished) => {
    setApprovingCourseId(courseId);
    try {
      await api.put(`/instructor/courses/${courseId}`, { published: !currentPublished });
      showToast?.(currentPublished ? "Course set to draft/unpublished" : "Course approved & published to Student Catalog!", "success");
      await loadAdminData();
    } catch (err) {
      showToast?.(err.message || "Failed to update course status", "error");
    } finally {
      setApprovingCourseId(null);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="ss-dashboard">{error}</div>
      </AppLayout>
    );
  }

  if (!dashboard) {
    return (
      <AppLayout>
        <div className="ss-dashboard">
          <h1 className="ss-welcome" style={{ marginBottom: "1.5rem" }}>Admin Command Center</h1>
          <SkeletonGrid count={4} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="ss-dashboard">
        <div className="ss-header">
          <div>
            <h1 className="ss-welcome">Admin Command Center</h1>
            <p className="ss-streak">Platform telemetry, instructor verification queue, and course approval management</p>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="ss-stats-grid">
          <div className="ss-stat-card">
            <p className="ss-stat-value">{dashboard.totalUsers}</p>
            <p className="ss-stat-label">Total Users</p>
          </div>
          <div className="ss-stat-card">
            <p className="ss-stat-value">{dashboard.totalStudents}</p>
            <p className="ss-stat-label">Students</p>
          </div>
          <div className="ss-stat-card">
            <p className="ss-stat-value">{dashboard.totalInstructors}</p>
            <p className="ss-stat-label">Mentors / Instructors</p>
          </div>
          <div className="ss-stat-card">
            <p className="ss-stat-value">{courses.length}</p>
            <p className="ss-stat-label">Total Courses</p>
          </div>
          <div className="ss-stat-card">
            <p className="ss-stat-value">&#8377;{dashboard.totalRevenueINR ? dashboard.totalRevenueINR.toLocaleString() : 0}</p>
            <p className="ss-stat-label">Estimated Revenue</p>
          </div>
        </div>

        {/* Pending Instructor Approval Section */}
        {pendingInstructors.length > 0 && (
          <section className="ss-section" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 16, padding: 20 }}>
            <h2 className="ss-section-title" style={{ color: "var(--st-orange-light)", display: "flex", alignItems: "center", gap: 8 }}>
              ⚠️ Pending Instructor Verification Queue ({pendingInstructors.length})
            </h2>
            <p style={{ fontSize: 13, color: "var(--st-text-muted)", marginBottom: 14 }}>
              The following instructors signed up and require Admin verification before publishing courses:
            </p>

            <div style={{ overflowX: "auto" }}>
              <table className="ss-admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Instructor Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingInstructors.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.name}</strong></td>
                      <td>{u.email}</td>
                      <td><span className="ss-status-disabled">Pending Approval</span></td>
                      <td>
                        <button
                          className="ss-resume-btn"
                          style={{ padding: "6px 14px", fontSize: 12 }}
                          disabled={togglingId === u.id}
                          onClick={() => handleToggleActive(u.id, u.active, true)}
                        >
                          {togglingId === u.id ? "Approving..." : "✓ Approve & Activate Instructor"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* All Top Performing Courses */}
        <section className="ss-section">
          <h2 className="ss-section-title">Top Performing Courses</h2>
          <div className="ss-course-grid">
            {dashboard.topCourses.map((c) => (
              <div key={c.id} className="ss-course-card">
                <span className="ss-course-tag">{c.category}</span>
                <h4 className="ss-course-title">{c.title}</h4>
                <p className="ss-course-percent">{c.studentCount} enrolled students</p>
              </div>
            ))}
          </div>
        </section>

        {/* Complete User Roster */}
        <section className="ss-section">
          <h2 className="ss-section-title">User Roster & Access Control</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="ss-admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className="ss-role-pill"
                        style={{
                          background:
                            u.role === "ADMIN"
                              ? "rgba(34,211,238,0.2)"
                              : u.role === "INSTRUCTOR"
                              ? "rgba(249,115,22,0.2)"
                              : "rgba(124,108,246,0.2)",
                          color:
                            u.role === "ADMIN"
                              ? "#22D3EE"
                              : u.role === "INSTRUCTOR"
                              ? "#F97316"
                              : "#A78BFA",
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>{u.provider}</td>
                    <td>
                      {u.active ? (
                        <span className="ss-status-active">Active</span>
                      ) : (
                        <span className="ss-status-disabled">
                          {u.role === "INSTRUCTOR" ? "Pending Approval" : "Disabled"}
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="ss-instr-small-btn"
                        disabled={togglingId === u.id}
                        onClick={() => handleToggleActive(u.id, u.active, false)}
                      >
                        {togglingId === u.id
                          ? "Updating..."
                          : u.active
                          ? "Disable"
                          : "Enable / Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <style>
          {`
            .ss-admin-table { width: 100%; border-collapse: collapse; margin-top: 12px; background: var(--st-forest-card); border-radius: 14px; overflow: hidden; border: 1px solid var(--st-border); }
            .ss-admin-table th, .ss-admin-table td { padding: 12px 16px; text-align: left; font-size: 13px; border-bottom: 1px solid var(--st-border); }
            .ss-admin-table th { background: rgba(255,255,255,0.03); color: var(--st-text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
            .ss-role-pill { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; }
            .ss-status-active { color: var(--st-sage); font-weight: 600; }
            .ss-status-disabled { color: #F87171; font-weight: 600; }
          `}
        </style>
      </div>
    </AppLayout>
  );
}
