import { useEffect, useState } from 'react';
import { api } from '../api';
import { useFifoBag } from '../useFifoBag';
import { useLanguage } from '../i18n/LanguageContext';
import CameraScanner from '../components/CameraScanner';

export default function Inspection() {
  const { t } = useLanguage();
  const {
    parts, partId, bag, method, setMethod, scanInput, setScanInput, handleScanSubmit,
    loadBagByCode, batchBags, selectPart, selectSpecificBag,
    fifoViolation, setFifoViolation, fifoOverrideReason, setFifoOverrideReason,
    isFifoOverridden, setIsFifoOverridden, error, setError, success, setSuccess,
    loading, refetch, clearBag,
  } = useFifoBag('inspect');

  const [inspectedWt, setInspectedWt] = useState('');
  const [rejectWt, setRejectWt] = useState('0');
  const [rejectReasonId, setRejectReasonId] = useState('');
  const [sentToReworkQty, setSentToReworkQty] = useState('0');
  const [reasons, setReasons] = useState([]);

  // Tiered tolerance confirmation & remarks
  const [confirmModal, setConfirmModal] = useState(null); // { tier, message, diffKg, diffPct }
  const [remarksModal, setRemarksModal] = useState(null); // { tier, message, diffKg, diffPct }
  const [mandatoryRemarks, setMandatoryRemarks] = useState('');

  // Hold quarantine state
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    api.checkItems('reject_reason').then(setReasons).catch(() => {});
  }, []);

  useEffect(() => {
    if (bag?.id) {
      setInspectedWt(String(bag.base_weight_kg || ''));
    } else {
      setInspectedWt('');
      setRejectWt('0');
      setRejectReasonId('');
      setSentToReworkQty('0');
      setConfirmModal(null);
      setRemarksModal(null);
      setMandatoryRemarks('');
    }
  }, [bag?.id]);

  async function submit(confirm = false, overrideRemarks = '') {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.inspectBag(bag.id, {
        inspected_wt_kg: Number(inspectedWt),
        reject_wt_kg: Number(rejectWt || 0),
        reject_reason_id: rejectReasonId ? Number(rejectReasonId) : null,
        sent_to_rework_qty: Number(sentToReworkQty || 0),
        remarks: overrideRemarks || mandatoryRemarks,
        confirm,
        fifo_override: isFifoOverridden,
        fifo_override_reason: fifoOverrideReason,
      });

      if (res.queuedOffline) {
        setConfirmModal(null);
        setRemarksModal(null);
        setSuccess('💾 ' + (res.message || 'Saved offline! Will sync automatically when connected.'));
        clearBag();
      } else if (res.needsConfirmation && res.tier === 'CONFIRM') {
        setConfirmModal(res);
      } else {
        setConfirmModal(null);
        setRemarksModal(null);
        setSuccess(res.closed
          ? t('inspection.bagMarkedInspected', { code: bag.bag_code })
          : t('common.readingSaved'));
        setInspectedWt('');
        setRejectWt('0');
        setSentToReworkQty('0');
        setMandatoryRemarks('');
        if (res.closed) {
          clearBag();
        } else {
          refetch();
        }
      }
    } catch (err) {
      if (err.data?.code === 'fifo_violation') {
        setFifoViolation({
          oldestBag: err.data.oldest_bag,
          canOverride: true,
        });
      } else if (err.data?.tier === 'REMARKS_REQUIRED') {
        setRemarksModal(err.data);
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
      await api.holdBag(bag.id, { stage: 'INSPECTION', reason: holdReason });
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
      <h1 className="screen-title">{t('inspection.title')}</h1>
      <p className="screen-sub">{t('inspection.subtitle')}</p>

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
            <div>Production Date: <strong>{new Date(fifoViolation.oldestBag.entry_date).toLocaleDateString('en-GB')}</strong></div>
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
            <div>Base Weight:</div><strong>{Number(bag.base_weight_kg).toFixed(3)} Kg</strong>
            <div>Expected Qty:</div><strong>{bag.qty} Nos</strong>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="inspected_wt">Inspected Good Weight (kg) *</label>
              <input
                id="inspected_wt"
                type="number"
                step="0.001"
                inputMode="decimal"
                placeholder="Inspected kg"
                value={inspectedWt}
                onChange={(e) => setInspectedWt(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="reject_wt">{t('inspection.rejectWt')}</label>
              <input
                id="reject_wt"
                type="number"
                step="0.001"
                inputMode="decimal"
                placeholder="Reject kg"
                value={rejectWt}
                onChange={(e) => setRejectWt(e.target.value)}
              />
            </div>
          </div>

          {Number(rejectWt || 0) > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="reason">{t('inspection.rejectReason')}</label>
                <select
                  id="reason"
                  value={rejectReasonId}
                  onChange={(e) => setRejectReasonId(e.target.value)}
                >
                  <option value="">{t('common.selectReason')}</option>
                  {reasons.map((r) => (
                    <option key={r.id} value={r.id}>{r.item_name}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="rework_qty">Send to Rework (Nos)</label>
                <input
                  id="rework_qty"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={sentToReworkQty}
                  onChange={(e) => setSentToReworkQty(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="btn-row" style={{ marginTop: 14 }}>
            <button
              className="btn btn-primary"
              disabled={saving || inspectedWt === ''}
              onClick={() => submit(false)}
            >
              {saving ? t('inspection.saving') : 'Complete Inspection'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearBag}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tier 2 Confirmation Modal (1% to 2% or <= 200g) */}
      {confirmModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="panel" style={{ width: '90%', maxWidth: 440, background: '#1c222d', borderColor: 'var(--amber)' }}>
            <h3 style={{ margin: '0 0 10px', color: 'var(--amber)', fontSize: 17 }}>
              ⚠️ Confirm Weight Variance
            </h3>
            <p style={{ fontSize: 13, margin: '0 0 14px' }}>
              {confirmModal.message}
            </p>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving}
                onClick={() => submit(true)}
              >
                {t('common.yes')} (Confirm)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={saving}
                onClick={() => setConfirmModal(null)}
              >
                {t('common.no')} (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier 3 Remarks Required Modal (> 2% or > 200g) */}
      {remarksModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="panel" style={{ width: '90%', maxWidth: 440, background: '#1c222d', borderColor: 'var(--red)' }}>
            <h3 style={{ margin: '0 0 10px', color: 'var(--red)', fontSize: 17 }}>
              🛑 Excess Tolerance Variance
            </h3>
            <p style={{ fontSize: 13, margin: '0 0 10px' }}>
              {remarksModal.message}
            </p>
            <div className="field">
              <label htmlFor="insp_remarks">Supervisor / Operator Remarks *</label>
              <textarea
                id="insp_remarks"
                rows={3}
                placeholder="Explain the reason for excess weight variance..."
                value={mandatoryRemarks}
                onChange={(e) => setMandatoryRemarks(e.target.value)}
                autoFocus
              />
            </div>
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving || !mandatoryRemarks.trim()}
                onClick={() => submit(true, mandatoryRemarks)}
              >
                Save with Remarks
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRemarksModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
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
                placeholder="e.g. Reject rate exceeded, visual blemish, dimensional check needed..."
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


