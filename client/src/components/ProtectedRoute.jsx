import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ProtectedRoute({ roles, page, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="screen">
        <p className="muted">Your role ({user.role}) doesn't have access to this page.</p>
      </div>
    );
  }
  // Page access: admins always see everything; older cached sessions with no
  // pages array (pre-this-feature) also pass through rather than lock out.
  if (page && user.role !== 'admin' && Array.isArray(user.pages) && !user.pages.includes(page)) {
    return (
      <div className="screen">
        <p className="muted">You don't have access to this page. Ask an admin to enable it for your account.</p>
      </div>
    );
  }
  return children;
}
