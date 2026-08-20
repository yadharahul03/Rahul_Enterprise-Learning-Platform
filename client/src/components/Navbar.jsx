import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  const links = [
    { href: '#explore', label: 'Explore' },
    { href: '#learn', label: 'Learn' },
    { href: '#track', label: 'Track' },
    { href: '#analytics', label: 'Analytics' },
    { href: '#connect', label: 'Connect' },
  ];

  return (
    <nav className="navbar">
      <a href="#explore" className="navbar-brand">
        <Logo width={28} height={28} animated={true} />
        Enterprise Learning
      </a>
      <ul className="navbar-links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
      {isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Link to="/courses" className="navbar-link-btn">Courses</Link>
          <Link to="/dashboard" className="navbar-link-btn">Dashboard</Link>
          <Link to="/profile" className="navbar-link-btn">Profile</Link>
          <button className="navbar-cta" onClick={logout}>Sign out</button>
        </div>
      ) : (
        <Link to="/login" className="navbar-cta">Sign in / Sign up</Link>
      )}
      <style>
        {`
          .navbar { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; justify-content: space-between; padding: 1.1rem 6vw; background: rgba(10, 14, 39, 0.7); backdrop-filter: blur(18px) saturate(140%); -webkit-backdrop-filter: blur(18px) saturate(140%); border-bottom: 1px solid var(--contour); }
          :root[data-theme='light'] .navbar { background: rgba(255, 255, 255, 0.75); }
          .navbar-brand { font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; letter-spacing: -0.01em; display: flex; align-items: center; gap: 0.6rem; text-decoration: none; color: inherit; }
          .navbar-links { display: flex; gap: 2rem; list-style: none; }
          .navbar-links a { font-family: var(--font-body); font-weight: 500; font-size: 0.88rem; color: var(--chalk-dim); transition: color 0.2s ease; text-decoration: none; }
          .navbar-links a:hover { color: var(--chalk); }
          .navbar-link-btn { font-family: var(--font-body); font-size: 0.85rem; font-weight: 500; color: var(--chalk-dim); padding: 0.5rem 0.9rem; border-radius: 999px; transition: all 0.2s ease; text-decoration: none; }
          .navbar-link-btn:hover { color: var(--chalk); background: var(--ridge-light); }
          .navbar-cta { font-family: var(--font-body); font-size: 0.85rem; font-weight: 600; border: none; border-radius: 999px; padding: 0.6rem 1.35rem; color: #fff; background: var(--gradient-primary); box-shadow: 0 4px 18px rgba(124, 108, 246, 0.35); transition: transform 0.15s ease, box-shadow 0.15s ease; text-decoration: none; cursor: pointer; }
          .navbar-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(124, 108, 246, 0.5); }
          @media (max-width: 860px) { .navbar-links { display: none; } }
        `}
      </style>
    </nav>
  );
}