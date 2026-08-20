import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";

export default function VerifyCertificate() {
  const { certNumber } = useParams();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const body = await api.get(`/public/certificates/verify/${certNumber}`);
        setCert(body.data || body);
      } catch (err) {
        setError(err.message || "Certificate verification failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, [certNumber]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        <p className="eyebrow">Enterprise Learning Registry</p>
        <h1>Official Certificate <em>Verification</em></h1>

        {loading && <p style={{ color: "var(--st-text-muted)" }}>Verifying certificate record...</p>}

        {error && (
          <div className="auth-error" style={{ marginTop: 20 }}>
            ❌ {error}
          </div>
        )}

        {cert && (
          <div className="verify-details">
            <div className="verify-badge">✓ VERIFIED AUTHENTIC</div>
            <h2>{cert.userName}</h2>
            <p className="verify-course">Has successfully completed <strong>{cert.courseTitle}</strong></p>
            <div className="verify-meta">
              <div>
                <span className="label">Verification ID</span>
                <span className="val">{cert.certificateNumber}</span>
              </div>
              <div>
                <span className="label">Issue Date</span>
                <span className="val">{cert.formattedIssueDate}</span>
              </div>
              <div>
                <span className="label">Completion Criteria</span>
                <span className="val">100% Units Completed</span>
              </div>
            </div>
          </div>
        )}

        <p style={{ marginTop: 24, textAlign: "center" }}>
          <Link to="/" style={{ color: "var(--st-orange-light)", textDecoration: "none", fontSize: 13 }}>
            &larr; Back to Enterprise Learning
          </Link>
        </p>
      </div>

      <style>
        {`
          .verify-page { min-height: 100vh; background: var(--st-forest-deep); display: flex; align-items: center; justify-content: center; padding: 20px; color: var(--st-cream); font-family: var(--font-body); }
          .verify-card { width: 100%; max-width: 600px; background: var(--st-forest-card); border: 1px solid var(--st-border); border-radius: 24px; padding: 36px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); backdrop-filter: blur(20px); }
          .verify-card h1 { font-family: var(--font-display); font-weight: 800; font-size: 26px; margin: 6px 0 16px; }
          .verify-badge { display: inline-block; background: rgba(34,211,238,0.15); border: 1px solid var(--st-sage); color: var(--st-sage); padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 16px; }
          .verify-details h2 { font-family: var(--font-display); font-size: 24px; margin-bottom: 4px; }
          .verify-course { color: var(--st-text-muted); font-size: 14px; margin-bottom: 20px; }
          .verify-meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--st-border); padding: 16px; border-radius: 14px; }
          .verify-meta .label { display: block; font-size: 10.5px; text-transform: uppercase; color: var(--st-text-muted); letter-spacing: 0.08em; margin-bottom: 4px; }
          .verify-meta .val { font-family: var(--font-mono); font-size: 12.5px; color: var(--st-cream); font-weight: 600; }
        `}
      </style>
    </div>
  );
}
