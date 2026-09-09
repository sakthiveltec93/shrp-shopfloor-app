import { useState } from 'react';
import { api } from '../api';
import { useFifoBag } from '../useFifoBag';

export default function Packing() {
  const { parts, partId, bag, error, loading, selectPart, refetch, setError } = useFifoBag('pack');
  const [qty, setQty] = useState('');
  const [wt, setWt] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(confirm = false) {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.packBag(bag.id, { packed_qty: Number(qty), packed_wt_kg: Number(wt), confirm });
      if (res.needsConfirmation) {
        setConfirmMsg(res.message);
      } else {
        setConfirmMsg('');
        setSuccess(res.closed ? `Bag ${bag.bag_code} marked PACKED.` : 'Reading saved.');
        setQty('');
        setWt('');
        if (res.closed) refetch();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Packing</h1>
      <p className="screen-sub">Oldest bag ready for packing is picked automatically</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <div className="panel">
        <div className="field">
          <label htmlFor="part">Part</label>
          <select id="part" value={partId} onChange={(e) => selectPart(e.target.value)}>
            <option value="" disabled>Select part</option>
            {parts.map((p) => <option key={p.id} value={p.id}>{p.part_code} — {p.part_name}</option>)}
          </select>
        </div>

        {loading && <p className="muted">Finding next bag…</p>}

        {bag && (
          <>
            <div className="readout" style={{ marginBottom: 14 }}>
              <div className="readout-label">Bag {bag.bag_code}</div>
              Base weight {bag.base_weight_kg} kg · Qty {bag.qty} · Machine {bag.machine_code}
            </div>

            {confirmMsg ? (
              <div className="panel" style={{ borderColor: 'var(--amber)' }}>
                <p style={{ marginTop: 0 }}>{confirmMsg}</p>
                <div className="btn-row">
                  <button className="btn btn-primary" disabled={saving} onClick={() => submit(true)}>Yes, close bag</button>
                  <button className="btn btn-secondary" disabled={saving} onClick={() => setConfirmMsg('')}>No</button>
                </div>
              </div>
            ) : (
              <>
                <div className="btn-row" style={{ marginBottom: 14 }}>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label htmlFor="qty">Packed qty</label>
                    <input id="qty" type="number" inputMode="numeric"
                      value={qty} onChange={(e) => setQty(e.target.value)} />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label htmlFor="wt">Packed wt (kg)</label>
                    <input id="wt" type="number" step="0.001" inputMode="decimal"
                      value={wt} onChange={(e) => setWt(e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-primary" disabled={saving || qty === '' || wt === ''} onClick={() => submit(false)}>
                  {saving ? 'Saving…' : 'Save reading'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
