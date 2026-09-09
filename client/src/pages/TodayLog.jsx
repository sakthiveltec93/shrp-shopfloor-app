import { useEffect, useState } from 'react';
import { api } from '../api';

export default function TodayLog() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.entriesForDate().then(setEntries);
  }, []);

  const totalGood = entries.reduce((sum, e) => sum + e.good_qty, 0);
  const totalReject = entries.reduce((sum, e) => sum + e.reject_qty, 0);

  return (
    <div className="screen">
      <h1 className="screen-title">Today's Log</h1>
      <p className="screen-sub">{new Date().toLocaleDateString()}</p>

      <div className="btn-row" style={{ marginBottom: 16 }}>
        <div className="readout" style={{ flex: 1 }}>
          <div className="readout-label">Good qty</div>
          {totalGood}
        </div>
        <div className="readout" style={{ flex: 1 }}>
          <div className="readout-label">Rejects</div>
          {totalReject}
        </div>
      </div>

      {entries.length === 0 && <p className="muted">No entries logged yet today.</p>}

      {entries.length > 0 && (
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Part</th>
                <th>Hr</th>
                <th>Good</th>
                <th>Rej</th>
                <th>Operator</th>
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
                  <td>{e.operator_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
