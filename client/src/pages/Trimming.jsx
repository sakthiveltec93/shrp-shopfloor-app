import SearchableSelect from '../components/SearchableSelect';
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

  // Sub-tab view: 'ready' or 'hold'
  const [activeSubTab, setActiveSubTab] = useState('ready');
  const [holdBags, setHoldBags] = useState([]);
  const [holdLoading, setHoldLoading] = useState(false);

  // Supervisor release modal for quarantined bags
  const [releasingBag, setReleasingBag] = useState(null);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [releaseRemarks, setReleaseRemarks] = useState('');
  const [releasing, setReleasing] = useState(false);

  // Multi-pass input fields
  const [trimmedWt, setTrimmedWt] = useState('');
  const [runnerWt, setRunnerWt] = useState('0');
  const [rejectRows, setRejectRows] = useState([]); // [{ reason_id, weight_kg, qty }]
  const [isPartial, setIsPartial] = useState(false);
  const [reasons, setReasons] = useState([]);
  const [trimSummary, setTrimSummary] = useState(null);

  // Hold quarantine state for currently active bag
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState('');

  const [confirmMsg, setConfirmMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [directPromptDismissed, setDirectPromptDismissed] = useState(false);

  const selectedPart = parts.find((p) => String(p.id) === String(partId));
  const cavityCount = Number(selectedPart?.cavity_count) || 1;
  const partWeightG = selectedPart?.part_weight_g
    ? Number(selectedPart.part_weight_g)
    : (selectedPart?.unit_weight_g ? Number(selectedPart.unit_weight_g) / cavityCount : 0);

  useEffect(() => {
    setDirectPromptDismissed(false);
  }, [partId]);

  useEffect(() => {
    api.checkItems('reject_reason').then(setReasons).catch(() => {});
  }, []);

  // Fetch HOLD bags
  const loadHoldBags = () => {
    setHoldLoading(true);
    api.holdBags({ stage: 'TRIMMING', part_id: partId || undefined })
      .then((res) => setHoldBags(res || []))
      .catch(() => setHoldBags([]))
      .finally(() => setHoldLoading(false));
  };

  useEffect(() => {
    loadHoldBags();
  }, [partId, activeSubTab]);

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
      setRejectRows([]);
      setIsPartial(false);
    }
  }, [bag?.id]);

  // Dynamic reject rows helpers
  function addRejectRow() {
    setRejectRows((r) => [...r, { reason_id: '', weight_kg: '', qty: '' }]);
  }

  function updateRejectRow(idx, field, val) {
    setRejectRows((prev) => {
      const next = [...prev];
      const row = { ...next[idx], [field]: val };

      // Bi-directional weight <-> qty calculation
      if (field === 'weight_kg' && partWeightG > 0) {
        row.qty = val !== '' ? String(Math.round((Number(val) * 1000) / partWeightG)) : '';
      } else if (field === 'qty' && partWeightG > 0) {
        row.weight_kg = val !== '' ? ((Number(val) * partWeightG) / 1000).toFixed(3) : '';
      }
      next[idx] = row;
      return next;
    });
  }

  function removeRejectRow(idx) {
    setRejectRows((prev) => prev.filter((_, i) => i !== idx));
  }

  // Derived calculations
  const totalRejectWeight = rejectRows.reduce((s, r) => s + Number(r.weight_kg || 0), 0);
  const totalRejectQty = rejectRows.reduce((s, r) => s + Number(r.qty || 0), 0);

  const baseWeight = Number(bag?.base_weight_kg || 0);
  const prevTrimmed = Number(trimSummary?.total_trimmed_wt_kg || 0);
  const prevRunner = Number(trimSummary?.total_runner_wt_kg || 0);
  const prevReject = Number(trimSummary?.total_reject_wt_kg || 0);
  const prevAccounted = prevTrimmed + prevRunner + prevReject;
  const currentPassTotal = Number(trimmedWt || 0) + Number(runnerWt || 0) + totalRejectWeight;
  const calculatedRemaining = Math.max(0, baseWeight - (prevAccounted + currentPassTotal));

  const trimmedQtyApprox = (partWeightG > 0 && trimmedWt) ? Math.round((Number(trimmedWt) * 1000) / partWeightG) : 0;
  const remainingQtyApprox = (partWeightG > 0 && calculatedRemaining > 0) ? Math.round((calculatedRemaining * 1000) / partWeightG) : 0;

  async function submit(confirm = false) {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const validRejects = rejectRows
        .filter((r) => r.reason_id && (Number(r.weight_kg) > 0 || Number(r.qty) > 0))
        .map((r) => ({
          reason_id: Number(r.reason_id),
          weight_kg: Number(r.weight_kg || 0),
          qty: Number(r.qty || 0),
        }));

      const res = await api.trimBag(bag.id, {
        trimmed_wt_kg: Number(trimmedWt || 0),
        runner_wt_kg: Number(runnerWt || 0),
        reject_wt_kg: totalRejectWeight,
        reject_reason_id: validRejects[0]?.reason_id || null,
        rejects: validRejects,
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
          : `✅ Pass saved! Remaining bag weight: ${res.remaining_wt_kg} kg (~${remainingQtyApprox} Nos)`);
        setTrimmedWt('');
        setRunnerWt('0');
        setRejectRows([]);
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
      loadHoldBags();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleReleaseHold(e) {
    e.preventDefault();
    if (!releasingBag) return;
    setError('');
    setReleasing(true);
    try {
      await api.releaseHold(releasingBag.id, {
        supervisor_pin: supervisorPin,
        release_remarks: releaseRemarks,
      });
      setSuccess(`✅ Bag ${releasingBag.bag_code} released from HOLD. Ready for Trimming!`);
      setReleasingBag(null);
      setSupervisorPin('');
      setReleaseRemarks('');
      setActiveSubTab('ready');
      loadHoldBags();
      refetch();
    } catch (err) {
      setError(err.message);
    } finally {
      setReleasing(false);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">{t('trimming.title')}</h1>
      <p className="screen-sub">{t('trimming.subtitle')}</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      {/* Sub-tab switcher: Ready Bags vs Quarantined / HOLD Bags */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={activeSubTab === 'ready' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ flex: 1, padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => setActiveSubTab('ready')}
        >
          <span>🟢 Ready Bags</span>
          {batchBags.length > 0 && (
            <span style={{ background: activeSubTab === 'ready' ? '#fff' : 'var(--amber)', color: '#000', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
              {batchBags.length}
            </span>
          )}
        </button>
        <button
          type="button"
          className={activeSubTab === 'hold' ? 'btn btn-danger' : 'btn btn-secondary'}
          style={{ flex: 1, padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => setActiveSubTab('hold')}
        >
          <span>🛑 Quarantined / HOLD Bags</span>
          {holdBags.length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
              {holdBags.length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'hold' ? (
        /* HOLD / QUARANTINED BAGS VIEW */
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--red)' }}>
              🛑 Quarantined Bags on HOLD ({holdBags.length})
            </h3>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '4px 10px', fontSize: 12 }}
              onClick={loadHoldBags}
              disabled={holdLoading}
            >
              ↻ Refresh
            </button>
          </div>

          {holdLoading ? (
            <p className="muted">Loading quarantined bags…</p>
          ) : holdBags.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
              ✅ No bags are currently on HOLD for Trimming.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {holdBags.map((hb) => (
                <div
                  key={hb.id}
                  style={{
                    padding: 12,
                    borderRadius: 6,
                    border: '1px solid var(--red)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="shrp-code-pill" style={{ background: 'var(--red)', color: '#fff' }}>
                        {hb.shrp_part_code || hb.part_code}
                      </span>
                      <strong style={{ fontSize: 14 }}>{hb.bag_code}</strong>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>({hb.base_weight_kg} kg · {hb.qty} Nos)</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#fca5a5' }}>
                      Reason: <strong>{hb.hold_reason || 'Quarantined for quality check'}</strong>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      Held by: {hb.hold_by_name || 'Operator'} · {hb.hold_at ? new Date(hb.hold_at).toLocaleString('en-GB') : ''}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}
                    onClick={() => setReleasingBag(hb)}
                  >
                    🔓 Release to Trimming
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* READY BAGS TRIMMING WORKFLOW */
        <>
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
                <SearchableSelect
                  id="part"
                  value={partId}
                  onChange={(e) => selectPart(e.target.value)}
                  options={parts.map((p) => {
                    const ready = Number(p.ready_bag_count || 0);
                    const active = Number(p.active_bag_count || 0);
                    const badge = ready > 0 ? ('🟢 [' + ready + ' Ready]') : active > 0 ? '🟡 Active' : '';
                    return {
                      value: p.id,
                      label: p.part_name,
                      badge: p.shrp_part_code || p.part_code,
                      sublabel: [p.customer_part_no ? ('Cust: ' + p.customer_part_no) : '', badge].filter(Boolean).join(' · '),
                      searchTerms: (p.shrp_part_code || '') + ' ' + (p.part_code || '') + ' ' + (p.part_name || '') + ' ' + (p.customer_part_no || '')
                    };
                  })}
                  placeholder={t('common.selectPart')}
                  searchPlaceholder="🔍 Type part code, name, customer no..."
                />
              </div>

              {batchBags.length > 0 && (
                <div className="field">
                  <label htmlFor="bag_pick">Select Ready Bag (FIFO Ordered)</label>
                  <SearchableSelect
                    id="bag_pick"
                    value={bag?.id || ''}
                    onChange={(e) => {
                      const b = batchBags.find((x) => String(x.id) === e.target.value);
                      selectSpecificBag(b);
                    }}
                    options={batchBags.map((b, idx) => ({
                      value: b.id,
                      label: b.bag_code,
                      badge: idx === 0 ? '⭐ FIFO Next' : '',
                      sublabel: b.base_weight_kg + ' kg · ' + b.status
                    }))}
                    placeholder="Select bag…"
                    searchPlaceholder="🔍 Type bag barcode / number..."
                  />
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

          {/* FIFO Violation Dialog */}
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

          {/* Scanned / Loaded Bag Details & Trimming Form */}
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
                <div>Part Unit Wt:</div><strong>{partWeightG > 0 ? `${partWeightG} g` : '—'}</strong>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div className="field" style={{ marginBottom: 0 }}>
                      <label htmlFor="trimmed_wt" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Trimmed Part Wt (kg) *</span>
                        {trimmedQtyApprox > 0 && (
                          <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 12 }}>
                            ~{trimmedQtyApprox} Nos
                          </span>
                        )}
                      </label>
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

                  {/* Multiple Rejection Reasons Breakdown */}
                  <div style={{ marginBottom: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: totalRejectWeight > 0 ? 'var(--amber)' : 'var(--muted)' }}>
                        Rejection Breakdown {totalRejectWeight > 0 ? `(${totalRejectWeight.toFixed(3)} kg · ~${totalRejectQty} Nos)` : ''}
                      </span>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ width: 'auto', padding: '3px 10px', fontSize: 12 }}
                        onClick={addRejectRow}
                      >
                        + Add Rejection
                      </button>
                    </div>

                    {rejectRows.length === 0 ? (
                      <p style={{ margin: '4px 0', fontSize: 12, color: 'var(--muted)' }}>
                        No rejections added. Click "+ Add Rejection" if any defects are observed.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {rejectRows.map((row, idx) => {
                          const selectedReason = reasons.find((r) => String(r.id) === String(row.reason_id));
                          const disp = selectedReason?.default_disposition || 'SCRAP';
                          const isRework = disp === 'Return To Trimming' || disp === 'REWORK' || selectedReason?.item_name?.toLowerCase().includes('flash');

                          return (
                            <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, border: '1px solid var(--border)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                                <div>
                                  <select
                                    value={row.reason_id}
                                    onChange={(e) => updateRejectRow(idx, 'reason_id', e.target.value)}
                                  >
                                    <option value="">Select defect reason…</option>
                                    {reasons.map((r) => (
                                      <option key={r.id} value={r.id}>{r.item_name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <input
                                    type="number"
                                    step="0.001"
                                    inputMode="decimal"
                                    placeholder="Weight (kg)"
                                    value={row.weight_kg}
                                    onChange={(e) => updateRejectRow(idx, 'weight_kg', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    placeholder="Qty (Nos)"
                                    value={row.qty}
                                    onChange={(e) => updateRejectRow(idx, 'qty', e.target.value)}
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  style={{ width: 'auto', padding: '6px 10px', color: 'var(--red)' }}
                                  onClick={() => removeRejectRow(idx)}
                                  title="Remove reject row"
                                >
                                  ✕
                                </button>
                              </div>

                              {selectedReason && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 11 }}>
                                  <span style={{ color: 'var(--muted)' }}>Disposition:</span>
                                  {isRework ? (
                                    <span style={{ background: 'rgba(245,166,35,0.15)', color: 'var(--amber)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                                      🛠️ Auto-routes to Rework ({row.qty || 0} Nos)
                                    </span>
                                  ) : disp === 'HOLD' ? (
                                    <span style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--red)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                                      🛑 Quality Hold
                                    </span>
                                  ) : (
                                    <span style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--muted)', padding: '1px 6px', borderRadius: 4 }}>
                                      🗑️ Scrap
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Real-time remaining calculation */}
                  <div className="readout" style={{ marginBottom: 14, fontSize: 13 }}>
                    <div>
                      Calculated Bag Remainder:{' '}
                      <strong style={{ color: calculatedRemaining <= 0.2 ? 'var(--green)' : 'var(--amber)' }}>
                        {calculatedRemaining.toFixed(3)} Kg
                      </strong>{' '}
                      {remainingQtyApprox > 0 && <span style={{ color: 'var(--muted)', fontSize: 12 }}>(~${remainingQtyApprox} Nos)</span>}
                    </div>
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
        </>
      )}

      {/* Release from HOLD Supervisor Modal */}
      {releasingBag && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <form onSubmit={handleReleaseHold} className="panel" style={{ width: '90%', maxWidth: 440, background: '#1c222d', borderColor: 'var(--green)' }}>
            <h3 style={{ margin: '0 0 10px', color: 'var(--green)', fontSize: 17 }}>
              🔓 Release Bag from HOLD
            </h3>
            <p style={{ fontSize: 13, margin: '0 0 10px' }}>
              Releasing Bag <strong>{releasingBag.bag_code}</strong> ({releasingBag.shrp_part_code || releasingBag.part_code}) will make it available for Trimming.
            </p>
            <div style={{ background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 6, fontSize: 12, marginBottom: 12 }}>
              <div>Hold Reason: <strong>{releasingBag.hold_reason || 'Quarantined'}</strong></div>
            </div>
            <div className="field">
              <label htmlFor="sup_pin">Supervisor / Admin PIN *</label>
              <input
                id="sup_pin"
                type="password"
                inputMode="numeric"
                placeholder="Enter Supervisor PIN"
                value={supervisorPin}
                onChange={(e) => setSupervisorPin(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="rel_remarks">Release Remarks / Actions Taken *</label>
              <textarea
                id="rel_remarks"
                rows={2}
                placeholder="e.g. Inspected and approved for trimming, defect corrected..."
                value={releaseRemarks}
                onChange={(e) => setReleaseRemarks(e.target.value)}
                required
              />
            </div>
            <div className="btn-row">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={releasing || !supervisorPin.trim() || !releaseRemarks.trim()}
              >
                {releasing ? 'Releasing…' : 'Authorize Release'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setReleasingBag(null)}
              >
                Cancel
              </button>
            </div>
          </form>
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
