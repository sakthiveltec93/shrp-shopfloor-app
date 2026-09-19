import { useEffect, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { api } from '../api';
import { useLanguage, LANGUAGES } from '../i18n/LanguageContext';
import { ERP_SECTIONS } from '../navigationSections';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [moreSearch, setMoreSearch] = useState('');
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
  const hasAttendanceAccess = user && (user.role === 'admin' || (Array.isArray(user.pages) && user.pages.includes('attendance')));
  const hasReportsAccess = user && (user.role === 'admin' || (Array.isArray(user.pages) && user.pages.includes('reports')));
  const isAdmin = user && user.role === 'admin';

  // Role-based 4-icon bottom bar:
  // Operator: Home · Entry · Shift Log · Alerts
  // Supervisor/Quality: Home · Entry · Quality · Alerts
  // Admin/Office: Home · Entry · Planning · More
  const getRoleBottomNav = () => {
    if (!user) return [];
    const role = user.role;
    const isQuality = role === 'quality' || role === 'quality_inspector';

    const baseItems = [
      { to: '/', labelKey: 'layout.nav.home', icon: '⌂', id: 'home' },
      { to: '/entry', labelKey: 'layout.nav.entry', icon: '📝', id: 'entry' },
    ];

    if (role === 'admin' || role === 'office') {
      return [
        ...baseItems,
        { to: '/planning', labelKey: 'layout.nav.planning', icon: '📊', id: 'planning' },
        { action: 'more', labelKey: 'layout.nav.more', icon: '☰', id: 'more' },
      ];
    }

    if (role === 'supervisor' || isQuality) {
      return [
        ...baseItems,
        { to: '/inspection', labelKey: 'layout.nav.quality', icon: '⚡', id: 'quality' },
        { to: '/alerts', labelKey: 'layout.nav.alerts', icon: '🔔', id: 'alerts', badge: alertCount },
      ];
    }

    // Operator (default)
    return [
      ...baseItems,
      { to: '/log', labelKey: 'layout.nav.log', icon: '📋', id: 'log' },
      { to: '/alerts', labelKey: 'layout.nav.alerts', icon: '🔔', id: 'alerts', badge: alertCount },
    ];
  };

  const navItems = getRoleBottomNav();

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

    const fetchAlerts = () => {
      try {
        const alertCall = api.getAlerts?.();
        if (alertCall && typeof alertCall.then === 'function') {
          alertCall
            .then((data) => {
              if (data && typeof data.totalCount === 'number') {
                setAlertCount(data.totalCount);
              }
            })
            .catch(() => {});
        }
      } catch {
        // Suppress
      }
    };

    fetchNotifs();
    fetchAlerts();
    const interval = setInterval(() => {
      fetchNotifs();
      fetchAlerts();
    }, 20000);
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

            {/* Live Plant Dashboard Quick Action */}
            {isSupervisorOrAdmin && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `dashboard-quick-pill ${isActive ? 'active' : ''}`}
                title="Live Plant Command Dashboard (Supervisor & Management Views)"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 800,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  background: isActive ? 'var(--amber)' : 'rgba(245, 158, 11, 0.15)',
                  border: '1.5px solid var(--amber)',
                  color: isActive ? '#0f172a' : 'var(--amber)',
                })}
              >
                <span>⚡</span>
                <span className="hide-mobile">DASHBOARD</span>
              </NavLink>
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
          {navItems.map((item) => {
            if (item.action === 'more') {
              return (
                <button
                  key="more-btn"
                  type="button"
                  className={`bottom-nav-item${showMoreMenu ? ' active' : ''}`}
                  onClick={() => setShowMoreMenu((v) => !v)}
                  title="All Modules"
                >
                  <span className="bottom-nav-icon-wrapper">
                    <span className="bottom-nav-icon">{item.icon}</span>
                  </span>
                  <span>{t(item.labelKey)}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.id || item.to}
                to={item.to}
                className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
                end={item.to === '/'}
              >
                <span className="bottom-nav-icon-wrapper">
                  <span className="bottom-nav-icon">{item.icon}</span>
                  {item.badge > 0 && (
                    <span className="bottom-nav-badge">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </span>
                <span>{t(item.labelKey)}</span>
              </NavLink>
            );
          })}
        </nav>
      )}

      {/* Admin "More" Full Module Drawer Modal */}
      {showMoreMenu && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(3px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMoreMenu(false);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              maxHeight: '85vh',
              background: 'var(--panel)',
              borderTop: '2px solid var(--amber)',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: '16px 14px 30px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              boxShadow: '0 -10px 40px rgba(0,0,0,0.8)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase' }}>
                  SHRP Navigation Directory
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>
                  All ERP & MES Modules
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--line)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text)',
                  fontSize: 16,
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Quick Search */}
            <input
              type="text"
              placeholder="🔍 Search all modules…"
              value={moreSearch}
              onChange={(e) => setMoreSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: 13,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--line)',
                borderRadius: 6,
                color: 'var(--text)',
                outline: 'none',
              }}
            />

            {/* Modules Grid / Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              {ERP_SECTIONS.map((section) => {
                const q = moreSearch.toLowerCase().trim();
                const filteredTiles = section.tiles.filter((tile) => {
                  if (tile.adminOnly && !isAdmin) return false;
                  if (tile.supervisorOnly && !isSupervisorOrAdmin) return false;
                  if (!q) return true;
                  const label = (t(`home.tiles.${tile.key}.label`) || tile.label || '').toLowerCase();
                  const hint = (t(`home.tiles.${tile.key}.hint`) || tile.hint || '').toLowerCase();
                  return label.includes(q) || hint.includes(q) || tile.key.includes(q);
                });

                if (filteredTiles.length === 0) return null;

                return (
                  <div
                    key={`more-${section.id}`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--line)',
                      borderLeft: `3px solid ${section.accentColor}`,
                      borderRadius: 8,
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{section.icon}</span>
                      <span>{t(`home.sections.${section.sectionKey}.title`) || section.title}</span>
                    </div>

                    <div className="tile-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                      {filteredTiles.map((tile) => (
                        tile.to ? (
                          <button
                            key={`more-tile-${tile.key}`}
                            type="button"
                            className="tile"
                            onClick={() => {
                              setShowMoreMenu(false);
                              navigate(tile.to);
                            }}
                            style={{
                              borderLeftColor: section.accentColor,
                              padding: '10px 8px',
                              textAlign: 'left',
                              cursor: 'pointer',
                              background: 'var(--panel)',
                              width: '100%',
                            }}
                          >
                            <span className="tile-icon" style={{ fontSize: 18, marginBottom: 2 }}>
                              {tile.icon}
                            </span>
                            <span className="tile-label" style={{ fontSize: 12, marginBottom: 2 }}>
                              {t(`home.tiles.${tile.key}.label`) || tile.label}
                            </span>
                            <span className="tile-hint" style={{ fontSize: 10 }}>
                              {t(`home.tiles.${tile.key}.hint`) || tile.hint}
                            </span>
                          </button>
                        ) : (
                          <div
                            key={`more-tile-${tile.key}`}
                            className="tile"
                            style={{
                              borderLeftColor: 'var(--line)',
                              padding: '10px 8px',
                              opacity: 0.6,
                              background: 'rgba(255, 255, 255, 0.02)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className="tile-icon" style={{ fontSize: 18, marginBottom: 2 }}>
                                {tile.icon}
                              </span>
                              <span style={{ fontSize: 8, fontWeight: 700, background: 'rgba(255, 255, 255, 0.1)', padding: '1px 4px', borderRadius: 3 }}>
                                SOON
                              </span>
                            </div>
                            <span className="tile-label" style={{ fontSize: 12, marginBottom: 2 }}>
                              {t(`home.tiles.${tile.key}.label`) || tile.label}
                            </span>
                            <span className="tile-hint" style={{ fontSize: 10 }}>
                              {t(`home.tiles.${tile.key}.hint`) || tile.hint}
                            </span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
