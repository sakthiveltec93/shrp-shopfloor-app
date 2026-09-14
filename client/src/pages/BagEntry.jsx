import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';
import CameraScanner from '../components/CameraScanner';

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
  const [showCamera, setShowCamera] = useState(false);

  // Over-tolerance approval modal
  const [tolerancePrompt, setTolerancePrompt] = useState(null);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [approvalReason, setApprovalReason] = useState('');

  // Batch completion confirmation modal
  const [completionPrompt, setCompletionPrompt] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [m, a, ctx, mySess] = await Promise.all([
          api.machines(),
          api.currentAssignments(),
          api.entryContext(),
          api.mySession().catch(() => null),
        ]);
        if (m) setMachines(m);
        if (a) setAssignments(a);
        if (ctx) {
          setContext(ctx);
          setEntryDate(ctx.entry_date);
          setShift(ctx.shift);
        }
        if (mySess?.session?.machine_id) {
          setMachineId(String(mySess.session.machine_id));
        } else if (a && a.length > 0) {
          const running = a.find((asgn) => asgn.active_stage || asgn.approved);
          if (running) setMachineId(String(running.machine_id));
        }
      } catch (err) {
        console.warn('Initial load using cached state or offline:', err);
      }
    })();
  }, []);

  function handleCameraScan(scannedCode) {
    if (!scannedCode) return;
    const clean = scannedCode.trim().toUpperCase();
    const mach = machines.find((m) => m.machine_code.toUpperCase() === clean);
    if (mach) {
      setMachineId(String(mach.id));
      setSuccess(`Selected machine ${mach.machine_code} from QR scan`);
      return;
    }
    const asgn = assignments.find(
      (a) => (a.shrp_part_code && a.shrp_part_code.toUpperCase() === clean) ||
             (a.part_code && a.part_code.toUpperCase() === clean) ||
             (a.customer_part_no && a.customer_part_no.toUpperCase() === clean)
    );
    if (asgn) {
      setMachineId(String(asgn.machine_id));
      setSuccess(`Found machine ${asgn.machine_code} running part ${clean}`);
      return;
    }
    setError(`Scanned code "${scannedCode}" not recognized as a machine or active part.`);
  }

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

      {/* 1. Live Production & Bagging Visibility Card - ALWAYS VISIBLE AT TOP */}
      <div className="visibility-kpi-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: prodVisibility ? '#22c55e' : 'var(--amber)', display: 'inline-block', boxShadow: '0 0 8px currentColor' }}></span>
            <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--amber)' }}>
              LIVE PRODUCTION & BAGGING VISIBILITY
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {machineId && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                onClick={() => loadVisibility()}
                title="Refresh live metrics"
              >
                ↻ Refresh
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '4px 10px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={() => setShowCamera(true)}
            >
              📷 Scan QR
            </button>
          </div>
        </div>

        {prodVisibility ? (
          <>
            {/* Prominent SHRP Part Code Badge */}
            <div className="shrp-part-badge-card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="shrp-code-pill" style={{ fontSize: 16, padding: '5px 14px' }}>
                  {prodVisibility.shrp_part_code || assigned?.shrp_part_code || assigned?.part_code || 'PART'}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                    {prodVisibility.part_name || assigned?.part_name || 'Assigned Part'}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                    Customer Part No: <strong style={{ color: 'var(--text)' }}>{prodVisibility.customer_part_no || assigned?.customer_part_no || assigned?.part_code || '—'}</strong>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 6 }}>
                Unit Weight: {prodVisibility.part_weight_g || batchInfo?.part_weight_g || '—'}g · Cavities: {batchInfo?.cavity_count || 1}
              </div>
            </div>

            {/* 8 KPI Metrics Grid */}
            <div className="visibility-kpi-grid">
              <div className="kpi-stat-box">
                <span className="kpi-label">Current Hr</span>
                <span className="kpi-val" style={{ color: 'var(--blue)' }}>
                  {(prodVisibility.current_hour_qty ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="kpi-stat-box">
                <span className="kpi-label">Shift Cumul.</span>
                <span className="kpi-val">
                  {(prodVisibility.shift_cumulative_qty ?? prodVisibility.production_qty ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="kpi-stat-box">
                <span className="kpi-label">Batch Cumul.</span>
                <span className="kpi-val">
                  {(prodVisibility.batch_cumulative_qty ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="kpi-stat-box">
                <span className="kpi-label">Target Qty</span>
                <span className="kpi-val">
                  {(prodVisibility.target_qty ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="kpi-stat-box">
                <span className="kpi-label">Produced Qty</span>
                <span className="kpi-val" style={{ color: 'var(--amber)' }}>
                  {(prodVisibility.production_qty ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="kpi-stat-box">
                <span className="kpi-label">Already Bagged</span>
                <span className="kpi-val" style={{ color: 'var(--purple, #a78bfa)' }}>
                  {(prodVisibility.already_bagged_qty ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="kpi-stat-box highlight">
                <span className="kpi-label">Available to Bag</span>
                <span className="kpi-val">
                  {(prodVisibility.available_to_bag_qty ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="kpi-stat-box">
                <span className="kpi-label">Balance Qty</span>
                <span className="kpi-val" style={{ color: prodVisibility.balance_qty < 0 ? 'var(--red)' : 'var(--text)' }}>
                  {(prodVisibility.balance_qty ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Bagging Progress Bar */}
            {prodVisibility.production_qty > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span className="muted">Bagged vs Produced</span>
                  <strong style={{ color: 'var(--green)' }}>
                    {Math.min(100, Math.round((prodVisibility.already_bagged_qty / Math.max(1, prodVisibility.production_qty)) * 100))}%
                  </strong>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--green)',
                      width: `${Math.min(100, Math.round((prodVisibility.already_bagged_qty / Math.max(1, prodVisibility.production_qty)) * 100))}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Weight Breakdown */}
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
              <span>Prod Wt: <strong style={{ color: 'var(--text)' }}>{prodVisibility.production_weight_kg.toFixed(3)} Kg</strong></span>
              <span>Bagged Wt: <strong style={{ color: 'var(--amber)' }}>{prodVisibility.already_bagged_weight_kg.toFixed(3)} Kg</strong></span>
              <span>Remaining Wt: <strong style={{ color: 'var(--green)' }}>{prodVisibility.remaining_weight_kg.toFixed(3)} Kg</strong></span>
              <span>Max Allowed: <strong style={{ color: 'var(--text)' }}>{prodVisibility.max_allowed_qty.toLocaleString()}</strong></span>
            </div>
          </>
        ) : (
          <div style={{ padding: '20px 10px', textAlign: 'center' }}>
            <p className="muted" style={{ margin: '0 0 12px', fontSize: 13 }}>
              {machineId
                ? 'Loading live production data for this machine...'
                : 'Select a Machine below or tap Scan QR to view live production flow, bagging status, and real-time inventory metrics.'}
            </p>
            {!machineId && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, margin: '0 auto' }}
                onClick={() => setShowCamera(true)}
              >
                📷 Scan Machine / Part QR
              </button>
            )}
          </div>
        )}
      </div>

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

      {/* Production Batch Completion Intimation */}
      {completionPrompt && (
        <div className="panel" style={{ borderColor: 'var(--green)', background: 'rgba(76,175,125,0.08)' }}>
          <h3 style={{ margin: '0 0 6px', color: 'var(--green)', fontSize: 15 }}>
            ✅ Batch Bag Entry Completed
          </h3>
          <p style={{ fontSize: 13, margin: '0 0 10px' }}>
            All bags for this batch ({batchInfo?.batch_no}) and production date ({entryDate}) have been completed within tolerance.
          </p>
          <div style={{ fontSize: 13, marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>Production Qty: <strong>{completionPrompt.prodQty?.toLocaleString()} Nos</strong></div>
            <div>Bagged Qty: <strong>{completionPrompt.baggedQty?.toLocaleString()} Nos</strong></div>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600 }}>
            Do you want to enter additional bags (overage)?
          </p>
          <div className="btn-row">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setCompletionPrompt(null)}
            >
              Yes, Enter More Bags
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => setCompletionPrompt(null)}
            >
              Done / Finished
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel">
        <div className="field">
          <label htmlFor="machine" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{t('common.machine')}</span>
            <button
              type="button"
              style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0 }}
              onClick={() => setShowCamera(true)}
            >
              📷 Scan QR
            </button>
          </label>
          <select id="machine" value={machineId} onChange={(e) => setMachineId(e.target.value)} required>
            <option value="" disabled>{t('common.selectMachine')}</option>
            {machines.map((m) => <option key={m.id} value={m.id}>{m.machine_code}</option>)}
          </select>
        </div>

        {machineId && assigned && (
          <div className="shrp-part-badge-card" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="shrp-code-pill">{assigned.shrp_part_code || assigned.part_code}</span>
              <div>
                <strong style={{ fontSize: 14 }}>{assigned.part_name}</strong>
                <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                  Customer Part No: <strong>{assigned.customer_part_no || assigned.part_code}</strong>
                </div>
              </div>
            </div>
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

      {showCamera && (
        <CameraScanner
          title="Scan Machine or Part QR"
          onScan={handleCameraScan}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}

