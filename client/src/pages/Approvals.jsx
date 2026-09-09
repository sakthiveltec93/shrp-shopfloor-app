import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Approvals() {
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function load() {
    setPending(await api.pendingAssignments());
  }

  useEffect(() => { load(); }, []);

  async function decide(id, decision) {
    setError('');
    setBusyId(id);
    try {
      await api.decideAssignment(id, decision);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Approvals</h1>
      <p className="screen-sub">Pending mould/part setup requests</p>

      {error && <div className="error-banner">{error}</div>}

      {pending.length === 0 && <p className="muted">No pending requests.</p>}

      {pending.map((p) => (
        <div key={p.id} className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <strong>{p.machine_code}</strong>
            <span className="status-pill status-pending">Pending</span>
          </div>
          <div className="muted" style={{ fontSize: 13, marginBottom: 4 }}>{p.part_code} — {p.part_name}</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
            Requested by {p.set_by_name} · {new Date(p.set_at).toLocaleString()}
          </div>
          {p.notes && <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Note: {p.notes}</div>}
          <div className="btn-row">
            <button
              className="btn btn-primary"
              disabled={busyId === p.id}
              onClick={() => decide(p.id, 'approved')}
            >
              Approve
            </button>
            <button
              className="btn btn-secondary"
              disabled={busyId === p.id}
              onClick={() => decide(p.id, 'rejected')}
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
