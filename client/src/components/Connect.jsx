import { useAuth } from '../context/AuthContext';

export default function Connect() {
  const { isAuthenticated, logout } = useAuth();

  const handleGoogleLogin = () => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    const backendRoot = apiBase.replace(/\/api\/?$/, '');
    window.location.href = `${backendRoot}/oauth2/authorization/google`;
  };

  return (
    <section id="connect" className="section connect">
      <div className="connect-inner">
        <p className="eyebrow">Connect — basecamp registration</p>

        {isAuthenticated ? (
          <>
            <h2>You're <em>on the trail.</em></h2>
            <p>You're signed in — ready to keep climbing.</p>
            <button className="google-btn" onClick={logout}>Sign out</button>
          </>
        ) : (
          <>
            <h2>Ready to <em>start climbing?</em></h2>
            <p>Sign in with Google — no forms, no passwords, one route to the top.</p>
            <button className="google-btn" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.6 6 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.6 6 29 4 24 4c-7.4 0-13.8 4.2-17.1 10.3z"/>
                <path fill="#4CAF50" d="M24 44c5 0 9.4-1.7 12.9-4.6l-6-5c-2 1.4-4.6 2.2-6.9 2.2-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.9 39.8 16.4 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6 5C40.5 35.6 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z"/>
              </svg>
              Continue with Google
            </button>
          </>
        )}

        <div className="connect-footer">
          <span>© {new Date().getFullYear()} Enterprise Learning</span>
          <span>Basecamp Elevation 0m</span>
        </div>
      </div>

      <style>{`
        .connect {
          text-align: center;
        }
        .connect-inner {
          max-width: 520px;
          margin: 0 auto;
        }
        .connect h2 {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: clamp(2rem, 4vw, 3rem);
          letter-spacing: -0.02em;
          margin: 0.75rem 0 1rem;
        }
        .connect h2 em {
          font-style: normal;
          background: var(--gradient-text);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .connect > .eyebrow { justify-content: center; }
        .connect-inner > p:not(.eyebrow) {
          color: var(--chalk-dim);
          margin-bottom: 2.5rem;
        }
        .google-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--chalk);
          color: var(--ink);
          border: none;
          border-radius: 999px;
          padding: 0.9rem 1.75rem;
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 600;
          box-shadow: 0 8px 26px rgba(124, 108, 246, 0.25);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(124, 108, 246, 0.4);
        }
        .connect-footer {
          margin-top: 4rem;
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: var(--chalk-dim);
          opacity: 0.6;
        }
      `}</style>
    </section>
  );
}