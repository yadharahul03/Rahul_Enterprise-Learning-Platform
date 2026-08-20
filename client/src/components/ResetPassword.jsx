import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import './Auth.css';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!token) {
      setError('This reset link is missing its token. Please request a new one.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.post('/auth/reset-password', { token, newPassword });
      setMessage(typeof data === 'string' ? data : (data.message || 'Password reset successfully!'));
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Almost there</p>
        <h1>Set a <em>new password</em></h1>
        <p className="auth-sub">Choose a new password for your account.</p>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-message">{message} Redirecting to login...</div>}

        {!token && !error && (
          <div className="auth-error">
            No reset token found in this link. Please use the link from your email, or{' '}
            <Link to="/forgot-password">request a new one</Link>.
          </div>
        )}

        <label>New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          required
          minLength={6}
        />

        <label>Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          required
          minLength={6}
        />

        <button type="submit" className="submit-btn" disabled={loading || !token}>
          {loading ? 'Resetting...' : 'Reset password →'}
        </button>

        <p className="auth-switch">
          <Link to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
