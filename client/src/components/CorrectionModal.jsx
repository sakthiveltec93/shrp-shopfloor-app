import { useState, useEffect } from 'react';
import { api } from '../api';
import SearchableSelect from './SearchableSelect';

export default function CorrectionModal({ mode, record, initialMachineId, initialDate, onClose, onSuccess, userRole }) {
  // mode: 'edit_production' | 'edit_bag' | 'override_bag_status' | 'backdate_production'
  const isAdmin = userRole === 'admin';

  const [machineId, setMachineId] = useState(initialMachineId || record?.machine_id || '');
  const [entryDate, setEntryDate] = useState(initialDate || record?.entry_date || '');
  const [shift, setShift] = useState(record?.shift || 'A');
  const [partId, setPartId] = useState(record?.part_id || '');
  const [operatorId, setOperatorId] = useState(record?.operator_user_id || '');
  const [periodStartAt, setPeriodStartAt] = useState(record?.period_start_at ? new Date(record.period_start_at).toISOString().slice(0, 16) : '');
  const [periodEndAt, setPeriodEndAt] = useState(record?.period_end_at ? new Date(record.period_end_at).toISOString().slice(0, 16) : '');
  const [startCount, setStartCount] = useState(record?.start_count != null ? record.start_count : '');
  const [endCount, setEndCount] = useState(record?.end_count != null ? record.end_count : '');
  const [goodQty, setGoodQty] = useState(record?.good_qty != null ? record.good_qty : '');
  const [remarks, setRemarks] = useState(record?.remarks || '');
  const [reason, setReason] = useState('');

  // Itemized Rejection & Downtime states
  const [rejectReasons, setRejectReasons] = useState([]);
  const [downtimeReasons, setDowntimeReasons] = useState([]);
  const [rejectRows, setRejectRows] = useState(() => {
    if (record?.rejects && Array.isArray(record.rejects) && record.rejects.length > 0) {
      return record.rejects.map((r) => ({
        reason_id: String(r.reject_reason_id || r.reason_id || r.id || ''),
        qty: String(r.qty != null ? r.qty : ''),
      }));
    }
    if (record?.reject_qty > 0) {
      return [{ reason_id: '', qty: String(record.reject_qty) }];
    }
    return [];
  });
  const [downtimeRows, setDowntimeRows] = useState(() => {
    if (record?.downtimes && Array.isArray(record.downtimes) && record.downtimes.length > 0) {
      return record.downtimes.map((d) => ({
        reason_id: String(d.downtime_reason_id || d.reason_id || d.id || ''),
        minutes: String(d.minutes != null ? d.minutes : ''),
      }));
    }
    if (record?.downtime_minutes > 0) {
      return [{ reason_id: '', minutes: String(record.downtime_minutes) }];
    }
    return [];
  });

  // Bag specific
  const [baseWeightKg, setBaseWeightKg] = useState(record?.base_weight_kg != null ? record.base_weight_kg : '');
  const [bagQty, setBagQty] = useState(record?.qty != null ? record.qty : '');
  const [targetStatus, setTargetStatus] = useState(record?.status || 'OPEN');

  // Master lists
  const [machines, setMachines] = useState([]);
  const [parts, setParts] = useState([]);
  const [operators, setOperators] = useState([]);
  const [lookupState, setLookupState] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [shots, setShots] = useState(''); // Calculated: End Count - Start Count

  // Live calculated totals
  const totalRejectQty = rejectRows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0);
  const totalDowntimeMin = downtimeRows.reduce((sum, d) => sum + (Number(d.minutes) || 0), 0);

  useEffect(() => {
    Promise.all([
      api.machines(),
      api.parts(),
      api.operators().catch(() => []),
      api.checkItems('reject_reason').catch(() => []),
      api.checkItems('downtime_reason').catch(() => []),
    ]).then(([m, p, ops, rejR, dtR]) => {
      if (m) setMachines(m);
      if (p) setParts(p);
      if (ops) setOperators(ops);
      if (rejR) setRejectReasons(rejR);
      if (dtR) setDowntimeReasons(dtR);
    }).catch(() => {});
  }, []);

  // Auto-calculate Shots and Good Qty based on cavity count
  useEffect(() => {
    if (startCount !== '' && endCount !== '') {
      const start = Number(startCount);
      const end = Number(endCount);
      if (!isNaN(start) && !isNaN(end)) {
        const calculatedShots = end - start;
        setShots(calculatedShots);

        // Get cavity count from selected part
        if (partId && parts.length > 0) {
          const selectedPart = parts.find((p) => String(p.id) === String(partId));
          if (selectedPart) {
            const cavities = Number(selectedPart.cavities_for_part) || Number(selectedPart.cavity_count) || 1;
            const calculatedGoodQty = calculatedShots * cavities;
            setGoodQty(calculatedGoodQty);
          }
        }
      }
    } else {
      setShots('');
    }
  }, [startCount, endCount, partId, parts]);

  // VBA Auto-lookup on Machine + Date change for backdating
  useEffect(() => {
    if (mode === 'backdate_production' && machineId && entryDate) {
      setLookupLoading(true);
      api.corrections.machineLastState(machineId, entryDate)
        .then((res) => {
          setLookupState(res);
          if (res?.entry) {
            const e = res.entry;
            if (e.is_mould_change) {
              setStartCount('0');
              setEndCount('');
            } else {
              setStartCount(e.end_count != null ? String(e.end_count) : '0');
            }
            if (e.part_id) setPartId(String(e.part_id));
            if (e.operator_user_id) setOperatorId(String(e.operator_user_id));
            if (e.period_end_at || e.end_time || e.period_start_at) {
              const dt = new Date(e.period_end_at || e.end_time || e.period_start_at);
              if (!isNaN(dt.getTime())) {
                const pad = (n) => String(n).padStart(2, '0');
                const localIso = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
                setPeriodStartAt(localIso);
              }
            }
          } else if (res?.assignment) {
            const asgn = res.assignment;
            if (asgn.part_id) setPartId(String(asgn.part_id));
            setStartCount('0');
            setEndCount('');
          }
        })
        .catch(() => setLookupState(null))
        .finally(() => setLookupLoading(false));
    }
  }, [mode, machineId, entryDate]);

  // Dynamic row management for Rejections
  const handleAddRejectRow = () => {
    setRejectRows((prev) => [...prev, { reason_id: '', qty: '' }]);
  };

  const handleRemoveRejectRow = (index) => {
    setRejectRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateRejectRow = (index, field, val) => {
    setRejectRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  // Dynamic row management for Downtimes
  const handleAddDowntimeRow = () => {
    setDowntimeRows((prev) => [...prev, { reason_id: '', minutes: '' }]);
  };

  const handleRemoveDowntimeRow = (index) => {
    setDowntimeRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateDowntimeRow = (index, field, val) => {
    setDowntimeRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!reason.trim()) {
      setError('A mandatory, non-empty correction reason is required for audit traceability.');
      return;
    }

    setSaving(true);
    setError('');

    // Prepare itemized reject & downtime arrays
    const validRejects = rejectRows
      .filter((r) => r.reason_id && Number(r.qty) > 0)
      .map((r) => ({
        reason_id: Number(r.reason_id),
        qty: Number(r.qty),
      }));

    const validDowntimes = downtimeRows
      .filter((d) => d.reason_id && Number(d.minutes) > 0)
      .map((d) => ({
        reason_id: Number(d.reason_id),
        minutes: Number(d.minutes),
      }));

    try {
      if (mode === 'edit_production') {
        const payload = {
          start_count: startCount !== '' ? Number(startCount) : undefined,
          end_count: endCount !== '' ? Number(endCount) : undefined,
          good_qty: goodQty !== '' ? Number(goodQty) : undefined,
          reject_qty: totalRejectQty,
          downtime_minutes: totalDowntimeMin,
          rejects: validRejects,
          downtimes: validDowntimes,
          shift,
          entry_date: entryDate,
          period_start_at: periodStartAt ? new Date(periodStartAt).toISOString() : undefined,
          period_end_at: periodEndAt ? new Date(periodEndAt).toISOString() : undefined,
          remarks: remarks || null,
        };

        const body = {
          entity_type: 'production_entry',
          entity_id: record.id,
          entity_code: `${record.machine_code || 'Machine'} (Entry #${record.id})`,
          action: 'EDIT',
          payload,
          reason: reason.trim(),
          direct: isAdmin, // Direct execute for admin, pending request for supervisor
        };

        await api.corrections.request(body);
      } else if (mode === 'backdate_production') {
        const payload = {
          machine_id: Number(machineId),
          part_id: Number(partId),
          operator_user_id: operatorId ? Number(operatorId) : undefined,
          shift,
          entry_date: entryDate,
          period_start_at: periodStartAt ? new Date(periodStartAt).toISOString() : undefined,
          period_end_at: periodEndAt ? new Date(periodEndAt).toISOString() : undefined,
          start_count: Number(startCount),
          end_count: Number(endCount),
          good_qty: Number(goodQty),
          reject_qty: totalRejectQty,
          downtime_minutes: totalDowntimeMin,
          rejects: validRejects,
          downtimes: validDowntimes,
          remarks: remarks || null,
        };

        const machObj = machines.find((m) => String(m.id) === String(machineId));
        const body = {
          entity_type: 'production_entry',
          entity_code: `${machObj?.machine_code || 'Machine'} - ${entryDate} (${periodStartAt?.slice(11, 16) || ''} - ${periodEndAt?.slice(11, 16) || ''})`,
          action: 'BACKDATED_CREATE',
          payload,
          reason: reason.trim(),
          direct: isAdmin,
        };

        await api.corrections.request(body);
      } else if (mode === 'edit_bag') {
        const payload = {
          base_weight_kg: Number(baseWeightKg),
          qty: Number(bagQty),
          remarks: remarks || null,
        };

        const body = {
          entity_type: 'bag',
          entity_id: record.id,
          entity_code: record.bag_code,
          action: 'EDIT',
          payload,
          reason: reason.trim(),
          direct: isAdmin,
        };

        await api.corrections.request(body);
      } else if (mode === 'override_bag_status') {
        const payload = {
          status: targetStatus,
        };

        const body = {
          entity_type: 'bag',
          entity_id: record.id,
          entity_code: record.bag_code,
          action: 'STATUS_OVERRIDE',
          payload,
          reason: reason.trim(),
          direct: isAdmin,
        };

        await api.corrections.request(body);
      }

      onSuccess(isAdmin ? 'Correction successfully applied and audit logged.' : 'Correction request submitted for Admin approval.');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit correction');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
      <div className="panel" style={{ width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', background: '#1c222d', borderColor: 'var(--blue)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>✏️</span>
            <span>
              {mode === 'edit_production' && `Edit Production Entry #${record?.id}`}
              {mode === 'backdate_production' && '➕ Backdated Production Catch-Up Entry'}
              {mode === 'edit_bag' && `Edit Bag #${record?.bag_code}`}
              {mode === 'override_bag_status' && `🔄 Override Status for Bag #${record?.bag_code}`}
            </span>
          </h3>
          <button type="button" style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }} onClick={onClose}>✕</button>
        </div>

        {error && <div className="error-banner" style={{ marginBottom: 12 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Backdate Production Form */}
          {mode === 'backdate_production' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="mach">Machine *</label>
                  <select id="mach" value={machineId} onChange={(e) => setMachineId(e.target.value)} required>
                    <option value="">Select Machine...</option>
                    {machines.map((m) => <option key={m.id} value={m.id}>{m.machine_code}</option>)}
                  </select>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="dt">Production Date *</label>
                  <input id="dt" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
                </div>
              </div>

              {lookupLoading && <p className="muted" style={{ fontSize: 12 }}>Looking up prior machine state…</p>}
              {lookupState && (
                <div style={{ background: 'rgba(59,130,246,0.08)', padding: '8px 10px', borderRadius: 6, marginBottom: 10, fontSize: 12, border: '1px solid rgba(59,130,246,0.2)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--blue)' }}>{lookupState.message}</div>
                  {lookupState.entry && (
                    <div style={{ marginTop: 4, color: 'var(--text)' }}>
                      Prior Part: <strong>{lookupState.entry.shrp_part_code || lookupState.entry.part_code}</strong> · Prior End Count: <strong>{lookupState.entry.end_count}</strong> · End Time: <strong>{lookupState.entry.period_end_at ? new Date(lookupState.entry.period_end_at).toLocaleTimeString() : '-'}</strong>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 10 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="shift">Shift *</label>
                  <select id="shift" value={shift} onChange={(e) => setShift(e.target.value)}>
                    <option value="A">Shift A (09:30 - 21:30)</option>
                    <option value="B">Shift B (21:30 - 09:30)</option>
                  </select>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="part">Part *</label>
                  <SearchableSelect
                    id="part"
                    value={partId}
                    onChange={(_, val) => setPartId(val)}
                    options={parts}
                    getOptionValue={(p) => String(p.id)}
                    getOptionLabel={(p) => p.shrp_part_code || p.part_code}
                    getOptionBadge={() => ''}
                    getOptionSublabel={() => ''}
                    placeholder="🔍 Select Part..."
                    searchPlaceholder="Search part code..."
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="p_start">Period Start Time *</label>
                  <input id="p_start" type="datetime-local" value={periodStartAt} onChange={(e) => setPeriodStartAt(e.target.value)} required />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="p_end">Period End Time *</label>
                  <input id="p_end" type="datetime-local" value={periodEndAt} onChange={(e) => setPeriodEndAt(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="st_cnt">Start Count *</label>
                  <input id="st_cnt" type="number" value={startCount} onChange={(e) => setStartCount(e.target.value)} required />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="end_cnt">End Count *</label>
                  <input id="end_cnt" type="number" value={endCount} onChange={(e) => setEndCount(e.target.value)} required />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="shots">Shots (Auto)</label>
                  <input id="shots" type="number" value={shots} disabled style={{ background: 'rgba(0,0,0,0.2)', cursor: 'not-allowed' }} />
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>End - Start</div>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="good">Good Qty (Auto)</label>
                  <input id="good" type="number" value={goodQty} disabled style={{ background: 'rgba(0,0,0,0.2)', cursor: 'not-allowed' }} />
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Shots × Cavities</div>
                </div>
              </div>

              <div className="field" style={{ marginBottom: 10 }}>
                <label htmlFor="op">Operator</label>
                <select id="op" value={operatorId} onChange={(e) => setOperatorId(e.target.value)}>
                  <option value="">Select Operator (Optional)...</option>
                  {operators.map((o) => <option key={o.id} value={o.id}>{o.full_name} ({o.username})</option>)}
                </select>
              </div>
            </>
          )}

          {/* Edit Production Form */}
          {mode === 'edit_production' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="st_cnt">Start Count</label>
                  <input id="st_cnt" type="number" value={startCount} onChange={(e) => setStartCount(e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="end_cnt">End Count</label>
                  <input id="end_cnt" type="number" value={endCount} onChange={(e) => setEndCount(e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="shots">Shots {startCount && endCount ? '(Auto)' : ''}</label>
                  <input id="shots" type="number" value={shots} style={startCount && endCount ? { background: 'rgba(0,0,0,0.2)', cursor: 'not-allowed' } : {}} disabled={startCount && endCount ? true : false} />
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>End - Start</div>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="good">Good Qty {startCount && endCount ? '(Auto)' : ''}</label>
                  <input id="good" type="number" value={goodQty} onChange={(e) => setGoodQty(e.target.value)} style={startCount && endCount ? { background: 'rgba(0,0,0,0.2)', cursor: 'not-allowed' } : {}} disabled={startCount && endCount ? true : false} />
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Shots × Cavities</div>
                </div>
              </div>
            </>
          )}

          {/* Rejection Breakdown Section for Production Modes */}
          {(mode === 'backdate_production' || mode === 'edit_production') && (
            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>🚨 Rejection Breakdown</span>
                  <span style={{ fontSize: 11, background: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: 12 }}>
                    Total: {totalRejectQty} pcs
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '3px 8px', fontSize: 11, color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                  onClick={handleAddRejectRow}
                >
                  ➕ Add Defect
                </button>
              </div>

              {rejectRows.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '6px 0' }}>
                  No rejection logged. Click "+ Add Defect" if scrap occurred.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {rejectRows.map((row, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 32px', gap: 8, alignItems: 'center' }}>
                      <SearchableSelect
                        value={row.reason_id}
                        onChange={(_, val) => handleUpdateRejectRow(idx, 'reason_id', val)}
                        options={rejectReasons}
                        getOptionValue={(opt) => String(opt.id)}
                        getOptionLabel={(opt) => opt.item_name}
                        getOptionBadge={(opt) => opt.code || ''}
                        placeholder="🔍 Select Defect / Scrap Reason..."
                        searchPlaceholder="Search defect name or code..."
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={row.qty}
                        onChange={(e) => handleUpdateRejectRow(idx, 'qty', e.target.value)}
                        style={{ height: 42, background: 'var(--card, #1a2234)', borderColor: 'var(--line, #334155)', color: '#fff' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRejectRow(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 16, cursor: 'pointer', padding: 4 }}
                        title="Remove Defect"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Downtime Breakdown Section for Production Modes */}
          {(mode === 'backdate_production' || mode === 'edit_production') && (
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⏱️ Downtime Breakdown</span>
                  <span style={{ fontSize: 11, background: 'rgba(245, 158, 11, 0.2)', padding: '2px 8px', borderRadius: 12 }}>
                    Total: {totalDowntimeMin} min
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '3px 8px', fontSize: 11, color: '#fde68a', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                  onClick={handleAddDowntimeRow}
                >
                  ➕ Add Downtime
                </button>
              </div>

              {downtimeRows.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '6px 0' }}>
                  No downtime logged. Click "+ Add Downtime" if stoppage occurred.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {downtimeRows.map((row, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 32px', gap: 8, alignItems: 'center' }}>
                      <SearchableSelect
                        value={row.reason_id}
                        onChange={(_, val) => handleUpdateDowntimeRow(idx, 'reason_id', val)}
                        options={downtimeReasons}
                        getOptionValue={(opt) => String(opt.id)}
                        getOptionLabel={(opt) => opt.item_name}
                        getOptionBadge={(opt) => opt.code || ''}
                        placeholder="🔍 Select Downtime Reason..."
                        searchPlaceholder="Search downtime reason..."
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Min"
                        value={row.minutes}
                        onChange={(e) => handleUpdateDowntimeRow(idx, 'minutes', e.target.value)}
                        style={{ height: 42, background: 'var(--card, #1a2234)', borderColor: 'var(--line, #334155)', color: '#fff' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDowntimeRow(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 16, cursor: 'pointer', padding: 4 }}
                        title="Remove Downtime"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit Bag Form */}
          {mode === 'edit_bag' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="b_wt">Base Weight (kg) *</label>
                <input id="b_wt" type="number" step="0.001" value={baseWeightKg} onChange={(e) => setBaseWeightKg(e.target.value)} required />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="b_qty">Piece Quantity *</label>
                <input id="b_qty" type="number" value={bagQty} onChange={(e) => setBagQty(e.target.value)} required />
              </div>
            </div>
          )}

          {/* Override Bag Status Form */}
          {mode === 'override_bag_status' && (
            <div className="field" style={{ marginBottom: 10 }}>
              <label htmlFor="t_status">New Target Status *</label>
              <select id="t_status" value={targetStatus} onChange={(e) => setTargetStatus(e.target.value)} required>
                <option value="OPEN">OPEN (Moulded / Pending Trim)</option>
                <option value="PARTIAL_TRIM">PARTIAL_TRIM (In Trimming)</option>
                <option value="TRIMMED">TRIMMED (Ready for Inspection)</option>
                <option value="PARTIAL_INSPECT">PARTIAL_INSPECT (In Inspection)</option>
                <option value="INSPECTED">INSPECTED (Ready for Packing)</option>
                <option value="PARTIAL_PACK">PARTIAL_PACK (Partially Packed)</option>
                <option value="PACKED">PACKED (Packed in Box)</option>
                <option value="DISPATCHED">DISPATCHED (Shipped)</option>
                <option value="HOLD">HOLD (Quarantined)</option>
                <option value="SCRAPPED">SCRAPPED (Rejected)</option>
              </select>
            </div>
          )}

          <div className="field" style={{ marginBottom: 10 }}>
            <label htmlFor="rem">Remarks</label>
            <input id="rem" type="text" placeholder="Optional notes on this record..." value={remarks} onChange={(e) => setRemarks(e.target.value)} />
          </div>

          {/* Mandatory Reason Field for IATF Audit Trail */}
          <div className="field" style={{ marginBottom: 14 }}>
            <label htmlFor="cor_reason" style={{ color: 'var(--amber)', fontWeight: 700 }}>
              ⚠️ Mandatory Correction Reason (Logged for IATF Traceability) *
            </label>
            <textarea
              id="cor_reason"
              rows={2}
              placeholder="Explain why this change/catch-up entry is being made (e.g. physical QA bin count reconciliation, retroactive entry after shift power outage)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="btn-row">
            <button className="btn btn-primary" type="submit" disabled={saving || !reason.trim()}>
              {saving ? 'Submitting…' : isAdmin ? '💾 Apply & Save' : '📝 Submit for Admin Approval'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
