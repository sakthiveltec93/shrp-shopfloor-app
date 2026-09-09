import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/mould-setup', label: 'Mould Setup', icon: '⚙' },
  { to: '/entry', label: 'Entry', icon: '▤' },
  { to: '/log', label: "Today's Log", icon: '≣' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">
          <span className="app-header-mark" />
          <div>
            <div className="app-header-title">SHRP SHOP FLOOR</div>
            <div className="app-header-sub">{user ? `${user.full_name} · ${user.role}` : ''}</div>
          </div>
        </div>
        {user && (
          <button
            className="logout-btn"
            onClick={() => { logout(); navigate('/login'); }}
          >
            Sign out
          </button>
        )}
      </header>

      <main className="app-main">{children}</main>

      {user && (
        <nav className="bottom-nav">
          {NAV_ITEMS.filter((item) => item.to !== '/mould-setup' || true).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
              end={item.to === '/'}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
