import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import AppLayout from "./AppLayout";
import "./Dashboard.css";

export default function Certificate() {
  const { courseId } = useParams();
  const { token } = useAuth();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const body = await api.get(`/certificates/course/${courseId}`);
        setCert(body.data || body);
      } catch (err) {
        setError(err.message || "Could not load your certificate.");
      }
    })();
  }, [token, courseId]);

  if (error) {
    return (
      <AppLayout>
        <div className="ss-dashboard">
          <p style={{ color: "#F87171", fontSize: 14 }}>⚠️ {error}</p>
          <Link to="/my-learning" className="ss-resume-btn" style={{ marginTop: 16, display: "inline-block", textDecoration: "none" }}>
            &larr; Back to My Learning
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (!cert) {
    return (
      <AppLayout>
        <div className="ss-dashboard">Generating official certificate of completion...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="ss-dashboard" style={{ maxWidth: 900 }}>
        <Link to="/my-learning" className="ss-cd-back">&larr; My Learning</Link>

        <div className="ss-cert">
          <div className="ss-cert-inner">
            <div className="ss-cert-mark" />
            <p className="ss-cert-eyebrow">Certificate of Completion</p>
            <h1 className="ss-cert-name">{cert.userName}</h1>
            <p className="ss-cert-line">has successfully completed</p>
            <h2 className="ss-cert-course">{cert.courseTitle}</h2>
            <p className="ss-cert-line">{cert.totalUnits} units &middot; awarded {cert.formattedIssueDate}</p>
            <p className="ss-cert-number">Verification ID: {cert.certificateNumber}</p>
            <div className="ss-cert-footer">
              <div>
                <p className="ss-cert-sig">Enterprise Learning</p>
                <p className="ss-cert-sig-label">Official issuing platform</p>
              </div>
              <div className="ss-cert-seal">SS</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="ss-resume-btn" onClick={() => window.print()}>Print / Save as PDF</button>
          <a
            href={cert.verifyUrl}
            target="_blank"
            rel="noreferrer"
            className="ss-instr-cancel"
            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
          >
            Verify Certificate &rarr;
          </a>
        </div>
      </div>

      <style>
        {`
          .ss-cert { margin-top: 20px; padding: 3px; border-radius: 24px; background: linear-gradient(135deg, #7C6CF6, #22D3EE); }
          .ss-cert-inner { background: var(--st-forest-deep); border-radius: 22px; padding: 60px 50px; text-align: center; position: relative; overflow: hidden; }
          .ss-cert-inner::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 50% 0%, rgba(124,108,246,0.16), transparent 60%); pointer-events: none; }
          .ss-cert-mark { width: 46px; height: 46px; border-radius: 50%; margin: 0 auto 18px; background: linear-gradient(135deg, #7C6CF6, #A78BFA 50%, #22D3EE); box-shadow: 0 0 24px rgba(124,108,246,0.6); }
          .ss-cert-eyebrow { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--st-sage); margin-bottom: 18px; }
          .ss-cert-name { font-family: var(--font-display); font-weight: 800; font-size: 34px; margin-bottom: 8px; }
          .ss-cert-line { color: var(--st-text-muted); font-size: 13px; margin-bottom: 6px; }
          .ss-cert-number { font-family: var(--font-mono); font-size: 11.5px; color: var(--st-orange-light); margin-top: 10px; }
          .ss-cert-course { font-family: var(--font-display); font-weight: 700; font-size: 22px; margin: 10px 0 14px; background: linear-gradient(135deg, #A78BFA, #22D3EE); -webkit-background-clip: text; background-clip: text; color: transparent; }
          .ss-cert-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 44px; padding-top: 20px; border-top: 1px solid var(--st-border); text-align: left; }
          .ss-cert-sig { font-family: var(--font-display); font-weight: 700; font-size: 15px; }
          .ss-cert-sig-label { font-size: 11px; color: var(--st-text-muted); margin-top: 2px; }
          .ss-cert-seal { width: 46px; height: 46px; border-radius: 50%; border: 2px solid var(--st-sage); color: var(--st-sage); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; font-family: var(--font-display); }
          @media print {
            html, body { height: auto !important; background: #0A0E27 !important; }
            .ss-shell aside, .ss-shell button, .ss-cd-back { display: none !important; }
            .ss-shell {
              display: block !important;
              min-height: 0 !important;
              background: #0A0E27 !important;
            }
            .ss-content {
              margin-left: 0 !important;
              min-height: 0 !important;
            }
            .ss-dashboard { max-width: none !important; }
            .ss-cert {
              margin-top: 0 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .ss-cert-inner {
              background: #0A0E27 !important;
              color: #F2F3FC !important;
            }
            .ss-cert-inner::before { display: none !important; }
            .ss-cert-name, .ss-cert-line, .ss-cert-number, .ss-cert-sig, .ss-cert-sig-label {
              color: #F2F3FC !important;
              -webkit-text-fill-color: #F2F3FC !important;
            }
            .ss-cert-course {
              background: none !important;
              -webkit-background-clip: unset !important;
              background-clip: unset !important;
              -webkit-text-fill-color: #A78BFA !important;
              color: #A78BFA !important;
            }
            .ss-cert-seal { color: #22D3EE !important; border-color: #22D3EE !important; }
          }
        `}
      </style>
    </AppLayout>
  );
}
