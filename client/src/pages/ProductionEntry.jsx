import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const OFF_REASONS = [
  { value: 'mould_change', label: 'Mould Change' },
  { value: 'shift_completed', label: 'Shift Completed' },
  { value: 'breakdown', label: 'Breakdown' },
  { value: 'operator_change', label: 'Change Operator' },
  { value: 'other', label: 'Other' },
];

export default function ProductionEntry() {
  const { user } = useAuth();
  const [machines, setMachines] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [downtimeReasons, setDowntimeReasons] = useState([]);
  const [rejectReasons, setRejectReasons] = useState([]);
  const [context, setContext] = useState(null);
  const [machineId, setMachineId] = useState('');
  const [session, setSession] = useState(undefined); // undefined = loading, null = none running

  const [startCount, setStartCount] = useState('');
  const [starting, setStarting] = useState(false);

  const [checkSheetItems, setCheckSheetItems] = useState([]);
  const [checkSheetStatus, setCheckSheetStatus] = useState(undefined); // undefined = loading, null = not submitted today, object = submitted
  const [checkResponses, setCheckResponses] = useState({}); // { [item_id]: { status, remarks } }
  const [submittingCheck, setSubmittingCheck] = useState(false);

  const [entryForm, setEntryForm] = useState({ end_count: '', remarks: '' });
  const [rejectRows, setRejectRows] = useState([]);     // [{ reason_id, qty }]
  const [downtimeRows, setDowntimeRows] = useState([]); // [{ reason_id, minutes }]
  const [belowTargetPrompt, setBelowTargetPrompt] = useState(null);
  const [savingEntry, setSavingEntry] = useState(false);
  const [lastEntry, setLastEntry] = useState(null);

  const [showOff, setShowOff] = useState(false);
  const [offForm, setOffForm] = useState({ off_count: '', off_reason: '', off_remarks: '' });
  const [endingOff, setEndingOff] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      const [m, a, r, rr, ctx, items, mine] = await Promise.all([
        api.machines(), api.currentAssignments(), api.checkItems('downtime_reason'),
        api.checkItems('reject_reason'), api.entryContext(), api.checkSheetItems(),
        api.mySession(),
      ]);
      setMachines(m);
      setAssignments(a);
      setDowntimeReasons(r);
      setRejectReasons(rr);
      setContext(ctx);
      setCheckSheetItems(items);
      // If this operator already has a machine running, jump straight to it -
      // no need to reselect from the dropdown every time they open this screen.
      if (mine) {
        setMachineId(String(mine.machine_id));
        setSession(mine);
        setOffForm({ off_count: '', off_reason: '', off_remarks: '' });
      }
    })();
  }, []);

  const assigned = assignments.find((a) => String(a.machine_id) === String(machineId));
  const isOwnSession = !!(session && user && session.operator_user_id === user.id);
  const lockedByOther = !!(session && user && session.operator_user_id !== user.id);

  async function selectMachine(id) {
    setMachineId(id);
    setSession(undefined);
    setCheckSheetStatus(undefined);
    setCheckResponses({});
    setError(''); setSuccess('');
    setBelowTargetPrompt(null);
    setShowOff(false);
    setLastEntry(null);
    if (!id) return;
    const active = await api.activeSession(id);
    setSession(active);
    if (!active) {
      const [{ suggested_start_count }, todayCheck] = await Promise.all([
        api.suggestedStartCount(id),
        context ? api.checkItemsToday(id, context.shift) : Promise.resolve(null),
      ]);
      setStartCount(suggested_start_count != null ? String(suggested_start_count) : '');
      setCheckSheetStatus(todayCheck);
    } else {
      setOffForm({ off_count: '', off_reason: '', off_remarks: '' });
    }
  }

  function setCheckResponse(itemId, field, value) {
    setCheckResponses((r) => ({ ...r, [itemId]: { ...r[itemId], [field]: value } }));
  }

  async function handleSubmitCheckSheet(e) {
    e.preventDefault();
    setError('');
    const responses = checkSheetItems.map((item) => ({
      check_item_id: item.id,
      status: checkResponses[item.id]?.status || '',
      remarks: checkResponses[item.id]?.remarks || '',
    }));
    if (responses.some((r) => !r.status)) {
      setError('Answer every check item before submitting.');
      return;
    }
    if (responses.some((r) => r.status === 'NG' && !r.remarks)) {
      setError('Add remarks for any item marked NG.');
      return;
    }
    setSubmittingCheck(true);
    try {
      const sub = await api.submitCheckSheet({ machine_id: Number(machineId), shift: context.shift, responses });
      setCheckSheetStatus(sub);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingCheck(false);
    }
  }

  async function handleStart(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setStarting(true);
    try {
      const s = await api.startMachine({ machine_id: Number(machineId), start_count: Number(startCount) });
      setSession(s);
      setSuccess(`Machine started at ${new Date(s.start_time).toLocaleString()}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  }

  function addRejectRow() { setRejectRows((r) => [...r, { reason_id: '', qty: '' }]); }
  function updateRejectRow(i, field, value) {
    setRejectRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  function removeRejectRow(i) { setRejectRows((r) => r.filter((_, idx) => idx !== i)); }

  function addDowntimeRow() { setDowntimeRows((d) => [...d, { reason_id: '', minutes: '' }]); }
  function updateDowntimeRow(i, field, value) {
    setDowntimeRows((d) => d.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  function removeDowntimeRow(i) { setDowntimeRows((d) => d.filter((_, idx) => idx !== i)); }

  async function submitEntry(withRemarks) {
    setError('');
    setSavingEntry(true);
    try {
      const entry = await api.createEntry({
        session_id: session.id,
        end_count: Number(entryForm.end_count),
        rejects: rejectRows
          .filter((r) => r.reason_id && r.qty)
          .map((r) => ({ reason_id: Number(r.reason_id), qty: Number(r.qty) })),
        downtimes: downtimeRows
          .filter((d) => d.reason_id && d.minutes)
          .map((d) => ({ reason_id: Number(d.reason_id), minutes: Number(d.minutes) })),
        remarks: withRemarks ? entryForm.remarks : (entryForm.remarks || undefined),
      });
      setBelowTargetPrompt(null);
      setLastEntry(entry);
      const effText = entry.efficiency_pct != null ? ` · Efficiency ${entry.efficiency_pct}%` : '';
      setSuccess(`Hour ${context.hour_slot} logged.${effText}`);
      setEntryForm({ end_count: '', remarks: '' });
      setRejectRows([]);
      setDowntimeRows([]);
    } catch (err) {
      if (err.data?.code === 'below_target') {
        setBelowTargetPrompt(err.data);
      } else {
        setError(err.message);
      }
    } finally {
      setSavingEntry(false);
    }
  }

  function handleEntrySubmit(e) {
    e.preventDefault();
    setSuccess('');
    submitEntry(false);
  }

  function handleOffSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!offForm.off_reason) { setError('Select a reason for switching the machine off.'); return; }
    setEndingOff(true);
    api.offMachine(session.id, {
      off_count: Number(offForm.off_count),
      off_reason: offForm.off_reason,
      off_remarks: offForm.off_remarks || null,
    }).then((closed) => {
      setSession(null);
      setShowOff(false);
      setSuccess(`Machine switched off (${OFF_REASONS.find((r) => r.value === closed.off_reason)?.label}).`);
      if (closed.off_reason === 'mould_change') {
        window.location.href = '/mould-setup';
      }
    }).catch((err) => setError(err.message))
      .finally(() => setEndingOff(false));
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Production Entry</h1>
      {context && <p className="screen-sub">Shift {context.shift} · Hour {context.hour_slot}</p>}

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <div className="panel">
        <div className="field">
          <label htmlFor="machine">Machine</label>
          <select id="machine" value={machineId} onChange={(e) => selectMachine(e.target.value)}>
            <option value="" disabled>Select machine</option>
            {machines.map((m) => <option key={m.id} value={m.id}>{m.machine_code}</option>)}
          </select>
        </div>

        {machineId && (
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">Assigned part</div>
            {assigned ? `${assigned.part_code} — ${assigned.part_name}` : 'None — submit a Mould Setup request first'}
          </div>
        )}

        {machineId && session === undefined && <p className="muted">Checking machine status…</p>}

        {machineId && session === null && assigned && checkSheetStatus === undefined && (
          <p className="muted">Checking today's check sheet…</p>
        )}

        {machineId && session === null && assigned && checkSheetStatus === null && (
          <form onSubmit={handleSubmitCheckSheet}>
            <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
              Complete today's check sheet for this machine before starting.
            </p>
            {checkSheetItems.map((item) => (
              <div key={item.id} className="field">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {item.icon && <i className={`ti ${item.icon}`} style={{ fontSize: 24, color: 'var(--text-secondary)', flexShrink: 0 }} aria-hidden="true" />}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.item_name}</div>
                    {item.local_label && <div className="muted" style={{ fontSize: 12 }}>{item.local_label}</div>}
                  </div>
                </div>
                <div className="btn-row" style={{ marginBottom: 6 }}>
                  {['OK', 'NG', 'NA'].map((s) => (
                    <button key={s} type="button"
                      className={checkResponses[item.id]?.status === s ? 'btn btn-primary' : 'btn btn-secondary'}
                      style={{ padding: '10px 0' }}
                      onClick={() => setCheckResponse(item.id, 'status', s)}>
                      <i className={`ti ${s === 'OK' ? 'ti-check' : s === 'NG' ? 'ti-x' : 'ti-minus'}`} style={{ fontSize: 20 }} aria-hidden="true" />
                    </button>
                  ))}
                </div>
                {checkResponses[item.id]?.status === 'NG' && (
                  <input placeholder="Remarks (required for NG)"
                    value={checkResponses[item.id]?.remarks || ''}
                    onChange={(e) => setCheckResponse(item.id, 'remarks', e.target.value)} />
                )}
              </div>
            ))}
            <button className="btn btn-primary" type="submit" disabled={submittingCheck}>
              {submittingCheck ? 'Submitting…' : 'Submit check sheet'}
            </button>
          </form>
        )}

        {machineId && session === null && assigned && checkSheetStatus && (
          <form onSubmit={handleStart}>
            <div className="readout" style={{ marginBottom: 14 }}>
              <div className="readout-label">Check sheet</div>
              Completed by {checkSheetStatus.operator_name} at {new Date(checkSheetStatus.submitted_at).toLocaleTimeString()}
            </div>
            <div className="field">
              <label htmlFor="start_count">Start count (confirm counter reading)</label>
              <input id="start_count" type="number" inputMode="numeric" required
                value={startCount} onChange={(e) => setStartCount(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={starting}>
              {starting ? 'Starting…' : 'Start Machine'}
            </button>
          </form>
        )}
      </div>

      {session && lockedByOther && (
        <div className="panel" style={{ borderColor: 'var(--amber)' }}>
          <div className="readout" style={{ marginBottom: 8 }}>
            <div className="readout-label">Running since</div>
            {new Date(session.start_time).toLocaleString()} · started by {session.operator_name}
          </div>
          <p style={{ fontSize: 13, marginBottom: 0 }}>
            This machine is running under <strong>{session.operator_name}</strong>. You can't log entries or switch
            it off from your login — pick a different machine, or ask {session.operator_name} (or a supervisor) to
            close it out first.
          </p>
        </div>
      )}

      {session && isOwnSession && (
        <div className="panel">
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">Running since</div>
            {new Date(session.start_time).toLocaleString()} · started by {session.operator_name}
          </div>

          {belowTargetPrompt ? (
            <div className="panel" style={{ borderColor: 'var(--amber)' }}>
              <p style={{ marginTop: 0, fontSize: 13 }}>{belowTargetPrompt.error}</p>
              {belowTargetPrompt.efficiency_pct != null && (
                <p className="muted" style={{ fontSize: 12, marginTop: -8 }}>Efficiency: {belowTargetPrompt.efficiency_pct}%</p>
              )}
              <div className="field">
                <label htmlFor="remarks_req">Remarks (required)</label>
                <textarea id="remarks_req" rows={2} required
                  value={entryForm.remarks} onChange={(e) => setEntryForm((f) => ({ ...f, remarks: e.target.value }))} />
              </div>
              <button className="btn btn-primary" disabled={savingEntry || !entryForm.remarks}
                onClick={() => submitEntry(true)}>
                {savingEntry ? 'Saving…' : 'Save with remarks'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleEntrySubmit}>
              <div className="field">
                <label htmlFor="end_count">Machine count now</label>
                {session.last_count != null && (
                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
                    Last count: {session.last_count}
                    {session.last_entry_time && ` at ${new Date(session.last_entry_time).toLocaleTimeString()}`}
                  </div>
                )}
                <input id="end_count" type="number" inputMode="numeric" required
                  value={entryForm.end_count} onChange={(e) => setEntryForm((f) => ({ ...f, end_count: e.target.value }))} />
              </div>

              <div className="field">
                <label>Rejects</label>
                {rejectRows.map((row, i) => (
                  <div key={i} className="btn-row" style={{ marginBottom: 8 }}>
                    <select value={row.reason_id} onChange={(e) => updateRejectRow(i, 'reason_id', e.target.value)}>
                    <option value="">Reason</option>
                      {rejectReasons.map((r) => <option key={r.id} value={r.id}>{r.code ? `${r.code} - ${r.item_name}` : r.item_name}</option>)}
                    </select>
                    <input type="number" inputMode="numeric" placeholder="Qty"
                      value={row.qty} onChange={(e) => updateRejectRow(i, 'qty', e.target.value)} />
                    <button type="button" className="btn btn-secondary" onClick={() => removeRejectRow(i)}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addRejectRow}>+ Add reject reason</button>
              </div>

              <div className="field">
                <label>Downtime</label>
                {downtimeRows.map((row, i) => (
                  <div key={i} className="btn-row" style={{ marginBottom: 8 }}>
                    <select value={row.reason_id} onChange={(e) => updateDowntimeRow(i, 'reason_id', e.target.value)}>
                      <option value="">Reason</option>
                      {downtimeReasons.map((r) => <option key={r.id} value={r.id}>{r.related_to ? `${r.item_name} (${r.related_to})` : r.item_name}</option>)}
                    </select>
                    <input type="number" inputMode="numeric" placeholder="Minutes"
                      value={row.minutes} onChange={(e) => updateDowntimeRow(i, 'minutes', e.target.value)} />
                    <button type="button" className="btn btn-secondary" onClick={() => removeDowntimeRow(i)}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addDowntimeRow}>+ Add downtime reason</button>
              </div>

              <div className="field">
                <label htmlFor="remarks">Remarks (optional)</label>
                <textarea id="remarks" rows={2} value={entryForm.remarks}
                  onChange={(e) => setEntryForm((f) => ({ ...f, remarks: e.target.value }))} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={savingEntry}>
                {savingEntry ? 'Saving…' : 'Save entry'}
              </button>
            </form>
          )}

          {lastEntry && (
            <div className="readout" style={{ marginTop: 14 }}>
              <div className="readout-label">Last entry — Hour {lastEntry.hour_slot}</div>
              Good {lastEntry.good_qty} · Reject {lastEntry.reject_qty} · Downtime {lastEntry.downtime_minutes}min
              {lastEntry.efficiency_pct != null && ` · Efficiency ${lastEntry.efficiency_pct}%`}
            </div>
          )}

          <button type="button" className="btn btn-secondary" style={{ marginTop: 14 }}
            onClick={() => setShowOff((v) => !v)}>
            {showOff ? 'Cancel' : 'Off Machine'}
          </button>

          {showOff && (
            <form onSubmit={handleOffSubmit} style={{ marginTop: 14 }}>
              <div className="field">
                <label htmlFor="off_reason">Reason</label>
                <select id="off_reason" value={offForm.off_reason} required
                  onChange={(e) => setOffForm((f) => ({ ...f, off_reason: e.target.value }))}>
                  <option value="" disabled>Select reason</option>
                  {OFF_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="off_count">Final count</label>
                <input id="off_count" type="number" inputMode="numeric" required
                  value={offForm.off_count} onChange={(e) => setOffForm((f) => ({ ...f, off_count: e.target.value }))} />
              </div>
              <div className="field">
                <label htmlFor="off_remarks">Remarks (optional)</label>
                <textarea id="off_remarks" rows={2} value={offForm.off_remarks}
                  onChange={(e) => setOffForm((f) => ({ ...f, off_remarks: e.target.value }))} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={endingOff}>
                {endingOff ? 'Submitting…' : 'Confirm Off Machine'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
