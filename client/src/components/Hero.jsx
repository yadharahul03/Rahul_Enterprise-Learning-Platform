import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <header id="explore" className="hero">
      <div className="hero-glow hero-glow-a" aria-hidden="true" />
      <div className="hero-glow hero-glow-b" aria-hidden="true" />

      <div className="hero-orbit" aria-hidden="true">
        <svg viewBox="0 0 800 800" fill="none">
          <defs>
            <linearGradient id="orbitLine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#7C6CF6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
            <radialGradient id="orbitCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C6CF6" stopOpacity="0" />
            </radialGradient>
          </defs>
          {[120, 200, 280, 360].map((r, i) => (
            <circle
              key={r}
              cx="560" cy="360" r={r}
              stroke="url(#orbitLine)"
              strokeWidth="1"
              strokeDasharray="2 8"
              opacity={0.55 - i * 0.1}
            />
          ))}
          <circle cx="560" cy="360" r="90" fill="url(#orbitCore)" opacity="0.5" />
          {[
            [560, 270], [680, 340], [640, 470], [470, 470], [430, 340], [560, 450],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 5 ? 5 : 3.5} fill={i % 2 ? '#22D3EE' : '#C084FC'} />
          ))}
          <circle cx="560" cy="360" r="5" fill="#fff" />
        </svg>
      </div>

      <div className="hero-content">
        <p className="eyebrow">Now boarding — cohort 04</p>
        <h1>
          Bridge learning<br />
          to <em>ready.</em>
        </h1>
        <p className="hero-copy">
          Enterprise Learning maps the route from where you are to where the
          workforce needs you — real skills, real progress, tracked as you grow.
        </p>
        <div className="hero-actions">
          <Link to="/login" className="btn btn-primary">Get started — it's free</Link>
          <a href="#track" className="btn btn-outline">See how it works</a>
        </div>
        <div className="hero-coords">Trusted by learners building careers in tech</div>
      </div>

      <style>{`
        .hero {
          position: relative;
          padding: 6rem 6vw 7rem;
          overflow: hidden;
          min-height: 88vh;
          display: flex;
          align-items: center;
        }
        .hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .hero-glow-a { width: 480px; height: 480px; top: -120px; left: -80px; background: radial-gradient(circle, rgba(124,108,246,0.35), transparent 70%); }
        .hero-glow-b { width: 420px; height: 420px; bottom: -140px; right: -60px; background: radial-gradient(circle, rgba(34,211,238,0.22), transparent 70%); }
        .hero-orbit {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          opacity: 0.85;
          pointer-events: none;
          animation: hero-orbit-spin 90s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-orbit { animation: none; }
        }
        @keyframes hero-orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .hero-orbit svg {
          width: 100%;
          height: 100%;
        }
        .hero-content {
          position: relative;
          z-index: 1;
          max-width: 640px;
        }
        .hero h1 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(2.6rem, 6vw, 4.4rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 1.25rem 0 1.5rem;
        }
        .hero h1 em {
          font-style: normal;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hero-copy {
          font-size: 1.15rem;
          color: var(--chalk-dim);
          max-width: 46ch;
          margin-bottom: 2.5rem;
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .btn {
          font-family: var(--font-body);
          font-size: 0.92rem;
          font-weight: 600;
          padding: 0.9rem 1.7rem;
          border: 1px solid transparent;
          border-radius: 999px;
          transition: all 0.2s ease;
        }
        .btn-primary {
          background: var(--gradient-primary);
          color: #fff;
          box-shadow: 0 6px 26px rgba(124, 108, 246, 0.4);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(124, 108, 246, 0.55);
        }
        .btn-outline {
          border-color: var(--contour);
          color: var(--chalk);
          background: var(--ridge);
          backdrop-filter: blur(10px);
        }
        .btn-outline:hover {
          border-color: var(--orange);
          color: #fff;
          background: var(--ridge-light);
        }
        .hero-coords {
          margin-top: 3rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          color: var(--chalk-dim);
          opacity: 0.7;
        }
        @media (max-width: 720px) {
          .hero { min-height: auto; padding: 3.5rem 6vw 4rem; }
        }
      `}</style>
    </header>
  );
}