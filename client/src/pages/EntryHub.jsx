import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ProductionEntry from './ProductionEntry';

const ENTRY_OPTIONS = {
  hourly: {
    key: 'hourly',
    to: '/production-entry',
    icon: '📝',
    label: 'Hourly Production Entry',
    hint: 'Log hourly count, scrap & machine runs',
    accentColor: '#f59e0b',
    badge: 'Moulding',
  },
  trimming: {
    key: 'trimming',
    to: '/trimming',
    icon: '✂',
    label: 'Trimming Entry',
    hint: 'Next bag in queue, FIFO queue',
    accentColor: '#10b981',
    badge: 'Trimming',
  },
  inspection: {
    key: 'inspection',
    to: '/inspection',
    icon: '◎',
    label: 'Final Inspection',
    hint: 'Quality checks & visual inspection',
    accentColor: '#10b981',
    badge: 'Inspection',
  },
  packing: {
    key: 'packing',
    to: '/packing',
    icon: '▧',
    label: 'Packing Entry',
    hint: 'Standard box packing & label verify',
    accentColor: '#3b82f6',
    badge: 'Packing',
  },
  dispatch: {
    key: 'dispatch',
    to: '/dispatch',
    icon: '🚚',
    label: 'Dispatch Entry',
    hint: 'Customer finished goods dispatch, FIFO',
    accentColor: '#14b8a6',
    badge: 'Dispatch',
  },
};

export default function EntryHub() {
  const { user } = useAuth();

  // If user is a standard moulding operator, render ProductionEntry directly with no extra step
  if (user && user.role === 'operator' && (user.assigned_process === 'PRODUCTION' || !user.assigned_process)) {
    return <ProductionEntry />;
  }

  // Determine available options
  let tiles = [];
  let stationTitle = 'Select Entry Station';
  let stationSubtitle = 'Choose an entry module to record production data';

  if (user?.role === 'operator') {
    if (user.assigned_process === 'TRIMMING') {
      tiles = [ENTRY_OPTIONS.trimming, ENTRY_OPTIONS.dispatch];
      stationTitle = 'Trimming & Dispatch Station';
      stationSubtitle = `Logged in as ${user.full_name} · Assigned Station: Trimming`;
    } else if (user.assigned_process === 'PACKING_INSPECTION') {
      tiles = [ENTRY_OPTIONS.inspection, ENTRY_OPTIONS.packing, ENTRY_OPTIONS.dispatch];
      stationTitle = 'Inspection, Packing & Dispatch';
      stationSubtitle = `Logged in as ${user.full_name} · Assigned Station: Inspection & Packing`;
    } else {
      tiles = [ENTRY_OPTIONS.hourly];
    }
  } else {
    // Supervisor / Admin / Quality - show all 5 entry modules
    tiles = [
      ENTRY_OPTIONS.hourly,
      ENTRY_OPTIONS.trimming,
      ENTRY_OPTIONS.inspection,
      ENTRY_OPTIONS.packing,
      ENTRY_OPTIONS.dispatch,
    ];
    stationTitle = 'Shopfloor Entry Hub';
    stationSubtitle = `Logged in as ${user?.full_name || 'User'} (${user?.role || 'Staff'}) · Select entry station`;
  }

  return (
    <div className="screen">
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderLeft: '4px solid var(--amber)',
          borderRadius: 8,
          padding: '14px 16px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {stationTitle}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {stationSubtitle}
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            padding: '3px 7px',
            background: 'rgba(245, 158, 11, 0.12)',
            color: 'var(--amber)',
            borderRadius: 4,
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}
        >
          {tiles.length} Stations
        </span>
      </div>

      <div className="tile-grid">
        {tiles.map((tile) => (
          <Link
            key={tile.key}
            to={tile.to}
            className="tile"
            style={{
              borderLeftColor: tile.accentColor,
              padding: '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: 110,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: 6 }}>
              <span className="tile-icon" style={{ fontSize: 28, lineHeight: 1 }}>
                {tile.icon}
              </span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 5px',
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: tile.accentColor,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {tile.badge}
              </span>
            </div>
            <span className="tile-label" style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
              {tile.label}
            </span>
            <span className="tile-hint" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {tile.hint}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
