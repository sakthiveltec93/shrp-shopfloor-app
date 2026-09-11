import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const empty = { machine_id: '', part_id: '', batch_no: '', bag_type: 'PART', base_weight_kg: '', qty: '', remarks: '' };

export default function BagEntry() {
  const [machines, setMachines] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(empty);
  const [bags, setBags] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [lastCreatedBag, setLastCreatedBag] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const [m, a] = await Promise.all([api.machines(), api.currentAssignments()]);
      setMachines(m);
      setAssignments(a);
    })();
  }, []);

  const assigned = assignments.find((a) => String(a.machine_id) === String(form.machine_id));
  const unitWeightG = assigned?.unit_weight_g ? Number(assigned.unit_weight_g) : null;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // Auto-calc the other field from the part's unit weight - still editable after.
  function updateWeight(value) {
    setForm((f) => {
      const next = { ...f, base_weight_kg: value };
      if (unitWeightG && value !== '') {
        const kg = Number(value);
        if (!Number.isNaN(kg)) next.qty = String(Math.round((kg * 1000) / unitWeightG));
      }
      return next;
    });
  }

  function updateQty(value) {
    setForm((f) => {
      const next = { ...f, qty: value };
      if (unitWeightG && value !== '') {
        const pieces = Number(value);
        if (!Number.isNaN(pieces)) next.base_weight_kg = ((pieces * unitWeightG) / 1000).toFixed(3);
      }
      return next;
    });
  }

  async function loadBatchBags(batchNo) {
    if (!batchNo) { setBags([]); return; }
    setBags(await api.bagsForBatch(batchNo));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!assigned) { setError('No approved part assigned to this machine.'); return; }
    setLoading(true);
    try {
      const bag = await api.createBag({
        machine_id: Number(form.machine_id),
        part_id: assigned.part_id,
        batch_no: form.batch_no.trim(),
        bag_type: form.bag_type,
        base_weight_kg: Number(form.base_weight_kg),
        qty: Number(form.qty),
        remarks: form.remarks || null,
      });
      setSuccess(`Created bag ${bag.bag_code}`);
      setLastCreatedBag(bag);
      setForm((f) => ({ ...f, base_weight_kg: '', qty: '', remarks: '' }));
      loadBatchBags(form.batch_no.trim());
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
          <select id="machine" value={form.machine_id} onChange={(e) => update('machine_id', e.target.value)} required>
            <option value="" disabled>Select machine</option>
            {machines.map((m) => <option key={m.id} value={m.id}>{m.machine_code}</option>)}
          </select>
        </div>

        {form.machine_id && (
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">Assigned part</div>
            {assigned ? `${assigned.part_code} — ${assigned.part_name}` : 'None assigned'}
          </div>
        )}

        <div className="field">
          <label htmlFor="batch">Batch no.</label>
          <input id="batch" value={form.batch_no}
            onChange={(e) => update('batch_no', e.target.value)}
            onBlur={(e) => loadBatchBags(e.target.value.trim())}
            required />
        </div>

        <div className="field">
          <label htmlFor="bag_type">Bag type</label>
          <select id="bag_type" value={form.bag_type} onChange={(e) => update('bag_type', e.target.value)}>
            <option value="PART">Part</option>
            <option value="RUNNER">Runner (sprue waste)</option>
          </select>
        </div>

        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="wt">Weight (kg)</label>
            <input id="wt" type="number" step="0.001" inputMode="decimal" required
              value={form.base_weight_kg} onChange={(e) => updateWeight(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="qty">Qty (pcs)</label>
            <input id="qty" type="number" inputMode="numeric" required
              value={form.qty} onChange={(e) => updateQty(e.target.value)} />
          </div>
        </div>
        {unitWeightG && (
          <p className="muted" style={{ fontSize: 12, marginTop: -8, marginBottom: 14 }}>
            Auto-calculated from part unit weight ({unitWeightG} g/pc) — edit either field freely.
          </p>
        )}

        <div className="field">
          <label htmlFor="remarks">Remarks (optional)</label>
          <textarea id="remarks" rows={2} value={form.remarks} onChange={(e) => update('remarks', e.target.value)} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading || !assigned}>
          {loading ? 'Saving…' : 'Save bag'}
        </button>
      </form>

      {bags.length > 0 && (
        <>
          <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>
            Bags on batch {form.batch_no}
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
