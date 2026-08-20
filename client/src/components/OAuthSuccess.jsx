import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // prevents React StrictMode's double-invoke from wiping the redirect
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      login(token);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [login, navigate]);

  return (
    <div className="oauth-success-page">
      <div className="oauth-spinner" aria-hidden="true" />
      <p>Signing you in…</p>
      <style>{`
        .oauth-success-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          color: var(--chalk-dim);
          font-family: var(--font-body);
          font-size: 0.95rem;
        }
        .oauth-spinner {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid rgba(124, 108, 246, 0.2);
          border-top-color: var(--orange);
          animation: oauth-spin 0.8s linear infinite;
        }
        @keyframes oauth-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .oauth-spinner { animation: none; }
        }
      `}</style>
    </div>
  );
}