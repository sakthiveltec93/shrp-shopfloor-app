import { useState } from 'react';
import { api } from '../api';
import { useFifoBag } from '../useFifoBag';

export default function Trimming() {
  const { parts, partId, bag, error, loading, selectPart, refetch, setError } = useFifoBag('trim');
  const [remaining, setRemaining] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(confirm = false) {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.trimBag(bag.id, { remaining_wt_kg: Number(remaining), confirm });
      if (res.needsConfirmation) {
        setConfirmMsg(res.message);
      } else {
        setConfirmMsg('');
        setSuccess(res.closed ? `Bag ${bag.bag_code} marked TRIMMED.` : 'Reading saved.');
        setRemaining('');
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
      <h1 className="screen-title">Trimming</h1>
      <p className="screen-sub">Oldest bag ready for trimming is picked automatically</p>

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
              Base weight {bag.base_weight_kg} kg · Machine {bag.machine_code}
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
                <div className="field">
                  <label htmlFor="remaining">Remaining weight (kg)</label>
                  <input id="remaining" type="number" step="0.001" inputMode="decimal"
                    value={remaining} onChange={(e) => setRemaining(e.target.value)} />
                </div>
                <button className="btn btn-primary" disabled={saving || remaining === ''} onClick={() => submit(false)}>
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
