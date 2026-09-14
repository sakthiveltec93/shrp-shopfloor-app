import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

const TILES = [
  { key: 'mould_setup', to: '/mould-setup', icon: '⚙' },
  { key: 'entry', to: '/entry', icon: '▤' },
  { key: 'bag_entry', to: '/bag-entry', icon: '◧' },
  { key: 'trimming', to: '/trimming', icon: '✂' },
  { key: 'inspection', to: '/inspection', icon: '◎' },
  { key: 'packing', to: '/packing', icon: '▧' },
  { key: 'dispatch', to: '/dispatch', icon: '🚚' },
  { key: 'approvals', to: '/approvals', icon: '✓' },
  { key: 'parts', to: '/parts', icon: '📋' },
  { key: 'users', to: '/users', icon: '👤' },
  { key: 'reports', to: '/reports', icon: '📊' },
  { key: 'log', to: '/log', icon: '≣' },
];

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
  // Admins always see every tile; everyone else sees only what's been granted.
  const visibleTiles = user.role === 'admin'
    ? TILES
    : TILES.filter((tile) => Array.isArray(user.pages) && user.pages.includes(tile.key));

  return (
    <div className="screen">
      <h1 className="screen-title">{t('home.welcome', { name: user.full_name.split(' ')[0] })}</h1>
      <p className="screen-sub">{t('home.subtitle')}</p>

      <div className="tile-grid">
        {visibleTiles.map((tile) => (
          <Link key={tile.key} to={tile.to} className="tile">
            <span className="tile-icon">{tile.icon}</span>
            <span className="tile-label">{t(`home.tiles.${tile.key}.label`)}</span>
            <span className="tile-hint">{t(`home.tiles.${tile.key}.hint`)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
