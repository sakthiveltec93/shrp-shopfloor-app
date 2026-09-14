import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// "Hr 5" means the 5th hour slot counted from shift start (Shift A starts
// 09:30 IST, Shift B 21:30 IST) - not the 5th hour of the calendar day.
// Showing the entry's own start_time-end_time next to it makes that concrete
// instead of requiring operators to do the shift-start math themselves.
function timeRange(e) {
  if (!e.start_time || !e.end_time) return null;
  const fmt = (t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${fmt(e.start_time)}–${fmt(e.end_time)}`;
}

export default function TodayLog() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayLocal());
  const [entries, setEntries] = useState([]);
  const [traceCode, setTraceCode] = useState('');
  const [traceLogs, setTraceLogs] = useState(null);
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError] = useState('');
  const isOperator = user.role === 'operator';

  useEffect(() => {
    api.entriesForDate(date).then(setEntries);
  }, [date]);

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

  return (
    <div className="screen">
      <h1 className="screen-title">{isOperator ? 'My Log' : 'Production Log'}</h1>

      <div className="field">
        <label htmlFor="date">Date</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* End-to-End Traceability Lookup per Section 14 */}
      <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '24px 0 10px' }}>🔍 End-to-End Traceability Lookup</h2>
      <form onSubmit={lookupTrace} className="panel">
        <div className="field">
          <label htmlFor="trace_code">Bag Code or Batch No.</label>
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
    </div>
  );
}
