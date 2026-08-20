import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getCourseExtras } from "../data/courseCatalogExtras";
import AppLayout from "./AppLayout";
import { SkeletonGrid } from "./Skeleton";
import "./Dashboard.css";

import api from "../api/client";

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

const SORTS = ["Most popular", "Highest rated", "Newest", "A–Z"];

export default function Courses() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const wishlist = useWishlist();

  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [sort, setSort] = useState(SORTS[0]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const loadCourses = async () => {
    try {
      const data = await api.get("/courses");
      setCourses(data);
    } catch {
      setError("Could not load courses. Is the backend running?");
    }
  };

  useEffect(() => {
    if (token) loadCourses();
  }, [token]);

  const handleEnroll = async (course) => {
    setEnrollingId(course.id);
    try {
      await api.post(`/courses/${course.id}/enroll`);
      showToast?.(`Enrolled in ${course.title}`, "success");
      await loadCourses();
    } catch (err) {
      showToast?.(err.message || "Enrollment failed", "error");
    } finally {
      setEnrollingId(null);
    }
  };

  const enriched = useMemo(
    () => (courses || []).map((c) => ({ ...c, ...getCourseExtras(c) })),
    [courses]
  );

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(enriched.map((c) => c.category)))],
    [enriched]
  );

  const filtered = useMemo(() => {
    let list = enriched;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }
    if (category !== "All") list = list.filter((c) => c.category === category);
    if (level !== "All") list = list.filter((c) => c.level === level);
    if (showSavedOnly) list = list.filter((c) => wishlist.has(c.id));

    list = [...list];
    if (sort === "Highest rated") list.sort((a, b) => b.rating - a.rating);
    else if (sort === "Newest") list.sort((a, b) => b.id - a.id);
    else if (sort === "A–Z") list.sort((a, b) => a.title.localeCompare(b.title));
    else list.sort((a, b) => b.students - a.students);

    return list;
  }, [enriched, query, category, level, showSavedOnly, sort, wishlist]);

  if (error) {
    return (
      <AppLayout>
        <div className="ss-dashboard">{error}</div>
      </AppLayout>
    );
  }

  if (!courses) {
    return (
      <AppLayout>
        <div className="ss-dashboard">
          <h1 className="ss-welcome" style={{ marginBottom: "1.5rem" }}>All routes</h1>
          <SkeletonGrid count={6} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="ss-dashboard">
        <h1 className="ss-welcome" style={{ marginBottom: "0.4rem" }}>All routes</h1>
        <p style={{ color: "var(--st-text-muted)", marginBottom: "1.5rem", fontSize: 14 }}>
          {filtered.length} of {courses.length} courses
        </p>

        <div className="ss-courses-toolbar">
          <input
            className="ss-courses-search"
            type="text"
            placeholder="Search courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="ss-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="ss-select" value={level} onChange={(e) => setLevel(e.target.value)}>
            {["All", "Beginner", "Intermediate", "Advanced"].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <select className="ss-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            className={`ss-learn-tab ${showSavedOnly ? "is-active" : ""}`}
            onClick={() => setShowSavedOnly((v) => !v)}
          >
            ♥ Saved
          </button>
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: "var(--st-text-muted)", fontSize: 14 }}>No courses match those filters.</p>
        ) : (
          <div className="ss-course-grid">
            {filtered.map((c) => {
              const saved = wishlist.has(c.id);
              return (
                <div key={c.id} className="ss-course-card ss-course-card-rich">
                  <div className="ss-course-card-top">
                    <span className="ss-course-tag">{c.category}</span>
                    <button
                      className={`ss-wishlist-heart ${saved ? "is-saved" : ""}`}
                      onClick={() => wishlist.toggle(c.id)}
                      aria-label="Toggle wishlist"
                    >
                      {saved ? "♥" : "♡"}
                    </button>
                  </div>
                  <Link to={`/courses/${c.id}`} className="ss-course-title-link">
                    <h4 className="ss-course-title">{c.title}</h4>
                  </Link>
                  <div className="ss-course-rating-row">
                    <span className="ss-course-stars">★ {c.rating}</span>
                    <span className="ss-course-reviewcount">({c.reviewCount})</span>
                    <span className="ss-course-level-pill">{c.level}</span>
                  </div>
                  <p className="ss-course-percent">{c.totalUnits} units &middot; &#8377;{c.priceINR}</p>
                  {c.enrolled ? (
                    <Link
                      to={`/courses/${c.id}/learn`}
                      className="ss-resume-btn"
                      style={{ marginTop: "10px", width: "100%", display: "block", textAlign: "center", textDecoration: "none" }}
                    >
                      Continue learning
                    </Link>
                  ) : (
                    <button
                      className="ss-resume-btn"
                      style={{ marginTop: "10px", width: "100%" }}
                      disabled={enrollingId === c.id}
                      onClick={() => handleEnroll(c)}
                    >
                      {enrollingId === c.id ? "Enrolling..." : "Enroll"}
                    </button>
                  )}
                  <Link to={`/courses/${c.id}`} className="ss-course-details-link">View details &rarr;</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>
        {`
          .ss-courses-toolbar { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 1.75rem; }
          .ss-courses-search { flex: 1; min-width: 180px; background: var(--st-forest-card); border: 1px solid var(--st-border); color: var(--st-cream); border-radius: 10px; padding: 9px 14px; font-size: 13px; font-family: var(--font-body); }
          .ss-courses-search::placeholder { color: var(--st-text-muted); }
          .ss-course-card-rich { position: relative; }
          .ss-wishlist-heart { background: transparent; border: none; font-size: 16px; color: var(--st-text-muted); line-height: 1; padding: 0; }
          .ss-wishlist-heart.is-saved { color: #F472B6; }
          .ss-course-title-link { text-decoration: none; }
          .ss-course-title-link:hover .ss-course-title { color: var(--st-orange-light); }
          .ss-course-rating-row { display: flex; align-items: center; gap: 6px; font-size: 12px; margin: 2px 0; }
          .ss-course-stars { color: #FBBF24; font-weight: 600; }
          .ss-course-reviewcount { color: var(--st-text-muted); }
          .ss-course-level-pill { margin-left: auto; background: rgba(124,108,246,0.14); color: var(--st-orange-light); padding: 2px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 600; }
          .ss-course-details-link { display: block; text-align: center; margin-top: 8px; font-size: 12px; color: var(--st-text-muted); text-decoration: none; }
          .ss-course-details-link:hover { color: var(--st-cream); }
        `}
      </style>
    </AppLayout>
  );
}
