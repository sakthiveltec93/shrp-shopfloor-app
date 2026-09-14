import { useState } from 'react';
import { api } from '../api';
import { useFifoBag } from '../useFifoBag';
import { useLanguage } from '../i18n/LanguageContext';

export default function Packing() {
  const { t } = useLanguage();
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
        setSuccess(res.closed ? t('packing.bagMarkedPacked', { code: bag.bag_code }) : t('common.readingSaved'));
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
      <h1 className="screen-title">{t('packing.title')}</h1>
      <p className="screen-sub">{t('packing.subtitle')}</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <div className="panel">
        <div className="field">
          <label htmlFor="part">{t('common.part')}</label>
          <select id="part" value={partId} onChange={(e) => selectPart(e.target.value)}>
            <option value="" disabled>{t('common.selectPart')}</option>
            {parts.map((p) => <option key={p.id} value={p.id}>{p.part_code} — {p.part_name}</option>)}
          </select>
        </div>

        {loading && <p className="muted">{t('common.findingNextBag')}</p>}

        {bag && (
          <>
            <div className="readout" style={{ marginBottom: 14 }}>
              <div className="readout-label">{t('common.bagLabel', { code: bag.bag_code })}</div>
              {t('packing.bagReadout', { wt: bag.base_weight_kg, qty: bag.qty, machine: bag.machine_code })}
            </div>

            {confirmMsg ? (
              <div className="panel" style={{ borderColor: 'var(--amber)' }}>
                <p style={{ marginTop: 0 }}>{confirmMsg}</p>
                <div className="btn-row">
                  <button className="btn btn-primary" disabled={saving} onClick={() => submit(true)}>{t('common.yesCloseBag')}</button>
                  <button className="btn btn-secondary" disabled={saving} onClick={() => setConfirmMsg('')}>{t('common.no')}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="btn-row" style={{ marginBottom: 14 }}>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label htmlFor="qty">{t('packing.packedQty')}</label>
                    <input id="qty" type="number" inputMode="numeric"
                      value={qty} onChange={(e) => setQty(e.target.value)} />
                  </div>
                  <div className="field" style={{ marginBottom: 0 }}>
                    <label htmlFor="wt">{t('packing.packedWt')}</label>
                    <input id="wt" type="number" step="0.001" inputMode="decimal"
                      value={wt} onChange={(e) => setWt(e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-primary" disabled={saving || qty === '' || wt === ''} onClick={() => submit(false)}>
                  {saving ? t('packing.saving') : t('common.saveReading')}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
