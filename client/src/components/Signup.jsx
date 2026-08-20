import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './Auth.css';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [adminSecretKey, setAdminSecretKey] = useState('');
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

    if (role === 'ADMIN' && !adminSecretKey.trim()) {
      setError('Admin registration requires a valid Admin Secret Passkey.');
      setLoading(false);
      return;
    }

    try {
      const payload = await api.post('/auth/register', {
        name,
        email,
        password,
        phoneNumber,
        dateOfBirth: dateOfBirth || null,
        gender,
        location,
        role,
        adminSecretKey: role === 'ADMIN' ? adminSecretKey : undefined,
      });

      if (payload.token) {
        const confirmedRole = await login(payload.token, payload.user);
        const finalRole = confirmedRole || role;
        if (finalRole === 'ADMIN') {
          navigate('/admin');
        } else if (finalRole === 'INSTRUCTOR') {
          navigate('/instructor');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Pending approval message for instructor
        setError('Registration submitted! Account pending Admin approval.');
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
        <p className="eyebrow">Create your route</p>
        <h1>Join <em>Enterprise Learning</em></h1>
        <p className="auth-sub">Start your personalized learning journey.</p>

        {error && <div className="auth-error">{error}</div>}

        <button type="button" className="google-btn" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C33.6 6 29 4 24 4 12.9 4 4 12.9 4 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C33.6 6 29 4 24 4c-7.4 0-13.8 4.2-17.1 10.3z"/>
            <path fill="#4CAF50" d="M24 44c5 0 9.4-1.7 12.9-4.6l-6-5c-2 1.4-4.6 2.2-6.9 2.2-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.9 39.8 16.4 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6 5C40.5 35.6 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        <label>I am signing up as a...</label>
        <div className="role-picker">
          <button
            type="button"
            className={`role-option ${role === 'STUDENT' ? 'is-active' : ''}`}
            onClick={() => setRole('STUDENT')}
          >
            🎓 Student
          </button>
          <button
            type="button"
            className={`role-option ${role === 'INSTRUCTOR' ? 'is-active' : ''}`}
            onClick={() => setRole('INSTRUCTOR')}
          >
            🧑‍🏫 Instructor
          </button>
          <button
            type="button"
            className={`role-option ${role === 'ADMIN' ? 'is-active' : ''}`}
            onClick={() => setRole('ADMIN')}
          >
            🔒 Admin
          </button>
        </div>

        {role === 'ADMIN' && (
          <div style={{ margin: "10px 0" }}>
            <label style={{ color: "var(--st-orange-light)", fontWeight: 600 }}>🔒 Admin Passkey Security Required</label>
            <input
              type="password"
              value={adminSecretKey}
              onChange={(e) => setAdminSecretKey(e.target.value)}
              placeholder="Enter Admin Secret Passkey"
              required
            />
          </div>
        )}

        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />

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
          placeholder="Create password"
          required
          minLength={6}
        />

        <label>Phone number</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter your phone number"
        />

        <label>Date of birth</label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />

        <label>Gender</label>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Prefer not to say</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </select>

        <label>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
        />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>

        <p className="auth-switch">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
