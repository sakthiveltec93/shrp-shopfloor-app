import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import CameraScanner from '../components/CameraScanner';
import DeletionModal from '../components/DeletionModal';
import CorrectionModal from '../components/CorrectionModal';

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function timeRange(e) {
  const start = e.period_start_at || e.start_time;
  const end = e.period_end_at || e.end_time;
  if (!start || !end) return null;
  const fmt = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${fmt(start)}–${fmt(end)}`;
}

export default function TodayLog() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('production'); // 'production' | 'bags' | 'traceability' | 'audit_log'
  const [date, setDate] = useState(todayLocal());
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [entries, setEntries] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [correctionTarget, setCorrectionTarget] = useState(null); // { mode, record }
  const [statusMsg, setStatusMsg] = useState('');

  // Bag Log State
  const [bagLogs, setBagLogs] = useState([]);
  const [bagStageFilter, setBagStageFilter] = useState('ALL');
  const [bagSearch, setBagSearch] = useState('');
  const [selectedBagDetail, setSelectedBagDetail] = useState(null);
  const [bagLoading, setBagLoading] = useState(false);

  // Traceability State
  const [traceCode, setTraceCode] = useState('');
  const [traceLogs, setTraceLogs] = useState(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  // Audit Log State (Admin Only)
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditEntityFilter, setAuditEntityFilter] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('');

  const isOperator = user?.role === 'operator';
  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor' || isAdmin;

  // Fetch Hourly Production Entries
  const loadEntries = () => {
    api.entriesForDate(date).then(setEntries).catch(() => {});
  };

  useEffect(() => {
    if (activeTab === 'production') {
      loadEntries();
    }
  }, [date, activeTab]);

  // Fetch Bag History Log
  const loadBagLogs = () => {
    setBagLoading(true);
    api.bagHistoryLog({ date, shift: shiftFilter })
      .then((res) => setBagLogs(res || []))
      .catch(() => setBagLogs([]))
      .finally(() => setBagLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'bags') {
      loadBagLogs();
    }
  }, [date, shiftFilter, activeTab]);

  // Fetch Correction Audit Log (Admin Only)
  const loadAuditLogs = () => {
    if (!isAdmin) return;
    setAuditLoading(true);
    api.corrections.log({
      entity_type: auditEntityFilter || undefined,
      action: auditActionFilter || undefined,
      date_from: date || undefined,
    })
      .then((res) => setAuditLogs(res || []))
      .catch(() => setAuditLogs([]))
      .finally(() => setAuditLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'audit_log') {
      loadAuditLogs();
    }
  }, [date, auditEntityFilter, auditActionFilter, activeTab]);

  async function handleScanTrace(code) {
    if (!code) return;
    setTraceCode(code);
    setTraceLoading(true);
    setTraceError('');
    setTraceLogs(null);
    try {
      const logs = await api.traceability(code.trim());
      setTraceLogs(logs);
      if (logs.length === 0) setTraceError('No audit records found for this code.');
    } catch (err) {
      setTraceError(err.message);
    } finally {
      setTraceLoading(false);
    }
  }

  async function lookupTrace(e) {
    if (e) e.preventDefault();
    if (!traceCode.trim()) return;
    setTraceLoading(true);
    setTraceError('');
    setTraceLogs(null);
    try {
      const logs = await api.traceability(traceCode.trim());
      setTraceLogs(logs);
      if (logs.length === 0) setTraceError('No audit records found for this code.');
    } catch (err) {
      setTraceError(err.message);
    } finally {
      setTraceLoading(false);
    }
  }

  function downloadCsv() {
    if (!bagLogs || bagLogs.length === 0) return;
    const headers = [
      'Bag Code', 'Batch No', 'Entry Date', 'Shift', 'Machine',
      'Part Short Code', 'Customer Part No', 'Bag Type', 'Base Weight (kg)', 'Quantity',
      'Current Status', 'Created By', 'Trimming Summary', 'Inspection Summary', 'Rejections & Dispositions', 'Packing Summary', 'Created At'
    ];

    const rows = filteredBags.map((b) => {
      const trimSummary = (b.trim_history || []).map((t) =>
        `Pass ${t.pass_number}: Trimmed ${t.trimmed_wt_kg}kg, Runner ${t.runner_wt_kg}kg, Rej ${t.reject_wt_kg}kg by ${t.operator_name || 'Op'}`
      ).join(' | ');

      const inspSummary = (b.inspection_history || []).map((i) =>
        `Insp ${i.inspected_wt_kg}kg, Rej ${i.reject_wt_kg}kg, Rework ${i.sent_to_rework_qty}pcs (${i.variance_tier || 'Tier 1'}) by ${i.operator_name || 'Op'}`
      ).join(' | ');

      const rejSummary = (b.reject_history || []).map((r) =>
        `[${r.stage}] ${r.reject_reason || 'Defect'}: ${r.reject_wt_kg}kg (~${r.reject_qty}pcs) -> ${r.disposition}`
      ).join(' | ');

      const packSummary = (b.packing_history || []).map((p) =>
        `Packed ${p.packed_qty}pcs (${p.packed_wt_kg}kg, ${p.packets_count} pkts, bal ${p.balance_qty}pcs) by ${p.operator_name || 'Op'}`
      ).join(' | ');

      return [
        `"${b.bag_code}"`,
        `"${b.batch_no}"`,
        `"${b.entry_date}"`,
        `"${b.shift}"`,
        `"${b.machine_code || ''}"`,
        `"${b.shrp_part_code || b.part_code}"`,
        `"${b.customer_part_no || b.part_name}"`,
        `"${b.bag_type}"`,
        b.base_weight_kg,
        b.qty,
        `"${b.status}"`,
        `"${b.created_by_name || ''}"`,
        `"${trimSummary}"`,
        `"${inspSummary}"`,
        `"${rejSummary}"`,
        `"${packSummary}"`,
        `"${new Date(b.created_at).toLocaleString('en-GB')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shrp_bag_log_${date}_${shiftFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filtered Bags
  const filteredBags = bagLogs.filter((b) => {
    if (bagStageFilter === 'OPEN' && b.status !== 'OPEN') return false;
    if (bagStageFilter === 'TRIMMING' && !['PARTIAL_TRIM', 'TRIMMED'].includes(b.status)) return false;
    if (bagStageFilter === 'INSPECTION' && !['PARTIAL_INSPECT', 'INSPECTED'].includes(b.status)) return false;
    if (bagStageFilter === 'PACKING' && !['PARTIAL_PACK', 'PACKED'].includes(b.status)) return false;
    if (bagStageFilter === 'HOLD' && b.status !== 'HOLD') return false;

    if (bagSearch.trim()) {
      const q = bagSearch.toLowerCase();
      const matchCode = b.bag_code?.toLowerCase().includes(q);
      const matchBatch = b.batch_no?.toLowerCase().includes(q);
      const matchPart = b.shrp_part_code?.toLowerCase().includes(q) || b.part_code?.toLowerCase().includes(q);
      const matchCust = b.customer_part_no?.toLowerCase().includes(q);
      if (!matchCode && !matchBatch && !matchPart && !matchCust) return false;
    }
    return true;
  });

  const totalGood = entries.reduce((sum, e) => sum + e.good_qty, 0);
  const totalReject = entries.reduce((sum, e) => sum + e.reject_qty, 0);
  const effEntries = entries.filter((e) => e.efficiency_pct != null);
  const avgEff = effEntries.length
    ? Math.round((effEntries.reduce((sum, e) => sum + Number(e.efficiency_pct), 0) / effEntries.length) * 10) / 10
    : null;

  const byPart = {};
  for (const e of entries) {
    const k = e.shrp_part_code || e.part_code;
    if (!byPart[k]) byPart[k] = { name: e.part_name, good: 0, reject: 0 };
    byPart[k].good += e.good_qty;
    byPart[k].reject += e.reject_qty;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'var(--blue)';
      case 'PARTIAL_TRIM': return '#a78bfa';
      case 'TRIMMED': return 'var(--purple, #c084fc)';
      case 'PARTIAL_INSPECT': return '#38bdf8';
      case 'INSPECTED': return 'var(--teal, #2dd4bf)';
      case 'PARTIAL_PACK': return '#fbbf24';
      case 'PACKED': return 'var(--green)';
      case 'DISPATCHED': return 'var(--text-muted)';
      case 'HOLD': return 'var(--red)';
      default: return 'var(--text)';
    }
  };

  return (
    <div className="screen">
      <h1 className="screen-title">Shopfloor Log & Traceability</h1>
      <p className="screen-sub">Audit trail for hourly production entries, bag movements, and data corrections</p>

      {/* Main Top Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'production' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 'auto', flex: 1, minWidth: 140 }}
          onClick={() => setActiveTab('production')}
        >
          ⚙️ Production ({entries.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'bags' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 'auto', flex: 1, minWidth: 140 }}
          onClick={() => setActiveTab('bags')}
        >
          📦 Bag Traceability ({bagLogs.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'traceability' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 'auto', flex: 1, minWidth: 140 }}
          onClick={() => setActiveTab('traceability')}
        >
          🔍 QR Trace Audit
        </button>
        {isAdmin && (
          <button
            type="button"
            className={`btn ${activeTab === 'audit_log' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', flex: 1.2, minWidth: 160 }}
            onClick={() => setActiveTab('audit_log')}
          >
            🛡️ Correction Audit Log
          </button>
        )}
      </div>

      {statusMsg && (
        <div className="success-banner" style={{ marginBottom: 14 }}>
          {statusMsg}
        </div>
      )}

      {/* TAB 1: HOURLY PRODUCTION ENTRIES */}
      {activeTab === 'production' && (
        <>
          <div className="filter-row" style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label htmlFor="log-date" className="muted" style={{ fontSize: 13 }}>Date:</label>
              <input
                id="log-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ width: 'auto' }}
              />
            </div>
            {isSupervisor && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: 'auto', padding: '6px 14px', fontSize: 13, marginLeft: 'auto' }}
                onClick={() => setCorrectionTarget({ mode: 'backdate_production', record: null })}
              >
                ➕ Backdated / Catch-Up Entry
              </button>
            )}
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Total Good</span>
              <span className="kpi-value">{totalGood}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Total Reject</span>
              <span className="kpi-value">{totalReject}</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Rejection %</span>
              <span className="kpi-value">
                {totalGood + totalReject > 0
                  ? `${Math.round((totalReject / (totalGood + totalReject)) * 1000) / 10}%`
                  : '0%'}
              </span>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Avg Efficiency</span>
              <span className="kpi-value">{avgEff != null ? `${avgEff}%` : '-'}</span>
            </div>
          </div>

          {entries.length === 0 ? (
            <p className="muted" style={{ marginTop: 20 }}>No entries found for this date.</p>
          ) : (
            <div className="table-wrap" style={{ marginTop: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>Time / Period</th>
                    <th>Shift</th>
                    <th>Machine</th>
                    <th>Part</th>
                    <th>Counts</th>
                    <th>Good</th>
                    <th>Rej</th>
                    <th>Down (min)</th>
                    <th>Operator</th>
                    <th>Status</th>
                    {isSupervisor && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <strong>{timeRange(e) || (e.hour_slot ? `Hr ${e.hour_slot}` : '-')}</strong>
                      </td>
                      <td>{e.shift}</td>
                      <td><strong>{e.machine_code}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="shrp-code-pill">{e.shrp_part_code || e.part_code}</span>
                          <span style={{ fontSize: 12 }}>{e.part_name}</span>
                        </div>
                      </td>
                      <td>{e.start_count} → {e.end_count}</td>
                      <td><strong style={{ color: 'var(--green)' }}>{e.good_qty}</strong></td>
                      <td>{e.reject_qty > 0 ? <strong style={{ color: 'var(--red)' }}>{e.reject_qty}</strong> : 0}</td>
                      <td>{e.downtime_minutes || 0}</td>
                      <td className="muted">{e.operator_name}</td>
                      <td>
                        {e.is_backdated && <span style={{ fontSize: 10, background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '1px 5px', borderRadius: 3, fontWeight: 700, marginRight: 4 }}>BACKDATED</span>}
                        {e.is_edited && <span style={{ fontSize: 10, background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>EDITED</span>}
                      </td>
                      {isSupervisor && (
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ width: 'auto', padding: '3px 8px', fontSize: 11 }}
                              onClick={() => setCorrectionTarget({ mode: 'edit_production', record: e })}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ width: 'auto', padding: '3px 8px', fontSize: 11 }}
                              onClick={() => setDeleteTarget({ type: 'production_entry', id: e.id, label: `${e.machine_code} (${timeRange(e) || e.hour_slot}) - ${e.part_name}` })}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* TAB 2: BAG TRACEABILITY LOG */}
      {activeTab === 'bags' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label htmlFor="bag_date" className="muted" style={{ fontSize: 13 }}>Date:</label>
              <input id="bag_date" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 'auto' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label htmlFor="bag_shift" className="muted" style={{ fontSize: 13 }}>Shift:</label>
              <select id="bag_shift" value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)} style={{ width: 'auto' }}>
                <option value="ALL">All Shifts</option>
                <option value="A">Shift A</option>
                <option value="B">Shift B</option>
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <input
                type="text"
                placeholder="🔍 Search Bag Barcode, Batch, Part..."
                value={bagSearch}
                onChange={(e) => setBagSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
              onClick={downloadCsv}
            >
              📥 Export CSV
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {['ALL', 'OPEN', 'TRIMMING', 'INSPECTION', 'PACKING', 'HOLD'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn ${bagStageFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: 'auto', padding: '4px 10px', fontSize: 12, borderRadius: 16 }}
                onClick={() => setBagStageFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          {bagLoading ? (
            <p className="muted">Loading bag history records…</p>
          ) : filteredBags.length === 0 ? (
            <p className="muted">No bag traceability logs match your criteria.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Bag Barcode</th>
                    <th>Machine</th>
                    <th>Part Code & Name</th>
                    <th>Base Wt (kg)</th>
                    <th>Qty (pcs)</th>
                    <th>Status</th>
                    <th>Summary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBags.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <strong style={{ color: 'var(--amber)' }}>{b.bag_code}</strong>
                        <div className="muted" style={{ fontSize: 10 }}>Batch: {b.batch_no}</div>
                      </td>
                      <td><strong>{b.machine_code || '-'}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="shrp-code-pill">{b.shrp_part_code || b.part_code}</span>
                          <span style={{ fontSize: 12 }}>{b.part_name}</span>
                        </div>
                      </td>
                      <td>{b.base_weight_kg} kg</td>
                      <td><strong>{b.qty}</strong></td>
                      <td>
                        <span className="status-pill" style={{ background: `${getStatusColor(b.status)}20`, color: getStatusColor(b.status) }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 11 }} className="muted">
                        {b.status === 'PACKED' && `Packed ${b.qty} pcs`}
                        {b.status === 'INSPECTED' && `Inspected ${b.base_weight_kg} kg`}
                        {b.status === 'TRIMMED' && `Trimmed ${b.base_weight_kg} kg`}
                        {b.status === 'OPEN' && 'Moulded'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ width: 'auto', padding: '3px 8px', fontSize: 11 }}
                            onClick={() => setSelectedBagDetail(b)}
                          >
                            👁️ View
                          </button>
                          {isSupervisor && (
                            <>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ width: 'auto', padding: '3px 8px', fontSize: 11 }}
                                onClick={() => setCorrectionTarget({ mode: 'edit_bag', record: b })}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ width: 'auto', padding: '3px 8px', fontSize: 11, color: 'var(--blue)' }}
                                onClick={() => setCorrectionTarget({ mode: 'override_bag_status', record: b })}
                              >
                                🔄 Status
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger"
                                style={{ width: 'auto', padding: '3px 8px', fontSize: 11 }}
                                onClick={() => setDeleteTarget({ type: 'bag', id: b.id, label: `${b.bag_code} (${b.base_weight_kg} kg, ${b.qty} pcs)` })}
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* TAB 3: QR CODE TRACEABILITY LOOKUP */}
      {activeTab === 'traceability' && (
        <div className="panel">
          <form onSubmit={lookupTrace} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Scan or enter Bag Code or Part Code..."
              value={traceCode}
              onChange={(e) => setTraceCode(e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" type="submit" style={{ width: 'auto' }} disabled={traceLoading}>
              {traceLoading ? 'Looking up…' : 'Lookup'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto' }}
              onClick={() => setShowCamera(true)}
            >
              📷 Scan
            </button>
          </form>

          {traceError && <div className="error-banner">{traceError}</div>}

          {traceLogs && traceLogs.length > 0 && (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Process</th>
                    <th>Bag / Part Code</th>
                    <th>Qty</th>
                    <th>Weight (kg)</th>
                    <th>Status Advance</th>
                    <th>User</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {traceLogs.map((l) => (
                    <tr key={l.id}>
                      <td style={{ fontSize: 12 }}>{new Date(l.created_at).toLocaleString('en-GB')}</td>
                      <td><strong>{l.process}</strong></td>
                      <td>{l.bag_code || l.shrp_part_code || l.part_code}</td>
                      <td>{l.qty ?? '-'}</td>
                      <td>{l.weight_kg ?? '-'}</td>
                      <td>
                        {l.status_from ? `${l.status_from} → ` : ''}
                        <strong>{l.status_to || '-'}</strong>
                      </td>
                      <td className="muted">{l.user_name || l.user_id}</td>
                      <td style={{ fontSize: 12 }}>{l.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CORRECTION AUDIT TRAIL (Admin Only) */}
      {activeTab === 'audit_log' && isAdmin && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label htmlFor="audit_date" className="muted" style={{ fontSize: 13 }}>Date:</label>
              <input id="audit_date" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 'auto' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label htmlFor="audit_entity" className="muted" style={{ fontSize: 13 }}>Entity:</label>
              <select id="audit_entity" value={auditEntityFilter} onChange={(e) => setAuditEntityFilter(e.target.value)} style={{ width: 'auto' }}>
                <option value="">All Entities</option>
                <option value="production_entry">Production Entries</option>
                <option value="bag">Bags</option>
                <option value="trim_entry">Trim Entries</option>
                <option value="inspection_entry">Inspection Entries</option>
                <option value="packing_entry">Packing Entries</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label htmlFor="audit_action" className="muted" style={{ fontSize: 13 }}>Action:</label>
              <select id="audit_action" value={auditActionFilter} onChange={(e) => setAuditActionFilter(e.target.value)} style={{ width: 'auto' }}>
                <option value="">All Actions</option>
                <option value="BACKDATED_CREATE">Backdated Creation</option>
                <option value="EDIT">Field Edit</option>
                <option value="STATUS_OVERRIDE">Status Override</option>
              </select>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '6px 14px', fontSize: 13, marginLeft: 'auto' }}
              onClick={loadAuditLogs}
            >
              ↻ Refresh Audit Log
            </button>
          </div>

          {auditLoading ? (
            <p className="muted">Loading correction audit trail…</p>
          ) : auditLogs.length === 0 ? (
            <p className="muted">No correction audit records match your filters.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Item Code / ID</th>
                    <th>Field Diff</th>
                    <th>Mandatory Reason</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ fontSize: 12 }}>{new Date(log.created_at).toLocaleString('en-GB')}</td>
                      <td>
                        <span style={{
                          fontSize: 11,
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontWeight: 700,
                          background: log.action === 'BACKDATED_CREATE' ? 'rgba(59,130,246,0.2)' : log.action === 'STATUS_OVERRIDE' ? 'rgba(168,85,247,0.2)' : 'rgba(245,158,11,0.2)',
                          color: log.action === 'BACKDATED_CREATE' ? '#60a5fa' : log.action === 'STATUS_OVERRIDE' ? '#c084fc' : '#fbbf24',
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td><strong>{log.entity_type.replace('_', ' ')}</strong></td>
                      <td><strong>{log.entity_code || `#${log.entity_id}`}</strong></td>
                      <td>
                        {log.field_name ? (
                          <div style={{ fontSize: 12 }}>
                            <code>{log.field_name}</code>: <span style={{ color: '#f87171' }}>{log.old_value || 'null'}</span> → <span style={{ color: '#34d399' }}>{log.new_value}</span>
                          </div>
                        ) : log.details ? (
                          <span className="muted" style={{ fontSize: 11 }}>Summary details logged</span>
                        ) : '-'}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        <strong style={{ color: 'var(--amber)' }}>"{log.reason}"</strong>
                      </td>
                      <td className="muted" style={{ fontSize: 12 }}>
                        {log.changed_by_name || log.user_full_name} ({log.changed_by_role || log.user_role})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Bag Detail Modal */}
      {selectedBagDetail && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div className="panel" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', background: '#1c222d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 17, color: 'var(--amber)' }}>
                🔍 Bag Traceability Passport: {selectedBagDetail.bag_code}
              </h3>
              <button type="button" style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }} onClick={() => setSelectedBagDetail(null)}>✕</button>
            </div>

            <div className="readout" style={{ marginBottom: 14, fontSize: 12 }}>
              <div>Part: <strong>[{selectedBagDetail.shrp_part_code || selectedBagDetail.part_code}] {selectedBagDetail.customer_part_no || selectedBagDetail.part_name}</strong></div>
              <div>Batch: <strong>{selectedBagDetail.batch_no}</strong> · Machine: <strong>{selectedBagDetail.machine_code}</strong></div>
              <div>Base Weight: <strong>{selectedBagDetail.base_weight_kg} kg</strong> · Qty: <strong>{selectedBagDetail.qty} Nos</strong></div>
              <div>Current Status: <strong style={{ color: getStatusColor(selectedBagDetail.status) }}>{selectedBagDetail.status}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Step 1: Bagging */}
              <div style={{ borderLeft: '3px solid #38bdf8', paddingLeft: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#38bdf8' }}>1. Bag Entry (Moulding Floor)</div>
                <div style={{ fontSize: 12 }}>Operator: <strong>{selectedBagDetail.created_by_name || 'Floor Operator'}</strong></div>
                <div style={{ fontSize: 11 }} className="muted">{new Date(selectedBagDetail.created_at).toLocaleString('en-GB')}</div>
              </div>

              {/* Step 2: Trimming */}
              {selectedBagDetail.trim_history && selectedBagDetail.trim_history.length > 0 && (
                <div style={{ borderLeft: '3px solid #a78bfa', paddingLeft: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#a78bfa' }}>2. Trimming Stage ({selectedBagDetail.trim_history.length} Passes)</div>
                  {selectedBagDetail.trim_history.map((t, idx) => (
                    <div key={idx} style={{ fontSize: 12, marginTop: 4, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                      <div><strong>Pass #{t.pass_number || (idx + 1)}</strong> {t.is_partial ? '(Partial)' : '(Final)'}</div>
                      <div>Trimmed: <strong>{t.trimmed_wt_kg} kg</strong> · Runner: <strong>{t.runner_wt_kg} kg</strong> · Rej: <strong>{t.reject_wt_kg} kg</strong></div>
                      <div>Remaining: <strong>{t.remaining_wt_kg} kg</strong></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Inspection */}
              {selectedBagDetail.inspection_history && selectedBagDetail.inspection_history.length > 0 && (
                <div style={{ borderLeft: '3px solid #34d399', paddingLeft: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#34d399' }}>3. Inspection Stage</div>
                  {selectedBagDetail.inspection_history.map((i, idx) => (
                    <div key={idx} style={{ fontSize: 12, marginTop: 4, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                      <div>Inspected Wt: <strong>{i.inspected_wt_kg} kg</strong> · Rej: <strong>{i.reject_wt_kg} kg</strong> · Rework: <strong>{i.sent_to_rework_qty} pcs</strong></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Packing */}
              {selectedBagDetail.packing_history && selectedBagDetail.packing_history.length > 0 && (
                <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#10b981' }}>4. Packing Stage</div>
                  {selectedBagDetail.packing_history.map((p, idx) => (
                    <div key={idx} style={{ fontSize: 12, marginTop: 4, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                      <div>Packed Qty: <strong>{p.packed_qty} pcs</strong> ({p.packed_wt_kg} kg)</div>
                      <div>Packets: <strong>{p.packets_count}</strong> · Balance: <strong>{p.balance_qty} pcs</strong></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedBagDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deletion Modal */}
      {deleteTarget && (
        <DeletionModal
          entityType={deleteTarget.type}
          entityId={deleteTarget.id}
          entityLabel={deleteTarget.label}
          onClose={() => setDeleteTarget(null)}
          onSuccess={(msg) => {
            setStatusMsg(msg);
            setDeleteTarget(null);
            loadEntries();
            loadBagLogs();
          }}
        />
      )}

      {/* Correction Modal */}
      {correctionTarget && (
        <CorrectionModal
          mode={correctionTarget.mode}
          record={correctionTarget.record}
          initialDate={date}
          userRole={user?.role}
          onClose={() => setCorrectionTarget(null)}
          onSuccess={(msg) => {
            setStatusMsg(msg);
            setCorrectionTarget(null);
            loadEntries();
            loadBagLogs();
            if (isAdmin) loadAuditLogs();
          }}
        />
      )}

      {showCamera && (
        <CameraScanner
          title="Scan Bag or Part QR / Barcode"
          onScan={(code) => {
            setShowCamera(false);
            handleScanTrace(code);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
