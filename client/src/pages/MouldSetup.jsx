import SearchableSelect from '../components/SearchableSelect';
import FpaModal from '../components/FpaModal';
import { useEffect, useState } from 'react';
import { api, getToken } from '../api';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

// Local "now" formatted for a datetime-local input's default value
function nowForInput() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const DEFAULT_REASONS = [
  'Plan Completed',
  'Customer Priority',
  'Machine Issue',
  'Mould Issue',
  'NPD/Trail',
  'Preventive Maintenance',
  'Max Stock Reached',
  'Sudden Plan',
  'Quality Issue',
  'Production Balancing',
];

export default function MouldSetup() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const canCorrect = user.role === 'supervisor' || user.role === 'admin';

  const [activeTab, setActiveTab] = useState('performance'); // 'performance' | 'setup' | 'audit'
  const [machines, setMachines] = useState([]);
  const [parts, setParts] = useState([]);
  const [current, setCurrent] = useState([]);
  const [mouldReasons, setMouldReasons] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyMachineFilter, setHistoryMachineFilter] = useState('ALL');

  // Campaign Performance State
  const [campaignData, setCampaignData] = useState([]);
  const [perfLoading, setPerfLoading] = useState(false);
  const [perfMachineFilter, setPerfMachineFilter] = useState('ALL');
  const [perfSearch, setPerfSearch] = useState('');

  // Setup Form State
  const [machineId, setMachineId] = useState('');
  const [partId, setPartId] = useState('');
  const [reason, setReason] = useState('Plan Completed');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loadStarted, setLoadStarted] = useState(nowForInput());
  const [directApprove, setDirectApprove] = useState(canCorrect);
  const [approvedAt, setApprovedAt] = useState(nowForInput());

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [okTimes, setOkTimes] = useState({}); // { [assignment_id]: 'YYYY-MM-DDTHH:mm' }
  const [editingId, setEditingId] = useState(null);
  const [selectedFpaAssignment, setSelectedFpaAssignment] = useState(null);

  async function loadData() {
    try {
      const [m, p, c, r] = await Promise.all([
        api.machines(),
        api.parts(),
        api.currentAssignments(),
        api.checkItems ? api.checkItems('mould_change_reason').catch(() => []) : Promise.resolve([]),
      ]);
      setMachines(m || []);
      setParts(p || []);
      setCurrent(c || []);
      const rList = Array.isArray(r) ? r : (r?.rows || []);
      setMouldReasons(rList.length > 0 ? rList.map((x) => x.item_name || x.reason) : DEFAULT_REASONS);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadCampaignPerformance(mId) {
    setPerfLoading(true);
    try {
      const params = mId && mId !== 'ALL' ? { machine_id: mId } : {};
      const data = await api.mouldCampaignPerformance(params);
      setCampaignData(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setPerfLoading(false);
    }
  }

  async function loadHistory(mId) {
    setHistoryLoading(true);
    try {
      const params = mId && mId !== 'ALL' ? { machine_id: mId } : {};
      const data = await api.assignmentHistory(params);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    loadCampaignPerformance(perfMachineFilter);
  }, []);

  useEffect(() => {
    if (activeTab === 'performance') {
      loadCampaignPerformance(perfMachineFilter);
    } else if (activeTab === 'audit' || activeTab === 'history') {
      loadHistory(historyMachineFilter);
    }
  }, [activeTab, perfMachineFilter, historyMachineFilter]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const effReason = reason === '__custom__' ? customReason.trim() : reason;
      await api.createAssignment({
        machine_id: Number(machineId),
        part_id: Number(partId),
        reason: effReason || 'Mould Change',
        notes,
        mould_load_started_at: loadStarted ? new Date(loadStarted).toISOString() : undefined,
        direct_approve: canCorrect ? directApprove : false,
        approved_at: canCorrect && directApprove && approvedAt ? new Date(approvedAt).toISOString() : undefined,
      });

      setSuccess(directApprove ? '✅ Mould change approved & activated. Counter reset to 0.' : t('mouldSetup.submittedSuccess'));
      setPartId('');
      setNotes('');
      setCustomReason('');
      setLoadStarted(nowForInput());
      setApprovedAt(nowForInput());
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function timeFor(assignmentId) {
    return okTimes[assignmentId] ?? nowForInput();
  }

  async function markFirstOk(assignmentId) {
    setError('');
    setMarkingId(assignmentId);
    try {
      const takenAt = okTimes[assignmentId];
      await api.markFirstOkPart(assignmentId, takenAt ? new Date(takenAt).toISOString() : undefined);
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.message);
      if (err.message && (err.message.toLowerCase().includes('fpa') || err.message.toLowerCase().includes('first-piece') || err.message.toLowerCase().includes('first piece'))) {
        const assign = current.find((c) => c.assignment_id === assignmentId);
        if (assign) {
          setSelectedFpaAssignment(assign);
        }
      }
    } finally {
      setMarkingId(null);
    }
  }

  const filteredPerformance = campaignData.filter((item) => {
    if (perfSearch.trim()) {
      const q = perfSearch.toLowerCase();
      const matchCode = (item.part_code || '').toLowerCase().includes(q);
      const matchShrp = (item.shrp_part_code || '').toLowerCase().includes(q);
      const matchName = (item.part_name || '').toLowerCase().includes(q);
      const matchMachine = (item.machine_code || '').toLowerCase().includes(q);
      const matchReason = (item.reason || '').toLowerCase().includes(q);
      if (!matchCode && !matchShrp && !matchName && !matchMachine && !matchReason) return false;
    }
    return true;
  });

  const totalRuns = filteredPerformance.length;
  const totalShots = filteredPerformance.reduce((sum, r) => sum + (Number(r.total_shots) || 0), 0);
  const totalGrossQty = filteredPerformance.reduce((sum, r) => sum + (Number(r.total_prod_qty) || 0), 0);
  const totalRejQty = filteredPerformance.reduce((sum, r) => sum + (Number(r.total_reject_qty) || 0), 0);
  const totalNetQty = filteredPerformance.reduce((sum, r) => sum + (Number(r.total_net_qty) || 0), 0);
  const totalGrossHrs = filteredPerformance.reduce((sum, r) => sum + (Number(r.gross_run_hours) || 0), 0);
  const totalIdleMin = filteredPerformance.reduce((sum, r) => sum + (Number(r.total_idle_min) || 0), 0);
  const totalNetHrs = filteredPerformance.reduce((sum, r) => sum + (Number(r.net_run_hours) || 0), 0);
  const avgEfficiency = totalRuns > 0 ? (filteredPerformance.reduce((sum, r) => sum + (Number(r.overall_efficiency_pct) || 0), 0) / totalRuns).toFixed(1) : '0.0';

  function formatPerfDateTime(val) {
    if (!val) return { date: '—', time: '' };
    const d = new Date(val);
    if (isNaN(d.getTime())) return { date: String(val), time: '' };
    return {
      date: d.toLocaleDateString([], { day: '2-digit', month: 'short', year: '2-digit' }),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  function exportPerfCsv() {
    if (!filteredPerformance.length) return;
    const headers = [
      'Machine', 'Part Code', 'SHRP Code', 'Part Name', 'Loaded Date', 'Loaded Time',
      'Unloaded Date', 'Unloaded Time', 'Total Shots', 'Total Prod Qty', 'Total Reject Qty',
      'Total Net Qty', 'Gross Run Hours', 'Total Idle Min', 'Net Run Hours', 'Overall Efficiency %', 'Mould Change Reason', 'Status'
    ];
    const rows = filteredPerformance.map((p) => {
      const l = p.loaded_at ? new Date(p.loaded_at) : null;
      const u = p.unloaded_at ? new Date(p.unloaded_at) : null;
      return [
        p.machine_code,
        `"${p.part_code || ''}"`,
        `"${p.shrp_part_code || ''}"`,
        `"${(p.part_name || '').replace(/"/g, '""')}"`,
        l ? l.toLocaleDateString() : '',
        l ? l.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        u ? u.toLocaleDateString() : (p.is_active ? 'RUNNING NOW' : ''),
        u ? u.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        p.total_shots,
        p.total_prod_qty,
        p.total_reject_qty,
        p.total_net_qty,
        p.gross_run_hours,
        p.total_idle_min,
        p.net_run_hours,
        p.overall_efficiency_pct,
        `"${(p.reason || '').replace(/"/g, '""')}"`,
        p.is_active ? 'Active' : (p.is_historical ? 'Historical' : 'Completed')
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mould_performance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function currentFor(mid) {
    return current.find((c) => String(c.machine_id) === String(mid));
  }

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="screen-title">{t('mouldSetup.title')}</h1>
          <p className="screen-sub">{t('mouldSetup.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={activeTab === 'performance' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ width: 'auto', padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
            onClick={() => setActiveTab('performance')}
          >
            📊 Mould Run Performance
          </button>
          <button
            type="button"
            className={activeTab === 'setup' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ width: 'auto', padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
            onClick={() => setActiveTab('setup')}
          >
            ⚙️ Mould Setup &amp; Active Runs
          </button>
          <button
            type="button"
            className={activeTab === 'audit' || activeTab === 'history' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ width: 'auto', padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
            onClick={() => setActiveTab('audit')}
          >
            📜 Setup &amp; Approval Audit Trail
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner" style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', marginTop: 12 }}>
          <div>{error}</div>
          {(error.toLowerCase().includes('fpa') || error.toLowerCase().includes('first-piece') || error.toLowerCase().includes('first piece')) && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '6px 14px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onClick={() => {
                const target = (markingId ? current.find((c) => c.assignment_id === markingId) : null) || current[0];
                if (target) setSelectedFpaAssignment(target);
              }}
            >
              <span>📝</span>
              <span>Open Digital FPA Sheet Now</span>
            </button>
          )}
        </div>
      )}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)', marginTop: 12 }}>{success}</div>}

      {activeTab === 'performance' && (
        <div style={{ marginTop: 16 }}>
          {/* Performance Summary KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 10, marginBottom: 16 }}>
            <div className="panel" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Runs</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)', marginTop: 4 }}>{totalRuns}</div>
            </div>
            <div className="panel" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Shots</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>{totalShots.toLocaleString()}</div>
            </div>
            <div className="panel" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Net OK Qty</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#34d399', marginTop: 4 }}>{totalNetQty.toLocaleString()}</div>
            </div>
            <div className="panel" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Rejections</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f87171', marginTop: 4 }}>{totalRejQty.toLocaleString()}</div>
            </div>
            <div className="panel" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Gross Run Hours</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', marginTop: 4 }}>{totalGrossHrs.toFixed(2)} hrs</div>
            </div>
            <div className="panel" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Idle Time</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fb923c', marginTop: 4 }}>{totalIdleMin.toLocaleString()} min</div>
            </div>
            <div className="panel" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Net Run Hours</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa', marginTop: 4 }}>{totalNetHrs.toFixed(2)} hrs</div>
            </div>
            <div className="panel" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Avg Efficiency</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: Number(avgEfficiency) >= 90 ? '#34d399' : Number(avgEfficiency) >= 75 ? '#fbbf24' : '#f87171', marginTop: 4 }}>
                {avgEfficiency}%
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="panel" style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ minWidth: 180 }}>
                <select
                  value={perfMachineFilter}
                  onChange={(e) => setPerfMachineFilter(e.target.value)}
                  style={{ width: '100%', padding: '6px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 12 }}
                >
                  <option value="ALL">All Machines ({machines.length})</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>{m.machine_code}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: 200, maxWidth: 350 }}>
                <input
                  type="text"
                  placeholder="🔍 Search Part, Machine, Reason..."
                  value={perfSearch}
                  onChange={(e) => setPerfSearch(e.target.value)}
                  style={{ width: '100%', padding: '6px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 12 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={exportPerfCsv}
                disabled={filteredPerformance.length === 0}
              >
                📥 Export Excel / CSV
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }}
                onClick={() => loadCampaignPerformance(perfMachineFilter)}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* Performance Data Table */}
          {perfLoading ? (
            <div className="panel" style={{ textAlign: 'center', padding: 40 }}>Loading mould campaign performance records...</div>
          ) : filteredPerformance.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No mould campaign performance records found matching filter.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--line)', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    <th style={{ padding: '10px 8px' }}>Machine</th>
                    <th style={{ padding: '10px 8px' }}>Part No</th>
                    <th style={{ padding: '10px 8px' }}>Part Name</th>
                    <th style={{ padding: '10px 8px' }}>Loaded Date &amp; Time</th>
                    <th style={{ padding: '10px 8px' }}>Unloaded Date &amp; Time</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Total Shots</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Total Prod Qty</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Reject Qty</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Net OK Qty</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Gross Run Hrs</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Idle Min</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Net Run Hrs</th>
                    <th style={{ padding: '10px 8px', textAlign: 'center' }}>Efficiency %</th>
                    <th style={{ padding: '10px 8px' }}>Mould Change Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPerformance.map((p, idx) => {
                    const lDt = formatPerfDateTime(p.loaded_at);
                    const uDt = p.is_active ? null : formatPerfDateTime(p.unloaded_at);
                    const eff = Number(p.overall_efficiency_pct) || 0;

                    return (
                      <tr
                        key={p.id || idx}
                        style={{
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          background: p.is_active ? 'rgba(16, 185, 129, 0.04)' : undefined,
                        }}
                      >
                        <td style={{ padding: '10px 8px', fontWeight: 700, color: '#fbbf24', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span>{p.machine_code}</span>
                            {p.is_active && (
                              <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 700 }}>
                                LIVE
                              </span>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text)' }}>
                            {p.shrp_part_code || p.part_code}
                          </span>
                          {p.shrp_part_code && p.part_code && p.shrp_part_code !== p.part_code && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.part_code}</div>
                          )}
                        </td>

                        <td style={{ padding: '10px 8px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.part_name}>
                          {p.part_name}
                        </td>

                        <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                          <div>{lDt.date}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{lDt.time}</div>
                        </td>

                        <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                          {p.is_active ? (
                            <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.2)', color: '#34d399', fontSize: 10, fontWeight: 700 }}>
                              🟢 Running Now
                            </span>
                          ) : (
                            <>
                              <div>{uDt?.date}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{uDt?.time}</div>
                            </>
                          )}
                        </td>

                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>
                          {(Number(p.total_shots) || 0).toLocaleString()}
                        </td>

                        <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                          {(Number(p.total_prod_qty) || 0).toLocaleString()}
                        </td>

                        <td style={{ padding: '10px 8px', textAlign: 'right', color: Number(p.total_reject_qty) > 0 ? '#f87171' : 'var(--text-muted)' }}>
                          {(Number(p.total_reject_qty) || 0).toLocaleString()}
                        </td>

                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>
                          {(Number(p.total_net_qty) || 0).toLocaleString()}
                        </td>

                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>
                          {(Number(p.gross_run_hours) || 0).toFixed(2)}
                        </td>

                        <td style={{ padding: '10px 8px', textAlign: 'right', color: Number(p.total_idle_min) > 0 ? '#fb923c' : 'var(--text-muted)' }}>
                          {Number(p.total_idle_min) || 0}
                        </td>

                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>
                          {(Number(p.net_run_hours) || 0).toFixed(2)}
                        </td>

                        <td style={{ padding: '10px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 12,
                              fontSize: 10,
                              fontWeight: 700,
                              background: eff >= 100 ? 'rgba(16,185,129,0.15)' : eff >= 85 ? 'rgba(56,189,248,0.15)' : eff >= 70 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                              color: eff >= 100 ? '#34d399' : eff >= 85 ? '#38bdf8' : eff >= 70 ? '#fbbf24' : '#f87171',
                            }}
                          >
                            {eff.toFixed(1)}%
                          </span>
                        </td>

                        <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              fontSize: 10,
                              fontWeight: 600,
                              background: 'rgba(255,255,255,0.06)',
                              color: 'var(--text)',
                            }}
                          >
                            {p.reason || 'Plan Completed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'rgba(255,255,255,0.06)', borderTop: '2px solid var(--line)', fontWeight: 800 }}>
                    <td colSpan={5} style={{ padding: '10px 8px', textAlign: 'right' }}>Total / Average:</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#38bdf8' }}>{totalShots.toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{totalGrossQty.toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#f87171' }}>{totalRejQty.toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#34d399' }}>{totalNetQty.toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{totalGrossHrs.toFixed(2)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', color: '#fb923c' }}>{totalIdleMin.toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>{totalNetHrs.toFixed(2)}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: Number(avgEfficiency) >= 90 ? '#34d399' : '#fbbf24' }}>
                      {avgEfficiency}%
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'setup' && (
        <>
          <form onSubmit={handleSubmit} className="panel" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', marginBottom: 12, borderBottom: '1px solid var(--line)', paddingBottom: 6 }}>
              ➕ Initiate Mould Change &amp; Setup
            </div>

            <div className="field">
              <label htmlFor="machine">{t('common.machine')} *</label>
              <SearchableSelect
                id="machine"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                options={machines}
                placeholder={t('common.selectMachine')}
                searchPlaceholder="🔍 Type machine code..."
                getOptionValue={(m) => m.id}
                getOptionLabel={(m) => m.machine_code}
                required
              />
            </div>

            {machineId && (
              <div className="readout" style={{ marginBottom: 14 }}>
                <div className="readout-label">{t('mouldSetup.currentlyRunning')}</div>
                {currentFor(machineId) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    <span className="shrp-code-pill">{currentFor(machineId).shrp_part_code || currentFor(machineId).part_code}</span>
                    <span style={{ fontWeight: 600 }}>{currentFor(machineId).part_name}</span>
                    <span className="muted" style={{ fontSize: 11 }}>({currentFor(machineId).customer_part_no || currentFor(machineId).part_code})</span>
                    {currentFor(machineId).reason_name && (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }}>
                        Reason: {currentFor(machineId).reason_name}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="muted">{t('mouldSetup.noApprovedPart')}</div>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor="part">{t('mouldSetup.newPart')} *</label>
              <SearchableSelect
                id="part"
                value={partId}
                onChange={(e) => setPartId(e.target.value)}
                options={parts}
                placeholder={t('common.selectPart')}
                searchPlaceholder="🔍 Type part code, name, customer no..."
                getOptionValue={(p) => p.id}
                getOptionLabel={(p) => p.part_name}
                getOptionBadge={(p) => p.shrp_part_code || p.part_code}
                getOptionSublabel={(p) => (p.customer_part_no ? 'Cust: ' + p.customer_part_no : p.part_code)}
                required
              />
            </div>

            {partId && (() => {
              const sel = parts.find((p) => String(p.id) === String(partId));
              if (!sel) return null;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                  {sel.photo_file_id ? (
                    <img
                      src={`/api/masters/parts/${sel.id}/files/${sel.photo_file_id}?token=${getToken()}`}
                      alt={sel.part_name}
                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}
                    />
                  ) : (
                    <div style={{ width: 60, height: 60, borderRadius: 8, border: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      📷
                    </div>
                  )}
                  <div style={{ fontSize: 13 }}>
                    <div style={{ fontWeight: 700, color: '#fbbf24' }}>[{sel.shrp_part_code || sel.part_code}] {sel.part_name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Customer No: {sel.customer_part_no || sel.part_code}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>Cavities: {sel.cavity_count} · Shot Wt: {sel.unit_weight_g || '-'}g</div>
                  </div>
                </div>
              );
            })()}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="field">
                <label htmlFor="mould_reason">Mould Change Reason *</label>
                <select
                  id="mould_reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6 }}
                >
                  {mouldReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  <option value="__custom__">✏️ Other / Custom Reason...</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="load_started">{t('mouldSetup.loadStarted')} *</label>
                <input
                  id="load_started"
                  type="datetime-local"
                  value={loadStarted}
                  onChange={(e) => setLoadStarted(e.target.value)}
                  required
                />
              </div>
            </div>

            {reason === '__custom__' && (
              <div className="field" style={{ marginTop: -4 }}>
                <label htmlFor="custom_reason">Enter Custom Reason *</label>
                <input
                  id="custom_reason"
                  required
                  placeholder="Specify reason for mould change"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="notes">{t('mouldSetup.notes')}</label>
              <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Tool condition, cavity blanking or trial details..." />
            </div>

            {canCorrect && (
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={directApprove}
                    onChange={(e) => setDirectApprove(e.target.checked)}
                  />
                  <div>
                    <strong style={{ fontSize: 12, color: '#38bdf8' }}>⚡ Direct Approve &amp; Activate Setup</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Auto-approves immediately as Supervisor/Admin (for backdating past mould changes)
                    </div>
                  </div>
                </label>

                {directApprove && (
                  <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="field" style={{ margin: 0 }}>
                      <label style={{ fontSize: 11, color: '#38bdf8' }}>Approval Timestamp</label>
                      <input
                        type="datetime-local"
                        value={approvedAt}
                        onChange={(e) => setApprovedAt(e.target.value)}
                      />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      Counter resets to 0 upon approval.
                    </div>
                  </div>
                )}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? t('mouldSetup.submitting') : directApprove ? '⚡ Approve & Activate Mould Change' : t('mouldSetup.submitForApproval')}
            </button>
          </form>

          <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '24px 0 12px' }}>{t('mouldSetup.runningNow')}</h2>
          {current.map((c) => {
            const isFpaApproved = c.fpa_approval_status === 'APPROVED' || c.fpa_approval_status === 'CONDITIONAL';

            return (
              <div key={c.machine_id} className="panel" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#fbbf24' }}>{c.machine_code}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <span className="shrp-code-pill" style={{ fontSize: 12, padding: '2px 8px' }}>{c.shrp_part_code || c.part_code}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{c.part_name}</span>
                      <span className="muted" style={{ fontSize: 11 }}>({c.customer_part_no || c.part_code})</span>
                      {c.reason_name && (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 600 }}>
                          Reason: {c.reason_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="status-pill status-approved">{t('mouldSetup.approved')}</span>
                    <span
                      className="status-pill"
                      style={
                        isFpaApproved
                          ? { background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }
                          : c.fpa_approval_status === 'VISUAL_APPROVED'
                          ? { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }
                          : { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }
                      }
                    >
                      {isFpaApproved ? '🛡️ Full FPA Approved' : c.fpa_approval_status === 'VISUAL_APPROVED' ? '⚡ Visual FPA Approved' : '🛡️ FPA Pending'}
                    </span>
                  </div>
                </div>

                {c.mould_load_started_at && (
                  <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                    {t('mouldSetup.loadingStartedLabel', { time: new Date(c.mould_load_started_at).toLocaleString() })}
                  </div>
                )}

                {!isFpaApproved ? (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: 12, marginTop: 10 }}>
                    <div style={{ color: '#f87171', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      🛡️ IATF 16949 Clause 8.5.1.1 First-Piece Approval Required
                    </div>
                    <div style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>
                      Mould setup is approved. Before regular production begins, enter machine parameters, visual check, and cavity dimensional readings on the FPA sheet.
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedFpaAssignment(c)}
                        className="btn btn-primary"
                        style={{ width: 'auto', padding: '8px 16px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <span>📝</span>
                        <span>Open Digital FPA Sheet &amp; First Part Approval</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, padding: 12, marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ color: '#34d399', fontSize: 12, fontWeight: 600 }}>
                        ✅ 1st OK Part Approved: {c.first_ok_part_at ? new Date(c.first_ok_part_at).toLocaleString() : new Date(c.approved_at).toLocaleString()}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        {c.fpa_submission_id && (
                          <a
                            href={api.fpa.downloadPdfUrl(c.fpa_submission_id)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '4px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            <span>📄</span>
                            <span>View FPA PDF</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedFpaAssignment(c)}
                          className="btn btn-secondary"
                          style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                        >
                          <span>📝</span>
                          <span>Edit FPA Sheet</span>
                        </button>
                        {canCorrect && (
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                            onClick={() => {
                              setOkTimes((ot) => ({ ...ot, [c.assignment_id]: nowForInput() }));
                              setEditingId(c.assignment_id);
                            }}
                          >
                            {t('mouldSetup.correctTime')}
                          </button>
                        )}
                      </div>
                    </div>

                    {editingId === c.assignment_id && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="field" style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: 12 }} htmlFor={`ok_time_${c.assignment_id}`}>
                            {t('mouldSetup.correctedLabel')}
                          </label>
                          <input
                            id={`ok_time_${c.assignment_id}`}
                            type="datetime-local"
                            value={timeFor(c.assignment_id)}
                            onChange={(e) => setOkTimes((ot) => ({ ...ot, [c.assignment_id]: e.target.value }))}
                          />
                        </div>
                        <div className="btn-row">
                          <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={markingId === c.assignment_id}
                            onClick={() => markFirstOk(c.assignment_id)}
                          >
                            {markingId === c.assignment_id ? t('mouldSetup.saving') : t('mouldSetup.saveCorrectedTime')}
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)}>
                            {t('mouldSetup.cancel')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {(activeTab === 'audit' || activeTab === 'history') && (
        <div style={{ marginTop: 16 }}>
          <div className="panel" style={{ marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <strong style={{ fontSize: 14, color: 'var(--amber)' }}>📜 Mould Change &amp; Setup Audit Trail</strong>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Chronological record of all mould changeovers, reasons, and approvals</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Filter Machine:</label>
              <select
                value={historyMachineFilter}
                onChange={(e) => setHistoryMachineFilter(e.target.value)}
                style={{ padding: '6px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 12 }}
              >
                <option value="ALL">All Machines ({machines.length})</option>
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>{m.machine_code}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }}
                onClick={() => loadHistory(historyMachineFilter)}
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="panel" style={{ textAlign: 'center', padding: 30 }}>Loading mould change history...</div>
          ) : history.length === 0 ? (
            <div className="panel" style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
              No mould change history records found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Date &amp; Time</th>
                    <th style={{ padding: '10px 12px' }}>Machine</th>
                    <th style={{ padding: '10px 12px' }}>Mould Transition (From → To)</th>
                    <th style={{ padding: '10px 12px' }}>Reason</th>
                    <th style={{ padding: '10px 12px' }}>Last Shot</th>
                    <th style={{ padding: '10px 12px' }}>Setup Approved</th>
                    <th style={{ padding: '10px 12px' }}>1st OK Part</th>
                    <th style={{ padding: '10px 12px' }}>FPA Sign-Off</th>
                    <th style={{ padding: '10px 12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => {
                    const isFpaOk = h.fpa_approval_status === 'APPROVED' || h.fpa_approval_status === 'CONDITIONAL';
                    const isVisualOk = h.fpa_approval_status === 'VISUAL_APPROVED';

                    return (
                      <tr key={h.assignment_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: 600 }}>{h.mould_load_started_at ? new Date(h.mould_load_started_at).toLocaleDateString() : (h.set_at ? new Date(h.set_at).toLocaleDateString() : '-')}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {h.mould_load_started_at ? new Date(h.mould_load_started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                          {h.set_by_name && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>by {h.set_by_name}</div>}
                        </td>

                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#fbbf24' }}>
                          {h.machine_code}
                        </td>

                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            {h.previous_part_code ? (
                              <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                                {h.previous_shrp_part_code || h.previous_part_code}
                              </span>
                            ) : (
                              <span className="muted" style={{ fontSize: 10 }}>Start</span>
                            )}
                            <span>→</span>
                            <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 700 }}>
                              {h.shrp_part_code || h.part_code}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text)', marginTop: 2 }}>{h.part_name}</div>
                        </td>

                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 10, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: 11, fontWeight: 600 }}>
                            {h.reason_name || h.reason || 'Mould Change'}
                          </span>
                          {h.notes && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{h.notes}</div>}
                        </td>

                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ fontWeight: 600 }}>{h.last_shot_count != null ? h.last_shot_count : '—'}</div>
                          <div style={{ fontSize: 10, color: '#34d399' }}>Reset to 0</div>
                        </td>

                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          {h.approved_at ? (
                            <div>
                              <div style={{ color: '#34d399', fontWeight: 600 }}>
                                {new Date(h.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{h.approved_by_name || 'Supervisor'}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#f59e0b', fontSize: 11 }}>Pending</span>
                          )}
                        </td>

                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          {h.first_ok_part_at ? (
                            <div>
                              <div style={{ color: '#34d399', fontWeight: 600 }}>
                                {new Date(h.first_ok_part_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>OK Part Logged</div>
                            </div>
                          ) : (
                            <span className="muted" style={{ fontSize: 11 }}>—</span>
                          )}
                        </td>

                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          {isFpaOk ? (
                            <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.2)', color: '#34d399', fontWeight: 700, fontSize: 11 }}>
                              ✅ Full FPA Approved
                            </span>
                          ) : isVisualOk ? (
                            <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontWeight: 700, fontSize: 11 }}>
                              ⚡ Visual Approved
                            </span>
                          ) : (
                            <span style={{ padding: '3px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: 11 }}>
                              ❌ FPA Pending
                            </span>
                          )}
                          {h.fpa_approved_by_name && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                              by {h.fpa_approved_by_name}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {h.fpa_submission_id && (
                              <a
                                href={api.fpa.downloadPdfUrl(h.fpa_submission_id)}
                                target="_blank"
                                rel="noreferrer"
                                className="btn btn-secondary"
                                style={{ padding: '3px 8px', fontSize: 11, width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              >
                                📄 PDF
                              </a>
                            )}
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '3px 8px', fontSize: 11, width: 'auto' }}
                              onClick={() => {
                                setSelectedFpaAssignment({
                                  assignment_id: h.assignment_id,
                                  machine_id: h.machine_id,
                                  machine_code: h.machine_code,
                                  part_id: h.part_id,
                                  part_code: h.part_code,
                                  shrp_part_code: h.shrp_part_code,
                                  part_name: h.part_name,
                                  mould_id: h.mould_id,
                                  mould_code: h.mould_code,
                                });
                              }}
                            >
                              📝 FPA
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {selectedFpaAssignment && (
        <FpaModal
          assignment={selectedFpaAssignment}
          machine={{ id: selectedFpaAssignment.machine_id, machine_code: selectedFpaAssignment.machine_code }}
          part={{
            id: selectedFpaAssignment.part_id,
            part_code: selectedFpaAssignment.part_code,
            shrp_part_code: selectedFpaAssignment.shrp_part_code,
            part_name: selectedFpaAssignment.part_name,
            cavity_count: selectedFpaAssignment.cavity_count,
          }}
          mould={selectedFpaAssignment.mould_id ? { id: selectedFpaAssignment.mould_id, mould_code: selectedFpaAssignment.mould_code } : null}
          onClose={() => setSelectedFpaAssignment(null)}
          onSuccess={() => {
            setSelectedFpaAssignment(null);
            setSuccess('✅ IATF First-Piece Approval saved & verified successfully!');
            loadData();
            if (activeTab === 'history') loadHistory(historyMachineFilter);
          }}
        />
      )}
    </div>
  );
}

