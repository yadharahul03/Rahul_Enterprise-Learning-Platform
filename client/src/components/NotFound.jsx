import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="ss-404">
      <div className="ss-404-mark" />
      <p className="ss-404-code">404</p>
      <h1>You've wandered off the trail</h1>
      <p className="ss-404-sub">This page doesn't exist, or it moved somewhere new.</p>
      <Link to="/" className="ss-404-btn">Back to base camp</Link>

      <style>
        {`
          .ss-404 { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem; background: var(--ink); color: var(--chalk); }
          .ss-404-mark { width: 46px; height: 46px; border-radius: 50%; margin-bottom: 22px; background: var(--gradient-primary); box-shadow: 0 0 30px rgba(124,108,246,0.6); }
          .ss-404-code { font-family: var(--font-mono); font-size: 13px; letter-spacing: 0.2em; color: var(--sage); margin-bottom: 10px; }
          .ss-404 h1 { font-family: var(--font-display); font-weight: 800; font-size: clamp(1.6rem, 4vw, 2.4rem); margin-bottom: 10px; }
          .ss-404-sub { color: var(--chalk-dim); margin-bottom: 26px; }
          .ss-404-btn { background: var(--gradient-primary); color: #fff; padding: 0.75rem 1.6rem; border-radius: 999px; font-weight: 600; font-size: 0.9rem; box-shadow: 0 4px 18px rgba(124,108,246,0.35); }
        `}
      </style>
    </div>
  );
}
