import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const ACTION_TYPES = [
  { value: 'pm_service', label: '🛠️ Scheduled PM Service (Full Strip, Clean & Grease)' },
  { value: 'polishing', label: '✨ Core / Cavity Polishing & Vent Cleaning' },
  { value: 'repair', label: '⚡ Emergency Repair (Ejector Pin, Gate, Seal)' },
  { value: 'inspection', label: '🔍 Periodic Tool Audit & Parting Line Check' },
  { value: 'overhaul', label: '🏗️ Major Tool Overhaul / Refurbishment' },
];

export default function MouldsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [moulds, setMoulds] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ok' | 'due_soon' | 'overdue'

  // Modal states
  const [pmModalMould, setPmModalMould] = useState(null);
  const [pmActionType, setPmActionType] = useState('pm_service');
  const [pmDescription, setPmDescription] = useState('');
  const [pmTechnician, setPmTechnician] = useState('');
  const [pmSubmitting, setPmSubmitting] = useState(false);

  const [historyModalMould, setHistoryModalMould] = useState(null);
  const [mouldDetail, setMouldDetail] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  function loadMoulds() {
    setLoading(true);
    api.moulds.list()
      .then((data) => setMoulds(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load moulds:', err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMoulds();
  }, []);

  function openPmModal(m) {
    setPmModalMould(m);
    setPmActionType('pm_service');
    setPmDescription('Scheduled 20K Shot PM: Cavity/core ultrasonic cleaning, ejector pins check, guide pillar lubrication, parting line venting inspection.');
    setPmTechnician(user?.full_name || '');
  }

  async function submitPm(e) {
    e.preventDefault();
    if (!pmModalMould) return;
    setPmSubmitting(true);
    try {
      await api.moulds.logMaintenance(pmModalMould.id, {
        action_type: pmActionType,
        description: pmDescription,
        technician_name: pmTechnician,
        reset_pm_counter: true,
      });
      setPmModalMould(null);
      loadMoulds();
    } catch (err) {
      alert('Error recording PM service: ' + (err.message || 'Server error'));
    } finally {
      setPmSubmitting(false);
    }
  }

  function openHistoryModal(m) {
    setHistoryModalMould(m);
    setHistoryLoading(true);
    api.moulds.detail(m.id)
      .then((data) => setMouldDetail(data))
      .catch((err) => alert('Failed to load mould detail: ' + err.message))
      .finally(() => setHistoryLoading(false));
  }

  // Filter logic
  const filteredMoulds = moulds.filter((m) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      m.mould_code?.toLowerCase().includes(q) ||
      m.mould_name?.toLowerCase().includes(q) ||
      m.customer_name?.toLowerCase().includes(q) ||
      (m.linked_parts && m.linked_parts.some((p) => p.shrp_part_code?.toLowerCase().includes(q) || p.part_name?.toLowerCase().includes(q)));

    if (!matchSearch) return false;
    if (filterStatus === 'ok') return m.pm_status === 'ok';
    if (filterStatus === 'due_soon') return m.pm_status === 'due_soon';
    if (filterStatus === 'overdue') return m.pm_status === 'overdue';
    return true;
  });

  // KPI calculations
  const totalCount = moulds.length;
  const okCount = moulds.filter((m) => m.pm_status === 'ok').length;
  const dueSoonCount = moulds.filter((m) => m.pm_status === 'due_soon').length;
  const overdueCount = moulds.filter((m) => m.pm_status === 'overdue').length;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}
            >
              ← Home
            </button>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
              ⚙️ Mould Management & Tool Life Tracking
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
            IATF 16949 Clause 8.5.1.5 · Automated Shot Accumulation, Tool Life TPM & Preventive Service
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => navigate('/machines')}
            style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '8px 14px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            🖥️ View Machines Fleet →
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Tooling Bank</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>{totalCount} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Moulds</span></div>
        </div>
        <div
          onClick={() => setFilterStatus('ok')}
          style={{ background: 'var(--surface)', border: `1.5px solid ${filterStatus === 'ok' ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: 10, padding: 14, cursor: 'pointer' }}
        >
          <div style={{ fontSize: 12, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Healthy Tool Life</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399', marginTop: 4 }}>{okCount}</div>
        </div>
        <div
          onClick={() => setFilterStatus('due_soon')}
          style={{ background: 'var(--surface)', border: `1.5px solid ${filterStatus === 'due_soon' ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)'}`, borderRadius: 10, padding: 14, cursor: 'pointer' }}
        >
          <div style={{ fontSize: 12, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PM Due Soon (&ge;80%)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>{dueSoonCount}</div>
        </div>
        <div
          onClick={() => setFilterStatus('overdue')}
          style={{ background: 'var(--surface)', border: `1.5px solid ${filterStatus === 'overdue' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)'}`, borderRadius: 10, padding: 14, cursor: 'pointer' }}
        >
          <div style={{ fontSize: 12, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PM Overdue (&ge;100%)</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: overdueCount > 0 ? '#f87171' : 'var(--text-muted)', marginTop: 4 }}>{overdueCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Search mould code, part name, or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 300px', padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 8, fontSize: 13 }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', 'ok', 'due_soon', 'overdue'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: filterStatus === st ? 'var(--line)' : 'var(--surface)',
                color: filterStatus === st ? 'var(--text)' : 'var(--text-muted)',
                border: '1px solid var(--line)',
              }}
            >
              {st === 'ALL' ? 'Show All' : st === 'ok' ? '🟢 Healthy' : st === 'due_soon' ? '🟡 Due Soon' : '🔴 Overdue'}
            </button>
          ))}
        </div>
      </div>

      {/* Moulds Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading mould database...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
          {filteredMoulds.map((m) => {
            const isOverdue = m.pm_status === 'overdue';
            const isDueSoon = m.pm_status === 'due_soon';
            const barColor = isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#10b981';
            const badgeBg = isOverdue ? 'rgba(239, 68, 68, 0.15)' : isDueSoon ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
            const badgeBorder = isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#10b981';

            return (
              <div
                key={m.id}
                style={{
                  background: 'var(--surface)',
                  border: `1.5px solid ${isOverdue ? '#ef4444' : isDueSoon ? 'rgba(245, 158, 11, 0.4)' : 'var(--line)'}`,
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  boxShadow: isOverdue ? '0 0 15px rgba(239, 68, 68, 0.15)' : 'none',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.02em' }}>
                        {m.mould_code}
                      </span>
                      <span style={{ background: 'var(--line)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                        {m.total_cavities}C Tool
                      </span>
                      {m.ownership === 'Customer' && (
                        <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                          {m.customer_name || 'Customer'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>
                      {m.mould_name}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: badgeBg, color: barColor, border: `1px solid ${badgeBorder}55`, whiteSpace: 'nowrap' }}>
                    {m.pm_status_label}
                  </span>
                </div>

                {/* Tool Life Progress Gauge */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Current PM Cycle: <strong>{m.shots_since_pm.toLocaleString()}</strong> / {m.pm_interval_shots.toLocaleString()} shots
                    </span>
                    <span style={{ fontWeight: 800, color: barColor }}>
                      {m.pm_progress_pct}%
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div style={{ height: 8, width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, m.pm_progress_pct)}%`,
                        background: barColor,
                        borderRadius: 4,
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    <span>Total Lifetime: <strong style={{ color: 'var(--text)' }}>{m.cumulative_shots.toLocaleString()} shots</strong></span>
                    <span>
                      {isOverdue ? (
                        <span style={{ color: '#f87171', fontWeight: 700 }}>⚠️ Overdue by {(m.shots_since_pm - m.pm_interval_shots).toLocaleString()}</span>
                      ) : (
                        <span>Balance to PM: <strong>{m.remaining_shots_to_pm.toLocaleString()}</strong></span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Storage & Specs Info */}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <div>📍 Location: <strong style={{ color: 'var(--text)' }}>{m.storage_location || 'Tool Crib'}</strong></div>
                  {m.notes && <div style={{ color: 'var(--text-muted)' }}>📋 {m.notes}</div>}
                  {m.last_pm && (
                    <div style={{ color: '#34d399', marginTop: 2 }}>
                      ✓ Last PM: {new Date(m.last_pm.last_pm_date).toLocaleDateString()} by {m.last_pm.technician_name}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => openPmModal(m)}
                    style={{
                      flex: 1,
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34d399',
                      padding: '7px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🛠️ Log PM Service
                  </button>
                  <button
                    onClick={() => openHistoryModal(m)}
                    style={{
                      flex: 1,
                      background: 'var(--line)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text)',
                      padding: '7px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    📜 Tool History
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Log PM Service / Maintenance */}
      {pmModalMould && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#181a1b', border: '1px solid var(--line)', borderRadius: 12, width: '100%', maxWidth: 540, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)' }}>🛠️ Log Tool PM / Maintenance Service</h3>
                <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600, marginTop: 2 }}>
                  {pmModalMould.mould_code} · {pmModalMould.mould_name} (Current Shots: {pmModalMould.shots_since_pm.toLocaleString()})
                </div>
              </div>
              <button onClick={() => setPmModalMould(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={submitPm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Maintenance Action</label>
                <select
                  value={pmActionType}
                  onChange={(e) => setPmActionType(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                >
                  {ACTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Service Notes & Work Done</label>
                <textarea
                  rows="3"
                  required
                  value={pmDescription}
                  onChange={(e) => setPmDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Toolmaker / Technician Name</label>
                <input
                  type="text"
                  required
                  value={pmTechnician}
                  onChange={(e) => setPmTechnician(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 6, padding: '10px 12px', fontSize: 12, color: '#34d399' }}>
                ✓ Submitting this service will reset the tool's <strong>shots since last PM</strong> back to <strong>0</strong> and record a permanent audit entry under IATF 16949 Clause 8.5.1.5.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setPmModalMould(null)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pmSubmitting}
                  style={{ background: '#10b981', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                >
                  {pmSubmitting ? 'Saving...' : '💾 Reset PM Counter & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Mould Detailed History & Service Audit */}
      {historyModalMould && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#181a1b', border: '1px solid var(--line)', borderRadius: 12, width: '100%', maxWidth: 840, padding: 24, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, color: 'var(--text)' }}>
                  📜 Tool Life & PM History: {historyModalMould.mould_code}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {historyModalMould.mould_name} · Total Lifetime: {historyModalMould.cumulative_shots.toLocaleString()} shots · Rack: {historyModalMould.storage_location}
                </div>
              </div>
              <button onClick={() => setHistoryModalMould(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Linked Parts Section */}
            {mouldDetail?.parts && mouldDetail.parts.length > 0 && (
              <div style={{ marginBottom: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
                  Linked Products Manufactured by this Tool
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {mouldDetail.parts.map((p) => (
                    <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '4px 10px', borderRadius: 6, fontSize: 12 }}>
                      <strong style={{ color: '#fbbf24' }}>{p.shrp_part_code || p.part_code}</strong> · {p.part_name} ({p.cavity_count} Cav)
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Maintenance History List */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading service history...</div>
              ) : (!mouldDetail?.logs || mouldDetail.logs.length === 0) ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No previous maintenance logs recorded yet. Tool is in pristine condition!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {mouldDetail.logs.map((log) => (
                    <div key={log.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                            {log.action_type.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                            {new Date(log.created_at).toLocaleDateString()} at {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 12 }}>
                          Shots at Service: {log.shots_at_service.toLocaleString()}
                        </span>
                      </div>

                      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text)' }}>
                        {log.description}
                      </div>

                      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Technician: <strong style={{ color: 'var(--text)' }}>{log.technician_name}</strong></span>
                        <span>Recorded by: {log.logged_by_name || 'System'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
