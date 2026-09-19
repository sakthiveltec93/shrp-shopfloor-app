import SearchableSelect from '../components/SearchableSelect';
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

  // Sub-tab view: 'ready' | 'completed' | 'hold'
  const [activeSubTab, setActiveSubTab] = useState('ready');
  const [completedBags, setCompletedBags] = useState([]);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [holdBags, setHoldBags] = useState([]);
  const [holdLoading, setHoldLoading] = useState(false);

  // Simplified packing inputs
  const [pktWt, setPktWt] = useState('');
  const [pktCount, setPktCount] = useState('');
  const [balanceQty, setBalanceQty] = useState('');
  const [balancePoolData, setBalancePoolData] = useState(null);
  const [isPartialPack, setIsPartialPack] = useState(false);

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

  const [completedPartFilter, setCompletedPartFilter] = useState('ALL');

  useEffect(() => {
    loadHoldBags();
    loadCompletedBags('ALL');
  }, []);

  // Fetch Completed Packed bags
  const loadCompletedBags = (targetFilter) => {
    setCompletedLoading(true);
    const effectiveFilter = targetFilter !== undefined ? targetFilter : completedPartFilter;
    const effectivePartId = (effectiveFilter && effectiveFilter !== 'ALL') ? effectiveFilter : (activePartId && effectiveFilter !== 'ALL' ? activePartId : undefined);

    api.bagHistoryLog({ stage: 'pack', part_id: effectivePartId })
      .then((res) => {
        const sorted = (res || []).sort((a, b) => {
          const tA = new Date(a.packing_history?.[a.packing_history.length - 1]?.created_at || a.created_at || 0).getTime();
          const tB = new Date(b.packing_history?.[b.packing_history.length - 1]?.created_at || b.created_at || 0).getTime();
          return tB - tA;
        });
        setCompletedBags(sorted);
      })
      .catch(() => setCompletedBags([]))
      .finally(() => setCompletedLoading(false));
  };

  // Fetch HOLD bags
  const loadHoldBags = () => {
    setHoldLoading(true);
    api.holdBags({ stage: 'PACKING', part_id: activePartId || undefined })
      .then((res) => setHoldBags(res || []))
      .catch(() => setHoldBags([]))
      .finally(() => setHoldLoading(false));
  };

  useEffect(() => {
    if (activeSubTab === 'completed') loadCompletedBags();
    if (activeSubTab === 'hold') loadHoldBags();
  }, [activePartId, activeSubTab, completedPartFilter]);

  // Derive part standard packing information
  const partObj = parts.find((p) => String(p.id) === String(activePartId));
  const standardPackQty = Number(partObj?.standard_pack_qty || 500);

  // Simplified calculation based on user input
  const bagWeightKg = Number(bag?.base_weight_kg || 0);
  const userPktWt = Number(pktWt || 0);
  const userPktCount = Number(pktCount || 0);
  const userBalanceQty = Number(balanceQty || 0);

  // Formula: Total Pkt Wt = (Pkt Wt × No of Pkt) + (Balance Qty × Pkt Wt / Std Pack Qty)
  const calculatedTotalWtKg = userPktWt > 0 && (userPktCount > 0 || userBalanceQty > 0)
    ? Number(((userPktWt * userPktCount) + (userBalanceQty * userPktWt / standardPackQty)).toFixed(3))
    : 0;

  // Tolerance check: ±0.300 kg
  const weightTolerance = 0.300;
  const isWithinTolerance = bagWeightKg > 0 && calculatedTotalWtKg > 0
    ? Math.abs(calculatedTotalWtKg - bagWeightKg) <= weightTolerance
    : null;

  // Can change to PACKED if: Balance < 1 packet AND weight within tolerance
  const canMarkPacked = userBalanceQty < 1 && isWithinTolerance === true;

  // Effective values for submission
  const effectivePacketsCount = userPktCount;
  const effectivePackedQty = userPktCount * standardPackQty;
  const effectivePackedWtKg = calculatedTotalWtKg;
  const effectiveBalanceQty = userBalanceQty;

  async function submit(confirm = false) {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.packBag(bag.id, {
        packed_qty: effectivePackedQty,
        packed_wt_kg: effectivePackedWtKg,
        sample_packet_wt_g: Number((currentSamplePacketWt * 1000).toFixed(2)),
        calculated_part_wt_g: Number(calculatedPartWeightG.toFixed(3)),
        packets_count: effectivePacketsCount,
        balance_qty: effectiveBalanceQty,
        is_partial: isPartialPack,
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
          ? `✅ Bag ${bag.bag_code} packed: ${effectivePacketsCount} packets (${effectivePackedQty} pcs). ${effectiveBalanceQty} balance pcs logged to pool!`
          : `✅ Bag ${bag.bag_code} logged as ${isPartialPack ? 'PARTIAL_PACK' : 'PACKED'}.`);
        setSamplePacketWtKg('');
        setManualPacketsCount('');
        setManualPackedQty('');
        setManualPackedWtKg('');
        setManualBalanceQty('');
        setIsPartialPack(false);
        setShowOverrides(false);
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
    if (!balancePoolData?.can_pack_packet) return;
    setSaving(true);
    try {
      const res = await api.packPacketFromPool(activePartId);
      setSuccess(`✅ ${res.message}`);
      api.balancePool(activePartId).then(setBalancePoolData).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleHoldSubmit() {
    if (!holdReason.trim()) return;
    setSaving(true);
    try {
      await api.holdBag(bag.id, { stage: 'PACKING', reason: holdReason.trim() });
      setShowHoldModal(false);
      setHoldReason('');
      setSuccess(`🛑 Bag ${bag.bag_code} placed on HOLD.`);
      clearBag();
      loadHoldBags();
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
      {success && <div className="success-banner">{success}</div>}

      {/* Sub-Tab Navigation */}
      <div className="btn-row" style={{ marginBottom: 14 }}>
        <button
          type="button"
          className={activeSubTab === 'ready' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ width: 'auto', flex: 1 }}
          onClick={() => setActiveSubTab('ready')}
        >
          📦 Ready Bags
        </button>
        <button
          type="button"
          className={activeSubTab === 'completed' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ width: 'auto', flex: 1 }}
          onClick={() => setActiveSubTab('completed')}
        >
          ✅ Completed Packed
        </button>
        <button
          type="button"
          className={activeSubTab === 'hold' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ width: 'auto', flex: 1 }}
          onClick={() => setActiveSubTab('hold')}
        >
          🛑 Quarantined / HOLD
        </button>
      </div>

      {activeSubTab === 'completed' ? (
        /* COMPLETED PACKED BAGS VIEW */
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, color: 'var(--green)' }}>
                ✅ Completed Packed Bags ({completedBags.length})
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                Showing bags packed in production
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select
                value={completedPartFilter}
                onChange={(e) => {
                  setCompletedPartFilter(e.target.value);
                  loadCompletedBags(e.target.value);
                }}
                style={{ padding: '6px 10px', fontSize: 13, minWidth: 160 }}
              >
                <option value="ALL">All Parts</option>
                {parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.part_name || p.shrp_part_code || p.part_code}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }}
                onClick={() => loadCompletedBags()}
                disabled={completedLoading}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {completedLoading ? (
            <p className="muted" style={{ padding: '12px 0' }}>Loading completed packing bags…</p>
          ) : completedBags.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
              No completed packed bags found for this selection.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {completedBags.map((cb) => {
                const lastPack = cb.packing_history && cb.packing_history.length > 0 ? cb.packing_history[cb.packing_history.length - 1] : null;
                const displayName = cb.part_name || cb.shrp_part_code || cb.part_code;
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
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span className="shrp-code-pill" style={{ background: 'var(--green)', color: '#000', fontWeight: 700 }}>
                          {displayName}
                        </span>
                        <strong style={{ fontSize: 14 }}>{cb.bag_code}</strong>
                        <span className={`status-pill status-${(cb.status || '').toLowerCase()}`}>
                          {cb.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text)' }}>
                        Base Wt: <strong>{cb.base_weight_kg} kg</strong> · Packed: <strong>{lastPack?.packed_qty || cb.qty} pcs ({lastPack?.packets_count || 1} pkts)</strong>
                        {lastPack?.balance_qty > 0 && <span style={{ color: 'var(--amber)', marginLeft: 6 }}>· Pool Balance: {lastPack.balance_qty} pcs</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                        Date: {cb.entry_date ? new Date(cb.entry_date).toLocaleDateString('en-GB') : '-'} (Shift {cb.shift}) ·
                        {lastPack ? ` Packed by ${lastPack.operator_name || 'Operator'} at ${new Date(lastPack.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ` Logged as ${cb.status}`}
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
              ✅ No bags are currently on HOLD for Packing.
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
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* READY BAGS PACKING WORKFLOW */
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
                  label: p.shrp_part_code || p.part_code,
                  badge,
                  sublabel: p.part_name || p.customer_part_no || '',
                  searchTerms: (p.shrp_part_code || '') + ' ' + (p.part_code || '') + ' ' + (p.part_name || '') + ' ' + (p.customer_part_no || '')
                };
              })}
              placeholder={t('common.selectPart')}
              searchPlaceholder="🔍 Type part code..."
            />
          </div>

          {batchBags.length > 0 && (
            <div className="field">
              <label htmlFor="bag_pick">Select Ready Bag (FIFO Ordered)</label>
              <SearchableSelect
                id="bag_pick"
                value={bag?.id || ''}
                onChange={(e) => selectSpecificBag(e.target.value)}
                options={batchBags.map((b) => ({
                  value: b.id,
                  label: `${b.bag_code} (${b.base_weight_kg}kg · ${b.qty}pcs)`,
                  badge: b.status === 'PARTIAL_PACK' ? '⚡ In-Progress Partial' : b.status,
                  sublabel: `Batch ${b.batch_no} · ${new Date(b.entry_date).toLocaleDateString('en-GB')} Shift ${b.shift}`,
                  searchTerms: `${b.bag_code} ${b.batch_no} ${b.status}`
                }))}
                placeholder="Select a ready bag..."
              />
            </div>
          )}
        </div>
      )}

      {/* FIFO Violation Modal */}
      {fifoViolation && (
        <div className="panel" style={{ borderColor: 'var(--red)', background: 'rgba(239, 68, 68, 0.08)', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <strong style={{ color: 'var(--red)', fontSize: 15 }}>FIFO Sequence Alert</strong>
          </div>
          <p style={{ margin: '0 0 10px', fontSize: 13 }}>
            An older un-packed bag exists in the queue:{' '}
            <strong style={{ color: 'var(--amber)' }}>{fifoViolation.oldestBag?.bag_code}</strong> (Moulded on {new Date(fifoViolation.oldestBag?.entry_date).toLocaleDateString('en-GB')}).
          </p>

          {fifoViolation.canOverride ? (
            <>
              <div className="field" style={{ marginBottom: 10 }}>
                <label htmlFor="fifo_reason">Supervisor / Admin Override Reason *</label>
                <input
                  id="fifo_reason"
                  type="text"
                  placeholder="e.g. Urgent customer dispatch, older bag under QA hold..."
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
            <div>Part Code:</div><strong className="shrp-code-pill" style={{ display: 'inline-block', width: 'fit-content' }}>{bag.shrp_part_code || bag.part_code}</strong>
            <div>Batch No:</div><strong>{bag.batch_no}</strong>
            <div>Bag Code:</div><strong>{bag.bag_code}</strong>
            <div>Prod Date:</div><strong>{new Date(bag.entry_date).toLocaleDateString('en-GB')} (Shift {bag.shift})</strong>
            <div>Inspected Bag Weight:</div><strong>{Number(bag.base_weight_kg).toFixed(3)} Kg</strong>
            <div>Estimated Qty:</div><strong>{bag.qty} Nos</strong>
          </div>

          {/* Simplified Manual Packing Entry */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 6, marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="pkt_wt">Packet Weight (kg) *</label>
                <input
                  id="pkt_wt"
                  type="number"
                  step="0.001"
                  inputMode="decimal"
                  placeholder="e.g. 1.186"
                  value={pktWt}
                  onChange={(e) => setPktWt(e.target.value)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="pkt_count">Packet Count *</label>
                <input
                  id="pkt_count"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 5"
                  value={pktCount}
                  onChange={(e) => setPktCount(e.target.value)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="balance_qty">Balance Qty (Pcs) *</label>
                <input
                  id="balance_qty"
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 50"
                  value={balanceQty}
                  onChange={(e) => setBalanceQty(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Real-time Packing Calculation Results - MAIN DISPLAY FOR OPERATORS */}
          <div className="readout" style={{ marginBottom: 14, background: 'rgba(76,175,125,0.06)', borderColor: 'var(--green)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13 }}>
              <div>Full Packets:</div><strong style={{ color: 'var(--green)', fontSize: 16 }}>{effectivePacketsCount} Packets</strong>
              <div>Packed Good Qty:</div><strong>{effectivePackedQty} Nos ({effectivePackedWtKg} kg)</strong>
              <div>Balance to Pool:</div><strong style={{ color: 'var(--amber)' }}>{effectiveBalanceQty} Nos</strong>
              <div>Standard Pack Qty:</div><strong>{standardPackQty} Nos / Pkt</strong>
            </div>
          </div>

          {/* Weight Tolerance Validation */}
          <div style={{ marginBottom: 14, padding: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 12 }}>
              <div>Calculated Total Wt:</div><strong style={{ color: isWithinTolerance === true ? 'var(--green)' : isWithinTolerance === false ? 'var(--red)' : 'inherit' }}>
                {calculatedTotalWtKg} kg
              </strong>
              <div>Bag Weight:</div><strong>{bagWeightKg.toFixed(3)} kg</strong>
              <div>Tolerance (±):</div><strong>{weightTolerance} kg</strong>
              <div>Status:</div><strong style={{ color: isWithinTolerance === true ? 'var(--green)' : isWithinTolerance === false ? 'var(--red)' : 'inherit' }}>
                {isWithinTolerance === true ? '✅ Within Tolerance' : isWithinTolerance === false ? '❌ Outside Tolerance' : '—'}
              </strong>
            </div>
          </div>

          {/* Partial Pack Option */}
          <div style={{ marginBottom: 14, padding: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <input
                type="checkbox"
                checked={isPartialPack}
                onChange={(e) => setIsPartialPack(e.target.checked)}
              />
              <span>Mark as <strong>Partial Pack</strong> — keep bag active for subsequent packing (Balance qty will move to pool)</span>
            </label>
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
                disabled={saving || (effectivePacketsCount <= 0 && !isPartialPack)}
                onClick={() => submit(false)}
              >
                {saving ? t('packing.saving') : isPartialPack ? `Save Partial Pack (${effectivePackedQty} pcs)` : `Pack ${effectivePacketsCount} Packets (${effectivePackedQty} pcs)`}
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
      </>
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
