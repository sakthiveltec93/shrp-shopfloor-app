import { useEffect, useState } from 'react';
import { api } from '../api';

export default function MouldSetup() {
  const [machines, setMachines] = useState([]);
  const [parts, setParts] = useState([]);
  const [current, setCurrent] = useState([]);
  const [machineId, setMachineId] = useState('');
  const [partId, setPartId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const [m, p, c] = await Promise.all([api.machines(), api.parts(), api.currentAssignments()]);
    setMachines(m);
    setParts(p);
    setCurrent(c);
  }

  useEffect(() => { loadData(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.createAssignment({ machine_id: Number(machineId), part_id: Number(partId), notes });
      setSuccess('Submitted for supervisor approval.');
      setPartId('');
      setNotes('');
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function currentFor(mid) {
    return current.find((c) => String(c.machine_id) === String(mid));
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Mould Setup</h1>
      <p className="screen-sub">Assign a part to a machine. Requires supervisor approval before Production Entry can use it.</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="panel">
        <div className="field">
          <label htmlFor="machine">Machine</label>
          <select id="machine" value={machineId} onChange={(e) => setMachineId(e.target.value)} required>
            <option value="" disabled>Select machine</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>{m.machine_code}</option>
            ))}
          </select>
        </div>

        {machineId && (
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">Currently running</div>
            {currentFor(machineId)
              ? `${currentFor(machineId).part_code} — ${currentFor(machineId).part_name}`
              : 'No approved part assigned yet'}
          </div>
        )}

        <div className="field">
          <label htmlFor="part">New part</label>
          <select id="part" value={partId} onChange={(e) => setPartId(e.target.value)} required>
            <option value="" disabled>Select part</option>
            {parts.map((p) => (
              <option key={p.id} value={p.id}>{p.part_code} — {p.part_name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Submitting…' : 'Submit for approval'}
        </button>
      </form>

      <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>Running now</h2>
      {current.map((c) => (
        <div key={c.machine_id} className="panel" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600 }}>{c.machine_code}</div>
            <div className="muted" style={{ fontSize: 12 }}>{c.part_code} — {c.part_name}</div>
          </div>
          <span className="status-pill status-approved">Approved</span>
        </div>
      ))}
    </div>
  );
}
