import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGoogleLogin = () => {
    const backendRoot = api.baseUrl.replace(/\/api\/?$/, '');
    window.location.href = `${backendRoot}/oauth2/authorization/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = await api.post('/auth/login', { email, password });
      const role = await login(payload.token, payload.user);
      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'INSTRUCTOR') {
        navigate('/instructor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Access your route</p>
        <h1>Welcome <em>back</em></h1>
        <p className="auth-sub">Continue your learning journey and track your progress.</p>

        {error && <div className="auth-error">{error}</div>}

        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.6 6 29 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.6 6 29 4 24 4c-7.4 0-13.8 4.2-17.1 10.3z"/>
            <path fill="#4CAF50" d="M24 44c5 0 9.4-1.7 12.9-4.6l-6-5c-2 1.4-4.6 2.2-6.9 2.2-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.9 39.8 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6 5C40.5 35.6 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <p style={{ textAlign: 'right', marginTop: '0.5rem' }}>
          <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--chalk-dim)' }}>
            Forgot password?
          </Link>
        </p>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login →'}
        </button>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
