import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import { useLanguage, LANGUAGES } from '../i18n/LanguageContext';

const NAV_ITEMS = [
  { to: '/', labelKey: 'layout.nav.home', icon: '⌂', key: null },
  { to: '/planning', labelKey: 'layout.nav.planning', icon: '📊', key: 'planning', supervisorOnly: true },
  { to: '/entry', labelKey: 'layout.nav.entry', icon: '📝', key: 'entry' },
  { to: '/log', labelKey: 'layout.nav.log', icon: '📋', key: 'log' },
  { to: '/masters', labelKey: 'layout.nav.masters', icon: '🗂️', key: 'masters', supervisorOnly: true },
  { to: '/mould-setup', labelKey: 'layout.nav.mouldSetup', icon: '⚙', key: 'mould_setup', supervisorOnly: true },
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

  // Sync language with user's saved default language if present
  useEffect(() => {
    if (user?.default_language && LANGUAGES.some((l) => l.code === user.default_language)) {
      const saved = localStorage.getItem('shrp_lang');
      if (!saved) {
        setLang(user.default_language);
      }
    }
  }, [user]);

  const isSupervisorOrAdmin = user && (user.role === 'admin' || user.role === 'supervisor');
  const visibleNavItems = user
    ? NAV_ITEMS.filter((item) => {
        if (item.supervisorOnly && !isSupervisorOrAdmin) return false;
        return !item.key || isSupervisorOrAdmin || (Array.isArray(user.pages) && user.pages.includes(item.key));
      })
    : [];
  const hasAttendanceAccess = user && (user.role === 'admin' || (Array.isArray(user.pages) && user.pages.includes('attendance')));
  const hasReportsAccess = user && (user.role === 'admin' || (Array.isArray(user.pages) && user.pages.includes('reports')));
  const isAdmin = user && user.role === 'admin';

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

  const handleManualSync = async () => {
    if (!api.syncOffline || isSyncing) return;
    setIsSyncing(true);
    try {
      await api.syncOffline();
    } finally {
      setIsSyncing(false);
      setPendingSyncCount(api.offlineQueue ? api.offlineQueue.getPendingCount() : 0);
    }
  };

  useEffect(() => {
    if (!user) return;
    const fetchNotifs = () => {
      try {
        const notifCall = (typeof api.notifications?.unread === 'function' ? api.notifications.unread() : null)
          ?? (typeof api.notifications?.list === 'function' ? api.notifications.list() : null);
        if (notifCall && typeof notifCall.then === 'function') {
          notifCall
            .then((data) => {
              if (Array.isArray(data)) {
                setNotifications(data);
                setUnreadCount(data.length);
              } else if (data && Array.isArray(data.notifications)) {
                setNotifications(data.notifications);
                setUnreadCount(typeof data.unread_count === 'number' ? data.unread_count : data.notifications.filter((n) => !n.read_at).length);
              }
            })
            .catch(() => {});
        }
      } catch {
        // Suppress any unexpected synchronous error
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchTodayStatus = () => {
      try {
        const attCall = (typeof api.attendance?.today === 'function' ? api.attendance.today() : null)
          ?? (typeof api.todayAttendanceStatus === 'function' ? api.todayAttendanceStatus() : null);
        if (attCall && typeof attCall.then === 'function') {
          attCall
            .then((data) => setTodayAttendance(data || null))
            .catch(() => {});
        }
      } catch {
        // Suppress any unexpected synchronous error
      }
    };
    fetchTodayStatus();

    const handleAttendanceUpdated = (e) => {
      if (e?.detail) {
        setTodayAttendance(e.detail);
      } else {
        fetchTodayStatus();
      }
    };
    window.addEventListener('attendance-updated', handleAttendanceUpdated);
    const interval = setInterval(fetchTodayStatus, 60000);
    return () => {
      window.removeEventListener('attendance-updated', handleAttendanceUpdated);
      clearInterval(interval);
    };
  }, [user]);

  function formatPillTime(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  return (
    <div className="app-layout">
      <header className="app-header">
        <NavLink to="/" className="app-brand" title="SHRP MES Home">
          <div className="brand-logo-container">
            <div className="brand-logo-pill">
              <img
                src="/shrp-logo.png"
                alt="SHRP Logo"
                className="brand-logo-img"
                onError={(e) => {
                  e.currentTarget.src = '/logo.png';
                }}
              />
            </div>
            <span className="brand-badge">MES</span>
          </div>
        </NavLink>

        {user && (
          <div className="app-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* 1. Quick Language Switcher Bar in Header */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '2px', border: '1px solid var(--line)' }}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLang(l.code)}
                  style={{
                    padding: '3px 6px',
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 4,
                    border: 'none',
                    background: lang === l.code ? 'var(--amber)' : 'transparent',
                    color: lang === l.code ? '#1c1500' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                  title={l.name}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* 2. Attendance Status Pill */}
            {hasAttendanceAccess && (
              <button
                type="button"
                className="attendance-quick-pill"
                onClick={() => navigate('/attendance')}
                title={
                  !todayAttendance?.check_in_at
                    ? 'Shift Attendance: Not Checked In (Click to Check In)'
                    : todayAttendance?.check_out_at
                    ? `Shift Attendance: Checked Out at ${new Date(todayAttendance.check_out_at).toLocaleTimeString()}`
                    : `Shift Attendance: Checked In at ${new Date(todayAttendance.check_in_at).toLocaleTimeString()}`
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: !todayAttendance?.check_in_at
                    ? 'rgba(239, 68, 68, 0.18)'
                    : todayAttendance?.check_out_at
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(16, 185, 129, 0.22)',
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
                <span>{!todayAttendance?.check_in_at ? '🔴' : todayAttendance?.check_out_at ? '⚪' : '🟢'}</span>
                <span>
                  {!todayAttendance?.check_in_at
                    ? 'OUT'
                    : todayAttendance?.check_out_at
                    ? 'OUT'
                    : `IN ${formatPillTime(todayAttendance.check_in_at)}`}
                </span>
              </button>
            )}

            {/* 3. Dedicated User Profile & HR Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="logout-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 6px',
                  borderRadius: 8,
                  background: showSettings ? 'var(--line)' : 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                }}
                onClick={() => setShowSettings((v) => !v)}
                title="Profile, Staff & Settings"
              >
                <div style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--amber), #b45309)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800,
                  overflow: 'hidden',
                }}>
                  {user.avatar_data ? (
                    <img src={user.avatar_data} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.full_name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▼</span>
              </button>

              {/* Profile & HR Dropdown Menu (Fully Translated) */}
              {showSettings && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    right: 0,
                    width: 240,
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: 10,
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{user.full_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{user.username} · {user.role}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12 }}
                      onClick={() => { setShowSettings(false); navigate('/profile'); }}
                    >
                      <span>👤</span>
                      <span style={{ fontWeight: 600, color: 'var(--amber)' }}>{t('layout.menu.profile')}</span>
                    </button>
                    {isSupervisorOrAdmin && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12 }}
                        onClick={() => { setShowSettings(false); navigate('/masters'); }}
                      >
                        <span>🗂️</span>
                        <span>{t('layout.menu.masters') || 'Item & Masters Hub'}</span>
                      </button>
                    )}
                    {isSupervisorOrAdmin && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12 }}
                        onClick={() => { setShowSettings(false); navigate('/planning'); }}
                      >
                        <span>📊</span>
                        <span>{t('layout.menu.planning') || 'Production Planning & MPS'}</span>
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12 }}
                        onClick={() => { setShowSettings(false); navigate('/users'); }}
                      >
                        <span>👥</span>
                        <span>{t('layout.menu.staff')}</span>
                      </button>
                    )}
                    {hasReportsAccess && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', fontSize: 12 }}
                        onClick={() => { setShowSettings(false); navigate('/reports'); }}
                      >
                        <span>📊</span>
                        <span>{t('layout.menu.reports')}</span>
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
                        <span>{t('layout.menu.attendance')}</span>
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
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 6 }}>
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
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="offline-banner-btn"
                disabled={isSyncing}
                onClick={handleManualSync}
              >
                {isSyncing ? 'Syncing…' : 'Sync Now'}
              </button>
              <button
                type="button"
                className="offline-banner-btn"
                style={{ background: 'rgba(239, 68, 68, 0.2)', borderColor: '#ef4444', color: '#f87171' }}
                onClick={() => {
                  api.offlineQueue.clear();
                  setPendingSyncCount(0);
                }}
                title="Clear stuck offline queue"
              >
                Clear
              </button>
            </div>
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
