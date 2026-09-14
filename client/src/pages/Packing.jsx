import { useState, useEffect } from 'react';
import { api } from '../api';
import { useFifoBag } from '../useFifoBag';
import { useLanguage } from '../i18n/LanguageContext';
import CameraScanner from '../components/CameraScanner';

export default function Packing() {
  const { t } = useLanguage();
  const {
    parts, partId, bag, method, setMethod, scanInput, setScanInput, handleScanSubmit,
    loadBagByCode, batchBags, selectPart, selectSpecificBag,
    fifoViolation, setFifoViolation, fifoOverrideReason, setFifoOverrideReason,
    isFifoOverridden, setIsFifoOverridden, error, setError, success, setSuccess,
    loading, refetch, clearBag,
  } = useFifoBag('pack');

  // Counting scale & packing inputs
  const [samplePacketWtKg, setSamplePacketWtKg] = useState('');
  const [customPackQty, setCustomPackQty] = useState('');
  const [balancePoolData, setBalancePoolData] = useState(null);

  // Hold quarantine state
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  const [confirmMsg, setConfirmMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Load balance pool for selected part
  const activePartId = bag?.part_id || partId;
  useEffect(() => {
    if (activePartId) {
      api.balancePool(activePartId)
        .then(setBalancePoolData)
        .catch(() => setBalancePoolData(null));
    } else {
      setBalancePoolData(null);
    }
  }, [activePartId]);

  // Derive part standard packing information
  const partObj = parts.find((p) => String(p.id) === String(activePartId));
  const standardPackQty = Number(customPackQty || partObj?.standard_pack_qty || 500);
  const historicalPartWeightG = Number(partObj?.part_weight_g || (partObj?.unit_weight_g ? partObj.unit_weight_g / (partObj.cavity_count || 1) : 0));
  const defaultSamplePacketWt = historicalPartWeightG > 0 ? (standardPackQty * historicalPartWeightG) / 1000 : null;

  // Real-time Counting Scale calculations:
  const bagWeightKg = Number(bag?.base_weight_kg || 0);
  const currentSamplePacketWt = Number(samplePacketWtKg || defaultSamplePacketWt || 1.0);
  const calculatedPartWeightG = standardPackQty > 0 ? (currentSamplePacketWt * 1000) / standardPackQty : historicalPartWeightG;

  let totalPiecesInBag = 0;
  let fullPacketsCount = 0;
  let totalPackedQty = 0;
  let totalPackedWtKg = 0;
  let balancePieces = 0;

  if (calculatedPartWeightG > 0 && bagWeightKg > 0) {
    totalPiecesInBag = Math.round((bagWeightKg * 1000) / calculatedPartWeightG);
    fullPacketsCount = Math.floor(totalPiecesInBag / standardPackQty);
    totalPackedQty = fullPacketsCount * standardPackQty;
    totalPackedWtKg = Number((fullPacketsCount * currentSamplePacketWt).toFixed(3));
    balancePieces = Math.max(0, totalPiecesInBag - totalPackedQty);
  }

  async function submit(confirm = false) {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.packBag(bag.id, {
        packed_qty: totalPackedQty,
        packed_wt_kg: totalPackedWtKg,
        sample_packet_wt_g: Number((currentSamplePacketWt * 1000).toFixed(2)),
        calculated_part_wt_g: Number(calculatedPartWeightG.toFixed(3)),
        packets_count: fullPacketsCount,
        balance_qty: balancePieces,
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
          ? `✅ Bag ${bag.bag_code} packed: ${fullPacketsCount} packets (${totalPackedQty} pcs). ${balancePieces} balance pcs logged to pool!`
          : t('common.readingSaved'));
        setSamplePacketWtKg('');
        if (res.closed) {
          clearBag();
        } else {
          refetch();
        }
        if (activePartId) {
          api.balancePool(activePartId).then(setBalancePoolData).catch(() => {});
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

  async function handlePackFromPool() {
    if (!activePartId) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.packPacketFromPool(activePartId);
      setSuccess(`📦 ${res.message}`);
      api.balancePool(activePartId).then(setBalancePoolData).catch(() => {});
    } catch (err) {
      setError(err.message);
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
      await api.holdBag(bag.id, { stage: 'PACKING', reason: holdReason });
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
      <h1 className="screen-title">{t('packing.title')}</h1>
      <p className="screen-sub">{t('packing.subtitle')}</p>

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

      {/* Balance Pool Alert Banner */}
      {balancePoolData && balancePoolData.available_qty > 0 && (
        <div className="panel" style={{ borderColor: 'var(--blue)', background: 'rgba(74,144,226,0.08)', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--blue)', fontSize: 14 }}>
                📦 Packing Balance Pool: {balancePoolData.available_qty} pieces accumulated
              </div>
              <div style={{ fontSize: 12, marginTop: 2, color: 'var(--muted)' }}>
                Standard Pack Size: {balancePoolData.standard_pack_qty} pcs | Full Packets Available: {balancePoolData.full_packets}
              </div>
            </div>
            {balancePoolData.can_pack_packet && (
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: 'auto', padding: '6px 14px', fontSize: 13 }}
                disabled={saving}
                onClick={handlePackFromPool}
              >
                Pack 1 Packet from Pool
              </button>
            )}
          </div>
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
            <div>Inspected Bag Weight:</div><strong>{Number(bag.base_weight_kg).toFixed(3)} Kg</strong>
            <div>Estimated Qty:</div><strong>{bag.qty} Nos</strong>
          </div>

          {/* Counting Scale Calculator Interface */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 6, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--amber)' }}>
              ⚖️ High-Precision Counting Scale (0.5g)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="pack_qty">Pack Size (Pcs / Packet)</label>
                <input
                  id="pack_qty"
                  type="number"
                  inputMode="numeric"
                  placeholder={String(partObj?.standard_pack_qty || 500)}
                  value={customPackQty}
                  onChange={(e) => setCustomPackQty(e.target.value)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="sample_pkt_wt">Sample Packet Wt (kg) *</label>
                <input
                  id="sample_pkt_wt"
                  type="number"
                  step="0.001"
                  inputMode="decimal"
                  placeholder={defaultSamplePacketWt ? defaultSamplePacketWt.toFixed(3) : 'e.g. 1.186'}
                  value={samplePacketWtKg}
                  onChange={(e) => setSamplePacketWtKg(e.target.value)}
                />
              </div>
            </div>

            <div style={{ fontSize: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 8, color: 'var(--muted)' }}>
              <div>Calculated Part Wt:</div><strong>{calculatedPartWeightG.toFixed(3)} g / pc</strong>
              <div>Total Calculated Pcs:</div><strong>{totalPiecesInBag} Nos</strong>
            </div>
          </div>

          {/* Real-time Packing Calculation Results */}
          <div className="readout" style={{ marginBottom: 14, background: 'rgba(76,175,125,0.06)', borderColor: 'var(--green)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13 }}>
              <div>Full Packets:</div><strong style={{ color: 'var(--green)', fontSize: 16 }}>{fullPacketsCount} Packets</strong>
              <div>Packed Good Qty:</div><strong>{totalPackedQty} Nos ({totalPackedWtKg} kg)</strong>
              <div>Balance to Pool:</div><strong style={{ color: 'var(--amber)' }}>{balancePieces} Nos</strong>
              <div>Standard Pack Qty:</div><strong>{standardPackQty} Nos / Pkt</strong>
            </div>
          </div>

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
            <div className="btn-row">
              <button
                className="btn btn-primary"
                disabled={saving || fullPacketsCount <= 0}
                onClick={() => submit(false)}
              >
                {saving ? t('packing.saving') : `Pack ${fullPacketsCount} Packets (${totalPackedQty} pcs)`}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearBag}
              >
                Cancel
              </button>
            </div>
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
                placeholder="e.g. Packing count discrepancy, torn packaging, label printing error..."
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


