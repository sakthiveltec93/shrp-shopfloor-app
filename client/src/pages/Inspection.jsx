import SearchableSelect from '../components/SearchableSelect';
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

  // Sub-tab switcher: 'ready' | 'completed' | 'hold'
  const [activeSubTab, setActiveSubTab] = useState('ready');
  const [holdBags, setHoldBags] = useState([]);
  const [holdLoading, setHoldLoading] = useState(false);
  const [completedBags, setCompletedBags] = useState([]);
  const [completedLoading, setCompletedLoading] = useState(false);

  // Supervisor release modal for quarantined bags
  const [releasingBag, setReleasingBag] = useState(null);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [releaseRemarks, setReleaseRemarks] = useState('');
  const [releasing, setReleasing] = useState(false);

  const [inspectedWt, setInspectedWt] = useState('');
  const [rejectRows, setRejectRows] = useState([]); // [{ reason_id, weight_kg, qty }]
  const [reasons, setReasons] = useState([]);

  // Tiered tolerance confirmation & remarks
  const [confirmModal, setConfirmModal] = useState(null); // { tier, message, diffKg, diffPct }
  const [remarksModal, setRemarksModal] = useState(null); // { tier, message, diffKg, diffPct }
  const [mandatoryRemarks, setMandatoryRemarks] = useState('');

  // Hold quarantine state for currently active bag
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [holdReason, setHoldReason] = useState('');

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
    api.holdBags({ stage: 'INSPECTION', part_id: partId || undefined })
      .then((res) => setHoldBags(res || []))
      .catch(() => setHoldBags([]))
      .finally(() => setHoldLoading(false));
  };

  // Fetch Completed Inspection bags
  const loadCompletedBags = () => {
    setCompletedLoading(true);
    api.bagHistoryLog({ stage: 'inspect', part_id: partId || undefined })
      .then((res) => setCompletedBags(res || []))
      .catch(() => setCompletedBags([]))
      .finally(() => setCompletedLoading(false));
  };

  useEffect(() => {
    if (activeSubTab === 'hold') loadHoldBags();
    if (activeSubTab === 'completed') loadCompletedBags();
  }, [partId, activeSubTab]);

  useEffect(() => {
    if (bag?.id) {
      setInspectedWt(String(bag.base_weight_kg || ''));
    } else {
      setInspectedWt('');
      setRejectRows([]);
      setConfirmModal(null);
      setRemarksModal(null);
      setMandatoryRemarks('');
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

  const inspectedQtyApprox = (partWeightG > 0 && inspectedWt) ? Math.round((Number(inspectedWt) * 1000) / partWeightG) : 0;

  async function submit(confirm = false, overrideRemarks = '') {
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

      const res = await api.inspectBag(bag.id, {
        inspected_wt_kg: Number(inspectedWt),
        reject_wt_kg: totalRejectWeight,
        reject_reason_id: validRejects[0]?.reason_id || null,
        rejects: validRejects,
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
        setRejectRows([]);
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
      setSuccess(`✅ Bag ${releasingBag.bag_code} released from HOLD. Ready for Inspection!`);
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
      <h1 className="screen-title">{t('inspection.title')}</h1>
      <p className="screen-sub">{t('inspection.subtitle')}</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      {/* Sub-tab switcher: Ready Bags vs Completed Bags vs Quarantined / HOLD Bags */}
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
          className={activeSubTab === 'completed' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ flex: 1, padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => setActiveSubTab('completed')}
        >
          <span>✅ Completed Bags</span>
          {completedBags.length > 0 && (
            <span style={{ background: activeSubTab === 'completed' ? '#fff' : 'var(--green, #22c55e)', color: '#000', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
              {completedBags.length}
            </span>
          )}
        </button>
        <button
          type="button"
          className={activeSubTab === 'hold' ? 'btn btn-danger' : 'btn btn-secondary'}
          style={{ flex: 1, padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onClick={() => setActiveSubTab('hold')}
        >
          <span>🛑 Quarantined / HOLD</span>
          {holdBags.length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
              {holdBags.length}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'completed' ? (
        /* COMPLETED INSPECTED BAGS VIEW */
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--green)' }}>
              ✅ Completed Inspected Bags ({completedBags.length})
            </h3>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: 'auto', padding: '4px 10px', fontSize: 12 }}
              onClick={loadCompletedBags}
              disabled={completedLoading}
            >
              ↻ Refresh
            </button>
          </div>

          {completedLoading ? (
            <p className="muted">Loading completed inspection bags…</p>
          ) : completedBags.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>
              No completed inspected bags found for this selection.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {completedBags.map((cb) => {
                const lastInsp = cb.inspection_history && cb.inspection_history.length > 0 ? cb.inspection_history[cb.inspection_history.length - 1] : null;
                return (
                  <div
                    key={cb.id}
                    style={{
                      padding: 12,
                      borderRadius: 6,
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      background: 'rgba(34, 197, 94, 0.05)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span className="shrp-code-pill" style={{ background: 'var(--green)', color: '#000', fontWeight: 700 }}>
                          {cb.shrp_part_code || cb.part_code}
                        </span>
                        <strong style={{ fontSize: 14 }}>{cb.bag_code}</strong>
                        <span className={`status-pill status-${(cb.status || '').toLowerCase()}`}>
                          {cb.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text)' }}>
                        Base Wt: <strong>{cb.base_weight_kg} kg</strong> · Inspected Wt: <strong>{lastInsp?.inspected_wt_kg || cb.base_weight_kg} kg</strong> · ({cb.qty} Nos)
                        {lastInsp?.reject_wt_kg > 0 && <span style={{ color: 'var(--red)', marginLeft: 6 }}>(Rejects: {lastInsp.reject_wt_kg} kg)</span>}
                        {lastInsp?.sent_to_rework_qty > 0 && <span style={{ color: 'var(--amber)', marginLeft: 6 }}>(Rework: {lastInsp.sent_to_rework_qty} Nos)</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                        Date: {cb.entry_date ? new Date(cb.entry_date).toLocaleDateString('en-GB') : '-'} (Shift {cb.shift}) ·
                        {lastInsp ? ` Inspected by ${lastInsp.operator_name || 'Inspector'} at ${new Date(lastInsp.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ` Logged as ${cb.status}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : activeSubTab === 'hold' ? (
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
              ✅ No bags are currently on HOLD for Inspection.
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
                    🔓 Release to Inspection
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* READY BAGS INSPECTION WORKFLOW */
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

          {/* Direct Packing Confirmation Banner */}
          {selectedPart && selectedPart.inspection_required === false && !directPromptDismissed && (
            <div className="panel" style={{ borderColor: 'var(--blue, #3b82f6)', background: 'rgba(59,130,246,0.1)', marginBottom: 16 }}>
              <h3 style={{ margin: '0 0 6px', color: '#60a5fa', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                ℹ️ Direct Packing Part
              </h3>
              <p style={{ fontSize: 13, margin: '0 0 10px' }}>
                Part <strong>{selectedPart.shrp_part_code || selectedPart.part_code}</strong> does not normally require inspection.
                Do you still want to inspect this bag?
              </p>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setDirectPromptDismissed(true)}
                >
                  🔍 Yes, Inspect Anyway
                </button>
                <a
                  href="/packing"
                  className="btn btn-primary"
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                >
                  📦 Go to Packing
                </a>
              </div>
            </div>
          )}

          {/* Helpful context if no bags are ready for inspection */}
          {error && error.includes('No bag ready') && selectedPart?.trim_required && (
            <div className="panel" style={{ borderColor: 'var(--amber)', background: 'rgba(245,166,35,0.08)', marginBottom: 16, fontSize: 13 }}>
              💡 <strong>Notice:</strong> Part <em>{selectedPart.shrp_part_code || selectedPart.part_code}</em> requires trimming first.
              Make sure bags for this part are completed in the <strong>Trimming</strong> stage before inspecting.
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

              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="inspected_wt" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Inspected Good Weight (kg) *</span>
                  {inspectedQtyApprox > 0 && (
                    <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 12 }}>
                      ~{inspectedQtyApprox} Nos
                    </span>
                  )}
                </label>
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
              Releasing Bag <strong>{releasingBag.bag_code}</strong> ({releasingBag.shrp_part_code || releasingBag.part_code}) will make it available for Inspection.
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
                placeholder="e.g. Inspected and approved for inspection, defect verified..."
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
                Confirm & Continue
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier 3 Mandatory Remarks Modal (>2% or >200g) */}
      {remarksModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="panel" style={{ width: '90%', maxWidth: 440, background: '#1c222d', borderColor: 'var(--red)' }}>
            <h3 style={{ margin: '0 0 10px', color: 'var(--red)', fontSize: 17 }}>
              🛑 Weight Variance Explanation Required
            </h3>
            <p style={{ fontSize: 13, margin: '0 0 12px' }}>
              {remarksModal.message}
            </p>
            <div className="field">
              <label htmlFor="mandatory_remarks">Remarks / Reason *</label>
              <textarea
                id="mandatory_remarks"
                rows={3}
                placeholder="State reason for weight discrepancy (e.g. runner trimmed earlier, heavy defect rate)..."
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
                {saving ? 'Saving…' : 'Submit with Remarks'}
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
