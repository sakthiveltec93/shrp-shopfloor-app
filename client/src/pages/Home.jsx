import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Home() {
  const { user } = useAuth();
  const isSupervisor = user.role === 'supervisor' || user.role === 'admin';

  return (
    <div className="screen">
      <h1 className="screen-title">Welcome, {user.full_name.split(' ')[0]}</h1>
      <p className="screen-sub">Shift dashboard</p>

      <div className="tile-grid">
        <Link to="/mould-setup" className="tile">
          <span className="tile-icon">⚙</span>
          <span className="tile-label">Mould Setup</span>
          <span className="tile-hint">Assign part to machine</span>
        </Link>
        <Link to="/entry" className="tile">
          <span className="tile-icon">▤</span>
          <span className="tile-label">Production Entry</span>
          <span className="tile-hint">Log hourly count</span>
        </Link>
        {isSupervisor && (
          <Link to="/approvals" className="tile">
            <span className="tile-icon">✓</span>
            <span className="tile-label">Approvals</span>
            <span className="tile-hint">Pending mould setups</span>
          </Link>
        )}
        <Link to="/log" className="tile">
          <span className="tile-icon">≣</span>
          <span className="tile-label">Today's Log</span>
          <span className="tile-hint">All entries today</span>
        </Link>
      </div>
    </div>
  );
}
