import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import CameraScanner from '../components/CameraScanner';
import DeletionModal from '../components/DeletionModal';

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function timeRange(e) {
  if (!e.start_time || !e.end_time) return null;
  const fmt = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${fmt(e.start_time)}–${fmt(e.end_time)}`;
}

export default function TodayLog() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('production'); // 'production' | 'bags'
  const [date, setDate] = useState(todayLocal());
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [entries, setEntries] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  // Bag Log State
  const [bagLogs, setBagLogs] = useState([]);
  const [bagStageFilter, setBagStageFilter] = useState('ALL'); // 'ALL' | 'OPEN' | 'TRIMMING' | 'INSPECTION' | 'PACKING' | 'DISPATCH' | 'HOLD'
  const [bagSearch, setBagSearch] = useState('');
  const [selectedBagDetail, setSelectedBagDetail] = useState(null);
  const [bagLoading, setBagLoading] = useState(false);

  // Traceability State
  const [traceCode, setTraceCode] = useState('');
  const [traceLogs, setTraceLogs] = useState(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const isOperator = user.role === 'operator';

  // Fetch Hourly Production Entries
  useEffect(() => {
    if (activeTab === 'production') {
      api.entriesForDate(date).then(setEntries).catch(() => {});
    }
  }, [date, activeTab]);

  // Fetch Bag History Log
  useEffect(() => {
    if (activeTab === 'bags') {
      setBagLoading(true);
      api.bagHistoryLog({ date, shift: shiftFilter })
        .then((res) => {
          setBagLogs(res || []);
        })
        .catch(() => setBagLogs([]))
        .finally(() => setBagLoading(false));
    }
  }, [date, shiftFilter, activeTab]);

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
    if (bagStageFilter === 'PACKING' && b.status !== 'PACKED') return false;
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
    const key = e.part_code;
    if (!byPart[key]) byPart[key] = { part_code: e.part_code, shrp_part_code: e.shrp_part_code, part_name: e.part_name, good: 0, reject: 0 };
    byPart[key].good += e.good_qty;
    byPart[key].reject += e.reject_qty;
  }
  const partRows = Object.values(byPart);

  // Status Badge Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#38bdf8';
      case 'PARTIAL_TRIM': return '#fbbf24';
      case 'TRIMMED': return '#a78bfa';
      case 'PARTIAL_INSPECT': return '#f59e0b';
      case 'INSPECTED': return '#34d399';
      case 'PACKED': return '#10b981';
      case 'HOLD': return '#ef4444';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="screen">
      <h1 className="screen-title">{isOperator ? 'Shopfloor Logs' : 'Production & Bag Log'}</h1>

      {/* Segmented Tab Switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 8 }}>
        <button
          type="button"
          className="btn"
          style={{
            flex: 1,
            background: activeTab === 'production' ? 'var(--amber)' : 'transparent',
            color: activeTab === 'production' ? '#000' : 'var(--text)',
            fontWeight: activeTab === 'production' ? 700 : 500,
            border: 'none',
          }}
          onClick={() => setActiveTab('production')}
        >
          ⚙️ Hourly Production Log
        </button>
        <button
          type="button"
          className="btn"
          style={{
            flex: 1,
            background: activeTab === 'bags' ? 'var(--amber)' : 'transparent',
            color: activeTab === 'bags' ? '#000' : 'var(--text)',
            fontWeight: activeTab === 'bags' ? 700 : 500,
            border: 'none',
          }}
          onClick={() => setActiveTab('bags')}
        >
          🎒 Bag & Stage History Log
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: activeTab === 'bags' ? 'repeat(auto-fit, minmax(130px, 1fr))' : '1fr',
        gap: 8,
        alignItems: 'flex-end',
        marginBottom: 14
      }}>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="date">Date</label>
          <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {activeTab === 'bags' && (
          <>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="shift_sel">Shift</label>
              <select id="shift_sel" value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)}>
                <option value="ALL">All Shifts</option>
                <option value="A">Shift A</option>
                <option value="B">Shift B</option>
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="stage_sel">Stage Filter</label>
              <select id="stage_sel" value={bagStageFilter} onChange={(e) => setBagStageFilter(e.target.value)}>
                <option value="ALL">📦 All Bags ({bagLogs.length})</option>
                <option value="OPEN">🔵 Bagged (Open)</option>
                <option value="TRIMMING">🟡 Trimming</option>
                <option value="INSPECTION">🟠 Inspection</option>
                <option value="PACKING">🟢 Packed</option>
                <option value="HOLD">🛑 On HOLD</option>
              </select>
            </div>
          </>
        )}
      </div>

      {statusMsg && <div className="success-banner" style={{ marginBottom: 12 }}>{statusMsg}</div>}

      {/* TAB 1: HOURLY PRODUCTION LOG */}
      {activeTab === 'production' && (
        <>
          <div className="btn-row" style={{ marginBottom: 16 }}>
            <div className="readout" style={{ flex: 1 }}>
              <div className="readout-label">Good qty</div>
              {totalGood}
            </div>
            <div className="readout" style={{ flex: 1 }}>
              <div className="readout-label">Rejects</div>
              {totalReject}
            </div>
            <div className="readout" style={{ flex: 1 }}>
              <div className="readout-label">Avg efficiency</div>
              {avgEff != null ? `${avgEff}%` : '—'}
            </div>
          </div>

          {entries.length === 0 && <p className="muted">No entries logged for this date.</p>}

          {partRows.length > 0 && (
            <>
              <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>By part</h2>
              <div className="panel" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr><th>Part</th><th>Good</th><th>Rej</th></tr>
                  </thead>
                  <tbody>
                    {partRows.map((p) => (
                      <tr key={p.part_code}>
                        <td>{p.shrp_part_code || p.part_code} — {p.part_name}</td>
                        <td>{p.good}</td>
                        <td>{p.reject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {entries.length > 0 && (
            <>
              <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>Hourly entries</h2>
              <p className="muted" style={{ fontSize: 12, marginTop: -6, marginBottom: 10 }}>
                "Hr" counts hours since the shift started (Shift A 9:30 AM, Shift B 9:30 PM) - the clock time next to it is the actual window.
              </p>
              <div className="panel" style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Machine</th>
                      <th>Part</th>
                      <th>Hr</th>
                      <th>Good</th>
                      <th>Rej</th>
                      <th>Eff%</th>
                      {!isOperator && <th>Operator</th>}
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id}>
                        <td>{e.machine_code}</td>
                        <td>{e.shrp_part_code || e.part_code}</td>
                        <td>
                          {e.hour_slot}
                          {timeRange(e) && <div className="muted" style={{ fontSize: 11 }}>{timeRange(e)}</div>}
                        </td>
                        <td>{e.good_qty}</td>
                        <td>{e.reject_qty}</td>
                        <td>{e.efficiency_pct != null ? e.efficiency_pct : '—'}</td>
                        {!isOperator && <td>{e.operator_name}</td>}
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: 11, width: 'auto', background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                            title={user.role === 'admin' ? 'Delete entry' : 'Request deletion approval'}
                            onClick={() => setDeleteTarget({
                              id: e.id,
                              title: `${e.machine_code} Hr ${e.hour_slot} (${e.shrp_part_code || e.part_code}, ${e.good_qty} good)`,
                            })}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {deleteTarget && (
            <DeletionModal
              isOpen={!!deleteTarget}
              onClose={() => setDeleteTarget(null)}
              entityType="production_entry"
              entityId={deleteTarget.id}
              entityTitle={deleteTarget.title}
              isAdmin={user.role === 'admin'}
              onSuccess={() => {
                setStatusMsg(user.role === 'admin' ? 'Entry deleted.' : 'Deletion request submitted for Admin approval.');
                api.entriesForDate(date).then(setEntries);
                setTimeout(() => setStatusMsg(''), 4000);
              }}
            />
          )}

          {/* End-to-End Traceability Lookup */}
          <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '24px 0 10px' }}>🔍 End-to-End Traceability Lookup</h2>
          <form onSubmit={lookupTrace} className="panel">
            <div className="field">
              <label htmlFor="trace_code" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Bag Code or Batch No.</span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                  onClick={() => setShowCamera(true)}
                >
                  📷 Scan Label
                </button>
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="trace_code"
                  type="text"
                  placeholder="e.g. HC442L3LBB01140926A-001"
                  value={traceCode}
                  onChange={(e) => setTraceCode(e.target.value)}
                />
                <button className="btn btn-primary" style={{ width: 'auto' }} type="submit" disabled={traceLoading || !traceCode.trim()}>
                  {traceLoading ? 'Searching…' : 'Trace'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                  onClick={() => setShowCamera(true)}
                >
                  📷 Scan
                </button>
              </div>
            </div>

            {traceError && <div className="error-banner" style={{ marginTop: 10 }}>{traceError}</div>}

            {traceLogs && traceLogs.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: 'var(--amber)' }}>
                  Audit History for {traceCode} ({traceLogs.length} events)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {traceLogs.map((log) => (
                    <div key={log.id} className="readout" style={{ borderLeft: '3px solid var(--amber)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <strong style={{ textTransform: 'uppercase', color: 'var(--amber)', fontSize: 12 }}>
                          {log.process} ({log.status_from || 'START'} → {log.status_to})
                        </strong>
                        <span className="muted" style={{ fontSize: 11 }}>
                          {new Date(log.created_at).toLocaleString('en-GB')}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 4 }}>
                        <div>User: <strong>{log.user_name}</strong></div>
                        {log.weight_kg != null && <div>Wt: <strong>{log.weight_kg} kg</strong></div>}
                        {log.qty != null && <div>Qty: <strong>{log.qty} nos</strong></div>}
                        {log.machine_code && <div>M/C: <strong>{log.machine_code}</strong></div>}
                        {log.is_over_tolerance && (
                          <div style={{ color: 'var(--red)' }}>⚠️ Over-tolerance (Appr: {log.approver_name || 'Supervisor'})</div>
                        )}
                        {log.is_fifo_override && (
                          <div style={{ color: 'var(--amber)' }}>⚠️ FIFO Override ({log.fifo_override_reason || 'Approved'})</div>
                        )}
                      </div>
                      {log.remarks && (
                        <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>Remarks: {log.remarks}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </>
      )}

      {/* TAB 2: BAG & STAGE HISTORY LOG */}
      {activeTab === 'bags' && (
        <div>
          {/* Action Bar: Search input and Download CSV */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
            <input
              type="text"
              placeholder="🔍 Search bag code, batch, part, customer no..."
              value={bagSearch}
              onChange={(e) => setBagSearch(e.target.value)}
              style={{ flex: 1, minWidth: 160 }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', width: 'auto', padding: '8px 14px' }}
              onClick={downloadCsv}
              disabled={filteredBags.length === 0}
            >
              📥 CSV
            </button>
          </div>

          {/* Bag Counts Summary Banner */}
          <div className="readout" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '8px 14px', marginBottom: 14, alignItems: 'center' }}>
            <div>Total Bags: <strong>{filteredBags.length}</strong></div>
            <div>Total Weight: <strong>{filteredBags.reduce((sum, b) => sum + Number(b.base_weight_kg || 0), 0).toFixed(3)} kg</strong></div>
            <div>Total Qty: <strong>{filteredBags.reduce((sum, b) => sum + Number(b.qty || 0), 0)} Nos</strong></div>
          </div>

          {bagLoading ? (
            <p className="muted">Loading bags history...</p>
          ) : filteredBags.length === 0 ? (
            <p className="muted">No bags found for the selected filters.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredBags.map((b) => (
                <div
                  key={b.id}
                  className="panel"
                  style={{
                    padding: 12,
                    borderLeft: `4px solid ${getStatusColor(b.status)}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--amber)', marginRight: 8 }}>
                        {b.bag_code}
                      </span>
                      <span className="shrp-code-pill" style={{ fontSize: 11, padding: '2px 6px' }}>
                        {b.shrp_part_code || b.part_code}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: `${getStatusColor(b.status)}22`,
                        color: getStatusColor(b.status),
                        border: `1px solid ${getStatusColor(b.status)}55`,
                      }}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Customer: <strong style={{ color: 'var(--text)' }}>{b.customer_part_no || b.part_name}</strong> · M/C: {b.machine_code} · Batch: {b.batch_no}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, marginTop: 4 }}>
                    <div>Base Wt: <strong>{b.base_weight_kg} kg</strong></div>
                    <div>Qty: <strong>{b.qty} nos</strong></div>
                    <div>Shift: <strong>{b.shift}</strong> ({new Date(b.entry_date).toLocaleDateString('en-GB')})</div>
                    <div>Operator: <strong>{b.created_by_name}</strong></div>
                  </div>

                  {/* Stage summary badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4, fontSize: 11 }}>
                    {b.trim_history && b.trim_history.length > 0 && (
                      <span style={{ background: 'rgba(167,139,250,0.15)', color: '#c4b5fd', padding: '2px 6px', borderRadius: 4 }}>
                        ✂️ Trimmed ({b.trim_history.length} {b.trim_history.length > 1 ? 'passes' : 'pass'})
                      </span>
                    )}
                    {b.inspection_history && b.inspection_history.length > 0 && (
                      <span style={{ background: 'rgba(52,211,153,0.15)', color: '#6ee7b7', padding: '2px 6px', borderRadius: 4 }}>
                        🔍 Inspected
                      </span>
                    )}
                    {b.packing_history && b.packing_history.length > 0 && (
                      <span style={{ background: 'rgba(16,185,129,0.15)', color: '#a7f3d0', padding: '2px 6px', borderRadius: 4 }}>
                        📦 Packed ({b.packing_history[0].packed_qty} pcs)
                      </span>
                    )}
                    {b.status === 'HOLD' && (
                      <span style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '2px 6px', borderRadius: 4 }}>
                        🛑 Quarantined
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: 11, padding: '4px 10px', width: 'auto' }}
                      onClick={() => setSelectedBagDetail(b)}
                    >
                      📜 View Full Lifecycle History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bag Lifecycle Timeline Modal */}
          {selectedBagDetail && (
            <div className="modal-backdrop" onClick={() => setSelectedBagDetail(null)}>
              <div className="modal" style={{ maxWidth: 520, maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, color: 'var(--amber)', fontSize: 16 }}>
                    Lifecycle History: {selectedBagDetail.bag_code}
                  </h3>
                  <button type="button" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }} onClick={() => setSelectedBagDetail(null)}>
                    ✕
                  </button>
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
                    <div style={{ fontSize: 12 }}>Operator: <strong>{selectedBagDetail.created_by_name}</strong></div>
                    <div style={{ fontSize: 11 }} className="muted">{new Date(selectedBagDetail.created_at).toLocaleString('en-GB')}</div>
                  </div>

                  {/* Step 2: Trimming Passes */}
                  {selectedBagDetail.trim_history && selectedBagDetail.trim_history.length > 0 && (
                    <div style={{ borderLeft: '3px solid #a78bfa', paddingLeft: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#a78bfa' }}>2. Trimming Stage ({selectedBagDetail.trim_history.length} Passes)</div>
                      {selectedBagDetail.trim_history.map((t, idx) => (
                        <div key={idx} style={{ fontSize: 12, marginTop: 4, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                          <div><strong>Pass #{t.pass_number || (idx + 1)}</strong> {t.is_partial ? '(Partial)' : '(Final)'}</div>
                          <div>Trimmed: <strong>{t.trimmed_wt_kg} kg</strong> · Runner: <strong>{t.runner_wt_kg} kg</strong> · Rej: <strong>{t.reject_wt_kg} kg</strong></div>
                          <div>Remaining Bag Wt: <strong>{t.remaining_wt_kg} kg</strong></div>
                          {t.reject_reason && <div className="muted" style={{ fontSize: 11 }}>Rejection: {t.reject_reason}</div>}
                          <div className="muted" style={{ fontSize: 11 }}>Operator: {t.operator_name} · {new Date(t.created_at).toLocaleString('en-GB')}</div>
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
                          <div>Variance Tier: <strong>{i.variance_tier || 'Tier 1'}</strong></div>
                          {i.remarks && <div className="muted" style={{ fontSize: 11 }}>Remarks: {i.remarks}</div>}
                          <div className="muted" style={{ fontSize: 11 }}>Inspector: {i.operator_name} · {new Date(i.created_at).toLocaleString('en-GB')}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 4: Rejection & Quality Log */}
                  {selectedBagDetail.reject_history && selectedBagDetail.reject_history.length > 0 && (
                    <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#f59e0b' }}>Quality Rejection Breakdown ({selectedBagDetail.reject_history.length} Defects Logged)</div>
                      {selectedBagDetail.reject_history.map((r, idx) => (
                        <div key={idx} style={{ fontSize: 12, marginTop: 4, background: 'rgba(245,158,11,0.08)', padding: 6, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div>
                            <strong>[{r.stage}] {r.reject_reason || 'Defect'}</strong>: {r.reject_wt_kg} kg (~{r.reject_qty} Nos)
                            <div className="muted" style={{ fontSize: 11 }}>Logged by {r.operator_name || 'Operator'} · {new Date(r.created_at).toLocaleString('en-GB')}</div>
                          </div>
                          <div>
                            <span style={{
                              background: r.disposition === 'Return To Trimming' || r.disposition === 'REWORK' ? 'rgba(245,166,35,0.2)' : 'rgba(255,255,255,0.1)',
                              color: r.disposition === 'Return To Trimming' || r.disposition === 'REWORK' ? 'var(--amber)' : '#aaa',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700
                            }}>
                              {r.disposition === 'Return To Trimming' || r.disposition === 'REWORK' ? '🛠️ Rework Pool' : r.disposition}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 5: Packing */}
                  {selectedBagDetail.packing_history && selectedBagDetail.packing_history.length > 0 && (
                    <div style={{ borderLeft: '3px solid #10b981', paddingLeft: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#10b981' }}>5. Packing Stage</div>
                      {selectedBagDetail.packing_history.map((p, idx) => (
                        <div key={idx} style={{ fontSize: 12, marginTop: 4, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 4 }}>
                          <div>Packed Qty: <strong>{p.packed_qty} pcs</strong> ({p.packed_wt_kg} kg)</div>
                          <div>Packets: <strong>{p.packets_count}</strong> · Balance Pool: <strong>{p.balance_qty} pcs</strong></div>
                          <div className="muted" style={{ fontSize: 11 }}>Packer: {p.operator_name} · {new Date(p.created_at).toLocaleString('en-GB')}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step 6: Hold History if any */}
                  {selectedBagDetail.hold_history && selectedBagDetail.hold_history.length > 0 && (
                    <div style={{ borderLeft: '3px solid #ef4444', paddingLeft: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#ef4444' }}>Quarantine & Hold Events</div>
                      {selectedBagDetail.hold_history.map((h, idx) => (
                        <div key={idx} style={{ fontSize: 12, marginTop: 4, background: 'rgba(239,68,68,0.1)', padding: 6, borderRadius: 4 }}>
                          <div>Hold Reason: <strong>{h.reason}</strong> (Stage: {h.stage})</div>
                          <div className="muted" style={{ fontSize: 11 }}>Put on hold by {h.hold_by} on {new Date(h.hold_at).toLocaleString('en-GB')}</div>
                          {h.released_at && (
                            <div style={{ marginTop: 4, color: '#34d399', fontSize: 11 }}>
                              ✅ Released by {h.released_by} on {new Date(h.released_at).toLocaleString('en-GB')} ({h.release_remarks})
                            </div>
                          )}
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
        </div>
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

