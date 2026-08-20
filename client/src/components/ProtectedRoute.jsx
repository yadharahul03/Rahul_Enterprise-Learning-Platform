import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wrap any route element that requires a logged-in user.
// Usage: <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Wait for the sessionStorage check to finish before deciding —
  // otherwise a refresh on /dashboard briefly bounces logged-in users to /login.
  if (loading) {
    return null; // or a small spinner/loading component if you have one
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}