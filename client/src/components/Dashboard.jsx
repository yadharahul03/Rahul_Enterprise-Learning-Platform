import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import { SkeletonGrid } from "./Skeleton";
import "./Dashboard.css";

function Initials({ name }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return <div className="ss-avatar">{initials}</div>;
}

function StatCard({ label, value, sublabel }) {
  return (
    <div className="ss-stat-card">
      <p className="ss-stat-value">{value}</p>
      <p className="ss-stat-label">{label}</p>
      {sublabel && <p className="ss-stat-sublabel">{sublabel}</p>}
    </div>
  );
}

function ProgressBar({ percent }) {
  return (
    <div className="ss-progress-track">
      <div className="ss-progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

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

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${
    height - padding
  } L ${points[0][0]} ${height - padding} Z`;

  return (
    <div className="ss-elevation-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="ss-elevation-svg"
        role="img"
        aria-label="Weekly learning activity"
      >
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

function CourseCard({ course }) {
  return (
    <div className="ss-course-card">
      <div className="ss-course-card-top">
        <span className="ss-course-tag">{course.category}</span>
        {course.percentComplete === 100 && (
          <span className="ss-course-done">Summit reached</span>
        )}
      </div>
      <h4 className="ss-course-title">{course.title}</h4>
      <ProgressBar percent={course.percentComplete} />
      <p className="ss-course-percent">{course.percentComplete}% complete</p>
      <Link
        to={`/courses/${course.courseId}/learn`}
        className="ss-resume-btn"
        style={{
          marginTop: "10px",
          display: "block",
          textAlign: "center",
          textDecoration: "none",
        }}
      >
        {course.percentComplete === 100 ? "Review" : "Continue"}
      </Link>
    </div>
  );
}

function ContinueCard({ course }) {
  return (
    <div className="ss-continue-card">
      <div className="ss-continue-top">
        <h4 className="ss-continue-title">{course.title}</h4>
        <span className="ss-continue-last">{course.lastAccessed}</span>
      </div>
      <ProgressBar percent={course.percentComplete} />
      <div className="ss-continue-bottom">
        <span>
          {course.unitsCompleted}/{course.unitsTotal} units
        </span>
        <Link
          to={`/courses/${course.courseId}/learn`}
          className="ss-resume-btn"
          style={{ textDecoration: "none" }}
        >
          Resume trail
        </Link>
      </div>
    </div>
  );
}

function AchievementBadge({ achievement }) {
  return (
    <div className={`ss-badge ${achievement.earned ? "earned" : "locked"}`}>
      <div className="ss-badge-icon">{achievement.iconUrl || (achievement.earned ? "★" : "○")}</div>
      <p className="ss-badge-title">{achievement.name || achievement.title}</p>
      <p className="ss-badge-desc">{achievement.description}</p>
    </div>
  );
}

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [error, setError] = useState("");
  const [announcements, setAnnouncements] = useState(null);

  const loadDashboard = async () => {
    try {
      const [summary, enrollments, bData] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/enrollments"),
        api.get("/badges/my-badges").catch(() => []),
      ]);

      if (bData) {
        setBadges(Array.isArray(bData) ? bData : (bData.data || []));
      }

      setData({ ...summary, ...enrollments });
    } catch (err) {
      setError("Could not load your dashboard. Is the backend running?");
    }
  };

  const loadAnnouncements = async () => {
    try {
      const list = await api.get("/announcements");
      setAnnouncements(list);
    } catch {
      // Non-critical
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboard();
      loadAnnouncements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="ss-dashboard">
          <SkeletonGrid count={4} />
        </div>
      </AppLayout>
    );
  }

  const { user, stats, weeklyActivity } = data;
  const completionPercent = Math.round((stats.unitsCompleted / Math.max(1, stats.unitsTotal)) * 100);
  const displayBadges = badges.length > 0 ? badges : data.achievements;

  return (
    <AppLayout>
      <div className="ss-dashboard">
        <div className="ss-header">
          <div className="ss-header-left">
            <Initials name={user.name} />
            <div>
              <h1 className="ss-welcome">Welcome back, {user.name.split(" ")[0]}</h1>
              <p className="ss-streak">{user.streakDays}-day streak on the trail</p>
            </div>
          </div>
        </div>

        {announcements && announcements.length > 0 && (
          <section className="ss-section">
            <h2 className="ss-section-title">Announcements</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="ss-continue-card">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <span className="ss-course-tag">{a.courseTitle}</span>
                    <span className="ss-continue-last">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--st-cream)", marginTop: 8 }}>{a.message}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="ss-stats-grid">
          <StatCard label="Courses enrolled" value={stats.coursesEnrolled} />
          <StatCard label="Courses completed" value={stats.coursesCompleted} />
          <StatCard
            label="Units completed"
            value={`${stats.unitsCompleted}/${stats.unitsTotal}`}
            sublabel={`${completionPercent}% overall`}
          />
          <StatCard label="Hours this week" value={stats.hoursThisWeek} />
        </div>

        <section className="ss-section">
          <h2 className="ss-section-title">This week's climb</h2>
          <ElevationChart data={weeklyActivity} />
        </section>

        <section className="ss-section">
          <h2 className="ss-section-title">Continue learning</h2>
          <div className="ss-continue-grid">
            {data.continueLearning.map((c) => (
              <ContinueCard key={c.id} course={c} />
            ))}
          </div>
        </section>

        <section className="ss-section">
          <h2 className="ss-section-title">All enrolled courses</h2>
          <div className="ss-course-grid">
            {data.enrolledCourses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>

        <section className="ss-section">
          <h2 className="ss-section-title">Achievements & Badges</h2>
          <div className="ss-badge-grid">
            {displayBadges.map((a, i) => (
              <AchievementBadge key={a.id || i} achievement={a} />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}