import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function TodayLog() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayLocal());
  const [entries, setEntries] = useState([]);
  const isOperator = user.role === 'operator';

  useEffect(() => {
    api.entriesForDate(date).then(setEntries);
  }, [date]);

  const totalGood = entries.reduce((sum, e) => sum + e.good_qty, 0);
  const totalReject = entries.reduce((sum, e) => sum + e.reject_qty, 0);
  const effEntries = entries.filter((e) => e.efficiency_pct != null);
  const avgEff = effEntries.length
    ? Math.round((effEntries.reduce((sum, e) => sum + Number(e.efficiency_pct), 0) / effEntries.length) * 10) / 10
    : null;

  const byPart = {};
  for (const e of entries) {
    const key = e.part_code;
    if (!byPart[key]) byPart[key] = { part_code: e.part_code, part_name: e.part_name, good: 0, reject: 0 };
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
                    <td>{p.part_code} — {p.part_name}</td>
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
                    <td>{e.part_code}</td>
                    <td>{e.hour_slot}</td>
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
    </div>
  );
}
