import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = {
  machine_id: '', start_count: '', end_count: '', reject_qty: '0',
  downtime_minutes: '0', downtime_reason_id: '', remarks: '', manual_start_time: '',
};

function toInputValue(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Local calendar date (YYYY-MM-DD) for an ISO timestamp, browser-local time
function localDateOf(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function ProductionEntry() {
  const [machines, setMachines] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [downtimeReasons, setDowntimeReasons] = useState([]);
  const [context, setContext] = useState(null);
  const [lastEntry, setLastEntry] = useState(undefined); // undefined = not checked yet, null = none today
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

  async function selectMachine(machineId) {
    setForm((f) => ({ ...emptyForm, machine_id: machineId }));
    setLastEntry(undefined);
    if (!machineId) return;
    const last = await api.lastEntry(machineId);
    setLastEntry(last);
    if (!last) {
      // First entry of the day for this machine - prefill from 1st OK part if it happened today
      const a = assignments.find((x) => String(x.machine_id) === String(machineId));
      if (a?.first_ok_part_at && context && localDateOf(a.first_ok_part_at) === localDateOf(context.server_time)) {
        setForm((f) => ({ ...f, manual_start_time: toInputValue(a.first_ok_part_at) }));
      }
    }
  }

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
    const startTimeIso = lastEntry ? lastEntry.end_time
      : form.manual_start_time ? new Date(form.manual_start_time).toISOString() : null;
    if (!startTimeIso) {
      setError('Enter the machine start time for this first entry of the day.');
      return;
    }
    setLoading(true);
    try {
      const entry = await api.createEntry({
        machine_id: Number(form.machine_id),
        entry_date: context.entry_date,
        hour_slot: context.hour_slot,
        shift: context.shift,
        start_time: startTimeIso,
        start_count: Number(form.start_count),
        end_count: Number(form.end_count),
        reject_qty: Number(form.reject_qty || 0),
        downtime_minutes: Number(form.downtime_minutes || 0),
        downtime_reason_id: form.downtime_reason_id ? Number(form.downtime_reason_id) : null,
        remarks: form.remarks || null,
      });
      const effText = entry.efficiency_pct != null ? ` · Efficiency ${entry.efficiency_pct}%` : '';
      setSuccess(`Logged hour ${context.hour_slot} for ${assigned.machine_code}.${effText}`);
      setLastEntry(entry);
      setForm((f) => ({ ...emptyForm, machine_id: f.machine_id }));
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
          <select id="machine" value={form.machine_id} onChange={(e) => selectMachine(e.target.value)} required>
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

        {form.machine_id && lastEntry === null && (
          <div className="field">
            <label htmlFor="manual_start">Machine start time (first entry today)</label>
            <input id="manual_start" type="datetime-local" required
              value={form.manual_start_time} onChange={(e) => update('manual_start_time', e.target.value)} />
          </div>
        )}
        {form.machine_id && lastEntry && (
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">Start time (from previous entry)</div>
            {new Date(lastEntry.end_time).toLocaleTimeString()}
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
