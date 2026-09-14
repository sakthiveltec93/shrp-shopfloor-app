import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';

export default function BagEntry() {
  const { t } = useLanguage();
  const [machines, setMachines] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [context, setContext] = useState(null);

  const [machineId, setMachineId] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [shift, setShift] = useState('');
  const [batchInfo, setBatchInfo] = useState(null);
  const [batchError, setBatchError] = useState('');
  const [prodVisibility, setProdVisibility] = useState(null);

  const [bagType, setBagType] = useState('PART');
  const [withRunner, setWithRunner] = useState(true);
  const [weightKg, setWeightKg] = useState('');
  const [qty, setQty] = useState('');
  const [remarks, setRemarks] = useState('');

  const [bags, setBags] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastCreatedBag, setLastCreatedBag] = useState(null);
  const [loading, setLoading] = useState(false);

  // Over-tolerance approval modal
  const [tolerancePrompt, setTolerancePrompt] = useState(null);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [approvalReason, setApprovalReason] = useState('');

  // Batch completion confirmation modal
  const [completionPrompt, setCompletionPrompt] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [m, a, ctx] = await Promise.all([api.machines(), api.currentAssignments(), api.entryContext()]);
        if (m) setMachines(m);
        if (a) setAssignments(a);
        if (ctx) {
          setContext(ctx);
          setEntryDate(ctx.entry_date);
          setShift(ctx.shift);
        }
      } catch (err) {
        console.warn('Initial load using cached state or offline:', err);
      }
    })();
  }, []);

  const assigned = assignments.find((a) => String(a.machine_id) === String(machineId));

  const loadVisibility = useCallback(async () => {
    if (!machineId || !entryDate || !shift) {
      setProdVisibility(null);
      return;
    }
    try {
      const vis = await api.productionVisibility(machineId, entryDate, shift, assigned?.part_id);
      setProdVisibility(vis);
      if (vis && vis.is_completed) {
        setCompletionPrompt({
          prodQty: vis.production_qty,
          baggedQty: vis.already_bagged_qty,
        });
      }
    } catch {
      setProdVisibility(null);
    }
  }, [machineId, entryDate, shift, assigned]);

  useEffect(() => {
    if (!machineId || !entryDate || !shift) { setBatchInfo(null); return; }
    setBatchError('');
    api.bagBatchInfo(machineId, entryDate, shift)
      .then((info) => {
        setBatchInfo(info);
        loadVisibility();
      })
      .catch((err) => { setBatchInfo(null); setBatchError(err.message); });
  }, [machineId, entryDate, shift, loadVisibility]);

  useEffect(() => {
    if (batchInfo?.batch_no) loadBatchBags(batchInfo.batch_no);
  }, [batchInfo?.batch_no]);

  async function loadBatchBags(batchNo) {
    try {
      const b = await api.bagsForBatch(batchNo);
      setBags(b);
    } catch { /* ignore */ }
  }

  // Weight Calculation Logic per Section 6:
  // With runner: Avail Wt = Production Weight + Runner Weight
  // Without runner: Avail Wt = Production Weight
  function relevantWeightG() {
    if (!batchInfo) return null;
    return withRunner ? batchInfo.shot_weight_g : batchInfo.part_weight_g;
  }

  function updateWeight(value) {
    setWeightKg(value);
    const unitG = relevantWeightG();
    if (unitG && value !== '') {
      const kg = Number(value);
      if (!Number.isNaN(kg)) {
        const shots = (kg * 1000) / unitG;
        const pieces = withRunner ? shots * (batchInfo.cavity_count || 1) : shots;
        setQty(String(Math.round(pieces)));
      }
    }
  }

  function updateQty(value) {
    setQty(value);
    const unitG = relevantWeightG();
    if (unitG && value !== '') {
      const pieces = Number(value);
      if (!Number.isNaN(pieces)) {
        const shots = withRunner ? pieces / (batchInfo.cavity_count || 1) : pieces;
        setWeightKg(((shots * unitG) / 1000).toFixed(3));
      }
    }
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    if (!assigned) { setError(t('bagEntry.noApprovedPartError')); return; }
    if (!batchInfo) { setError(batchError || t('bagEntry.batchNotReadyError')); return; }
    setLoading(true);

    try {
      const payload = {
        machine_id: Number(machineId),
        part_id: batchInfo.part_id,
        batch_no: batchInfo.batch_no,
        bag_type: bagType,
        base_weight_kg: Number(weightKg),
        qty: Number(qty),
        remarks: remarks || null,
      };

      if (tolerancePrompt) {
        payload.supervisor_pin = supervisorPin;
        payload.approval_reason = approvalReason;
      }

      const bag = await api.createBag(payload);
      setTolerancePrompt(null);
      setSupervisorPin('');
      setApprovalReason('');
      setSuccess(bag.queuedOffline ? bag.message : t('bagEntry.createdBag', { code: bag.bag_code }));
      setLastCreatedBag(bag);
      setWeightKg(''); setQty(''); setRemarks('');
      loadBatchBags(batchInfo.batch_no);
      loadVisibility();
    } catch (err) {
      if (err.data?.code === 'over_tolerance') {
        setTolerancePrompt(err.data);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">{t('bagEntry.title')}</h1>
      <p className="screen-sub">{t('bagEntry.subtitle')}</p>

      {error && <div className="error-banner">{error}</div>}
      {success && (
        <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>
          {success}
          {lastCreatedBag && !lastCreatedBag.queuedOffline && (
            <Link to={`/bags/${lastCreatedBag.id}/label`} className="btn btn-secondary" style={{ marginTop: 10 }}>
              {t('bagEntry.printLabel')}
            </Link>
          )}
        </div>
      )}

      {/* Over-Tolerance Supervisor Approval Modal per Section 8 */}
      {tolerancePrompt && (
        <div className="panel" style={{ borderColor: 'var(--red)', background: 'rgba(229,72,77,0.06)' }}>
          <h3 style={{ margin: '0 0 8px', color: 'var(--red)', fontSize: 15 }}>
            Quantity exceeds allowed tolerance.
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13, marginBottom: 12 }}>
            <div>Production Qty:</div><strong>{tolerancePrompt.production_qty?.toLocaleString()}</strong>
            <div>Already Processed:</div><strong>{tolerancePrompt.already_processed?.toLocaleString()}</strong>
            <div>New Total:</div><strong style={{ color: 'var(--red)' }}>{tolerancePrompt.new_total?.toLocaleString()}</strong>
            <div>Allowed Maximum:</div><strong>{tolerancePrompt.max_allowed?.toLocaleString()}</strong>
          </div>

          <div className="field">
            <label htmlFor="sup_pin">Supervisor / Admin PIN *</label>
            <input
              id="sup_pin"
              type="password"
              inputMode="numeric"
              placeholder="Enter PIN"
              value={supervisorPin}
              onChange={(e) => setSupervisorPin(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="app_reason">Approval Reason / Mandatory Remarks *</label>
            <textarea
              id="app_reason"
              rows={2}
              placeholder="State reason for authorizing over-tolerance bagging"
              value={approvalReason}
              onChange={(e) => setApprovalReason(e.target.value)}
              required
            />
          </div>

          <div className="btn-row">
            <button
              className="btn btn-primary"
              disabled={loading || !supervisorPin || !approvalReason}
              onClick={() => handleSubmit(null)}
            >
              {loading ? 'Approving…' : 'Authorize & Save'}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setTolerancePrompt(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Production Batch Completion Confirmation per Section 9 */}
      {completionPrompt && (
        <div className="panel" style={{ borderColor: 'var(--green)', background: 'rgba(76,175,125,0.08)' }}>
          <h3 style={{ margin: '0 0 6px', color: 'var(--green)', fontSize: 15 }}>
            Production batch fully bagged within tolerance.
          </h3>
          <div style={{ fontSize: 13, marginBottom: 12 }}>
            <div>Production Qty : <strong>{completionPrompt.prodQty?.toLocaleString()}</strong></div>
            <div>Bagged Qty : <strong>{completionPrompt.baggedQty?.toLocaleString()}</strong></div>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600 }}>Mark production as COMPLETED?</p>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setCompletionPrompt(null)}
            >
              Yes
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setCompletionPrompt(null)}
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Live Production Visibility Panel per Section 5 */}
      {prodVisibility && (
        <div className="panel" style={{ borderLeft: '3px solid var(--amber)' }}>
          <div className="readout-label" style={{ marginBottom: 8, fontWeight: 700, color: 'var(--text)' }}>
            PRODUCTION & BAGGING VISIBILITY
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="readout">
              <div className="readout-label">Production Qty</div>
              <strong style={{ fontSize: 15 }}>{prodVisibility.production_qty.toLocaleString()}</strong>
            </div>
            <div className="readout">
              <div className="readout-label">Already Bagged Qty</div>
              <strong style={{ fontSize: 15, color: 'var(--amber)' }}>{prodVisibility.already_bagged_qty.toLocaleString()}</strong>
            </div>
            <div className="readout">
              <div className="readout-label">Remaining Qty</div>
              <strong style={{ fontSize: 15, color: prodVisibility.remaining_qty > 0 ? 'var(--green)' : 'var(--text-muted)' }}>
                {prodVisibility.remaining_qty.toLocaleString()}
              </strong>
            </div>
            <div className="readout">
              <div className="readout-label">Allowed Max Qty</div>
              <span className="muted" style={{ fontSize: 13 }}>{prodVisibility.max_allowed_qty.toLocaleString()}</span>
            </div>
            <div className="readout">
              <div className="readout-label">Production Weight</div>
              <strong>{prodVisibility.production_weight_kg.toFixed(3)} Kg</strong>
            </div>
            <div className="readout">
              <div className="readout-label">Already Bagged Wt</div>
              <strong>{prodVisibility.already_bagged_weight_kg.toFixed(3)} Kg</strong>
            </div>
            <div className="readout">
              <div className="readout-label">Remaining Weight</div>
              <strong style={{ color: 'var(--green)' }}>{prodVisibility.remaining_weight_kg.toFixed(3)} Kg</strong>
            </div>
            <div className="readout">
              <div className="readout-label">Part Wt / Runner Wt</div>
              <span style={{ fontSize: 12 }}>{prodVisibility.part_weight_g}g / {prodVisibility.runner_weight_kg}Kg</span>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel">
        <div className="field">
          <label htmlFor="machine">{t('common.machine')}</label>
          <select id="machine" value={machineId} onChange={(e) => setMachineId(e.target.value)} required>
            <option value="" disabled>{t('common.selectMachine')}</option>
            {machines.map((m) => <option key={m.id} value={m.id}>{m.machine_code}</option>)}
          </select>
        </div>

        {machineId && (
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">{t('bagEntry.assignedPart')}</div>
            {assigned ? `${assigned.shrp_part_code || assigned.part_code} — ${assigned.part_name}` : t('bagEntry.noneAssigned')}
          </div>
        )}

        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="date">{t('bagEntry.productionDate')}</label>
            <input id="date" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="shift">{t('bagEntry.shift')}</label>
            <select id="shift" value={shift} onChange={(e) => setShift(e.target.value)}>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
        </div>

        {batchError && <div className="error-banner">{batchError}</div>}
        {batchInfo && (
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">{t('bagEntry.batchNo')}</div>
            {batchInfo.batch_no}
          </div>
        )}

        <div className="field">
          <label htmlFor="bag_type">{t('bagEntry.bagType')}</label>
          <select id="bag_type" value={bagType} onChange={(e) => setBagType(e.target.value)}>
            <option value="PART">{t('bagEntry.bagTypePart')}</option>
            <option value="RUNNER">{t('bagEntry.bagTypeRunner')}</option>
          </select>
        </div>

        {batchInfo && bagType === 'PART' && (
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={withRunner} onChange={(e) => { setWithRunner(e.target.checked); setWeightKg(''); setQty(''); }} />
              {t('bagEntry.weighedWithRunner')}
            </label>
            <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              {withRunner
                ? t('bagEntry.usingShotWeight', { wt: batchInfo.shot_weight_g ?? '—', cavities: batchInfo.cavity_count })
                : t('bagEntry.usingPartWeight', { wt: batchInfo.part_weight_g ?? '—' })}
            </p>
          </div>
        )}

        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="wt">{t('common.weightKg')}</label>
            <input id="wt" type="number" step="0.001" inputMode="decimal" required
              value={weightKg} onChange={(e) => updateWeight(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="qty">{t('bagEntry.qtyPcs')}</label>
            <input id="qty" type="number" inputMode="numeric" required
              value={qty} onChange={(e) => updateQty(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="remarks">{t('common.remarksOptional')}</label>
          <textarea id="remarks" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading || !assigned || !batchInfo}>
          {loading ? t('bagEntry.saving') : t('bagEntry.saveBag')}
        </button>
      </form>

      {bags.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>
            {t('bagEntry.bagsOnBatch', { batch: batchInfo?.batch_no })}
          </h2>
          <div className="panel" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('bagEntry.colBag')}</th>
                  <th>{t('bagEntry.colType')}</th>
                  <th>{t('bagEntry.colWt')}</th>
                  <th>{t('bagEntry.colQty')}</th>
                  <th>{t('bagEntry.colStatus')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bags.map((b) => (
                  <tr key={b.id}>
                    <td>{b.bag_code}</td>
                    <td>{b.bag_type}</td>
                    <td>{b.base_weight_kg}</td>
                    <td>{b.qty}</td>
                    <td>{b.status}</td>
                    <td>
                      <Link to={`/bags/${b.id}/label`} style={{ color: 'var(--amber)', fontSize: 12 }}>
                        {t('bagEntry.colLabel')}
                      </Link>
                    </td>
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
