import SearchableSelect from '../components/SearchableSelect';
import FpaModal from '../components/FpaModal';
import { useEffect, useState } from 'react';
import { api, getToken } from '../api';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedCheckItem } from '../i18n/checksheetTranslations';

const OFF_REASONS = [
  { value: 'operator_change', labelKey: 'entry.offReasons.operator_change', label: '🔄 Change Operator / Shift Handover' },
  { value: 'shift_completed', labelKey: 'entry.offReasons.shift_completed', label: '🏁 Shift Completed / End of Day' },
  { value: 'mould_change', labelKey: 'entry.offReasons.mould_change', label: '🔧 Mould Change / New Part Setup' },
  { value: 'breakdown', labelKey: 'entry.offReasons.breakdown', label: '⚡ Machine Breakdown / Maintenance' },
  { value: 'other', labelKey: 'entry.offReasons.other', label: '🛠️ Other Reason' },
];

export default function ProductionEntry() {
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletingEntry, setDeletingEntry] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [machines, setMachines] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [downtimeReasons, setDowntimeReasons] = useState([]);
  const [rejectReasons, setRejectReasons] = useState([]);
  const [context, setContext] = useState(null);
  const [machineId, setMachineId] = useState('');
  const [session, setSession] = useState(undefined); // undefined = loading, null = none running

  const [operators, setOperators] = useState([]);
  const [assignedOperatorId, setAssignedOperatorId] = useState('');

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
  const [offForm, setOffForm] = useState({ off_count: '', off_reason: '', off_remarks: '', new_operator_user_id: '' });
  const [endingOff, setEndingOff] = useState(false);

  // Quick Change Operator state
  const [showChangeOp, setShowChangeOp] = useState(false);
  const [changeOpForm, setChangeOpForm] = useState({ off_count: '', new_operator_user_id: '', remarks: '' });
  const [changingOp, setChangingOp] = useState(false);

  const [showFpaModal, setShowFpaModal] = useState(false);
  const [fpaBlockedInfo, setFpaBlockedInfo] = useState(null);
  const [activeTarget, setActiveTarget] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [m, a, r, rr, ctx, items, mine, ops] = await Promise.all([
          api.machines('PRODUCTION'), api.currentAssignments(), api.checkItems('downtime_reason'),
          api.checkItems('reject_reason'), api.entryContext(), api.checkSheetItems(),
          api.mySession(), api.operators(),
        ]);
        if (m) setMachines(m);
        if (a) setAssignments(a);
        if (r) setDowntimeReasons(r);
        if (rr) setRejectReasons(rr);
        if (ctx) setContext(ctx);
        if (items) setCheckSheetItems(items);
        if (ops) setOperators(Array.isArray(ops) ? ops : []);
        if (mine) {
          setMachineId(String(mine.machine_id));
          setSession(mine);
          setOffForm({ off_count: '', off_reason: '', off_remarks: '', new_operator_user_id: '' });
        }
      } catch (err) {
        console.warn('Initial load using cached state or offline:', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (user && !assignedOperatorId) {
      setAssignedOperatorId(String(user.id));
    }
  }, [user]);

  const assigned = assignments.find((a) => String(a.machine_id) === String(machineId));
  const isOwnSession = !!(session && user && (session.operator_user_id === user.id || user.role === 'admin' || user.role === 'supervisor'));
  const lockedByOther = !!(session && user && session.operator_user_id !== user.id && user.role === 'operator');

  async function selectMachine(id) {
    setMachineId(id);
    setSession(undefined);
    setCheckSheetStatus(undefined);
    setCheckResponses({});
    setError(''); setSuccess('');
    setBelowTargetPrompt(null);
    setShowOff(false);
    setShowChangeOp(false);
    setLastEntry(null);
    setFpaBlockedInfo(null);
    if (!id) return;
    const active = await api.activeSession(id);
    setSession(active);
    api.planning.getActiveTarget(id).then((tgt) => setActiveTarget(tgt)).catch(() => setActiveTarget(null));
    if (!active) {
      const [{ suggested_start_count }, todayCheck] = await Promise.all([
        api.suggestedStartCount(id),
        context ? api.checkItemsToday(id, context.shift) : Promise.resolve(null),
      ]);
      setStartCount(suggested_start_count != null ? String(suggested_start_count) : '');
      setCheckSheetStatus(todayCheck);
      if (user) setAssignedOperatorId(String(user.id));
    } else {
      setOffForm({ off_count: '', off_reason: '', off_remarks: '', new_operator_user_id: '' });
      setChangeOpForm({ off_count: active.last_count != null ? String(active.last_count) : String(active.start_count), new_operator_user_id: '', remarks: '' });
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
      setError(t('entry.answerAllItems', 'Please answer all check sheet items'));
      return;
    }
    if (responses.some((r) => r.status === 'NG' && !r.remarks)) {
      setError(t('entry.remarksRequiredForNg', 'Remarks required for NG items'));
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
      const targetOperatorId = (user?.role === 'admin' || user?.role === 'supervisor') && assignedOperatorId
        ? Number(assignedOperatorId)
        : user?.id;

      const s = await api.startMachine({
        machine_id: Number(machineId),
        start_count: Number(startCount),
        operator_user_id: targetOperatorId,
      });
      setSession(s);
      setFpaBlockedInfo(null);
      const opName = operators.find((o) => o.id === targetOperatorId)?.full_name || s.operator_name || user?.full_name;
      setSuccess(`⚡ Machine switched ON for operator ${opName} at count ${s.start_count}!`);
    } catch (err) {
      if (err.data?.code === 'fpa_required') {
        setFpaBlockedInfo(err.data);
      }
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
      if (entry.queuedOffline) {
        setSuccess('💾 ' + (entry.message || 'Saved offline! Will sync automatically when connected.'));
      } else {
        setLastEntry(entry);
        const effText = entry.efficiency_pct != null ? t('entry.efficiencySuffix', { pct: entry.efficiency_pct }) : '';
        setSuccess(t('entry.hourLogged', { hour: context.hour_slot }) + effText);
      }
      setEntryForm({ end_count: '', remarks: '' });
      setRejectRows([]);
      setDowntimeRows([]);
    } catch (err) {
      if (err.data?.code === 'below_target') {
        setBelowTargetPrompt(err.data);
      } else if (err.data?.code === 'fpa_required') {
        setFpaBlockedInfo(err.data);
        setError(err.message);
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

  async function handleChangeOperatorSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!changeOpForm.new_operator_user_id) {
      setError('Please select the incoming operator to assign');
      return;
    }
    setChangingOp(true);
    try {
      const res = await api.changeOperator(session.id, {
        off_count: Number(changeOpForm.off_count),
        new_operator_user_id: Number(changeOpForm.new_operator_user_id),
        remarks: changeOpForm.remarks || 'Shift handover',
      });
      setShowChangeOp(false);
      setSession(res);
      const newOpName = res.operator_name || operators.find((o) => o.id === Number(changeOpForm.new_operator_user_id))?.full_name;
      setSuccess(`✅ Machine handed over to operator ${newOpName}! New session started at counter ${res.start_count}.`);
      setChangeOpForm({ off_count: '', new_operator_user_id: '', remarks: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingOp(false);
    }
  }

  function handleOffSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!offForm.off_reason) { setError(t('entry.selectOffReasonError', 'Please select a reason')); return; }
    setEndingOff(true);
    api.offMachine(session.id, {
      off_count: Number(offForm.off_count),
      off_reason: offForm.off_reason,
      off_remarks: offForm.off_remarks || null,
      new_operator_user_id: offForm.new_operator_user_id ? Number(offForm.new_operator_user_id) : undefined,
    }).then((res) => {
      setShowOff(false);
      if (res.new_session) {
        setSession(res.new_session);
        setSuccess(`✅ Machine handed over to operator ${res.new_session.operator_name}! Active session started.`);
      } else {
        setSession(null);
        setStartCount(String(offForm.off_count));
        const reasonEntry = OFF_REASONS.find((r) => r.value === offForm.off_reason);
        setSuccess(`⚡ Machine switched OFF (${reasonEntry ? reasonEntry.label : offForm.off_reason}) at count ${offForm.off_count}.`);
        if (offForm.off_reason === 'mould_change') {
          window.location.href = '/mould-setup';
        }
      }
    }).catch((err) => setError(err.message))
      .finally(() => setEndingOff(false));
  }

  return (
    <div className="screen">
      <h1 className="screen-title">{t('entry.title', 'Hourly Production Entry')}</h1>
      {context && <p className="screen-sub">{t('entry.shiftHour', { shift: context.shift, hour: context.hour_slot })}</p>}

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <div className="panel">
        <div className="field">
          <label htmlFor="machine">{t('common.machine', 'Machine')}</label>
          <SearchableSelect
            id="machine"
            value={machineId}
            onChange={(e) => selectMachine(e.target.value)}
            options={machines}
            placeholder={t('common.selectMachine', 'Select machine')}
            searchPlaceholder="🔍 Type machine code..."
            getOptionValue={(m) => m.id}
            getOptionLabel={(m) => m.machine_code}
          />
        </div>

        {machineId && (
          assigned ? (
            <div className="shrp-part-badge-card" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                {assigned.photo_file_id ? (
                  <img
                    src={`/api/masters/parts/${assigned.part_id}/files/${assigned.photo_file_id}?token=${getToken()}`}
                    alt={assigned.part_name}
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)', background: '#111', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, border: '1px dashed var(--line)', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    📷
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span className="shrp-code-pill" style={{ fontSize: 15, padding: '4px 12px' }}>{assigned.shrp_part_code || assigned.part_code}</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                    {assigned.cavity_count} Cavities · Cycle Time: {assigned.standard_cycle_time_sec || '—'}s
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="readout" style={{ marginBottom: 14 }}>
              <div className="readout-label">{t('entry.assignedPart', 'Assigned Part')}</div>
              {t('entry.noneAssigned', 'No mould/part assigned. Please submit Mould Setup.')}
            </div>
          )
        )}

        {machineId && session === undefined && <p className="muted">{t('entry.checkingStatus', 'Checking machine session...')}</p>}

        {machineId && session === null && assigned && checkSheetStatus === undefined && (
          <p className="muted">{t('entry.checkingCheckSheet', 'Checking daily check sheet...')}</p>
        )}

        {machineId && session === null && assigned && checkSheetStatus === null && (
          <form onSubmit={handleSubmitCheckSheet}>
            <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>
              {t('entry.completeCheckSheet', 'Complete shift start check sheet before turning ON machine')}
            </p>
            {checkSheetItems.map((item) => {
              const loc = getLocalizedCheckItem(item, lang);
              const iconClass = (loc.icon || 'ti-check').replace(/^ti\s+/, '');
              return (
                <div key={item.id} className="field" style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 8, border: '1px solid var(--line)', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <i className={`ti ${iconClass}`} style={{ fontSize: 22, color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{loc.name}</div>
                      {loc.spec && (
                        <div style={{ fontSize: 12, marginTop: 3, color: '#93c5fd', lineHeight: 1.4 }}>
                          📌 <strong>{lang === 'ta' ? 'சரிபார்க்க வேண்டியவை:' : lang === 'or' ? 'Kichi check kariba:' : 'What to check:'}</strong> {loc.spec}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="btn-row" style={{ marginBottom: 6, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {['OK', 'NG', 'NA'].map((s) => (
                      <button key={s} type="button"
                        className={checkResponses[item.id]?.status === s ? (s === 'OK' ? 'btn btn-primary' : s === 'NG' ? 'btn btn-danger' : 'btn btn-secondary') : 'btn btn-secondary'}
                        style={{ padding: '10px 0', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        onClick={() => setCheckResponse(item.id, 'status', s)}>
                        <i className={`ti ${s === 'OK' ? 'ti-check' : s === 'NG' ? 'ti-x' : 'ti-minus'}`} style={{ fontSize: 18 }} aria-hidden="true" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                  {checkResponses[item.id]?.status === 'NG' && (
                    <input placeholder={t('entry.remarksNgPlaceholder', 'Remarks for NG')}
                      value={checkResponses[item.id]?.remarks || ''}
                      onChange={(e) => setCheckResponse(item.id, 'remarks', e.target.value)}
                      style={{ marginTop: 6 }} />
                  )}
                </div>
              );
            })}
            <button className="btn btn-primary" type="submit" disabled={submittingCheck}>
              {submittingCheck ? t('entry.submitting', 'Submitting...') : t('entry.submitCheckSheet', 'Submit Check Sheet')}
            </button>
          </form>
        )}

        {/* START MACHINE FORM with OPERATOR ASSIGNMENT */}
        {machineId && session === null && assigned && checkSheetStatus && (
          <form onSubmit={handleStart} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="readout">
              <div className="readout-label">{t('entry.checkSheetLabel', 'Check Sheet Completed')}</div>
              {t('entry.checkSheetCompletedBy', { name: checkSheetStatus.operator_name, time: new Date(checkSheetStatus.submitted_at).toLocaleTimeString() })}
            </div>

            {/* Operator Selection (Crucial for Admin assigning Operator) */}
            <div className="field" style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: 12, borderRadius: 8 }}>
              <label htmlFor="assigned_operator" style={{ color: '#60a5fa', fontWeight: 700 }}>
                👤 Assigned Operator for this Machine *
              </label>
              <select
                id="assigned_operator"
                required
                value={assignedOperatorId}
                onChange={(e) => setAssignedOperatorId(e.target.value)}
                disabled={user?.role === 'operator'}
                style={{ width: '100%', marginTop: 4, fontWeight: 600 }}
              >
                {Array.from(new Map(operators.map((op) => [op.full_name.trim().toUpperCase(), op])).values()).map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.full_name} ({op.role.toUpperCase()}) {op.id === user?.id ? '★ Current User' : ''}
                  </option>
                ))}
              </select>
              {(user?.role === 'admin' || user?.role === 'supervisor') && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  💡 As Admin/Supervisor, you can assign any operator. When they log in, this machine session will automatically appear in their app.
                </div>
              )}
            </div>

            <div className="field">
              <label htmlFor="start_count">{t('entry.startCountLabel', 'Starting Machine Counter *')}</label>
              <input id="start_count" type="number" inputMode="numeric" required
                value={startCount} onChange={(e) => setStartCount(e.target.value)} />
            </div>

            {fpaBlockedInfo && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 8, padding: 12 }}>
                <div style={{ color: '#f87171', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🛡️ IATF 16949 Clause 8.5.1.1 First-Piece Approval Required
                </div>
                <div style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>
                  Machine startup is blocked. Initial setup, visual workmanship, and multi-cavity dimensional inspection must be approved.
                </div>
                <button
                  type="button"
                  onClick={() => setShowFpaModal(true)}
                  style={{ marginTop: 8, padding: '8px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  📝 Open Digital FPA Sheet & Submit QA Approval
                </button>
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={starting} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              {starting ? t('entry.starting', 'Starting machine...') : '⚡ Switch ON Machine & Assign Operator'}
            </button>
          </form>
        )}
      </div>

      {session && lockedByOther && (
        <div className="panel" style={{ borderColor: 'var(--amber)' }}>
          <div className="readout" style={{ marginBottom: 8 }}>
            <div className="readout-label">{t('entry.runningSince', 'Active Session')}</div>
            {t('entry.startedBy', { time: new Date(session.start_time).toLocaleString(), name: session.operator_name })}
          </div>
          <p style={{ fontSize: 13, marginBottom: 0 }}>
            {t('entry.lockedMessage', { name: session.operator_name })}
          </p>
        </div>
      )}

      {session && isOwnSession && (() => {
        const uniqueOps = Array.from(new Map(operators.map((op) => [op.full_name.trim().toUpperCase(), op])).values());
        const prevCount = session.last_count != null ? Number(session.last_count) : Number(session.start_count || 0);
        const enteredEndCount = Number(entryForm.end_count) || 0;
        const liveShots = enteredEndCount >= prevCount ? enteredEndCount - prevCount : 0;
        const cav = assigned?.cavity_count ? Number(assigned.cavity_count) : 1;
        const liveGrossPieces = liveShots * cav;
        const liveTotalRejects = rejectRows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0);
        const liveNetGood = Math.max(0, liveGrossPieces - liveTotalRejects);
        const cycleSec = Number(assigned?.standard_cycle_time_sec) || 0;
        const targetPerHour = cycleSec > 0 ? Math.round((3600 / cycleSec) * cav) : null;
        const targetShotsPerHour = cycleSec > 0 ? Math.round(3600 / cycleSec) : null;

        return (
        <div className="panel">
          {/* Active Machine Operator Banner */}
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  <strong style={{ fontSize: 15, color: '#34d399' }}>Machine ON & Running</strong>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 4 }}>
                  Assigned Operator: <strong style={{ color: '#fbbf24' }}>{session.operator_name}</strong>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Started: {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Persistent Incomplete FPA Warning Banner for Visual Approval */}
          {assigned?.fpa_approval_status === 'VISUAL_APPROVED' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(180, 83, 9, 0.22) 100%)',
              border: '2px solid #f59e0b',
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: 14,
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.15)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⚠️ FPA Incomplete — Full Approval Required
                  </div>
                  <div style={{ color: '#fef3c7', fontSize: 12, marginTop: 4 }}>
                    Machine running under <strong>Visual Approval</strong> (Entries 1 & 2 allowed). Full measured FPA (process parameters & cavity dimensions) must be signed off by supervisor within 2 hours or before 3rd entry.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFpaModal(true)}
                  style={{
                    padding: '7px 14px',
                    background: '#f59e0b',
                    color: '#000',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  📝 Complete Full FPA
                </button>
              </div>
            </div>
          )}

          {activeTarget && (
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontSize: 11, color: '#93c5fd', textTransform: 'uppercase', fontWeight: 700 }}>📅 MPS Planned Shift Target: </span>
                <strong style={{ color: '#fff', fontSize: 14 }}>{Number(activeTarget.planned_qty).toLocaleString()} pcs</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}> ({Number(activeTarget.planned_shots).toLocaleString()} shots)</span>
              </div>
              <span style={{ fontSize: 11, background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7', padding: '3px 10px', borderRadius: 12, fontWeight: 600 }}>
                ✓ BOM Material Allocated
              </span>
            </div>
          )}

          {fpaBlockedInfo && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <div style={{ color: '#f87171', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                🛡️ IATF 16949 Clause 8.5.1.1 First-Piece Approval Required
              </div>
              <div style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>
                Production entry logging is blocked. Initial setup, visual workmanship, and multi-cavity dimensional inspection must be approved before logging production.
              </div>
              <button
                type="button"
                onClick={() => setShowFpaModal(true)}
                style={{ marginTop: 8, padding: '8px 14px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                📝 Open Digital FPA Sheet & Submit QA Approval
              </button>
            </div>
          )}

          {belowTargetPrompt ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(20, 10, 5, 0.95) 100%)',
              border: '2px solid #f59e0b',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.2)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h4 style={{ margin: 0, color: '#fbbf24', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⚠️ Low Production Output Warning
                  </h4>
                  <div style={{ fontSize: 12, color: '#fef3c7', marginTop: 4 }}>
                    {belowTargetPrompt.error}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setBelowTargetPrompt(null)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: 28, height: 28, borderRadius: '50%', cursor: 'pointer', fontSize: 14 }}
                  title="Close warning and re-check data"
                >
                  ✕
                </button>
              </div>

              {/* Metric comparison pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ fontSize: 11, background: 'rgba(245, 158, 11, 0.2)', color: '#fde68a', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                  🎯 Target: {belowTargetPrompt.target_qty} pcs ({belowTargetPrompt.target_shots || Math.round(belowTargetPrompt.target_qty / cav)} shots)
                </span>
                <span style={{ fontSize: 11, background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                  📦 Actual: {belowTargetPrompt.good_qty} pcs ({belowTargetPrompt.shots_logged || liveShots} shots)
                </span>
                {belowTargetPrompt.efficiency_pct != null && (
                  <span style={{ fontSize: 11, background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                    📈 Efficiency: {belowTargetPrompt.efficiency_pct}%
                  </span>
                )}
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="remarks_req" style={{ color: '#fbbf24', fontWeight: 600, fontSize: 12 }}>
                  {t('entry.remarksRequired', 'Remarks (Mandatory - explain reason for low output or breakdown):')}
                </label>
                <textarea
                  id="remarks_req"
                  rows={2}
                  required
                  placeholder="e.g. Machine heater issue / delay in raw material / power interruption / quality checking..."
                  value={entryForm.remarks}
                  onChange={(e) => setEntryForm((f) => ({ ...f, remarks: e.target.value }))}
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', color: '#fff', padding: 8, borderRadius: 6, fontSize: 13 }}
                />
              </div>

              {/* TWO BALANCED ACTION BUTTONS: GO BACK/EDIT vs SAVE WITH REMARKS */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBelowTargetPrompt(null)}
                  style={{
                    flex: 1,
                    padding: '11px 14px',
                    background: '#334155',
                    border: '1px solid #475569',
                    color: '#f8fafc',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  ✏️ ← Edit / Re-check Values
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={savingEntry || !entryForm.remarks?.trim()}
                  onClick={() => submitEntry(true)}
                  style={{
                    flex: 1.3,
                    padding: '11px 14px',
                    background: (!entryForm.remarks?.trim() || savingEntry) ? '#64748b' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    border: 'none',
                    color: '#fff',
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: (!entryForm.remarks?.trim() || savingEntry) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  {savingEntry ? t('entry.saving', 'Saving...') : '💾 Save with Remarks'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEntrySubmit}>
              <div className="field">
                <label htmlFor="end_count">{t('entry.machineCountNow', 'Machine Counter Now *')}</label>
                {session.last_count != null && (
                  <div className="muted" style={{ fontSize: 13, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>
                      {t('entry.lastCount', { count: session.last_count })}
                    </span>
                    {session.last_entry_time && (
                      <span style={{ color: '#94a3b8' }}>
                        ({new Date(session.last_entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                      </span>
                    )}
                  </div>
                )}
                <input id="end_count" type="number" inputMode="numeric" required
                  placeholder={`e.g. ${prevCount + 50}`}
                  value={entryForm.end_count} onChange={(e) => setEntryForm((f) => ({ ...f, end_count: e.target.value }))} />

                {/* LIVE CALCULATION PREVIEW CARD */}
                {entryForm.end_count !== '' && enteredEndCount >= prevCount && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                    border: '1.5px solid #3b82f6',
                    borderRadius: 10,
                    padding: '12px 14px',
                    marginTop: 8,
                    marginBottom: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 5 }}>
                        ⚡ Live Output Preview ({cav} Cavities · Cycle {cycleSec}s)
                      </span>
                      {targetPerHour && (
                        <span style={{ fontSize: 11, background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                          Target: {targetPerHour} pcs/hr ({targetShotsPerHour} shots/hr)
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Shots Logged</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#f8fafc' }}>
                          {liveShots} <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>shots</span>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Gross Pieces</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#38bdf8' }}>
                          {liveGrossPieces} <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>pcs</span>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Rejections</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: liveTotalRejects > 0 ? '#f87171' : '#34d399' }}>
                          {liveTotalRejects} <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>pcs</span>
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 8px', borderRadius: 6, border: '1px solid var(--line)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Net Good Output</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: '#4ade80' }}>
                          {liveNetGood} <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>pcs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="field">
                <label>{t('entry.rejects', 'Rejection Quantity & Reasons')}</label>
                {rejectRows.map((row, i) => (
                  <div key={i} className="btn-row" style={{ marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <SearchableSelect
                        value={row.reason_id}
                        onChange={(e) => updateRejectRow(i, 'reason_id', e.target.value)}
                        options={rejectReasons}
                        placeholder={t('entry.reasonPlaceholder', 'Select scrap reason')}
                        searchPlaceholder="🔍 Type scrap reason..."
                        getOptionValue={(r) => r.id}
                        getOptionLabel={(r) => r.code ? (r.code + ' - ' + r.item_name) : (r.item_name || r.name)}
                      />
                    </div>
                    <input type="number" inputMode="numeric" placeholder={t('entry.qtyPlaceholder', 'Qty')}
                      value={row.qty} onChange={(e) => updateRejectRow(i, 'qty', e.target.value)} />
                    <button type="button" className="btn btn-secondary" onClick={() => removeRejectRow(i)}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addRejectRow}>{t('entry.addRejectReason', '+ Add scrap reason')}</button>
              </div>

              <div className="field">
                <label>{t('entry.downtime', 'Downtime Duration & Reasons')}</label>
                {downtimeRows.map((row, i) => (
                  <div key={i} className="btn-row" style={{ marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <SearchableSelect
                        value={row.reason_id}
                        onChange={(e) => updateDowntimeRow(i, 'reason_id', e.target.value)}
                        options={downtimeReasons}
                        placeholder={t('entry.reasonPlaceholder', 'Select downtime reason')}
                        searchPlaceholder="🔍 Type downtime reason..."
                        getOptionValue={(r) => r.id}
                        getOptionLabel={(r) => r.related_to ? (r.item_name + ' (' + r.related_to + ')') : (r.item_name || r.name)}
                      />
                    </div>
                    <input type="number" inputMode="numeric" placeholder={t('entry.minutesPlaceholder', 'Minutes')}
                      value={row.minutes} onChange={(e) => updateDowntimeRow(i, 'minutes', e.target.value)} />
                    <button type="button" className="btn btn-secondary" onClick={() => removeDowntimeRow(i)}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addDowntimeRow}>{t('entry.addDowntimeReason', '+ Add downtime')}</button>
              </div>

              <div className="field">
                <label htmlFor="remarks">{t('entry.remarksOptional', 'Remarks (Optional)')}</label>
                <textarea id="remarks" rows={2} value={entryForm.remarks}
                  onChange={(e) => setEntryForm((f) => ({ ...f, remarks: e.target.value }))} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={savingEntry}>
                {savingEntry ? t('entry.saving', 'Saving...') : t('entry.saveEntry', '💾 Log Hourly Production')}
              </button>
            </form>
          )}

          {lastEntry && (
            <div className="readout" style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div className="readout-label">{t('entry.lastEntry', { hour: lastEntry.hour_slot })}</div>
                {t('entry.lastEntryDetail', { qty: lastEntry.good_qty, scrap: lastEntry.reject_qty, dt: lastEntry.downtime_minutes })}
                {lastEntry.efficiency_pct != null && ` · Efficiency: ${lastEntry.efficiency_pct}%`}
              </div>
              <button
                type="button"
                onClick={() => setEntryToDelete(lastEntry)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  borderRadius: 6,
                  padding: '4px 8px',
                  fontSize: 11,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="Delete this hour entry if entered by mistake"
              >
                🗑️ Delete Entry
              </button>
            </div>
          )}

          {/* ACTION BUTTONS: CHANGE OPERATOR & OFF MACHINE */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, borderColor: '#3b82f6', color: '#60a5fa', background: 'rgba(59, 130, 246, 0.08)', fontWeight: 700, padding: '10px 14px' }}
              onClick={() => {
                setShowChangeOp((v) => !v);
                setShowOff(false);
                setChangeOpForm({
                  off_count: session.last_count != null ? String(session.last_count) : String(session.start_count),
                  new_operator_user_id: '',
                  remarks: '',
                });
              }}
            >
              🔄 Change Operator
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', background: 'rgba(239, 68, 68, 0.08)', fontWeight: 700, padding: '10px 14px' }}
              onClick={() => {
                setShowOff((v) => !v);
                setShowChangeOp(false);
                setOffForm({
                  off_count: session.last_count != null ? String(session.last_count) : String(session.start_count),
                  off_reason: '',
                  off_remarks: '',
                  new_operator_user_id: '',
                });
              }}
            >
              ⚡ Off Machine
            </button>
          </div>

          {/* DEDICATED CHANGE OPERATOR MODAL / SECTION */}
          {showChangeOp && (
            <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '2px solid #3b82f6', borderRadius: 12, padding: 16, marginTop: 14, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: '#60a5fa', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🔄 Operator Handover / Change Operator
                </h3>
                <button type="button" onClick={() => setShowChangeOp(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0 }}>
                Closes <strong>{session.operator_name}</strong>'s shift and transfers machine to the next operator. The new operator's login will reflect this machine instantly.
              </p>

              <form onSubmit={handleChangeOperatorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="field">
                  <label style={{ fontWeight: 600 }}>Handover Machine Counter *</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    value={changeOpForm.off_count}
                    onChange={(e) => setChangeOpForm({ ...changeOpForm, off_count: e.target.value })}
                    placeholder={`Last counter: ${session.last_count || session.start_count}`}
                  />
                </div>

                <div className="field">
                  <label style={{ fontWeight: 600 }}>👤 Incoming Operator Taking Over *</label>
                  <select
                    required
                    value={changeOpForm.new_operator_user_id}
                    onChange={(e) => setChangeOpForm({ ...changeOpForm, new_operator_user_id: e.target.value })}
                    style={{ fontWeight: 600 }}
                  >
                    <option value="">-- Select Incoming Operator --</option>
                    {uniqueOps
                      .filter((op) => op.id !== session.operator_user_id)
                      .map((op) => (
                        <option key={op.id} value={op.id}>
                          {op.full_name} ({op.role.toUpperCase()})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="field">
                  <label>Handover Remarks (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Shift B handover, relief during break"
                    value={changeOpForm.remarks}
                    onChange={(e) => setChangeOpForm({ ...changeOpForm, remarks: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowChangeOp(false)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: '#334155',
                      border: '1px solid #475569',
                      color: '#f8fafc',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={changingOp || !changeOpForm.new_operator_user_id}
                    style={{
                      flex: 1.4,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: 8,
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: (changingOp || !changeOpForm.new_operator_user_id) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
                    }}
                  >
                    {changingOp ? 'Transferring...' : '🔄 Confirm Handover & Assign Operator'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* OFF MACHINE FORM */}
          {showOff && (
            <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '2px solid #ef4444', borderRadius: 12, padding: 16, marginTop: 14, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 16, color: '#f87171', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  ⚡ Switch Off Machine
                </h3>
                <button type="button" onClick={() => setShowOff(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleOffSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="field">
                  <label htmlFor="off_reason" style={{ fontWeight: 600 }}>{t('entry.offReason', 'Reason for Stopping *')}</label>
                  <select id="off_reason" value={offForm.off_reason} required
                    onChange={(e) => setOffForm((f) => ({ ...f, off_reason: e.target.value }))}
                    style={{ fontWeight: 600 }}
                  >
                    <option value="" disabled>{t('entry.selectReasonOption', 'Select reason')}</option>
                    {OFF_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>

                {/* If operator_change is chosen inside Off form, show operator selector */}
                {offForm.off_reason === 'operator_change' && (
                  <div className="field" style={{ background: 'rgba(59, 130, 246, 0.08)', padding: 10, borderRadius: 6, border: '1px solid rgba(59, 130, 246, 0.25)' }}>
                    <label style={{ color: '#60a5fa', fontWeight: 600 }}>👤 Next Operator (Optional - instant restart)</label>
                    <select
                      value={offForm.new_operator_user_id}
                      onChange={(e) => setOffForm((f) => ({ ...f, new_operator_user_id: e.target.value }))}
                      style={{ width: '100%', marginTop: 4, fontWeight: 600 }}
                    >
                      <option value="">-- No Operator Now (Stop Machine) --</option>
                      {uniqueOps
                        .filter((op) => op.id !== session.operator_user_id)
                        .map((op) => (
                          <option key={op.id} value={op.id}>
                            {op.full_name} ({op.role.toUpperCase()})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="field">
                  <label htmlFor="off_count" style={{ fontWeight: 600 }}>{t('entry.finalCount', 'Final Machine Counter *')}</label>
                  <input id="off_count" type="number" inputMode="numeric" required
                    value={offForm.off_count} onChange={(e) => setOffForm((f) => ({ ...f, off_count: e.target.value }))} />
                </div>
                <div className="field">
                  <label htmlFor="off_remarks">{t('entry.remarksOptional', 'Remarks (Optional)')}</label>
                  <textarea id="off_remarks" rows={2} value={offForm.off_remarks}
                    onChange={(e) => setOffForm((f) => ({ ...f, off_remarks: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowOff(false)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: '#334155',
                      border: '1px solid #475569',
                      color: '#f8fafc',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={endingOff || !offForm.off_reason}
                    style={{
                      flex: 1.4,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      border: 'none',
                      color: '#fff',
                      borderRadius: 8,
                      fontWeight: 800,
                      fontSize: 13,
                      cursor: (endingOff || !offForm.off_reason) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    {endingOff ? t('entry.submitting', 'Submitting...') : '⚡ Confirm Machine OFF'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        );
      })()}
{entryToDelete && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 99999, padding: 16
        }}>
          <div style={{
            background: '#131b2e', border: '1px solid #ef4444',
            borderRadius: 12, width: '100%', maxWidth: 460, padding: 20,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6, fontSize: 16 }}>
                🗑️ Delete Hourly Production Entry
              </h3>
              <button
                type="button"
                onClick={() => { setEntryToDelete(null); setDeleteReason(''); setDeleteError(''); }}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', marginBottom: 14, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: '#fbbf24' }}>
                Hour Slot: {entryToDelete.hour_slot} · Good: {entryToDelete.good_qty} · Rej: {entryToDelete.reject_qty}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                Counts: {entryToDelete.start_count} → {entryToDelete.end_count} ({entryToDelete.entry_date} Shift {entryToDelete.shift})
              </div>
            </div>

            <form onSubmit={handleConfirmDeleteEntry}>
              <div className="field" style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc', display: 'block', marginBottom: 6 }}>
                  Reason / Remarks for Deletion (Mandatory) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Wrong counter value typed / wrong hour selected..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#fff',
                    fontSize: 13,
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {deleteError && (
                <div style={{ color: '#f87171', fontSize: 12, marginBottom: 10 }}>
                  ⚠ {deleteError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setEntryToDelete(null); setDeleteReason(''); setDeleteError(''); }}
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '8px 14px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deletingEntry || !deleteReason.trim()}
                  style={{
                    width: 'auto',
                    padding: '8px 16px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: (deletingEntry || !deleteReason.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {deletingEntry ? 'Deleting…' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFpaModal && (
        <FpaModal
          machine={machines.find((m) => String(m.id) === String(machineId || session?.machine_id))}
          part={assigned ? { id: assigned.part_id, part_code: assigned.part_code, shrp_part_code: assigned.shrp_part_code, part_name: assigned.part_name, cavity_count: assigned.cavity_count } : (session ? { id: session.part_id, part_code: session.part_code, shrp_part_code: session.shrp_part_code, part_name: session.part_name } : null)}
          mould={assigned?.mould_id ? { id: assigned.mould_id } : (session?.mould_id ? { id: session.mould_id } : null)}
          onClose={() => setShowFpaModal(false)}
          onSuccess={() => {
            setShowFpaModal(false);
            setFpaBlockedInfo(null);
            setSuccess('✅ FPA Approved! You can now proceed with production.');
          }}
        />
      )}
    </div>
  );
}

