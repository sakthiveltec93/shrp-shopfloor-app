import { useState, useEffect } from 'react';
import { api } from '../api';
import { useFifoBag } from '../useFifoBag';
import { useLanguage } from '../i18n/LanguageContext';
import CameraScanner from '../components/CameraScanner';

export default function Trimming() {
  const { t } = useLanguage();
  const {
    parts, partId, bag, method, setMethod, scanInput, setScanInput, handleScanSubmit,
    loadBagByCode, selectedBatch, batchBags, selectPart, selectBatch, selectSpecificBag,
    fifoViolation, setFifoViolation, fifoOverrideReason, setFifoOverrideReason,
    isFifoOverridden, setIsFifoOverridden, error, setError, success, setSuccess,
    loading, refetch, clearBag,
  } = useFifoBag('trim');

  // Multi-pass input fields
  const [trimmedWt, setTrimmedWt] = useState('');
  const [runnerWt, setRunnerWt] = useState('0');
  const [rejectWt, setRejectWt] = useState('0');
  const [rejectReasonId, setRejectReasonId] = useState('');
  const [isPartial, setIsPartial] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [trimSummary, setTrimSummary] = useState(null);

  // Hold quarantine state
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  const [confirmMsg, setConfirmMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [directPromptDismissed, setDirectPromptDismissed] = useState(false);

  const selectedPart = parts.find((p) => String(p.id) === String(partId));

  useEffect(() => {
    setDirectPromptDismissed(false);
  }, [partId]);

  useEffect(() => {
    api.checkItems('reject_reason').then(setReasons).catch(() => {});
  }, []);

  // Fetch previous trim passes when a bag is loaded
  useEffect(() => {
    if (bag?.id) {
      api.trimSummary(bag.id)
        .then((summary) => {
          setTrimSummary(summary);
        })
        .catch(() => setTrimSummary(null));
    } else {
      setTrimSummary(null);
      setTrimmedWt('');
      setRunnerWt('0');
      setRejectWt('0');
      setRejectReasonId('');
      setIsPartial(false);
    }
  }, [bag?.id]);

  // Derived remaining weight calculation
  const baseWeight = Number(bag?.base_weight_kg || 0);
  const prevTrimmed = Number(trimSummary?.total_trimmed_wt_kg || 0);
  const prevRunner = Number(trimSummary?.total_runner_wt_kg || 0);
  const prevReject = Number(trimSummary?.total_reject_wt_kg || 0);
  const prevAccounted = prevTrimmed + prevRunner + prevReject;
  const currentPassTotal = Number(trimmedWt || 0) + Number(runnerWt || 0) + Number(rejectWt || 0);
  const calculatedRemaining = Math.max(0, baseWeight - (prevAccounted + currentPassTotal));

  async function submit(confirm = false) {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.trimBag(bag.id, {
        trimmed_wt_kg: Number(trimmedWt || 0),
        runner_wt_kg: Number(runnerWt || 0),
        reject_wt_kg: Number(rejectWt || 0),
        reject_reason_id: rejectReasonId ? Number(rejectReasonId) : null,
        remaining_wt_kg: calculatedRemaining,
        is_partial: isPartial,
        confirm,
        fifo_override: isFifoOverridden,
        fifo_override_reason: fifoOverrideReason,
      });

      if (res.queuedOffline) {
        setConfirmMsg('');
        setSuccess('💾 ' + (res.message || 'Saved offline! Will sync automatically when connected.'));
        clearBag();
      } else if (res.needsConfirmation) {
        setConfirmMsg(res.message);
      } else {
        setConfirmMsg('');
        setSuccess(res.closed
          ? t('trimming.bagMarkedTrimmed', { code: bag.bag_code })
          : `✅ Pass saved! Remaining bag weight: ${res.remaining_wt_kg} kg`);
        setTrimmedWt('');
        setRunnerWt('0');
        setRejectWt('0');
        if (res.closed) {
          clearBag();
        } else {
          refetch();
          if (bag?.id) {
            api.trimSummary(bag.id).then(setTrimSummary).catch(() => {});
          }
        }
      }
    } catch (err) {
      if (err.data?.code === 'fifo_violation') {
        setFifoViolation({
          oldestBag: err.data.oldest_bag,
          canOverride: true,
        });
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleHoldSubmit() {
    if (!holdReason.trim()) {
      setError('Please provide a reason to quarantine this bag on HOLD.');
      return;
    }
    setSaving(true);
    try {
      await api.holdBag(bag.id, { stage: 'TRIMMING', reason: holdReason });
      setSuccess(`⚠️ Bag ${bag.bag_code} has been quarantined and placed on HOLD.`);
      setShowHoldModal(false);
      setHoldReason('');
      clearBag();
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

      {/* Dual Method Toggle */}
      <div className="btn-row" style={{ marginBottom: 14 }}>
        <button
          type="button"
          className={method === 'scan' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setMethod('scan')}
        >
          Method B: QR / Barcode Scan
        </button>
        <button
          type="button"
          className={method === 'manual' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setMethod('manual')}
        >
          Method A: Manual Selection
        </button>
      </div>

      {method === 'scan' && (
        <form onSubmit={handleScanSubmit} className="panel">
          <div className="field">
            <label htmlFor="scan_code" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Scan Bag Barcode / QR Code</span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--amber)', cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                onClick={() => setShowCamera(true)}
              >
                📷 Open Camera
              </button>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                id="scan_code"
                type="text"
                placeholder="Scan or enter Bag Code..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                autoFocus
              />
              <button className="btn btn-primary" style={{ width: 'auto' }} type="submit" disabled={loading || !scanInput.trim()}>
                {loading ? 'Scanning…' : 'Load'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                onClick={() => setShowCamera(true)}
              >
                📷 Scan
              </button>
            </div>
          </div>
        </form>
      )}

      {method === 'manual' && (
        <div className="panel">
          <div className="field">
            <label htmlFor="part">{t('common.part')}</label>
            <select id="part" value={partId} onChange={(e) => selectPart(e.target.value)}>
              <option value="" disabled>{t('common.selectPart')}</option>
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.shrp_part_code || p.part_code} — {p.part_name}
                </option>
              ))}
            </select>
          </div>

          {batchBags.length > 0 && (
            <div className="field">
              <label htmlFor="bag_pick">Select Ready Bag (FIFO Ordered)</label>
              <select
                id="bag_pick"
                value={bag?.id || ''}
                onChange={(e) => {
                  const b = batchBags.find((x) => String(x.id) === e.target.value);
                  selectSpecificBag(b);
                }}
              >
                <option value="" disabled>Select bag…</option>
                {batchBags.map((b, idx) => (
                  <option key={b.id} value={b.id}>
                    {idx === 0 ? '⭐ [FIFO Next] ' : ''}{b.bag_code} ({b.base_weight_kg} kg · {b.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Direct Inspection Confirmation Banner */}
      {selectedPart && selectedPart.trim_required === false && !directPromptDismissed && (
        <div className="panel" style={{ borderColor: 'var(--blue, #3b82f6)', background: 'rgba(59,130,246,0.1)', marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 6px', color: '#60a5fa', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
            ℹ️ Direct Inspection Part
          </h3>
          <p style={{ fontSize: 13, margin: '0 0 10px' }}>
            Part <strong>{selectedPart.shrp_part_code || selectedPart.part_code}</strong> does not normally require trimming.
            Do you still want to trim this bag?
          </p>
          <div className="btn-row">
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setDirectPromptDismissed(true)}
            >
              ✂️ Yes, Trim Anyway
            </button>
            <a
              href="/inspection"
              className="btn btn-primary"
              style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
            >
              🔍 Go to Inspection
            </a>
          </div>
        </div>
      )}


      {/* FIFO Violation Dialog per Section 4 */}
      {fifoViolation && (
        <div className="panel" style={{ borderColor: 'var(--amber)', background: 'rgba(245,166,35,0.08)' }}>
          <h3 style={{ margin: '0 0 8px', color: 'var(--amber)', fontSize: 16 }}>
            ⚠️ FIFO Violation
          </h3>
          <p style={{ fontSize: 13, margin: '0 0 6px' }}>
            An older available bag must be processed first:
          </p>
          <div className="readout" style={{ marginBottom: 10 }}>
            <div>Oldest available bag: <strong>{fifoViolation.oldestBag.bag_code}</strong></div>
            <div>Production Date: <strong>{new Date(fifoViolation.oldestBag.entry_date).toLocaleDateString('en-GB')} (Shift {fifoViolation.oldestBag.shift})</strong></div>
          </div>

          {fifoViolation.canOverride ? (
            <>
              <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 8px' }}>Continue with FIFO Override?</p>
              <div className="field">
                <label htmlFor="fifo_reason">Override Reason *</label>
                <input
                  id="fifo_reason"
                  type="text"
                  placeholder="Enter reason for FIFO override"
                  value={fifoOverrideReason}
                  onChange={(e) => setFifoOverrideReason(e.target.value)}
                />
              </div>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!fifoOverrideReason.trim()}
                  onClick={() => { setIsFifoOverridden(true); setFifoViolation(null); }}
                >
                  Override & Continue
                </button>
                <button type="button" className="btn btn-secondary" onClick={clearBag}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: 'var(--red)' }}>
                Only users with FIFO Override permission can continue.
              </p>
              <button type="button" className="btn btn-secondary" onClick={clearBag}>
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scanned / Loaded Bag Details */}
      {bag && !fifoViolation && (
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--amber)' }}>
              {bag.shrp_part_code || bag.part_code}
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className={`status-pill status-${bag.status.toLowerCase()}`}>
                {bag.status}
              </span>
              <button
                type="button"
                className="btn btn-danger"
                style={{ padding: '4px 10px', fontSize: 12, width: 'auto' }}
                onClick={() => setShowHoldModal(true)}
              >
                🛑 Put on HOLD
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 14 }}>
            <div>Part Name:</div><strong>{bag.part_name}</strong>
            <div>Cust Part No:</div><span className="muted">{bag.customer_part_no || bag.part_code}</span>
            <div>Batch No:</div><strong>{bag.batch_no}</strong>
            <div>Bag Code:</div><strong>{bag.bag_code}</strong>
            <div>Prod Date:</div><strong>{new Date(bag.entry_date).toLocaleDateString('en-GB')} (Shift {bag.shift})</strong>
            <div>Initial Bag Weight:</div><strong>{Number(bag.base_weight_kg).toFixed(3)} Kg</strong>
            <div>Quantity:</div><strong>{bag.qty} Nos</strong>
          </div>

          {/* Previous Pass Summary if multi-pass */}
          {trimSummary && trimSummary.pass_count > 0 && (
            <div className="readout" style={{ marginBottom: 14, background: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: 6 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--amber)' }}>
                Multi-Pass Trimming Progress ({trimSummary.pass_count} Previous Pass{trimSummary.pass_count > 1 ? 'es' : ''})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 12 }}>
                <div>Total Trimmed So Far:</div><strong>{trimSummary.total_trimmed_wt_kg} kg</strong>
                <div>Total Runner So Far:</div><strong>{trimSummary.total_runner_wt_kg} kg</strong>
                <div>Total Rejections:</div><strong>{trimSummary.total_reject_wt_kg} kg</strong>
                <div>Current Bag Remainder:</div><strong style={{ color: 'var(--green)' }}>{trimSummary.remaining_wt_kg} kg</strong>
              </div>
            </div>
          )}

          {/* Stage Completion Confirmation */}
          {confirmMsg ? (
            <div className="panel" style={{ borderColor: 'var(--green)', background: 'rgba(76,175,125,0.08)' }}>
              <p style={{ marginTop: 0, fontWeight: 600 }}>
                {confirmMsg}
              </p>
              <div className="btn-row">
                <button className="btn btn-primary" disabled={saving} onClick={() => submit(true)}>
                  {t('common.yes')}
                </button>
                <button className="btn btn-secondary" disabled={saving} onClick={() => setConfirmMsg('')}>
                  {t('common.no')}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="trimmed_wt">Trimmed Part Weight (kg) *</label>
                  <input
                    id="trimmed_wt"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    placeholder="e.g. 8.200"
                    value={trimmedWt}
                    onChange={(e) => setTrimmedWt(e.target.value)}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="runner_wt">Runner Weight (kg)</label>
                  <input
                    id="runner_wt"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    placeholder="0.000"
                    value={runnerWt}
                    onChange={(e) => setRunnerWt(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="reject_wt">Reject Weight (kg)</label>
                  <input
                    id="reject_wt"
                    type="number"
                    step="0.001"
                    inputMode="decimal"
                    placeholder="0.000"
                    value={rejectWt}
                    onChange={(e) => setRejectWt(e.target.value)}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label htmlFor="reject_reason">Reject Reason</label>
                  <select
                    id="reject_reason"
                    value={rejectReasonId}
                    onChange={(e) => setRejectReasonId(e.target.value)}
                    disabled={Number(rejectWt || 0) <= 0}
                  >
                    <option value="">Select reason…</option>
                    {reasons.map((r) => (
                      <option key={r.id} value={r.id}>{r.item_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Real-time remaining calculation */}
              <div className="readout" style={{ marginBottom: 14, fontSize: 13 }}>
                <div>Calculated Bag Remainder: <strong style={{ color: calculatedRemaining <= 0.2 ? 'var(--green)' : 'var(--amber)' }}>{calculatedRemaining.toFixed(3)} Kg</strong></div>
              </div>

              <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <input
                  id="is_partial"
                  type="checkbox"
                  checked={isPartial}
                  onChange={(e) => setIsPartial(e.target.checked)}
                  style={{ width: 'auto', height: 'auto', margin: 0 }}
                />
                <label htmlFor="is_partial" style={{ margin: 0, cursor: 'pointer', fontWeight: 600 }}>
                  Partial Trimming Pass (I will finish trimming this bag later)
                </label>
              </div>

              <div className="btn-row">
                <button
                  className="btn btn-primary"
                  disabled={saving || !trimmedWt}
                  onClick={() => submit(false)}
                >
                  {saving ? t('trimming.saving') : (isPartial ? 'Save Partial Pass' : 'Complete Trimming')}
                </button>
                <button type="button" className="btn btn-secondary" onClick={clearBag}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Put on HOLD Modal */}
      {showHoldModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="panel" style={{ width: '90%', maxWidth: 440, background: '#1c222d', borderColor: 'var(--red)' }}>
            <h3 style={{ margin: '0 0 10px', color: 'var(--red)', fontSize: 17 }}>
              🛑 Put Bag on HOLD / Quarantine
            </h3>
            <p style={{ fontSize: 13, margin: '0 0 12px' }}>
              Quarantining Bag <strong>{bag.bag_code}</strong> will remove it from active processing until reviewed and released by a Supervisor.
            </p>
            <div className="field">
              <label htmlFor="hold_reason">Hold / Quarantine Reason *</label>
              <textarea
                id="hold_reason"
                rows={3}
                placeholder="e.g. Flash defect, severe contamination, weight mismatch..."
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                autoFocus
              />
            </div>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-danger"
                disabled={saving || !holdReason.trim()}
                onClick={handleHoldSubmit}
              >
                {saving ? 'Holding…' : 'Confirm HOLD'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowHoldModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <CameraScanner
          title="Scan Bag QR / Barcode"
          onScan={(code) => {
            setShowCamera(false);
            setScanInput(code);
            loadBagByCode(code);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
