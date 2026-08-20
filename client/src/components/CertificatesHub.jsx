import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import api from "../api/client";

export default function CertificatesHub() {
  const [activeTab, setActiveTab] = useState("BADGES");
  const [badges, setBadges] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bData, cData] = await Promise.all([
        api.get("/badges/my-badges").catch(() => []),
        api.get("/certificates/my-certificates").catch(() => []),
      ]);
      setBadges(bData || []);
      setCertificates(cData || []);
    } catch (err) {
      console.error("Failed to load badges/certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const earnedBadgesCount = badges.filter((b) => b.earned).length;

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 1100 }}>
        <div className="ss-header" style={{ marginBottom: "1.25rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--st-emerald)", fontWeight: 700 }}>
              ACADEMIC CREDENTIALS & ACHIEVEMENTS
            </span>
            <h1 className="ss-welcome">🏆 Certificates & Module Badges Hub</h1>
            <p className="ss-streak">Track your official Enterprise Learning badges awarded for course progress & achievements and claim master course certificates.</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="ss-schedule-tabs" style={{ marginBottom: 20 }}>
          <button className={`ss-learn-tab ${activeTab === "BADGES" ? "is-active" : ""}`} onClick={() => setActiveTab("BADGES")}>
            🎖️ Enterprise Learning Badges ({earnedBadgesCount}/{badges.length})
          </button>
          <button className={`ss-learn-tab ${activeTab === "CERTIFICATES" ? "is-active" : ""}`} onClick={() => setActiveTab("CERTIFICATES")}>
            📜 Master Course Certificates ({certificates.length})
          </button>
        </div>

        {loading ? (
          <p style={{ color: "var(--st-text-muted)" }}>Loading credentials...</p>
        ) : activeTab === "BADGES" ? (
          /* Module Badges View */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem" }}>
            {badges.map((b) => (
              <div key={b.id} className="ss-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "1.5rem 1rem", opacity: b.earned ? 1 : 0.6 }}>
                <div style={{ fontSize: "3.5rem", marginBottom: 10 }}>{b.iconUrl || (b.earned ? "🏆" : "🔒")}</div>
                <span className="ss-badge-tech">{b.code}</span>
                <h3 style={{ margin: "10px 0 6px 0", fontSize: "1.05rem", textAlign: "center" }}>{b.name}</h3>
                <p style={{ fontSize: "0.82rem", color: "var(--st-text-muted)", textAlign: "center", marginBottom: 16 }}>{b.description}</p>
                {b.earned ? (
                  <button className="ss-resume-btn" onClick={() => setSelectedBadge(b)} style={{ width: "100%", fontSize: "0.82rem" }}>
                    View Badge Medallion →
                  </button>
                ) : (
                  <button className="ss-chip" disabled style={{ width: "100%", fontSize: "0.82rem", opacity: 0.6 }}>
                    🔒 LOCKED (EARN via ACTIVITY)
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Master Certificates View */
          certificates.length === 0 ? (
            <p style={{ color: "var(--st-text-muted)" }}>No certificates earned yet. Complete 100% of a course to generate your official certificate!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {certificates.map((c) => (
                <div key={c.id} className="ss-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, background: "var(--st-emerald-glow)", color: "#fff", padding: "3px 8px", borderRadius: 4 }}>
                      MASTER COURSE CERTIFICATE
                    </span>
                    <h3 style={{ margin: "10px 0 4px 0", fontSize: "1.15rem" }}>{c.courseTitle}</h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--st-text-muted)", margin: 0 }}>
                      Student: <strong>{c.studentName}</strong> • ID: <strong>{c.certificateNumber}</strong> • Issued: {new Date(c.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="ss-resume-btn" onClick={() => setSelectedCert(c)} style={{ padding: "10px 20px" }}>
                    View Certificate →
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Badge Medallion Popup Modal */}
        {selectedBadge && (
          <div className="ss-modal-overlay" onClick={() => setSelectedBadge(null)}>
            <div className="ss-modal-card" style={{ width: 420, background: "#0a2e22", border: "2px solid #10b981", color: "#fff" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ border: "2px solid #f59e0b", padding: 20, borderRadius: 12, background: "rgba(16, 185, 129, 0.1)", textAlign: "center" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#f59e0b", letterSpacing: "0.1em" }}>⭐ OFFICIAL STUDENT ACHIEVEMENT</span>
                <h2 style={{ margin: "10px 0 4px 0", color: "#fff", fontSize: "1.3rem" }}>SKILLSPHERE NEXUS</h2>
                <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 700 }}>ACADEMIC ACHIEVEMENT BADGE</div>
                <div style={{ fontSize: "3rem", margin: "12px 0" }}>{selectedBadge.iconUrl || "🏆"}</div>
                <div style={{ margin: "12px 0", padding: "8px", background: "rgba(0,0,0,0.3)", borderRadius: 6, fontWeight: 700, color: "#fff" }}>
                  {selectedBadge.name}
                </div>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.8)", marginBottom: 12 }}>{selectedBadge.description}</p>
                <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.7)" }}>
                  Earned: {new Date(selectedBadge.earnedAt).toLocaleString()} • Verified Enterprise Learning Medallion
                </div>
              </div>

              <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="ss-resume-btn" style={{ flex: 1 }} onClick={() => window.print()}>
                  🖨️ Print Badge Certificate
                </button>
                <button className="ss-chip" onClick={() => setSelectedBadge(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Master Certificate Popup Modal */}
        {selectedCert && (
          <div className="ss-modal-overlay" onClick={() => setSelectedCert(null)}>
            <div className="ss-modal-card" style={{ width: 620, background: "#ffffff", color: "#1e293b", border: "8px solid #0f766e" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ border: "2px solid #0f766e", padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0f766e", letterSpacing: "0.12em" }}>SKILLSPHERE NEXUS ACADEMY OF DIGITAL EXCELLENCE</div>
                <h1 style={{ margin: "12px 0 4px 0", fontFamily: "serif", color: "#0f766e", fontSize: "1.8rem" }}>Certificate of Completion</h1>
                <p style={{ fontSize: "0.82rem", color: "#64748b" }}>THIS IS TO CERTIFY THAT</p>
                <h2 style={{ margin: "8px 0 16px 0", color: "#0f766e", fontSize: "1.6rem", textDecoration: "underline" }}>{selectedCert.studentName}</h2>
                <p style={{ fontSize: "0.85rem", color: "#334155", maxWidth: 480, margin: "0 auto 16px auto", lineHeight: 1.5 }}>
                  has successfully fulfilled all curriculum requirements, demonstrating full mastery across 100% of lectures, course modules, assessment quizzes, and capstone assignments for
                </p>
                <h3 style={{ fontSize: "1.1rem", color: "#0f766e", margin: "0 0 16px 0" }}>{selectedCert.courseTitle}</h3>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px dashed #cbd5e1" }}>
                  <div style={{ textAlign: "left", fontSize: "0.75rem" }}>
                    <strong>Enterprise Learning Governance Board</strong><br />
                    Academic Governance Board
                  </div>
                  <div style={{ border: "2px solid #0f766e", padding: "4px 8px", borderRadius: 4, fontSize: "0.7rem", fontWeight: 800, color: "#0f766e" }}>
                    VERIFIED CERTIFICATE<br />ID: {selectedCert.certificateNumber}
                  </div>
                  <div style={{ textAlign: "right", fontSize: "0.75rem" }}>
                    <strong>{selectedCert.issueDate ? new Date(selectedCert.issueDate).toLocaleDateString() : "2026"}</strong><br />
                    Issue Date
                  </div>
                </div>
              </div>

              <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
                <button className="ss-resume-btn" onClick={() => window.print()} style={{ background: "#0f766e" }}>
                  🖨️ Download / Print Master Certificate
                </button>
                <button className="ss-chip" onClick={() => setSelectedCert(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ss-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
        .ss-modal-card { background: var(--st-bg, #121824); border-radius: 12px; padding: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }

        @media print {
          html, body { height: auto !important; background: #ffffff !important; }
          body * { visibility: hidden !important; }
          .ss-modal-card, .ss-modal-card * { visibility: visible !important; }
          .ss-modal-card {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-width: 2px !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </AppLayout>
  );
}
