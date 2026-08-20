import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getCourseExtras, formatStudents } from "../data/courseCatalogExtras";
import AppLayout from "./AppLayout";
import { SkeletonBar } from "./Skeleton";
import "./Dashboard.css";

import api from "../api/client";

function Stars({ rating, size = 14 }) {
  const full = Math.round(rating * 2) / 2;
  return (
    <span className="ss-stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= Math.round(full) ? "is-full" : "is-empty"}>★</span>
      ))}
    </span>
  );
}

function useWishlist() {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sp_wishlist") || "[]");
    } catch {
      return [];
    }
  });
  const toggle = (id) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("sp_wishlist", JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  };
  return { ids, toggle, has: (id) => ids.includes(id) };
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const { showToast } = useToast();
  const wishlist = useWishlist();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [openSection, setOpenSection] = useState("sec-0");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const found = await api.get(`/courses/${courseId}`);
        setCourse(found);
      } catch {
        setError("Could not load this course. Is the backend running?");
      }
    })();
  }, [token, courseId]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      showToast?.(`Enrolled in ${course.title}`, "success");
      setCourse((c) => ({ ...c, enrolled: true }));
    } catch (err) {
      showToast?.(err.message || "Enroll failed", "error");
    } finally {
      setEnrolling(false);
    }
  };

  if (error) {
    return (
      <AppLayout>
        <div className="ss-dashboard">{error}</div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="ss-dashboard">
          <SkeletonBar height={20} width="40%" />
          <SkeletonBar height={40} width="70%" style={{ marginTop: 16 }} />
          <SkeletonBar height={200} style={{ marginTop: 24, borderRadius: 18 }} />
        </div>
      </AppLayout>
    );
  }

  const extras = getCourseExtras(course);
  const description = course.description && course.description.trim() ? course.description : extras.description;
  const instructor = course.instructorName
    ? {
        name: course.instructorName,
        title: "Course Instructor",
        initials: course.instructorName
          .split(" ")
          .map((p) => p[0])
          .slice(0, 2)
          .join("")
          .toUpperCase(),
      }
    : extras.instructor;
  const saved = wishlist.has(course.id);

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1100 }}>
        <Link to="/courses" className="ss-cd-back">&larr; All routes</Link>

        <div className="ss-cd-layout">
          <div className="ss-cd-main">
            <span className="ss-course-tag">{course.category}</span>
            <h1 className="ss-cd-title">{course.title}</h1>
            <p className="ss-cd-desc">{description}</p>

            <div className="ss-cd-meta">
              <span className="ss-cd-rating"><Stars rating={course.rating || extras.rating} /> {course.rating || extras.rating}</span>
              <span>({extras.reviewCount} reviews)</span>
              <span>{formatStudents(course.studentCount || extras.students)} students</span>
              <span className="ss-cd-level">{course.difficulty || extras.level}</span>
            </div>
            <p className="ss-cd-updated">Duration: {course.durationHours || 20} hours &middot; {course.totalUnits} units</p>

            <section className="ss-section" style={{ marginTop: 28 }}>
              <h2 className="ss-section-title">What you'll learn</h2>
              <div className="ss-cd-learn-grid">
                {extras.learnPoints.map((p, i) => (
                  <div key={i} className="ss-cd-learn-item">
                    <span className="ss-cd-check">✓</span>{p}
                  </div>
                ))}
              </div>
            </section>

            <section className="ss-section">
              <h2 className="ss-section-title">Curriculum</h2>
              <div className="ss-cd-curriculum">
                {extras.curriculum.map((sec) => (
                  <div key={sec.id} className="ss-cd-sec">
                    <button className="ss-cd-sec-head" onClick={() => setOpenSection(openSection === sec.id ? "" : sec.id)}>
                      <span>{sec.title}</span>
                      <span className="ss-cd-sec-meta">
                        {sec.lessons.length} units
                        <span className={`ss-cd-chevron ${openSection === sec.id ? "is-open" : ""}`}>&rsaquo;</span>
                      </span>
                    </button>
                    {openSection === sec.id && (
                      <div className="ss-cd-sec-body">
                        {sec.lessons.map((l) => (
                          <div key={l.id} className="ss-cd-lesson">
                            <span>&#9654; {l.title}</span>
                            <span className="ss-cd-lesson-min">{l.minutes} min</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="ss-section">
              <h2 className="ss-section-title">Instructor</h2>
              <div className="ss-cd-instructor">
                <div className="ss-avatar">{instructor.initials}</div>
                <div>
                  <p className="ss-continue-title" style={{ marginBottom: 2 }}>{instructor.name}</p>
                  <p className="ss-cd-updated" style={{ margin: 0 }}>{instructor.title}</p>
                </div>
              </div>
            </section>

            <section className="ss-section">
              <h2 className="ss-section-title">Student reviews</h2>
              <div className="ss-cd-reviews">
                {extras.reviews.map((r, i) => (
                  <div key={i} className="ss-cd-review">
                    <div className="ss-cd-review-head">
                      <strong>{r.name}</strong>
                      <Stars rating={r.rating} size={12} />
                    </div>
                    <p>{r.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="ss-cd-side">
            <div className="ss-cd-card">
              <p className="ss-cd-price">&#8377;{course.priceINR ?? extras.priceINR}</p>
              {course.enrolled ? (
                <Link to={`/courses/${course.id}/learn`} className="ss-resume-btn" style={{ display: "block", textAlign: "center", textDecoration: "none", width: "100%" }}>
                  Continue learning
                </Link>
              ) : (
                <button className="ss-resume-btn" style={{ width: "100%" }} disabled={enrolling} onClick={handleEnroll}>
                  {enrolling ? "Enrolling..." : "Enroll now"}
                </button>
              )}
              <button className={`ss-cd-wishlist-btn ${saved ? "is-saved" : ""}`} onClick={() => wishlist.toggle(course.id)}>
                {saved ? "♥ Saved to wishlist" : "♡ Save to wishlist"}
              </button>
              <ul className="ss-cd-includes">
                <li>{course.totalUnits} units, self-paced</li>
                <li>Certificate of completion</li>
                <li>Full lifetime access</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <style>
        {`
          .ss-cd-back { display: inline-block; margin-bottom: 18px; font-size: 13px; color: var(--st-text-muted); }
          .ss-cd-back:hover { color: var(--st-cream); }
          .ss-cd-layout { display: grid; grid-template-columns: 1fr 300px; gap: 40px; align-items: start; }
          .ss-cd-title { font-family: var(--font-display); font-weight: 800; font-size: 30px; margin: 10px 0 12px; letter-spacing: -0.01em; }
          .ss-cd-desc { color: var(--st-text-muted); font-size: 14px; max-width: 62ch; line-height: 1.6; }
          .ss-cd-meta { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 14px; font-size: 13px; color: var(--st-text-muted); }
          .ss-cd-rating { color: var(--st-cream); font-weight: 600; display: flex; align-items: center; gap: 6px; }
          .ss-cd-level { background: rgba(124,108,246,0.14); color: var(--st-orange-light); padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
          .ss-cd-updated { font-size: 12px; color: var(--st-text-muted); margin-top: 8px; }
          .ss-stars .is-full { color: #FBBF24; }
          .ss-stars .is-empty { color: var(--st-border); }
          .ss-cd-learn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 16px; padding: 18px 20px; }
          .ss-cd-learn-item { display: flex; gap: 8px; font-size: 13px; color: var(--st-cream); align-items: flex-start; }
          .ss-cd-check { color: var(--st-sage); font-weight: 700; }
          .ss-cd-curriculum { display: flex; flex-direction: column; gap: 8px; }
          .ss-cd-sec { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 12px; overflow: hidden; }
          .ss-cd-sec-head { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 13px 16px; background: transparent; border: none; color: var(--st-cream); font-size: 13.5px; font-weight: 600; }
          .ss-cd-sec-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--st-text-muted); font-weight: 400; }
          .ss-cd-chevron { display: inline-block; transition: transform 0.2s ease; transform: rotate(90deg); font-size: 16px; }
          .ss-cd-chevron.is-open { transform: rotate(-90deg); }
          .ss-cd-sec-body { border-top: 1px solid var(--st-border); }
          .ss-cd-lesson { display: flex; justify-content: space-between; padding: 10px 16px; font-size: 12.5px; color: var(--st-text-muted); }
          .ss-cd-lesson-min { flex-shrink: 0; }
          .ss-cd-instructor { display: flex; align-items: center; gap: 14px; background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 16px; padding: 16px 18px; }
          .ss-cd-reviews { display: flex; flex-direction: column; gap: 10px; }
          .ss-cd-review { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 14px; padding: 14px 18px; }
          .ss-cd-review-head { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: var(--st-cream); }
          .ss-cd-review p { font-size: 13px; color: var(--st-text-muted); line-height: 1.55; margin: 0; }
          .ss-cd-side { position: sticky; top: 24px; }
          .ss-cd-card { background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 18px; padding: 22px; backdrop-filter: blur(20px) saturate(140%); box-shadow: 0 8px 30px rgba(6,8,30,0.4); }
          .ss-cd-price { font-family: var(--font-display); font-weight: 800; font-size: 26px; margin-bottom: 14px; color: var(--st-cream); }
          .ss-cd-wishlist-btn { width: 100%; margin-top: 10px; background: transparent; border: 1px solid var(--st-border); color: var(--st-text-muted); border-radius: 999px; padding: 9px; font-size: 12.5px; font-weight: 600; transition: all 0.2s ease; }
          .ss-cd-wishlist-btn:hover { border-color: rgba(124,108,246,0.4); color: var(--st-cream); }
          .ss-cd-wishlist-btn.is-saved { color: #F472B6; border-color: rgba(244,114,182,0.4); }
          .ss-cd-includes { list-style: none; padding: 0; margin: 18px 0 0; display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; color: var(--st-text-muted); }
          .ss-cd-includes li::before { content: "\\2022"; color: var(--st-sage); margin-right: 8px; }
          @media (max-width: 820px) {
            .ss-cd-layout { grid-template-columns: 1fr; }
            .ss-cd-learn-grid { grid-template-columns: 1fr; }
            .ss-cd-side { position: static; }
          }
        `}
      </style>
    </AppLayout>
  );
}