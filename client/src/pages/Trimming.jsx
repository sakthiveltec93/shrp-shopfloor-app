import { useState } from 'react';
import { api } from '../api';
import { useFifoBag } from '../useFifoBag';
import { useLanguage } from '../i18n/LanguageContext';

export default function Trimming() {
  const { t } = useLanguage();
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
        setSuccess(res.closed ? t('trimming.bagMarkedTrimmed', { code: bag.bag_code }) : t('common.readingSaved'));
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
      <h1 className="screen-title">{t('trimming.title')}</h1>
      <p className="screen-sub">{t('trimming.subtitle')}</p>

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
              {t('common.baseWeightMachine', { wt: bag.base_weight_kg, machine: bag.machine_code })}
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
                <div className="field">
                  <label htmlFor="remaining">{t('trimming.remainingWeight')}</label>
                  <input id="remaining" type="number" step="0.001" inputMode="decimal"
                    value={remaining} onChange={(e) => setRemaining(e.target.value)} />
                </div>
                <button className="btn btn-primary" disabled={saving || remaining === ''} onClick={() => submit(false)}>
                  {saving ? t('trimming.saving') : t('common.saveReading')}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
