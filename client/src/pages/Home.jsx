import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const TILES = [
  { key: 'mould_setup', to: '/mould-setup', icon: '⚙', label: 'Mould Setup', hint: 'Assign part to machine' },
  { key: 'entry', to: '/entry', icon: '▤', label: 'Production Entry', hint: 'Log hourly count' },
  { key: 'bag_entry', to: '/bag-entry', icon: '◧', label: 'Bag Entry', hint: 'Log a bag against a batch' },
  { key: 'trimming', to: '/trimming', icon: '✂', label: 'Trimming', hint: 'Next bag, FIFO' },
  { key: 'inspection', to: '/inspection', icon: '◎', label: 'Inspection', hint: 'Next bag, FIFO' },
  { key: 'packing', to: '/packing', icon: '▧', label: 'Packing', hint: 'Next bag, FIFO' },
  { key: 'approvals', to: '/approvals', icon: '✓', label: 'Approvals', hint: 'Pending mould setups' },
  { key: 'parts', to: '/parts', icon: '📋', label: 'Parts', hint: 'Add / edit part master' },
  { key: 'users', to: '/users', icon: '👤', label: 'Users', hint: 'Accounts & page access' },
  { key: 'log', to: '/log', icon: '≣', label: "Today's Log", hint: 'All entries today' },
];

export default function Home() {
  const { user } = useAuth();
  // Admins always see every tile; everyone else sees only what's been granted.
  const visibleTiles = user.role === 'admin'
    ? TILES
    : TILES.filter((t) => Array.isArray(user.pages) && user.pages.includes(t.key));

  return (
    <div className="screen">
      <h1 className="screen-title">Welcome, {user.full_name.split(' ')[0]}</h1>
      <p className="screen-sub">Shift dashboard</p>

      <div className="tile-grid">
        {visibleTiles.map((t) => (
          <Link key={t.key} to={t.to} className="tile">
            <span className="tile-icon">{t.icon}</span>
            <span className="tile-label">{t.label}</span>
            <span className="tile-hint">{t.hint}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
