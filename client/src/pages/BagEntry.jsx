import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function BagEntry() {
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
    if (!assigned) { setError('No approved part assigned to this machine.'); return; }
    if (!batchInfo) { setError(batchError || 'Batch details not ready yet.'); return; }
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
      setSuccess(`Created bag ${bag.bag_code}`);
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
      <h1 className="screen-title">Bag Entry</h1>
      <p className="screen-sub">Log a bag of material against a batch</p>

      {error && <div className="error-banner">{error}</div>}
      {success && (
        <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>
          {success}
          {lastCreatedBag && (
            <Link to={`/bags/${lastCreatedBag.id}/label`} className="btn btn-secondary" style={{ marginTop: 10 }}>
              Print label
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel">
        <div className="field">
          <label htmlFor="machine">Machine</label>
          <select id="machine" value={machineId} onChange={(e) => setMachineId(e.target.value)} required>
            <option value="" disabled>Select machine</option>
            {machines.map((m) => <option key={m.id} value={m.id}>{m.machine_code}</option>)}
          </select>
        </div>

        {machineId && (
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">Assigned part</div>
            {assigned ? `${assigned.part_code} — ${assigned.part_name}` : 'None assigned'}
          </div>
        )}

        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="date">Production date</label>
            <input id="date" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="shift">Shift</label>
            <select id="shift" value={shift} onChange={(e) => setShift(e.target.value)}>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
        </div>

        {batchError && <div className="error-banner">{batchError}</div>}
        {batchInfo && (
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">Batch no.</div>
            {batchInfo.batch_no}
          </div>
        )}

        <div className="field">
          <label htmlFor="bag_type">Bag type</label>
          <select id="bag_type" value={bagType} onChange={(e) => setBagType(e.target.value)}>
            <option value="PART">Part</option>
            <option value="RUNNER">Runner (sprue waste)</option>
          </select>
        </div>

        {batchInfo && bagType === 'PART' && (
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={withRunner} onChange={(e) => { setWithRunner(e.target.checked); setWeightKg(''); setQty(''); }} />
              Weighed with runner (shot weight)
            </label>
            <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              {withRunner
                ? `Using shot weight ${batchInfo.shot_weight_g ?? '—'} g × ${batchInfo.cavity_count} cavities`
                : `Using part weight ${batchInfo.part_weight_g ?? '—'} g (runner weighed separately)`}
            </p>
          </div>
        )}

        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="wt">Weight (kg)</label>
            <input id="wt" type="number" step="0.001" inputMode="decimal" required
              value={weightKg} onChange={(e) => updateWeight(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="qty">Qty (pcs)</label>
            <input id="qty" type="number" inputMode="numeric" required
              value={qty} onChange={(e) => updateQty(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="remarks">Remarks (optional)</label>
          <textarea id="remarks" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading || !assigned || !batchInfo}>
          {loading ? 'Saving…' : 'Save bag'}
        </button>
      </form>

      {bags.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>
            Bags on batch {batchInfo?.batch_no}
          </h2>
          <div className="panel" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Bag</th><th>Type</th><th>Wt</th><th>Qty</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {bags.map((b) => (
                  <tr key={b.id}>
                    <td>{b.bag_code}</td>
                    <td>{b.bag_type}</td>
                    <td>{b.base_weight_kg}</td>
                    <td>{b.qty}</td>
                    <td>{b.status}</td>
                    <td><Link to={`/bags/${b.id}/label`} style={{ color: 'var(--amber)', fontSize: 12 }}>Label</Link></td>
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
