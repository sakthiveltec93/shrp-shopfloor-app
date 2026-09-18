import SearchableSelect from '../components/SearchableSelect';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { useFifoBag } from '../useFifoBag';
import { useLanguage } from '../i18n/LanguageContext';
import CameraScanner from '../components/CameraScanner';

export default function Dispatch() {
  const { t } = useLanguage();
  const {
    parts, partId, bag, method, setMethod, scanInput, setScanInput, handleScanSubmit,
    loadBagByCode, batchBags, selectPart, selectSpecificBag,
    fifoViolation, setFifoViolation, fifoOverrideReason, setFifoOverrideReason,
    isFifoOverridden, setIsFifoOverridden, error, setError, success, setSuccess,
    loading, refetch, clearBag,
  } = useFifoBag('dispatch');

  const [activeTab, setActiveTab] = useState('ready'); // 'ready' | 'history' | 'gatepass'
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [dispatchedQty, setDispatchedQty] = useState('');
  const [dispatchedWt, setDispatchedWt] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  // Tab 2: History state
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [historyCustomerId, setHistoryCustomerId] = useState('');

  // Tab 3: Gate pass state
  const [gatePassList, setGatePassList] = useState([]);
  const [selectedGatePasses, setSelectedGatePasses] = useState(new Set());

  useEffect(() => {
    api.customers().then(setCustomers).catch(() => {});
  }, []);

  // When a bag is loaded, pre-populate qty & weight from bag
  useEffect(() => {
    if (bag) {
      setDispatchedQty(String(bag.packed_qty || bag.qty || ''));
      setDispatchedWt(String(bag.packed_wt_kg || bag.base_weight_kg || ''));
    } else {
      setDispatchedQty('');
      setDispatchedWt('');
      setInvoiceNo('');
      setVehicleNo('');
      setRemarks('');
      setCustomerId('');
      setConfirmMsg('');
    }
  }, [bag]);

  // Load history when tab 2 is opened
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const query = {};
      if (dateFrom) query.date_from = dateFrom;
      if (dateTo) query.date_to = dateTo;
      if (historyCustomerId) query.customer_id = historyCustomerId;

      const data = await api.dispatchHistory(query);
      setHistoryData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function submit(confirm = false) {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await api.dispatchBag(bag.id, {
        dispatched_qty: Number(dispatchedQty),
        dispatched_wt_kg: Number(dispatchedWt),
        customer_id: customerId ? Number(customerId) : null,
        invoice_no: invoiceNo.trim() || null,
        vehicle_no: vehicleNo.trim() || null,
        remarks: remarks.trim() || null,
        confirm,
        fifo_override: isFifoOverridden,
        fifo_override_reason: fifoOverrideReason,
      });

      if (res.needsConfirmation) {
        setConfirmMsg(res.message);
      } else {
        setConfirmMsg('');
        setSuccess(res.closed
          ? `Bag ${bag.bag_code} marked DISPATCHED successfully.`
          : 'Dispatch reading saved.');
        if (res.closed) {
          clearBag();
          refetch();
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
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function printGatePasses() {
    if (selectedGatePasses.size === 0) {
      setError('Select at least one dispatch to print');
      return;
    }

    // TODO: Generate PDF gate passes for selected dispatches
    alert(`Print gate passes for ${selectedGatePasses.size} dispatch(es) - PDF generation pending`);
  }

  return (
    <div className="screen">
      <h1 className="screen-title">🚚 Dispatch Management</h1>
      <p className="screen-sub">Track & manage dispatch of packed bags</p>

      {/* Tab Navigation */}
      <div className="btn-row" style={{ marginBottom: 16, gap: 8 }}>
        <button
          className={activeTab === 'ready' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setActiveTab('ready')}
          style={{ flex: 1 }}
        >
          📦 Ready for Dispatch
        </button>
        <button
          className={activeTab === 'history' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setActiveTab('history')}
          style={{ flex: 1 }}
        >
          📜 Completed Dispatches
        </button>
        <button
          className={activeTab === 'gatepass' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setActiveTab('gatepass')}
          style={{ flex: 1 }}
        >
          🎫 Gate Pass Slips
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      {/* TAB 1: Ready for Dispatch */}
      {activeTab === 'ready' && (
        <div>
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

          {/* FIFO Violation Dialog */}
          {fifoViolation && (
            <div className="panel" style={{ borderColor: 'var(--amber)', background: 'rgba(245,166,35,0.08)' }}>
              <h3 style={{ margin: '0 0 8px', color: 'var(--amber)', fontSize: 16 }}>
                ⚠️ FIFO Violation
              </h3>
              <p style={{ fontSize: 13, margin: '0 0 6px' }}>
                An older available bag must be dispatched first:
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

          {/* Bag Not Packed Notice */}
          {bag && bag.status !== 'PACKED' && (
            <div className="panel" style={{ borderColor: 'var(--red)', background: 'rgba(235,87,87,0.08)' }}>
              <h4 style={{ margin: '0 0 6px', color: 'var(--red)' }}>⚠️ Bag Not Ready for Dispatch</h4>
              <p style={{ fontSize: 13, margin: 0 }}>
                Bag <strong>{bag.bag_code}</strong> is currently in <strong>{bag.status}</strong> status.
                It must be packed before it can be dispatched.
              </p>
              <button type="button" className="btn btn-secondary" style={{ marginTop: 10 }} onClick={clearBag}>
                Select Another Bag
              </button>
            </div>
          )}

          {/* Scanned / Loaded Bag Details */}
          {bag && bag.status === 'PACKED' && !fifoViolation && (
            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--amber)' }}>
                  {bag.shrp_part_code || bag.part_code}
                </span>
                <span className={`status-pill status-${bag.status.toLowerCase()}`}>
                  {bag.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, marginBottom: 14 }}>
                <div>Part Name:</div><strong>{bag.part_name}</strong>
                <div>Cust Part No:</div><span className="muted">{bag.customer_part_no || bag.part_code}</span>
                <div>Batch No:</div><strong>{bag.batch_no}</strong>
                <div>Bag Code:</div><strong>{bag.bag_code}</strong>
                <div>Prod Date:</div><strong>{new Date(bag.entry_date).toLocaleDateString('en-GB')} (Shift {bag.shift})</strong>
                <div>Base Weight:</div><strong>{Number(bag.base_weight_kg).toFixed(3)} Kg</strong>
                <div>Total Quantity:</div><strong>{bag.qty} Nos</strong>
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
                <>
                  <div className="btn-row" style={{ marginBottom: 14 }}>
                    <div className="field" style={{ marginBottom: 0, flex: 1 }}>
                      <label htmlFor="dispatched_qty">Dispatched Qty (Nos) *</label>
                      <input
                        id="dispatched_qty"
                        type="number"
                        inputMode="numeric"
                        placeholder="Dispatched Qty"
                        value={dispatchedQty}
                        onChange={(e) => setDispatchedQty(e.target.value)}
                      />
                    </div>
                    <div className="field" style={{ marginBottom: 0, flex: 1 }}>
                      <label htmlFor="dispatched_wt">Dispatched Wt (Kg) *</label>
                      <input
                        id="dispatched_wt"
                        type="number"
                        step="0.001"
                        inputMode="decimal"
                        placeholder="Dispatched Wt"
                        value={dispatchedWt}
                        onChange={(e) => setDispatchedWt(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="customer">Customer</label>
                    <select
                      id="customer"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                    >
                      <option value="">Select customer…</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.customer_name || c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="btn-row" style={{ marginBottom: 14 }}>
                    <div className="field" style={{ marginBottom: 0, flex: 1 }}>
                      <label htmlFor="invoice_no">Invoice / DC No.</label>
                      <input
                        id="invoice_no"
                        type="text"
                        placeholder="e.g. INV-2026-001"
                        value={invoiceNo}
                        onChange={(e) => setInvoiceNo(e.target.value)}
                      />
                    </div>
                    <div className="field" style={{ marginBottom: 0, flex: 1 }}>
                      <label htmlFor="vehicle_no">Vehicle No.</label>
                      <input
                        id="vehicle_no"
                        type="text"
                        placeholder="e.g. TN-01-AB-1234"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="remarks">Remarks (optional)</label>
                    <input
                      id="remarks"
                      type="text"
                      placeholder="Dispatch notes or remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    />
                  </div>

                  <div className="btn-row">
                    <button
                      className="btn btn-primary"
                      disabled={saving || !dispatchedQty || !dispatchedWt}
                      onClick={() => submit(false)}
                    >
                      {saving ? 'Saving…' : '✅ Record Dispatch'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={clearBag}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
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
      )}

      {/* TAB 2: Completed Dispatches */}
      {activeTab === 'history' && (
        <div>
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>📜 Dispatch History</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="date_from">From Date</label>
                <input
                  id="date_from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="date_to">To Date</label>
                <input
                  id="date_to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="hist_customer">Customer</label>
                <select
                  id="hist_customer"
                  value={historyCustomerId}
                  onChange={(e) => setHistoryCustomerId(e.target.value)}
                >
                  <option value="">All Customers</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.customer_name || c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="btn btn-primary" onClick={loadHistory} disabled={historyLoading}>
              {historyLoading ? 'Loading…' : 'Search Dispatches'}
            </button>
          </div>

          {historyData.length > 0 && (
            <div style={{ overflowX: 'auto', marginTop: 14 }}>
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Bag ID</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Part</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px' }}>Weight (Kg)</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Customer</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Vehicle</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Invoice</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 4px' }}><strong>{d.bag_code}</strong></td>
                      <td style={{ padding: '8px 4px' }}>{d.shrp_part_code || d.part_code}</td>
                      <td style={{ textAlign: 'right', padding: '8px 4px' }}>{d.dispatched_qty}</td>
                      <td style={{ textAlign: 'right', padding: '8px 4px' }}>{Number(d.dispatched_wt_kg).toFixed(3)}</td>
                      <td style={{ padding: '8px 4px' }}>{d.customer_name}</td>
                      <td style={{ padding: '8px 4px' }}>{d.vehicle_no || '—'}</td>
                      <td style={{ padding: '8px 4px' }}>{d.invoice_no || '—'}</td>
                      <td style={{ padding: '8px 4px' }}>{new Date(d.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {historyData.length === 0 && !historyLoading && (
            <div className="panel" style={{ textAlign: 'center', color: 'var(--muted)' }}>
              No dispatches found. Try adjusting filters.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Gate Pass Slips */}
      {activeTab === 'gatepass' && (
        <div>
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>🎫 Gate Pass Slips</h3>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              Select dispatches to generate & print gate pass documents
            </p>

            <button
              className="btn btn-primary"
              onClick={printGatePasses}
              disabled={selectedGatePasses.size === 0}
              style={{ marginBottom: 14 }}
            >
              🖨️ Print {selectedGatePasses.size > 0 ? `(${selectedGatePasses.size})` : ''}
            </button>
          </div>

          {historyData.length > 0 && (
            <div style={{ overflowX: 'auto', marginTop: 14 }}>
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'center', padding: '8px 4px', width: 30 }}>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGatePasses(new Set(historyData.map(d => d.id)));
                          } else {
                            setSelectedGatePasses(new Set());
                          }
                        }}
                      />
                    </th>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Bag ID</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Part</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px' }}>Qty</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Customer</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Vehicle</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.map((d) => (
                    <tr key={d.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ textAlign: 'center', padding: '8px 4px' }}>
                        <input
                          type="checkbox"
                          checked={selectedGatePasses.has(d.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedGatePasses);
                            if (e.target.checked) {
                              newSet.add(d.id);
                            } else {
                              newSet.delete(d.id);
                            }
                            setSelectedGatePasses(newSet);
                          }}
                        />
                      </td>
                      <td style={{ padding: '8px 4px' }}><strong>{d.bag_code}</strong></td>
                      <td style={{ padding: '8px 4px' }}>{d.shrp_part_code || d.part_code}</td>
                      <td style={{ textAlign: 'right', padding: '8px 4px' }}>{d.dispatched_qty}</td>
                      <td style={{ padding: '8px 4px' }}>{d.customer_name}</td>
                      <td style={{ padding: '8px 4px' }}>{d.vehicle_no || '—'}</td>
                      <td style={{ padding: '8px 4px' }}>{new Date(d.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {historyData.length === 0 && (
            <div className="panel" style={{ textAlign: 'center', color: 'var(--muted)' }}>
              No dispatches available. Load history first.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
