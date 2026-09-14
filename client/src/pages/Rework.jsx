import { useState, useEffect } from 'react';
import { api } from '../api';
import { useLanguage } from '../i18n/LanguageContext';

export default function Rework() {
  const { t } = useLanguage();
  const [pendingItems, setPendingItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [goodQty, setGoodQty] = useState('');
  const [scrapQty, setScrapQty] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    setLoading(true);
    try {
      const items = await api.reworkPending();
      setPendingItems(items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(item) {
    setSelectedItem(item);
    setGoodQty(String(item.rework_qty || ''));
    setScrapQty('0');
    setRemarks('');
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedItem) return;

    const totalAccounted = Number(goodQty || 0) + Number(scrapQty || 0);
    if (totalAccounted !== Number(selectedItem.rework_qty)) {
      setError(`Total good (${goodQty}) + scrap (${scrapQty}) must equal original rework qty (${selectedItem.rework_qty})`);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.completeRework(selectedItem.id, {
        reworked_good_qty: Number(goodQty),
        scrap_qty: Number(scrapQty),
        remarks,
      });
      setSuccess(`✅ Rework completed for Part ${selectedItem.shrp_part_code || selectedItem.part_code}: ${goodQty} Good, ${scrapQty} Scrap`);
      setSelectedItem(null);
      loadPending();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Rework Management</h1>
      <p className="screen-sub">Process and track pending rework items from Inspection & Trimming</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      {/* Pending Items List */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--amber)' }}>
            Pending Rework Pool ({pendingItems.length} item{pendingItems.length !== 1 ? 's' : ''})
          </h3>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '4px 10px', fontSize: 12 }}
            onClick={loadPending}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <p className="muted">Loading pending items…</p>
        ) : pendingItems.length === 0 ? (
          <p className="muted">No pending rework items. All items are clear! 🎉</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: `1px solid ${isSelected ? 'var(--amber)' : 'var(--border)'}`,
                    background: isSelected ? 'rgba(245,166,35,0.08)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div>
                    <span className="shrp-code-pill" style={{ marginRight: 8 }}>
                      {item.shrp_part_code || item.part_code}
                    </span>
                    <strong style={{ fontSize: 14 }}>{item.part_name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                      Bag: <strong>{item.bag_code || '—'}</strong> | Reason: <strong style={{ color: 'var(--red)' }}>{item.reject_reason_name || 'Defect'}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--amber)' }}>
                      {item.rework_qty} Nos
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      Stage: {item.stage}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Item Rework Action Form */}
      {selectedItem && (
        <form onSubmit={handleSubmit} className="panel" style={{ borderColor: 'var(--amber)' }}>
          <h3 style={{ margin: '0 0 12px', color: 'var(--amber)', fontSize: 16 }}>
            🛠️ Action Rework: {selectedItem.shrp_part_code || selectedItem.part_code} ({selectedItem.rework_qty} Nos)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="good_qty">Reworked Good Qty (Nos) *</label>
              <input
                id="good_qty"
                type="number"
                inputMode="numeric"
                required
                value={goodQty}
                onChange={(e) => {
                  const g = Number(e.target.value || 0);
                  setGoodQty(e.target.value);
                  setScrapQty(String(Math.max(0, Number(selectedItem.rework_qty) - g)));
                }}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="scrap_qty">Scrap / Unrecoverable Qty (Nos) *</label>
              <input
                id="scrap_qty"
                type="number"
                inputMode="numeric"
                required
                value={scrapQty}
                onChange={(e) => setScrapQty(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="rework_remarks">Rework Notes / Action Taken</label>
            <textarea
              id="rework_remarks"
              rows={2}
              placeholder="e.g. De-flashed with hobby knife, trimmed excess gate..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="btn-row">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving Rework…' : 'Complete & Return to Stock'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSelectedItem(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
