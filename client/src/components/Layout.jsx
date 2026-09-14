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
  const [showSettings, setShowSettings] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingSyncCount, setPendingSyncCount] = useState(api.offlineQueue ? api.offlineQueue.getPendingCount() : 0);
  const [isSyncing, setIsSyncing] = useState(false);

  const visibleNavItems = user
    ? NAV_ITEMS.filter((item) => !item.key || user.role === 'admin' || (Array.isArray(user.pages) && user.pages.includes(item.key)))
    : [];
  const hasAttendanceAccess = user && (user.role === 'admin' || (Array.isArray(user.pages) && user.pages.includes('attendance')));
  const hasReportsAccess = user && (user.role === 'admin' || (Array.isArray(user.pages) && user.pages.includes('reports')));

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

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    function fetchAttendance() {
      api.attendance.today().then((rec) => {
        if (!cancelled) setTodayAttendance(rec);
      }).catch(() => {});
    }
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 30000);
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
        <div className="app-header-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/logo.png"
            alt="SHRP"
            style={{ height: 32, width: 'auto', objectFit: 'contain', background: '#ffffff', padding: '2px 4px', borderRadius: 4 }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div>
            <div className="app-header-title">SHRP MES</div>
            <div className="app-header-sub">{user ? `${user.full_name} · ${user.role}` : ''}</div>
          </div>
        </div>
        {user && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative' }}>
            {/* 1. Interactive Check-In / In-Time Status Button */}
            {hasAttendanceAccess && (
              <button
                type="button"
                className={`attendance-badge-btn ${!todayAttendance?.check_in_at ? 'not-checked-in pulse-red' : todayAttendance?.check_out_at ? 'checked-out' : 'checked-in'}`}
                onClick={() => navigate('/attendance')}
                title={
                  !todayAttendance?.check_in_at
                    ? 'You have not checked in today. Tap to Check In!'
                    : todayAttendance?.check_out_at
                    ? `Shift completed (Checked Out: ${new Date(todayAttendance.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                    : `Checked in at ${new Date(todayAttendance.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Tap to view or Check Out.`
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: !todayAttendance?.check_in_at
                    ? 'rgba(239, 68, 68, 0.18)'
                    : todayAttendance?.check_out_at
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(16, 185, 129, 0.18)',
                  border: !todayAttendance?.check_in_at
                    ? '1.5px solid #ef4444'
                    : todayAttendance?.check_out_at
                    ? '1px solid var(--line)'
                    : '1.5px solid #10b981',
                  color: !todayAttendance?.check_in_at
                    ? '#f87171'
                    : todayAttendance?.check_out_at
                    ? 'var(--text-muted)'
                    : '#34d399',
                }}
              >
                <span>
                  {!todayAttendance?.check_in_at ? '🔴' : todayAttendance?.check_out_at ? '⚪' : '🟢'}
                </span>
                <span>
                  {!todayAttendance?.check_in_at
                    ? 'CHECK IN'
                    : todayAttendance?.check_out_at
                    ? 'OUT'
                    : `IN: ${new Date(todayAttendance.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              </button>
            )}

            {/* 2. Notification Bell Button */}
            <button
              className="logout-btn"
              style={{
                position: 'relative',
                padding: '6px 9px',
                fontSize: 14,
                borderRadius: 6,
                background: showNotifications ? 'var(--line)' : 'transparent',
              }}
              onClick={() => {
                setShowNotifications((v) => !v);
                setShowSettings(false);
              }}
              aria-label={t('layout.notifications')}
              title="Notifications"
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

            {/* 3. Settings & Profile Menu Button */}
            <button
              className="logout-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 9px',
                fontSize: 13,
                borderRadius: 6,
                background: showSettings ? 'var(--line)' : 'transparent',
              }}
              onClick={() => {
                setShowSettings((v) => !v);
                setShowNotifications(false);
              }}
              aria-label="Settings and Profile"
              title="Settings & Profile"
            >
              <span>⚙️</span>
              <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>▼</span>
            </button>

            {/* Click-outside Backdrop */}
            {(showNotifications || showSettings) && (
              <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 45 }}
                onClick={() => { setShowNotifications(false); setShowSettings(false); }}
              />
            )}

            {/* Notifications Popover Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute', top: '120%', right: 0, width: 300, maxHeight: 360, overflowY: 'auto',
                background: 'var(--bg-panel, #111)', border: '1px solid var(--border, #333)', borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 55,
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

            {/* Settings & Profile Popover Dropdown */}
            {showSettings && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: 270,
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                  zIndex: 55,
                  padding: 14,
                }}
              >
                {/* User Info Header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--line)', marginBottom: 12, cursor: 'pointer' }}
                  onClick={() => { setShowSettings(false); navigate('/profile'); }}
                  title="View My Profile"
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--amber), #b45309)',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 15,
                    overflow: 'hidden',
                  }}>
                    {user.avatar_data ? (
                      <img src={user.avatar_data} alt={user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      user.full_name ? user.full_name[0].toUpperCase() : 'U'
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{user.full_name}</span>
                      <span style={{ fontSize: 11, color: 'var(--amber)' }}>✏️</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {user.role} • Profile
                    </div>
                  </div>
                </div>

                {/* Language Switcher */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Language / மொழி / ଭାଷା
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        className="btn btn-secondary"
                        style={{
                          flex: 1,
                          padding: '5px 0',
                          fontSize: 11,
                          fontWeight: lang === l.code ? 700 : 400,
                          borderColor: lang === l.code ? 'var(--amber)' : 'var(--line)',
                          background: lang === l.code ? 'rgba(217,119,6,0.18)' : 'rgba(255,255,255,0.03)',
                          color: lang === l.code ? 'var(--amber)' : 'var(--text)',
                        }}
                        onClick={() => setLang(l.code)}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Shortcuts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12, borderColor: 'rgba(217,119,6,0.4)', background: 'rgba(217,119,6,0.08)' }}
                    onClick={() => { setShowSettings(false); navigate('/profile'); }}
                  >
                    <span>👤</span>
                    <span style={{ fontWeight: 600, color: 'var(--amber)' }}>My Profile & HR Portal</span>
                  </button>
                  {hasReportsAccess && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12 }}
                      onClick={() => { setShowSettings(false); navigate('/reports'); }}
                    >
                      <span>📊</span>
                      <span>Daily Reports</span>
                    </button>
                  )}
                  {hasAttendanceAccess && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12 }}
                      onClick={() => { setShowSettings(false); navigate('/attendance'); }}
                    >
                      <span>🕒</span>
                      <span>Attendance & Geofence</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12 }}
                    onClick={() => { setShowSettings(false); navigate('/change-pin'); }}
                  >
                    <span>🔑</span>
                    <span>{t('layout.changePin')}</span>
                  </button>
                </div>

                {/* Sign Out Button */}
                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '7px 10px',
                      fontSize: 12,
                      color: 'var(--red)',
                      borderColor: 'rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.06)',
                    }}
                    onClick={() => {
                      setShowSettings(false);
                      logout();
                      navigate('/login');
                    }}
                  >
                    <span>🚪</span>
                    <span>{t('layout.signOut')}</span>
                  </button>
                </div>
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
