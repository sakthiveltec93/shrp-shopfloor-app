import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="screen">
        <p className="muted">Your role ({user.role}) doesn't have access to this page.</p>
      </div>
    );
  }
  return children;
}
