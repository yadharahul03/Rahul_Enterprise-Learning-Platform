import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const data = await api.post('/auth/forgot-password', { email });
      setMessage(typeof data === 'string' ? data : (data.message || 'Password reset link sent! Check your email.'));
    } catch (err) {
      setError(err.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Lost your way?</p>
        <h1>Reset <em>password</em></h1>
        <p className="auth-sub">
          Enter the email you signed up with, and we'll send you a link to reset your password.
        </p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-message">{message}</div>}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link →'}
        </button>

        <p className="auth-switch">
          Remembered your password? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
