import React, { useState, useEffect } from 'react';
import { api, getToken } from '../api';
import { useAuth } from '../AuthContext';
import SearchableSelect from '../components/SearchableSelect';

export default function ProductionPlanning() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('mps'); // 'mps' | 'milestones' | 'daily' | 'plan_vs_actual'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data states
  const [mpsList, setMpsList] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [dailySchedules, setDailySchedules] = useState([]);
  const [planVsActual, setPlanVsActual] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [parts, setParts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [moulds, setMoulds] = useState([]);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Variance Modal
  const [varianceAlert, setVarianceAlert] = useState(null);
  const [confirmReason, setConfirmReason] = useState('');

  // New Milestone Modal
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({
    customer_id: '',
    part_id: '',
    quantity: '',
    milestone_date: new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10),
    program: '',
    customer_po_ref: '',
    notes: '',
  });

  // New Daily Schedule Modal
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyForm, setDailyForm] = useState({
    plan_date: new Date().toISOString().slice(0, 10),
    shift: 'A',
    machine_id: '',
    part_id: '',
    mould_id: '',
    planned_shots: 1000,
    planned_qty: 1000,
    planned_hours: 8.0,
    notes: '',
  });

  // Load masters
  useEffect(() => {
    async function loadMasters() {
      try {
        const [partsRes, machRes, mouldRes] = await Promise.all([
          api.parts().catch(() => []),
          api.machines().catch(() => []),
          api.moulds.list().catch(() => []),
        ]);
        setParts(Array.isArray(partsRes) ? partsRes : []);
        setMachines(Array.isArray(machRes) ? machRes : []);
        setMoulds(Array.isArray(mouldRes) ? mouldRes : []);
      } catch (err) {
        console.warn('Failed to load masters', err);
      }
    }
    loadMasters();
  }, []);

  // Load active tab data
  useEffect(() => {
    loadTabData();
  }, [activeTab, selectedMonth]);

  const loadTabData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'mps') {
        const res = await api.planning.getMps(selectedMonth);
        const list = Array.isArray(res) ? res : (res?.records || res?.imported || []);
        setMpsList(list);
      } else if (activeTab === 'milestones') {
        const res = await api.planning.getMilestones('', selectedMonth);
        const list = Array.isArray(res) ? res : (res?.milestones || res?.records || []);
        setMilestones(list);
      } else if (activeTab === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        const res = await api.planning.getDailySchedules(today);
        const list = Array.isArray(res) ? res : (res?.schedules || res?.plans || res?.records || []);
        setDailySchedules(list);
      } else if (activeTab === 'plan_vs_actual') {
        const res = await api.planning.getPlanVsActual(selectedMonth);
        const list = Array.isArray(res) ? res : (res?.records || []);
        setPlanVsActual(list);
      }
    } catch (err) {
      setError(err.message || 'Failed to load planning data');
    } finally {
      setLoading(false);
    }
  };

  // Upload MPS File
  const handleUploadMps = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const res = await api.planning.uploadMps({
          fileData: base64,
          excel_base64: base64,
          scheduleMonth: selectedMonth,
          month_year: selectedMonth,
          fileName: uploadFile.name,
        });

        const highVariances = (res.imported || res.records || []).filter((item) => item.is_high_variance || Math.abs(Number(item.variance_pct) || 0) > 15);
        if (highVariances && highVariances.length > 0) {
          setVarianceAlert({
            mps_ids: highVariances.map((h) => h.id),
            count: highVariances.length,
            items: highVariances,
          });
        }

        setSuccessMsg(`Successfully imported ${res.imported_count || res.totalRows || res.imported?.length || 0} MPS schedules for ${selectedMonth}!`);
        setShowUploadModal(false);
        setUploadFile(null);
        loadTabData();
      } catch (err) {
        setError(err.message || 'Failed to upload MPS Excel');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(uploadFile);
  };

  // Confirm Variance
  const handleConfirmVariance = async () => {
    if (!varianceAlert || !confirmReason.trim()) return;
    try {
      for (const mpsId of varianceAlert.mps_ids) {
        await api.planning.confirmMpsVariance({
          mps_id: mpsId,
          confirm_reason: confirmReason,
        });
      }
      setSuccessMsg('High variances acknowledged & audited successfully.');
      setVarianceAlert(null);
      setConfirmReason('');
      loadTabData();
    } catch (err) {
      setError(err.message || 'Failed to confirm variances');
    }
  };

  // Create Milestone
  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    try {
      await api.planning.createMilestone(milestoneForm);
      setSuccessMsg('Customer delivery milestone schedule created!');
      setShowMilestoneModal(false);
      loadTabData();
    } catch (err) {
      setError(err.message || 'Failed to create delivery milestone');
    }
  };

  // Create Daily Schedule
  const handleCreateDaily = async (e) => {
    e.preventDefault();
    try {
      const res = await api.planning.createDailySchedule(dailyForm);
      if (res.stock_warning) {
        setSuccessMsg(`Daily plan scheduled with warning: ${res.stock_warning}`);
      } else {
        setSuccessMsg('Daily machine schedule published with full RM stock reservation!');
      }
      setShowDailyModal(false);
      loadTabData();
    } catch (err) {
      setError(err.message || 'Failed to create daily schedule');
    }
  };

  // Aggregations
  const totalDemand = mpsList.reduce((sum, item) => sum + Number(item.gross_demand_qty || item.gross_demand || 0), 0);
  const totalTarget = mpsList.reduce((sum, item) => sum + Number(item.net_production_target_qty || item.receipts_target || 0), 0);
  const totalRMKg = mpsList.reduce((sum, item) => sum + Number(item.required_rm_kg || 0), 0);

  return (
    <div className="screen" style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 24 }}>📊</span>
            <h1 className="screen-title" style={{ margin: 0, fontSize: 20 }}>
              Production Planning & Customer Schedules
            </h1>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Monthly MPS Engine, Transit Lead-Time Offsets, BOM Stock Allocation & Plan vs Actual Matrix
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '6px 10px',
              fontSize: 12,
              fontWeight: 700,
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          />
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
            style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span>📥</span>
            <span>Import MPS Excel</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: 13, marginBottom: 16, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>⚠ {error}</div>
          <button type="button" onClick={() => setError('')} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid var(--green)', color: 'var(--green)', fontSize: 13, marginBottom: 16, fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>✓ {successMsg}</div>
          <button type="button" onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', fontSize: 14 }}>✕</button>
        </div>
      )}

      {/* Top Metric Cards */}
      {activeTab === 'mps' && mpsList.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Customer Demand</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)', fontFamily: 'var(--font-num)', marginTop: 4 }}>
              {totalDemand.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500 }}>pcs</span>
            </div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Net Receipts Target</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#60a5fa', fontFamily: 'var(--font-num)', marginTop: 4 }}>
              {totalTarget.toLocaleString()} <span style={{ fontSize: 12, fontWeight: 500 }}>pcs</span>
            </div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Raw Material Required</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--font-num)', marginTop: 4 }}>
              {totalRMKg.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 500 }}>kg</span>
            </div>
          </div>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Programs / Parts</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-num)', marginTop: 4 }}>
              {mpsList.length} <span style={{ fontSize: 12, fontWeight: 500 }}>schedules</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {[
          { id: 'mps', label: '1. Master Schedule (MPS)', icon: '📅' },
          { id: 'milestones', label: '2. Customer Transit Lead-Time Offsets', icon: '🚚' },
          { id: 'daily', label: '3. Daily Shift Schedules & RM Check', icon: '⚙️' },
          { id: 'plan_vs_actual', label: '4. Live Plan vs Actual Matrix', icon: '📈' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              borderRadius: 6,
              border: activeTab === tab.id ? '1px solid var(--amber)' : '1px solid var(--line)',
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: MASTER SCHEDULE (MPS) */}
      {/* ============================================================ */}
      {activeTab === 'mps' && (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 14 }}>Monthly Master Production Schedule ({selectedMonth})</strong>
            <span className="muted" style={{ fontSize: 12 }}>{mpsList.length} Program Schedules</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--line)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Program / Customer</th>
                  <th style={{ padding: '10px 12px' }}>Part Code & Name</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Gross Demand</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Receipts Target</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Req. RM (Kg)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Variance %</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Audit Status</th>
                  <th style={{ padding: '10px 12px' }}>Rolling Forecast</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading MPS schedules...
                    </td>
                  </tr>
                ) : mpsList.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
                      <div style={{ fontWeight: 600 }}>No MPS loaded for {selectedMonth}.</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        Click <strong>"Import MPS Excel"</strong> above to upload customer schedule sheet.
                      </div>
                    </td>
                  </tr>
                ) : (
                  mpsList.map((m) => {
                    const isHighVar = Math.abs(Number(m.variance_pct) || 0) > 15;
                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text)' }}>{m.program || 'Standard'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.customer_name || 'Customer Program'}</div>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="shrp-code-pill" style={{ fontSize: 11, padding: '2px 6px' }}>{m.shrp_part_code || m.part_code}</span>
                            <span style={{ fontWeight: 600 }}>{m.part_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700, color: 'var(--amber)' }}>
                          {Number(m.gross_demand_qty).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700, color: '#60a5fa' }}>
                          {Number(m.net_production_target_qty).toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', color: 'var(--green)' }}>
                          {Number(m.required_rm_kg || 0).toFixed(1)} kg
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 700,
                              background: isHighVar ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                              color: isHighVar ? '#f87171' : 'var(--text-muted)',
                              border: isHighVar ? '1px solid rgba(239,68,68,0.4)' : '1px solid var(--line)',
                            }}
                          >
                            {m.variance_pct ? `${m.variance_pct}%` : '0%'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {m.variance_confirmed_by ? (
                            <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }} title={`Confirmed: ${m.variance_confirm_reason}`}>
                              ✓ Audited
                            </span>
                          ) : isHighVar ? (
                            <button
                              type="button"
                              onClick={() =>
                                setVarianceAlert({
                                  mps_ids: [m.id],
                                  count: 1,
                                  items: [m],
                                })
                              }
                              style={{
                                padding: '3px 8px',
                                background: 'rgba(245, 158, 11, 0.2)',
                                border: '1px solid var(--amber)',
                                color: 'var(--amber)',
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              ! Confirm
                            </button>
                          ) : (
                            <span className="muted" style={{ fontSize: 11 }}>Normal</span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {m.forecast_periods?.map((fp) => (
                              <span
                                key={fp.id}
                                style={{
                                  padding: '2px 6px',
                                  background: 'rgba(255,255,255,0.04)',
                                  borderRadius: 4,
                                  border: '1px solid var(--line)',
                                  fontSize: 10,
                                }}
                              >
                                {fp.period_label}: <strong style={{ color: '#fff' }}>{Number(fp.quantity).toLocaleString()}</strong>
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: CUSTOMER TRANSIT LEAD-TIME OFFSETS */}
      {/* ============================================================ */}
      {activeTab === 'milestones' && (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <strong style={{ fontSize: 14 }}>Customer Delivery Milestones & Backward Scheduling</strong>
              <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                Offsets: Pune (7d), Bhiwadi (12d), Chennai (1-week buffer)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMilestoneModal(true)}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700 }}
            >
              + Add Delivery Schedule
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--line)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Customer & Plant</th>
                  <th style={{ padding: '10px 12px' }}>Part Details</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Scheduled Qty</th>
                  <th style={{ padding: '10px 12px' }}>Customer Delivery Date</th>
                  <th style={{ padding: '10px 12px' }}>Transit Lead Time</th>
                  <th style={{ padding: '10px 12px' }}>Recommended Production Start</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Dispatched Qty</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading delivery milestones...
                    </td>
                  </tr>
                ) : milestones.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No delivery milestones logged. Click "+ Add Delivery Schedule" above.
                    </td>
                  </tr>
                ) : (
                  milestones.map((mil) => (
                    <tr key={mil.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700 }}>{mil.customer_name || 'Hanon Systems'}</div>
                        <div style={{ fontSize: 11, color: '#60a5fa' }}>{mil.plant_location || 'Pune / Bhiwadi'}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="shrp-code-pill" style={{ fontSize: 11 }}>{mil.shrp_part_code || mil.part_code}</span>
                          <span style={{ fontWeight: 600 }}>{mil.part_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700, color: '#60a5fa' }}>
                        {Number(mil.quantity).toLocaleString()} pcs
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, fontFamily: 'var(--font-num)' }}>
                        {mil.milestone_date}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)', fontSize: 11, fontWeight: 600, border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                          {mil.transit_lead_days || 0} days offset
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-num)' }}>
                        {mil.scheduled_prod_date || mil.milestone_date}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)' }}>
                        {Number(mil.dispatched_qty || 0).toLocaleString()} pcs
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span className={`status-pill ${mil.status === 'COMPLETED' ? 'status-approved' : 'status-pending'}`}>
                          {mil.status || 'SCHEDULED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: DAILY SHIFT SCHEDULES & RM CHECK */}
      {/* ============================================================ */}
      {activeTab === 'daily' && (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <strong style={{ fontSize: 14 }}>Daily Machine Shift Schedules & BOM Stock Validation</strong>
              <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                Publishes hourly shift targets to operator screen & reserves raw material in stock
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDailyModal(true)}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700 }}
            >
              + Plan Machine Shift
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--line)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Shift & Machine</th>
                  <th style={{ padding: '10px 12px' }}>Part & Mould</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Planned Shots</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Target Output (Pcs)</th>
                  <th style={{ padding: '10px 12px' }}>Required Raw Material (BOM)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading daily schedules...
                    </td>
                  </tr>
                ) : dailySchedules.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No shift schedules defined for today. Click "+ Plan Machine Shift" above.
                    </td>
                  </tr>
                ) : (
                  dailySchedules.map((ds) => (
                    <tr key={ds.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontWeight: 700, fontSize: 11, marginRight: 6 }}>
                          Shift {ds.shift}
                        </span>
                        <strong>{ds.machine_code}</strong>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="shrp-code-pill" style={{ fontSize: 11 }}>{ds.shrp_part_code || ds.part_code}</span>
                          <span style={{ fontWeight: 600 }}>{ds.part_name}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Mould: {ds.mould_code || 'Standard'}</div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700 }}>
                        {Number(ds.planned_shots).toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700, color: 'var(--green)' }}>
                        {Number(ds.planned_qty).toLocaleString()} pcs
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {ds.required_rm_details && Array.isArray(ds.required_rm_details) ? (
                          ds.required_rm_details.map((rm, idx) => (
                            <div key={idx} style={{ fontSize: 11, display: 'flex', gap: 6 }}>
                              <span>• {rm.material_name || rm.material_code}:</span>
                              <strong style={{ color: '#fff' }}>{rm.required_kg} kg</strong>
                              <span className="muted">(avail: {rm.available_kg} kg)</span>
                            </div>
                          ))
                        ) : (
                          <span style={{ fontSize: 11 }}>{Number(ds.required_rm_kg || 0).toFixed(1)} kg allocated</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span className="status-pill status-approved" style={{ fontSize: 10 }}>
                          {ds.status || 'SCHEDULED'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: LIVE PLAN VS ACTUAL MATRIX */}
      {/* ============================================================ */}
      {activeTab === 'plan_vs_actual' && (
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <strong style={{ fontSize: 14 }}>Monthly Customer Plan vs Produced vs Dispatched vs FG Stock ({selectedMonth})</strong>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
              Live reconciliation across ERP schedule, shopfloor production, and dispatch register
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--line)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 12px' }}>Program & Part Code</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Customer Plan</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actual Produced</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Dispatched</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Current FG Stock</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Pending vs Plan</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Plan Adherence</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                      Loading plan vs actual tracker...
                    </td>
                  </tr>
                ) : planVsActual.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No production comparison records for {selectedMonth}.
                    </td>
                  </tr>
                ) : (
                  planVsActual.map((pva, idx) => {
                    const planQty = Number(pva.customer_plan_qty) || 0;
                    const prodQty = Number(pva.produced_qty) || 0;
                    const dispQty = Number(pva.dispatched_qty) || 0;
                    const fgStock = Number(pva.fg_stock_qty) || 0;
                    const pendingQty = Math.max(0, planQty - prodQty);
                    const adherencePct = planQty > 0 ? Math.round((prodQty / planQty) * 100) : 100;

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="shrp-code-pill" style={{ fontSize: 11 }}>{pva.shrp_part_code || pva.part_code}</span>
                            <span style={{ fontWeight: 600 }}>{pva.part_name}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{pva.program || 'Hanon'}</div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700, color: 'var(--amber)' }}>
                          {planQty.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700, color: '#60a5fa' }}>
                          {prodQty.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700, color: 'var(--green)' }}>
                          {dispQty.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700, color: '#c084fc' }}>
                          {fgStock.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-num)', fontWeight: 700, color: '#f87171' }}>
                          {pendingQty.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${Math.min(100, adherencePct)}%`,
                                  height: '100%',
                                  background: adherencePct >= 90 ? 'var(--green)' : adherencePct >= 60 ? 'var(--amber)' : 'var(--red)',
                                }}
                              />
                            </div>
                            <span style={{ fontFamily: 'var(--font-num)', fontWeight: 700, fontSize: 11 }}>{adherencePct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: IMPORT MPS EXCEL */}
      {/* ============================================================ */}
      {showUploadModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
        }}>
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12,
            width: '100%', maxWidth: 460, padding: 20, boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: 16 }}>📥 Import Master Production Schedule (MPS)</strong>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
              Select customer monthly MPS spreadsheet (.xlsx / .xls) to parse vehicle programs, monthly gross demand, and net receipts targets.
            </p>

            <form onSubmit={handleUploadMps} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Target Month *</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Excel File (.xlsx / .xls) *</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: 12 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
                >
                  {uploading ? 'Parsing Excel...' : 'Upload & Parse Matrix'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: >15% VARIANCE CONFIRMATION */}
      {/* ============================================================ */}
      {varianceAlert && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
        }}>
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--amber)', borderRadius: 12,
            width: '100%', maxWidth: 500, padding: 20, boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 22 }}>⚠️</span>
              <strong style={{ fontSize: 16, color: 'var(--amber)' }}>Confirm MPS Demand Variance (&gt; 15%)</strong>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px' }}>
              {varianceAlert.count} part schedule(s) have significant delta between Gross Customer Demand and Net Receipts Target. A reason is required for audit.
            </p>

            <div style={{ maxHeight: 160, overflowY: 'auto', background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 6, border: '1px solid var(--line)', marginBottom: 12 }}>
              {varianceAlert.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
                  <div>
                    <strong>{item.shrp_part_code || item.part_code}</strong> ({item.program || 'Program'})
                  </div>
                  <div style={{ fontFamily: 'var(--font-num)', color: 'var(--amber)' }}>
                    Demand: {Number(item.gross_demand_qty).toLocaleString()} → Target: {Number(item.net_production_target_qty).toLocaleString()} ({item.variance_pct}%)
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                Variance Explanation & Confirmation Reason *
              </label>
              <textarea
                rows={2}
                required
                placeholder="e.g. Safety buffer for Diwali transit delays / customer line buffer build"
                value={confirmReason}
                onChange={(e) => setConfirmReason(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setVarianceAlert(null)}
                className="btn btn-secondary"
                style={{ padding: '8px 14px', fontSize: 12 }}
              >
                Dismiss
              </button>
              <button
                type="button"
                disabled={!confirmReason.trim()}
                onClick={handleConfirmVariance}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
              >
                Confirm & Save Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: NEW DELIVERY MILESTONE */}
      {/* ============================================================ */}
      {showMilestoneModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
        }}>
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12,
            width: '100%', maxWidth: 480, padding: 20, boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: 16 }}>🚚 Create Customer Delivery Schedule</strong>
              <button
                type="button"
                onClick={() => setShowMilestoneModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Select Part *</label>
                <SearchableSelect
                  value={milestoneForm.part_id}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, part_id: e.target.value })}
                  options={parts}
                  placeholder="Select Part..."
                  searchPlaceholder="🔍 Type part code or name..."
                  getOptionValue={(p) => p.id}
                  getOptionLabel={(p) => p.part_name}
                  getOptionBadge={(p) => p.shrp_part_code || p.part_code}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Delivery Due Date *</label>
                  <input
                    type="date"
                    required
                    value={milestoneForm.milestone_date}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, milestone_date: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Quantity (Pcs) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5000"
                    value={milestoneForm.quantity}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, quantity: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Program / PO Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Hanon Pune Line-2"
                  value={milestoneForm.program}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, program: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: 12 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
                >
                  Schedule Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: NEW DAILY SHIFT SCHEDULE */}
      {/* ============================================================ */}
      {showDailyModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
        }}>
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12,
            width: '100%', maxWidth: 500, padding: 20, boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: 16 }}>⚙️ Plan Machine Shift Schedule</strong>
              <button
                type="button"
                onClick={() => setShowDailyModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDaily} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Date *</label>
                  <input
                    type="date"
                    required
                    value={dailyForm.plan_date}
                    onChange={(e) => setDailyForm({ ...dailyForm, plan_date: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Shift *</label>
                  <select
                    value={dailyForm.shift}
                    onChange={(e) => setDailyForm({ ...dailyForm, shift: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                  >
                    <option value="A">Shift A (07:00 - 15:30)</option>
                    <option value="B">Shift B (15:30 - 00:00)</option>
                    <option value="C">Shift C (00:00 - 07:00)</option>
                    <option value="G">General Shift (08:30 - 17:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Target Machine *</label>
                <SearchableSelect
                  value={dailyForm.machine_id}
                  onChange={(e) => setDailyForm({ ...dailyForm, machine_id: e.target.value })}
                  options={machines}
                  placeholder="Select Machine..."
                  searchPlaceholder="🔍 Type machine code..."
                  getOptionValue={(m) => m.id}
                  getOptionLabel={(m) => m.machine_code + (m.tonnage ? ` (${m.tonnage}T)` : '')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Part to Produce *</label>
                <SearchableSelect
                  value={dailyForm.part_id}
                  onChange={(e) => setDailyForm({ ...dailyForm, part_id: e.target.value })}
                  options={parts}
                  placeholder="Select Part..."
                  searchPlaceholder="🔍 Type part code or name..."
                  getOptionValue={(p) => p.id}
                  getOptionLabel={(p) => p.part_name}
                  getOptionBadge={(p) => p.shrp_part_code || p.part_code}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Planned Shots *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={dailyForm.planned_shots}
                    onChange={(e) => setDailyForm({ ...dailyForm, planned_shots: Number(e.target.value), planned_qty: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Planned Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={dailyForm.planned_hours}
                    onChange={(e) => setDailyForm({ ...dailyForm, planned_hours: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowDailyModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: 12 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700 }}
                >
                  Publish Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
