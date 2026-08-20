import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import api from "../api/client";

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadInternships = async () => {
    try {
      setLoading(true);
      const list = await api.get("/internships");
      setInternships(list || []);
    } catch (err) {
      console.error("Failed to load internships:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

  const filtered = internships.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.company.toLowerCase().includes(search.toLowerCase()) ||
      (i.location && i.location.toLowerCase().includes(search.toLowerCase())) ||
      (i.description && i.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1150 }}>
        <div className="ss-header" style={{ marginBottom: "1.25rem" }}>
          <div>
            <h1 className="ss-welcome">💼 Internship Matchmaker</h1>
            <p className="ss-streak">Explore curated developer and designer internship openings. Apply directly to career links.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            className="ss-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search roles, companies, location, or programming topics..."
            style={{ width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: "0.95rem" }}
          />
        </div>

        {loading ? (
          <p style={{ color: "var(--st-text-muted)" }}>Loading internships...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--st-text-muted)" }}>No internship listings available right now.</p>
        ) : (
          /* Internship Cards Grid */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }}>
            {filtered.map((item) => (
              <div key={item.id} className="ss-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: "0 0 2px 0", fontSize: "1.1rem" }}>{item.title}</h3>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "2px 6px", borderRadius: 4 }}>
                      {item.type || "REMOTE"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#3b82f6", fontWeight: 600, marginBottom: 10 }}>{item.company}</div>

                  <div style={{ fontSize: "0.82rem", color: "var(--st-text-muted)", display: "flex", gap: 16, marginBottom: 12 }}>
                    <span>📍 Location: {item.location}</span>
                    <span>📅 Posted: {new Date(item.postedAt).toLocaleDateString()}</span>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "var(--st-text-muted)", lineHeight: 1.5, marginBottom: 14 }}>{item.description}</p>
                </div>

                <a
                  href={item.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ss-resume-btn"
                  style={{ display: "block", textAlign: "center", textDecoration: "none", width: "100%", padding: 10 }}
                >
                  Apply via Official Careers Portal &rarr;
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
