import { useEffect, useState } from 'react';
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
  const [batchInfo, setBatchInfo] = useState(null); // { batch_no, cavity_count, shot_weight_g, part_weight_g }
  const [batchError, setBatchError] = useState('');

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

  useEffect(() => {
    (async () => {
      const [m, a, ctx] = await Promise.all([api.machines(), api.currentAssignments(), api.entryContext()]);
      setMachines(m);
      setAssignments(a);
      setContext(ctx);
      setEntryDate(ctx.entry_date);
      setShift(ctx.shift);
    })();
  }, []);

  const assigned = assignments.find((a) => String(a.machine_id) === String(machineId));

  useEffect(() => {
    if (!machineId || !entryDate || !shift) { setBatchInfo(null); return; }
    setBatchError('');
    api.bagBatchInfo(machineId, entryDate, shift)
      .then(setBatchInfo)
      .catch((err) => { setBatchInfo(null); setBatchError(err.message); });
  }, [machineId, entryDate, shift]);

  useEffect(() => {
    if (batchInfo?.batch_no) loadBatchBags(batchInfo.batch_no);
  }, [batchInfo?.batch_no]);

  async function loadBatchBags(batchNo) {
    setBags(await api.bagsForBatch(batchNo));
  }

  // Weight <-> qty auto-calc, ported from frmbagentry's chkWithRunner logic:
  // with runner: qty = (weight_kg*1000 / shot_weight_g) * cavities
  // separately:  qty = (weight_kg*1000 / part_weight_g)
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
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!assigned) { setError(t('bagEntry.noApprovedPartError')); return; }
    if (!batchInfo) { setError(batchError || t('bagEntry.batchNotReadyError')); return; }
    setLoading(true);
    try {
      const bag = await api.createBag({
        machine_id: Number(machineId),
        part_id: batchInfo.part_id,
        batch_no: batchInfo.batch_no,
        bag_type: bagType,
        base_weight_kg: Number(weightKg),
        qty: Number(qty),
        remarks: remarks || null,
      });
      setSuccess(t('bagEntry.createdBag', { code: bag.bag_code }));
      setLastCreatedBag(bag);
      setWeightKg(''); setQty(''); setRemarks('');
      loadBatchBags(batchInfo.batch_no);
    } catch (err) {
      setError(err.message);
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
          {lastCreatedBag && (
            <Link to={`/bags/${lastCreatedBag.id}/label`} className="btn btn-secondary" style={{ marginTop: 10 }}>
              {t('bagEntry.printLabel')}
            </Link>
          )}
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
            {assigned ? `${assigned.part_code} — ${assigned.part_name}` : t('bagEntry.noneAssigned')}
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
                <tr><th>{t('bagEntry.colBag')}</th><th>{t('bagEntry.colType')}</th><th>{t('bagEntry.colWt')}</th><th>{t('bagEntry.colQty')}</th><th>{t('bagEntry.colStatus')}</th><th></th></tr>
              </thead>
              <tbody>
                {bags.map((b) => (
                  <tr key={b.id}>
                    <td>{b.bag_code}</td>
                    <td>{b.bag_type}</td>
                    <td>{b.base_weight_kg}</td>
                    <td>{b.qty}</td>
                    <td>{b.status}</td>
                    <td><Link to={`/bags/${b.id}/label`} style={{ color: 'var(--amber)', fontSize: 12 }}>{t('bagEntry.colLabel')}</Link></td>
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
