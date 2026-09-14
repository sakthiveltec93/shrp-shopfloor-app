import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [activityReport, setActivityReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'activity'

  // Dropdown Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ONLINE_ACTIVE' | 'ONLINE_IDLE' | 'OFFLINE' | 'ACTIVE' | 'INACTIVE'
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [uList, actList] = await Promise.all([
        api.users(),
        api.userActivityReport(reportDate),
      ]);
      setUsers(Array.isArray(uList) ? uList : []);
      setActivityReport(Array.isArray(actList) ? actList : []);
    } catch (err) {
      setError(err.message || 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      api.users().then(setUsers).catch(() => {});
      api.userActivityReport(reportDate).then(setActivityReport).catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, [reportDate]);

  const handleToggleActive = async (targetUser) => {
    setTogglingId(targetUser.id);
    setError('');
    try {
      const res = await api.toggleActiveUser(targetUser.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, active: res.active ? 1 : 0 } : u))
      );
      setSuccessMsg(res.message || 'User status updated.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to change user active status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    setError('');
    try {
      const res = await api.deleteUser(userToDelete.id);
      // Immediately remove from local list for instant feedback
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setUserToDelete(null);
      setSuccessMsg(res.message || `User "${userToDelete.full_name}" deleted.`);
      setTimeout(() => setSuccessMsg(''), 5000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const formatMinutes = (mins) => {
    if (!mins || mins <= 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Never';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  // Status counts: Green (Online Active), Yellow (Online Idle), Red (Offline)
  const onlineActiveCount = users.filter((u) => u.live_status === 'ONLINE_ACTIVE').length;
  const onlineIdleCount = users.filter((u) => u.live_status === 'ONLINE_IDLE').length;
  const offlineCount = users.filter((u) => u.live_status === 'OFFLINE' || !u.live_status).length;

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter === 'ONLINE_ACTIVE' && u.live_status !== 'ONLINE_ACTIVE') return false;
    if (statusFilter === 'ONLINE_IDLE' && u.live_status !== 'ONLINE_IDLE') return false;
    if (statusFilter === 'OFFLINE' && u.live_status !== 'OFFLINE') return false;
    if (statusFilter === 'ACTIVE' && (!u.active || u.active === 0)) return false;
    if (statusFilter === 'INACTIVE' && u.active && u.active !== 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        u.username?.toLowerCase().includes(q) ||
        u.full_name?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="screen" style={{ paddingBottom: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h1 className="screen-title" style={{ margin: 0 }}>👥 Staff & Logins</h1>
          <div className="muted" style={{ fontSize: 12 }}>Manage staff accounts, access status & live attendance</div>
        </div>
        <Link to="/users/new" className="btn btn-primary" style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}>
          + Add Staff
        </Link>
      </div>

      {successMsg && (
        <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b98144', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div style={{ padding: '8px 12px', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid #f43f5e44', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
          ⚠ {error}
        </div>
      )}

      {/* 3 Color KPI Counters (Green: Online, Yellow: Idle, Red: Offline) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {/* Green: Online Active */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'ONLINE_ACTIVE' ? 'ALL' : 'ONLINE_ACTIVE')}
          style={{
            background: 'var(--panel)',
            border: `1px solid ${statusFilter === 'ONLINE_ACTIVE' ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: 8,
            padding: '10px 8px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            Online
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', marginTop: 2 }}>
            {onlineActiveCount}
          </div>
        </div>

        {/* Yellow: Online Idle */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'ONLINE_IDLE' ? 'ALL' : 'ONLINE_IDLE')}
          style={{
            background: 'var(--panel)',
            border: `1px solid ${statusFilter === 'ONLINE_IDLE' ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: 8,
            padding: '10px 8px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
            Idle
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>
            {onlineIdleCount}
          </div>
        </div>

        {/* Red: Offline */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'OFFLINE' ? 'ALL' : 'OFFLINE')}
          style={{
            background: 'var(--panel)',
            border: `1px solid ${statusFilter === 'OFFLINE' ? '#f43f5e' : 'rgba(244, 63, 94, 0.3)'}`,
            borderRadius: 8,
            padding: '10px 8px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#f43f5e', textTransform: 'uppercase' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }}></span>
            Offline
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#f43f5e', marginTop: 2 }}>
            {offlineCount}
          </div>
        </div>
      </div>

      {/* Clean Dropdowns Filter Bar */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 12,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
        }}
      >
        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            flex: 1,
            minWidth: 130,
            padding: '6px 8px',
            fontSize: 12,
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            color: 'var(--text)',
            borderRadius: 6,
          }}
        >
          <option value="ALL">All Status ({users.length})</option>
          <option value="ONLINE_ACTIVE">🟢 Online Active ({onlineActiveCount})</option>
          <option value="ONLINE_IDLE">🟡 Idle in Tab ({onlineIdleCount})</option>
          <option value="OFFLINE">🔴 Offline ({offlineCount})</option>
          <option value="ACTIVE">🟢 Active Accounts</option>
          <option value="INACTIVE">⚪ Deactivated Accounts</option>
        </select>

        {/* Role Dropdown */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            flex: 1,
            minWidth: 110,
            padding: '6px 8px',
            fontSize: 12,
            background: 'var(--bg)',
            border: '1px solid var(--line)',
            color: 'var(--text)',
            borderRadius: 6,
          }}
        >
          <option value="ALL">All Roles</option>
          <option value="operator">Operators</option>
          <option value="supervisor">Supervisors</option>
          <option value="admin">Admins</option>
        </select>

        {/* Search */}
        <div style={{ width: '100%', position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search name or @username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 24px 6px 10px',
              fontSize: 12,
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              borderRadius: 6,
              outline: 'none',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: 6,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button
          onClick={() => setActiveTab('accounts')}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 6,
            background: activeTab === 'accounts' ? 'var(--amber)' : 'var(--panel)',
            color: activeTab === 'accounts' ? '#1c1500' : 'var(--text-muted)',
            border: '1px solid var(--line)',
            cursor: 'pointer',
          }}
        >
          👥 Staff List ({filteredUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: 12,
            fontWeight: 700,
            borderRadius: 6,
            background: activeTab === 'activity' ? 'var(--amber)' : 'var(--panel)',
            color: activeTab === 'activity' ? '#1c1500' : 'var(--text-muted)',
            border: '1px solid var(--line)',
            cursor: 'pointer',
          }}
        >
          📊 Daily Report
        </button>
      </div>

      {activeTab === 'accounts' ? (
        /* Staff Cards List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>Loading staff...</div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)', background: 'var(--panel)', borderRadius: 8 }}>
              No staff found matching filter.
            </div>
          ) : (
            filteredUsers.map((u) => {
              let statusDot = '#f43f5e'; // red
              let statusLabel = 'Offline';
              if (u.live_status === 'ONLINE_ACTIVE') {
                statusDot = '#10b981'; // green
                statusLabel = 'Online';
              } else if (u.live_status === 'ONLINE_IDLE') {
                statusDot = '#f59e0b'; // yellow
                statusLabel = 'Idle';
              }

              const isUserActive = u.active === 1 || u.active === true || u.active === undefined;

              return (
                <div
                  key={u.id}
                  style={{
                    background: 'var(--panel)',
                    border: `1px solid ${isUserActive ? 'var(--line)' : 'rgba(244,63,94,0.3)'}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    opacity: isUserActive ? 1 : 0.75,
                  }}
                >
                  {/* Left: Avatar / Status dot & Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'var(--text)',
                          border: '1px solid var(--line)',
                          overflow: 'hidden',
                        }}
                      >
                        {u.avatar_data ? (
                          <img src={u.avatar_data} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          u.full_name?.charAt(0).toUpperCase() || 'U'
                        )}
                      </div>
                      {/* Status indicator dot */}
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: 9,
                          height: 9,
                          borderRadius: '50%',
                          background: statusDot,
                          border: '2px solid var(--panel)',
                        }}
                        title={statusLabel}
                      ></span>
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.full_name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: 4,
                            background: u.role === 'admin' ? '#581c87' : u.role === 'supervisor' ? '#1e3a8a' : '#1f2937',
                            color: '#fff',
                            textTransform: 'uppercase',
                          }}
                        >
                          {u.role ? u.role.slice(0, 4) : 'USER'}
                        </span>
                        {!isUserActive && (
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              padding: '1px 4px',
                              borderRadius: 3,
                              background: 'rgba(244,63,94,0.2)',
                              color: '#f43f5e',
                              textTransform: 'uppercase',
                            }}
                          >
                            Inactive
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                        @{u.username} · <span style={{ color: statusDot, fontWeight: 600 }}>{statusLabel}</span> ({formatRelativeTime(u.last_active_at)})
                      </div>
                    </div>
                  </div>

                  {/* Middle: Today App Time */}
                  <div style={{ textAlign: 'right', flexShrink: 0, padding: '0 4px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                      {formatMinutes(u.today_active_minutes)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      today
                    </div>
                  </div>

                  {/* Right (Same Line): Active Toggle, Edit ✏️ & Delete 🗑️ Icons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    {/* Active/Inactive Toggle Pill Button */}
                    <button
                      type="button"
                      disabled={togglingId === u.id}
                      onClick={() => handleToggleActive(u)}
                      style={{
                        padding: '4px 7px',
                        borderRadius: 5,
                        fontSize: 10,
                        fontWeight: 700,
                        border: isUserActive ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(156,163,175,0.4)',
                        background: isUserActive ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
                        color: isUserActive ? '#10b981' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                      title={isUserActive ? 'Click to Deactivate account' : 'Click to Activate account'}
                    >
                      <span>{isUserActive ? '🟢' : '⚪'}</span>
                      <span className="hide-mobile-micro">{isUserActive ? 'Active' : 'Inactive'}</span>
                    </button>

                    {/* Edit Icon Button */}
                    <Link
                      to={`/users/${u.id}/edit`}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        textDecoration: 'none',
                        color: 'var(--text)',
                      }}
                      title="Edit User"
                    >
                      ✏️
                    </Link>

                    {/* Delete Icon Button */}
                    <button
                      type="button"
                      onClick={() => setUserToDelete(u)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        background: isUserActive ? 'rgba(255,255,255,0.04)' : 'rgba(244, 63, 94, 0.15)',
                        border: isUserActive ? '1px solid var(--line)' : '1px solid rgba(244, 63, 94, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        cursor: 'pointer',
                        color: '#f43f5e',
                      }}
                      title={isUserActive ? 'Deactivate or Delete' : 'Permanently Delete User'}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Daily Activity Report */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 10px',
                fontSize: 12,
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                color: 'var(--text)',
                borderRadius: 6,
              }}
            />
            <button
              onClick={() => setReportDate(new Date().toISOString().slice(0, 10))}
              style={{
                padding: '8px 12px',
                fontSize: 12,
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                color: 'var(--text-muted)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Today
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activityReport.map((r) => (
              <div
                key={r.user_id}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
                    {r.full_name} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>@{r.username}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--amber)' }}>
                    {formatMinutes(r.active_minutes)}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>1st Login: {r.first_login_at ? new Date(r.first_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  <span>Actions: <strong style={{ color: 'var(--text)' }}>{r.total_actions_count || 0}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete User Modal (Handles both Active & Inactive) */}
      {userToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              padding: 18,
              maxWidth: 400,
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🗑️</span> {userToDelete.active ? 'User Account Action' : 'Delete Inactive Account'}
            </div>

            {userToDelete.active ? (
              <div>
                <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>
                  <strong style={{ color: 'var(--text)' }}>{userToDelete.full_name}</strong> (<code>@{userToDelete.username}</code>) is currently <span style={{ color: '#10b981', fontWeight: 700 }}>🟢 ACTIVE</span>.
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 6, padding: '8px 10px', fontSize: 12, color: 'var(--text)', marginBottom: 14 }}>
                  ⚠️ <strong>Recommendation:</strong> Change active user to <strong>Inactive</strong> first before permanent deletion to safeguard live sessions.
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setUserToDelete(null)}
                    style={{
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'none',
                      border: '1px solid var(--line)',
                      color: 'var(--text)',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleToggleActive(userToDelete);
                      setUserToDelete(null);
                    }}
                    style={{
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      background: 'var(--amber)',
                      color: '#1c1500',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    Change to Inactive ⚪
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    style={{
                      padding: '8px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      background: '#f43f5e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Purge Anyway'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
                  Are you sure you want to permanently delete inactive user <strong style={{ color: 'var(--text)' }}>{userToDelete.full_name}</strong> (<code>@{userToDelete.username}</code>)?
                  <div style={{ marginTop: 8, fontSize: 11, color: '#10b981' }}>
                    • Inactive account records unlinked cleanly.<br/>
                    • Username <code>@{userToDelete.username}</code> immediately freed up for new registration.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setUserToDelete(null)}
                    style={{
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'none',
                      border: '1px solid var(--line)',
                      color: 'var(--text)',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    style={{
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      background: '#f43f5e',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    {deleting ? 'Deleting…' : 'Yes, Delete Permanently'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
