import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import { useLanguage, LANGUAGES } from '../i18n/LanguageContext';

const NAV_ITEMS = [
  { to: '/', labelKey: 'layout.nav.home', icon: '⌂', key: null },
  { to: '/mould-setup', labelKey: 'layout.nav.mouldSetup', icon: '⚙', key: 'mould_setup' },
  { to: '/entry', labelKey: 'layout.nav.entry', icon: '▤', key: 'entry' },
  { to: '/log', labelKey: 'layout.nav.log', icon: '≣', key: 'log' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState(api.offlineQueue ? api.offlineQueue.getPendingCount() : 0);
  const [isSyncing, setIsSyncing] = useState(false);

  const visibleNavItems = user
    ? NAV_ITEMS.filter((item) => !item.key || user.role === 'admin' || (Array.isArray(user.pages) && user.pages.includes(item.key)))
    : [];
  const hasAttendanceAccess = user && (user.role === 'admin' || (Array.isArray(user.pages) && user.pages.includes('attendance')));

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      if (api.syncOffline) {
        setIsSyncing(true);
        api.syncOffline().finally(() => {
          setIsSyncing(false);
          setPendingSyncCount(api.offlineQueue ? api.offlineQueue.getPendingCount() : 0);
        });
      }
    }
    function handleOffline() {
      setIsOnline(false);
    }
    function handleQueueUpdated(e) {
      setPendingSyncCount(e.detail?.count ?? (api.offlineQueue ? api.offlineQueue.getPendingCount() : 0));
    }
    function handleSyncStarted() {
      setIsSyncing(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('shrp:offline-queue-updated', handleQueueUpdated);
    window.addEventListener('shrp:offline-sync-started', handleSyncStarted);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('shrp:offline-queue-updated', handleQueueUpdated);
      window.removeEventListener('shrp:offline-sync-started', handleSyncStarted);
    };
  }, []);

  async function handleManualSync() {
    if (!api.syncOffline) return;
    setIsSyncing(true);
    try {
      await api.syncOffline();
    } finally {
      setIsSyncing(false);
      setPendingSyncCount(api.offlineQueue ? api.offlineQueue.getPendingCount() : 0);
    }
  }

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    function load() {
      api.notifications.list().then((data) => {
        if (cancelled) return;
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }).catch(() => {});
    }
    load();
    const interval = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user]);

  async function openNotification(n) {
    if (!n.read_at) {
      await api.notifications.markRead(n.id).catch(() => {});
      setUnreadCount((c) => Math.max(0, c - 1));
      setNotifications((list) => list.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
    }
    setShowNotifications(false);
    if (n.link) navigate(n.link);
  }

  async function markAllRead() {
    await api.notifications.markAllRead().catch(() => {});
    setUnreadCount(0);
    setNotifications((list) => list.map((x) => ({ ...x, read_at: x.read_at || new Date().toISOString() })));
  }

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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
            <div className="btn-row" style={{ gap: 2 }} role="group" aria-label="Language">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className="logout-btn"
                  style={{
                    padding: '4px 8px', fontSize: 11, minWidth: 0,
                    fontWeight: lang === l.code ? 700 : 400,
                    borderColor: lang === l.code ? 'var(--amber, #d97706)' : undefined,
                    color: lang === l.code ? 'var(--amber, #d97706)' : undefined,
                  }}
                  onClick={() => setLang(l.code)}
                  aria-pressed={lang === l.code}
                >
                  {l.label}
                </button>
              ))}
            </div>
            {hasAttendanceAccess && (
              <button className="logout-btn" onClick={() => navigate('/attendance')}>
                {t('layout.attendance')}
              </button>
            )}
            <button
              className="logout-btn"
              style={{ position: 'relative' }}
              onClick={() => setShowNotifications((v) => !v)}
              aria-label={t('layout.notifications')}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4, background: 'var(--amber, #d97706)',
                  color: '#000', borderRadius: 999, fontSize: 10, fontWeight: 700,
                  minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button className="logout-btn" onClick={() => navigate('/change-pin')}>
              {t('layout.changePin')}
            </button>
            <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
              {t('layout.signOut')}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, width: 300, maxHeight: 360, overflowY: 'auto',
                background: 'var(--bg-panel, #111)', border: '1px solid var(--border, #333)', borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 50,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--border, #333)' }}>
                  <strong style={{ fontSize: 13 }}>{t('layout.notifications')}</strong>
                  {unreadCount > 0 && (
                    <button type="button" onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--text-secondary, #999)', fontSize: 11, cursor: 'pointer' }}>
                      {t('layout.markAllRead')}
                    </button>
                  )}
                </div>
                {notifications.length === 0 && (
                  <div style={{ padding: 16, fontSize: 12, color: 'var(--text-secondary, #999)' }}>{t('layout.noNotifications')}</div>
                )}
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => openNotification(n)}
                    style={{
                      padding: '10px 12px', borderBottom: '1px solid var(--border, #222)', cursor: 'pointer',
                      background: n.read_at ? 'transparent' : 'rgba(217,119,6,0.08)',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: n.read_at ? 400 : 600 }}>{n.title}</div>
                    {n.body && <div style={{ fontSize: 12, color: 'var(--text-secondary, #999)', marginTop: 2 }}>{n.body}</div>}
                    <div style={{ fontSize: 10, color: 'var(--text-secondary, #777)', marginTop: 4 }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {(!isOnline || pendingSyncCount > 0 || isSyncing) && (
        <div className={`offline-banner ${!isOnline ? 'is-offline' : isSyncing ? 'is-syncing' : 'is-offline'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{!isOnline ? '📡 Offline Mode' : isSyncing ? '🔄 Syncing data…' : '⚠️ Pending Offline Sync'}</span>
            {pendingSyncCount > 0 && (
              <span className="offline-badge">{pendingSyncCount} pending</span>
            )}
          </div>
          {isOnline && pendingSyncCount > 0 && (
            <button
              type="button"
              className="offline-banner-btn"
              disabled={isSyncing}
              onClick={handleManualSync}
            >
              {isSyncing ? 'Syncing…' : 'Sync Now'}
            </button>
          )}
        </div>
      )}

      <main className="app-main">{children}</main>

      {user && (
        <nav className="bottom-nav">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
              end={item.to === '/'}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}
