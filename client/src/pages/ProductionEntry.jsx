import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = {
  machine_id: '', start_count: '', end_count: '', reject_qty: '0',
  downtime_minutes: '0', downtime_reason_id: '', remarks: '',
};

export default function ProductionEntry() {
  const [machines, setMachines] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [downtimeReasons, setDowntimeReasons] = useState([]);
  const [context, setContext] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [m, a, r, ctx] = await Promise.all([
        api.machines(), api.currentAssignments(), api.checkItems('downtime_reason'), api.entryContext(),
      ]);
      setMachines(m);
      setAssignments(a);
      setDowntimeReasons(r);
      setContext(ctx);
    })();
  }, []);

  const assigned = assignments.find((a) => String(a.machine_id) === String(form.machine_id));

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!assigned) {
      setError('No approved part assigned to this machine yet.');
      return;
    }
    setLoading(true);
    try {
      await api.createEntry({
        machine_id: Number(form.machine_id),
        entry_date: new Date().toISOString().slice(0, 10),
        hour_slot: context.hour_slot,
        shift: context.shift,
        start_count: Number(form.start_count),
        end_count: Number(form.end_count),
        reject_qty: Number(form.reject_qty || 0),
        downtime_minutes: Number(form.downtime_minutes || 0),
        downtime_reason_id: form.downtime_reason_id ? Number(form.downtime_reason_id) : null,
        remarks: form.remarks || null,
      });
      setSuccess(`Logged hour ${context.hour_slot} for ${assigned.machine_code}.`);
      setForm({ ...emptyForm, machine_id: form.machine_id });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Production Entry</h1>
      {context && (
        <p className="screen-sub">Shift {context.shift} · Hour {context.hour_slot}</p>
      )}

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="panel">
        <div className="field">
          <label htmlFor="machine">Machine</label>
          <select id="machine" value={form.machine_id} onChange={(e) => update('machine_id', e.target.value)} required>
            <option value="" disabled>Select machine</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>{m.machine_code}</option>
            ))}
          </select>
        </div>

        {form.machine_id && (
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">Assigned part</div>
            {assigned ? `${assigned.part_code} — ${assigned.part_name}` : 'None — submit a Mould Setup request first'}
          </div>
        )}

        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="start_count">Start count</label>
            <input id="start_count" type="number" inputMode="numeric" required
              value={form.start_count} onChange={(e) => update('start_count', e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="end_count">End count</label>
            <input id="end_count" type="number" inputMode="numeric" required
              value={form.end_count} onChange={(e) => update('end_count', e.target.value)} />
          </div>
        </div>

        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="reject_qty">Reject qty</label>
            <input id="reject_qty" type="number" inputMode="numeric"
              value={form.reject_qty} onChange={(e) => update('reject_qty', e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="downtime_minutes">Downtime (min)</label>
            <input id="downtime_minutes" type="number" inputMode="numeric"
              value={form.downtime_minutes} onChange={(e) => update('downtime_minutes', e.target.value)} />
          </div>
        </div>

        {Number(form.downtime_minutes) > 0 && (
          <div className="field">
            <label htmlFor="downtime_reason">Downtime reason</label>
            <select id="downtime_reason" value={form.downtime_reason_id} onChange={(e) => update('downtime_reason_id', e.target.value)}>
              <option value="">Select reason</option>
              {downtimeReasons.map((r) => (
                <option key={r.id} value={r.id}>{r.item_name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label htmlFor="remarks">Remarks (optional)</label>
          <textarea id="remarks" rows={2} value={form.remarks} onChange={(e) => update('remarks', e.target.value)} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading || !assigned}>
          {loading ? 'Saving…' : 'Save entry'}
        </button>
      </form>
    </div>
  );
}
