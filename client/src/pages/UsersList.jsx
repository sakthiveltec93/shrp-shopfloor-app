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

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ONLINE'
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
    // Auto-refresh active users every 30s
    const timer = setInterval(() => {
      api.users().then(setUsers).catch(() => {});
      api.userActivityReport(reportDate).then(setActivityReport).catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, [reportDate]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    setError('');
    try {
      const res = await api.deleteUser(userToDelete.id);
      setUserToDelete(null);
      setSuccessMsg(res.message || `User "${userToDelete.full_name}" deleted successfully!`);
      setTimeout(() => setSuccessMsg(''), 6000);
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

  const onlineCount = users.filter((u) => u.is_online).length;
  const activeCount = users.filter((u) => u.active).length;
  const inactiveCount = users.filter((u) => !u.active).length;

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (statusFilter === 'ACTIVE' && !u.active) return false;
    if (statusFilter === 'INACTIVE' && u.active) return false;
    if (statusFilter === 'ONLINE' && !u.is_online) return false;
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
    <div className="screen max-w-7xl mx-auto px-2 py-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div>
          <h1 className="screen-title">Staff Accounts & User Activity</h1>
          <p className="screen-sub">Manage operator access, delete inactive staff, track live logins & daily time-spent</p>
        </div>
        <Link to="/users/new" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontWeight: 600 }}>
          + Add New User
        </Link>
      </div>

      {successMsg && (
        <div className="p-3 mb-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3 mb-4 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-sm font-medium">
          ⚠ {error}
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accounts</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">{activeCount} active · {inactiveCount} inactive</div>
        </div>

        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Currently Online Now
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{onlineCount} <span className="text-xs font-normal text-emerald-700">active in app</span></div>
          <div className="text-xs text-emerald-700 mt-0.5">Live heartbeat within 5 mins</div>
        </div>

        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200 shadow-xs">
          <div className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Logged In Today</div>
          <div className="text-2xl font-black text-blue-900 mt-1">
            {activityReport.filter((r) => r.active_minutes > 0).length} <span className="text-xs font-normal text-blue-700">users</span>
          </div>
          <div className="text-xs text-blue-700 mt-0.5">Active session recorded today</div>
        </div>

        <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200 shadow-xs">
          <div className="text-xs font-semibold text-purple-800 uppercase tracking-wider">Total App Time Today</div>
          <div className="text-2xl font-black text-purple-900 mt-1">
            {formatMinutes(activityReport.reduce((sum, r) => sum + Number(r.active_minutes || 0), 0))}
          </div>
          <div className="text-xs text-purple-700 mt-0.5">Combined active shopfloor usage</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-4">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-2.5 px-3.5 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'accounts'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          👥 User Accounts & Access ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-2.5 px-3.5 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'activity'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📊 Daily User Activity & Time-Spent Report
        </button>
      </div>

      {activeTab === 'accounts' ? (
        <div>
          {/* Filter & Search Bar */}
          <div className="flex flex-wrap gap-2 items-center justify-between mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex flex-wrap gap-1">
              {['ALL', 'operator', 'supervisor', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    roleFilter === r
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-slate-600 border hover:bg-slate-100'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
              <div className="w-[1px] h-6 bg-slate-300 mx-1 self-center"></div>
              {['ALL', 'ACTIVE', 'INACTIVE', 'ONLINE'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-slate-600 border hover:bg-slate-100'
                  }`}
                >
                  {st === 'ONLINE' ? '🟢 Online Now' : st.charAt(0).toUpperCase() + st.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search user name, username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 w-60"
            />
          </div>

          {/* User Accounts Table */}
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading user accounts...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-xl border text-slate-500">
              No users found matching filter.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="p-3">Staff Name & Username</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Live App Status</th>
                    <th className="p-3">Last Active</th>
                    <th className="p-3 text-right">Today's Time in App</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{u.full_name}</div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          @{u.username}
                          {u.running_machine_code && (
                            <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] border border-amber-200 font-sans">
                              ⚙ Machine {u.running_machine_code}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'supervisor' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.is_online ? (
                          <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Online</span>
                            {u.last_viewed_page && (
                              <span className="text-[10px] text-slate-400 font-mono font-normal">({u.last_viewed_page})</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                            <span>Offline</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-medium">
                        {formatRelativeTime(u.last_active_at)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="font-bold text-slate-800">{formatMinutes(u.today_active_minutes)}</div>
                        {u.today_actions_count > 0 && (
                          <div className="text-[10px] text-slate-400">{u.today_actions_count} actions logged</div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {u.active ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <Link
                          to={`/users/${u.id}/edit`}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border"
                        >
                          ✏ Edit
                        </Link>
                        <button
                          onClick={() => setUserToDelete(u)}
                          className="px-2.5 py-1 rounded text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                          title="Delete user and release username"
                        >
                          🗑 Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Daily Activity & Time Spent Report Tab */
        <div>
          {/* Date Picker Bar */}
          <div className="flex flex-wrap justify-between items-center mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Report Date:</span>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-semibold"
              />
              <button
                onClick={() => setReportDate(new Date().toISOString().slice(0, 10))}
                className="px-2.5 py-1 text-xs font-medium rounded bg-white border hover:bg-slate-100 text-slate-700"
              >
                Today
              </button>
            </div>
            <div className="text-xs text-slate-500">
              Showing active time & shopfloor actions logged on <strong>{reportDate}</strong>
            </div>
          </div>

          {/* Activity Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-3">Staff Name & Username</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">First Login / Check-In</th>
                  <th className="p-3">Last Active Ping</th>
                  <th className="p-3">Total Time in App</th>
                  <th className="p-3 text-center">Production Entries</th>
                  <th className="p-3 text-center">Bags Created</th>
                  <th className="p-3 text-center">Trim Passes</th>
                  <th className="p-3 text-center">Inspections</th>
                  <th className="p-3 text-right">Total Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activityReport.map((row) => {
                  const hasActivity = Number(row.active_minutes) > 0 || Number(row.total_actions_count) > 0;
                  return (
                    <tr key={row.user_id} className={`hover:bg-slate-50/80 ${!hasActivity ? 'opacity-60 bg-slate-50/30' : ''}`}>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{row.full_name}</div>
                        <div className="text-slate-500 font-mono text-[11px]">@{row.username}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {row.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-mono">
                        {row.first_login_at ? new Date(row.first_login_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="p-3 text-slate-700 font-mono">
                        {row.day_last_active_at ? new Date(row.day_last_active_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 text-sm">{formatMinutes(row.active_minutes)}</div>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 border">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, (Number(row.active_minutes || 0) / 480) * 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {row.production_entries_count || 0}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {row.bags_created_count || 0}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {row.trim_entries_count || 0}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {row.inspection_entries_count || 0}
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {row.total_actions_count || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="text-rose-600 text-lg">🗑️</span> Delete User Account
              </h2>
              <button onClick={() => setUserToDelete(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p>
                Are you sure you want to delete <strong>{userToDelete.full_name}</strong> (<code>@{userToDelete.username}</code>)?
              </p>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 space-y-1">
                <div className="font-bold">What will happen:</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>The user will be immediately logged out and blocked from logging in.</li>
                  <li>Their username <strong>"{userToDelete.username}"</strong> will be freed up immediately and can be registered for a new operator.</li>
                  <li>If the user has historical production/bag entries, their audit logs will remain safe for IATF compliance.</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded text-xs font-medium border text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 rounded text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
