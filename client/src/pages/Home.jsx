import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Home() {
  const { user } = useAuth();
  const isSupervisor = user.role === 'supervisor' || user.role === 'admin';
  const isAdmin = user.role === 'admin';

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
        <Link to="/bag-entry" className="tile">
          <span className="tile-icon">◧</span>
          <span className="tile-label">Bag Entry</span>
          <span className="tile-hint">Log a bag against a batch</span>
        </Link>
        <Link to="/trimming" className="tile">
          <span className="tile-icon">✂</span>
          <span className="tile-label">Trimming</span>
          <span className="tile-hint">Next bag, FIFO</span>
        </Link>
        <Link to="/inspection" className="tile">
          <span className="tile-icon">◎</span>
          <span className="tile-label">Inspection</span>
          <span className="tile-hint">Next bag, FIFO</span>
        </Link>
        <Link to="/packing" className="tile">
          <span className="tile-icon">▧</span>
          <span className="tile-label">Packing</span>
          <span className="tile-hint">Next bag, FIFO</span>
        </Link>
        {isSupervisor && (
          <Link to="/approvals" className="tile">
            <span className="tile-icon">✓</span>
            <span className="tile-label">Approvals</span>
            <span className="tile-hint">Pending mould setups</span>
          </Link>
        )}
        {isSupervisor && (
          <Link to="/parts" className="tile">
            <span className="tile-icon">📋</span>
            <span className="tile-label">Parts</span>
            <span className="tile-hint">Add / edit part master</span>
          </Link>
        )}
        {isAdmin && (
          <Link to="/users" className="tile">
            <span className="tile-icon">👤</span>
            <span className="tile-label">Users</span>
            <span className="tile-hint">Accounts & page access</span>
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
