import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

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
        setMpsList(Array.isArray(res) ? res : []);
      } else if (activeTab === 'milestones') {
        const res = await api.planning.getMilestones('', selectedMonth);
        setMilestones(Array.isArray(res) ? res : []);
      } else if (activeTab === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        const res = await api.planning.getDailySchedules(today);
        setDailySchedules(Array.isArray(res) ? res : []);
      } else if (activeTab === 'plan_vs_actual') {
        const res = await api.planning.getPlanVsActual(selectedMonth);
        setPlanVsActual(Array.isArray(res) ? res : []);
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
          excel_base64: base64,
          month_year: selectedMonth,
        });

        // Check if there are >15% variances that require user confirmation
        const highVariances = res.imported?.filter((item) => item.is_high_variance);
        if (highVariances && highVariances.length > 0) {
          setVarianceAlert({
            mps_ids: highVariances.map((h) => h.id),
            count: highVariances.length,
            items: highVariances,
          });
        }

        setSuccessMsg(`Successfully imported ${res.imported_count} MPS schedules for ${selectedMonth}!`);
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl text-2xl font-bold">
              📊
            </span>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Production Planning & Customer Schedules
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly Master Production Schedule (MPS), Transit Backward Scheduling & Shift Targets
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm"
          />
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow inline-flex items-center gap-2"
          >
            <span>📥</span> Import MPS Excel
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 font-bold">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 font-bold">✕</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto">
        {[
          { id: 'mps', label: '1. Master Schedule (MPS)', icon: '📅' },
          { id: 'milestones', label: '2. Customer Transit Lead-Time Offsets', icon: '🚚' },
          { id: 'daily', label: '3. Daily Shift Schedules & RM Check', icon: '⚙️' },
          { id: 'plan_vs_actual', label: '4. Live Plan vs Actual Matrix', icon: '📈' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-bold rounded-t-xl transition border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: MPS VIEW */}
      {activeTab === 'mps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Master Production Schedule (MPS) for {selectedMonth}
            </h2>
            <span className="text-xs text-slate-500">Total Program Schedules: {mpsList.length}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Program / Customer</th>
                    <th className="p-3">Part Code & Name</th>
                    <th className="p-3 text-right">Gross Demand (Pcs)</th>
                    <th className="p-3 text-right">Receipts Target (Pcs)</th>
                    <th className="p-3 text-right">Req. RM (Kg)</th>
                    <th className="p-3 text-center">Variance %</th>
                    <th className="p-3 text-center">Audit Status</th>
                    <th className="p-3">Forecast Breakdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">Loading MPS data...</td>
                    </tr>
                  ) : mpsList.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        No MPS loaded for {selectedMonth}. Click "Import MPS Excel" above to upload customer schedule.
                      </td>
                    </tr>
                  ) : (
                    mpsList.map((m) => {
                      const isHighVar = Math.abs(Number(m.variance_pct) || 0) > 15;
                      return (
                        <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">
                            <div>{m.program || 'Standard Program'}</div>
                            <div className="text-[11px] text-slate-400 font-normal">{m.customer_name || 'Customer Demand'}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{m.shrp_part_code || m.part_code}</span>
                            <div className="text-[11px] text-slate-500">{m.part_name}</div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold">{Number(m.gross_demand_qty).toLocaleString()}</td>
                          <td className="p-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {Number(m.net_production_target_qty).toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                            {Number(m.required_rm_kg || 0).toFixed(1)} kg
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                isHighVar
                                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {m.variance_pct ? `${m.variance_pct}%` : '0%'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            {m.variance_confirmed_by ? (
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-semibold" title={`Confirmed: ${m.variance_confirm_reason}`}>
                                ✓ Audited
                              </span>
                            ) : isHighVar ? (
                              <button
                                onClick={() =>
                                  setVarianceAlert({
                                    mps_ids: [m.id],
                                    count: 1,
                                    items: [m],
                                  })
                                }
                                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold shadow-sm"
                              >
                                ! Confirm Variance
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">Normal</span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {m.forecast_periods?.map((fp) => (
                                <span
                                  key={fp.id}
                                  className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                >
                                  {fp.period_label}: <b className="text-slate-900 dark:text-white">{Number(fp.quantity).toLocaleString()}</b>
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
        </div>
      )}

      {/* TAB 2: CUSTOMER MILESTONES & TRANSIT LEAD TIME */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Customer Delivery Milestones & Backward Scheduling
              </h2>
              <p className="text-xs text-slate-500">
                Automatic Lead-Time Offsets: Pune (7d transit), Bhiwadi (12d transit), Chennai (1-week buffer)
              </p>
            </div>
            <button
              onClick={() => setShowMilestoneModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow inline-flex items-center gap-1.5"
            >
              <span>+</span> Add Delivery Schedule
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Customer & Plant</th>
                    <th className="p-3">Part Details</th>
                    <th className="p-3 text-right">Scheduled Qty</th>
                    <th className="p-3">Customer Delivery Date</th>
                    <th className="p-3">Transit Lead Time</th>
                    <th className="p-3">Recommended Production Start</th>
                    <th className="p-3 text-right">Dispatched Qty</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">Loading delivery milestones...</td>
                    </tr>
                  ) : milestones.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-slate-400">
                        No delivery milestones logged. Create one using the button above.
                      </td>
                    </tr>
                  ) : (
                    milestones.map((mil) => {
                      const transitDays = mil.transit_lead_days || 0;
                      return (
                        <tr key={mil.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white">
                            <div>{mil.customer_name || 'Hanon Systems'}</div>
                            <div className="text-[11px] text-blue-600 font-normal">{mil.plant_location || 'Pune / Bhiwadi'}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">{mil.shrp_part_code || mil.part_code}</span>
                            <div className="text-[11px] text-slate-500">{mil.part_name}</div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {Number(mil.quantity).toLocaleString()} pcs
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-900 dark:text-white">
                            {mil.milestone_date}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded font-semibold text-[11px]">
                              {transitDays} days offset
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {mil.scheduled_prod_date || mil.milestone_date}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {Number(mil.dispatched_qty || 0).toLocaleString()} pcs
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                mil.status === 'COMPLETED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {mil.status || 'SCHEDULED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DAILY MACHINE SCHEDULES & RM CHECK */}
      {activeTab === 'daily' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Daily Machine Shift Schedules & BOM Stock Validation
              </h2>
              <p className="text-xs text-slate-500">
                Publishes hourly shift targets to operator screen & reserves raw material in stock
              </p>
            </div>
            <button
              onClick={() => setShowDailyModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow inline-flex items-center gap-1.5"
            >
              <span>+</span> Plan Machine Shift
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Shift & Machine</th>
                    <th className="p-3">Part & Mould</th>
                    <th className="p-3 text-right">Planned Shots</th>
                    <th className="p-3 text-right">Target Output (Pcs)</th>
                    <th className="p-3">Required Raw Material (BOM)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">Loading daily schedules...</td>
                    </tr>
                  ) : dailySchedules.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400">
                        No shift schedules defined for today. Click "Plan Machine Shift" above to allocate production.
                      </td>
                    </tr>
                  ) : (
                    dailySchedules.map((ds) => (
                      <tr key={ds.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-bold mr-2">
                            Shift {ds.shift}
                          </span>
                          <span>{ds.machine_code}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{ds.shrp_part_code || ds.part_code}</span>
                          <div className="text-[11px] text-slate-500">{ds.part_name} | Mould: {ds.mould_code || 'Standard'}</div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold">{Number(ds.planned_shots).toLocaleString()}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {Number(ds.planned_qty).toLocaleString()} pcs
                        </td>
                        <td className="p-3">
                          <div className="text-[11px] text-slate-600 dark:text-slate-300">
                            {ds.required_rm_details && Array.isArray(ds.required_rm_details) ? (
                              ds.required_rm_details.map((rm, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <span>• {rm.material_name || rm.material_code}:</span>
                                  <b className="text-slate-900 dark:text-white">{rm.required_kg} kg</b>
                                  <span className="text-[10px] text-slate-400">(avail: {rm.available_kg} kg)</span>
                                </div>
                              ))
                            ) : (
                              <span>{Number(ds.required_rm_kg || 0).toFixed(1)} kg allocated</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-[10px]">
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
        </div>
      )}

      {/* TAB 4: LIVE PLAN VS ACTUAL MATRIX */}
      {activeTab === 'plan_vs_actual' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Customer Plan vs Produced vs Dispatched vs FG Stock ({selectedMonth})
              </h2>
              <p className="text-xs text-slate-500">
                Live end-to-end reconciliation tracker across ERP schedule, shopfloor production, and dispatch register
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Program & Part Code</th>
                    <th className="p-3 text-right">Customer Plan (Pcs)</th>
                    <th className="p-3 text-right">Actual Produced (Pcs)</th>
                    <th className="p-3 text-right">Dispatched (Pcs)</th>
                    <th className="p-3 text-right">Current FG Stock</th>
                    <th className="p-3 text-right">Pending vs Plan</th>
                    <th className="p-3 text-center">Plan Adherence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">Loading plan vs actual tracker...</td>
                    </tr>
                  ) : planVsActual.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">
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
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="font-mono font-bold text-slate-900 dark:text-white">{pva.shrp_part_code || pva.part_code}</div>
                            <div className="text-[11px] text-slate-500">{pva.part_name} ({pva.program || 'Hanon'})</div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            {planQty.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {prodQty.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {dispQty.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                            {fgStock.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            {pendingQty.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <div className="inline-flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    adherencePct >= 90 ? 'bg-emerald-500' : adherencePct >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(100, adherencePct)}%` }}
                                ></div>
                              </div>
                              <span className="font-mono font-bold text-[11px]">{adherencePct}%</span>
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
        </div>
      )}

      {/* MODAL: Import MPS Excel */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Import Master Production Schedule (MPS)
            </h3>
            <p className="text-xs text-slate-500">
              Select monthly MPS Excel file (e.g., Sri Hari MPS / Hanon Bhiwadi & Pune split sheets).
            </p>

            <form onSubmit={handleUploadMps} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Excel Spreadsheet (.xlsx / .xls)
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  required
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {uploading ? 'Processing Matrix...' : 'Upload & Parse Matrix'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: >15% Variance Confirmation */}
      {varianceAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 border border-amber-300 dark:border-amber-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-amber-100 dark:bg-amber-950 text-amber-600 rounded-xl text-xl">⚠️</span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confirm MPS Demand Variance (&gt; 15%)
                </h3>
                <p className="text-xs text-slate-500">
                  {varianceAlert.count} part schedule(s) have significant delta between Gross Customer Demand and Net Receipts Target.
                </p>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
              {varianceAlert.items?.map((item) => (
                <div key={item.id} className="py-2 text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold">{item.shrp_part_code || item.part_code}</span>
                    <span className="text-slate-400 ml-1">({item.program || 'Program'})</span>
                  </div>
                  <div className="text-right font-mono">
                    Demand: {Number(item.gross_demand_qty).toLocaleString()} | Target: {Number(item.net_production_target_qty).toLocaleString()} ({item.variance_pct}%)
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Variance Explanation & Confirmation Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Approved safety buffer for Diwali transit delays / customer line buffer build"
                value={confirmReason}
                onChange={(e) => setConfirmReason(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVarianceAlert(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                Dismiss
              </button>
              <button
                type="button"
                disabled={!confirmReason.trim()}
                onClick={handleConfirmVariance}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 shadow"
              >
                Confirm & Audit Variance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: New Milestone Schedule */}
      {showMilestoneModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Create Customer Delivery Schedule
            </h3>

            <form onSubmit={handleCreateMilestone} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Part</label>
                  <select
                    required
                    value={milestoneForm.part_id}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, part_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="">Select Part</option>
                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>{p.shrp_part_code || p.part_code} - {p.part_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity (Pcs)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5000"
                    value={milestoneForm.quantity}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Delivery Due Date</label>
                  <input
                    type="date"
                    required
                    value={milestoneForm.milestone_date}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, milestone_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Program / PO Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. Hanon Pune Line-2"
                    value={milestoneForm.program}
                    onChange={(e) => setMilestoneForm({ ...milestoneForm, program: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMilestoneModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  Schedule Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: New Daily Shift Schedule */}
      {showDailyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Plan Machine Shift Schedule & BOM Reservation
            </h3>

            <form onSubmit={handleCreateDaily} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={dailyForm.plan_date}
                    onChange={(e) => setDailyForm({ ...dailyForm, plan_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Shift</label>
                  <select
                    value={dailyForm.shift}
                    onChange={(e) => setDailyForm({ ...dailyForm, shift: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="A">Shift A (07:00 - 15:30)</option>
                    <option value="B">Shift B (15:30 - 00:00)</option>
                    <option value="C">Shift C (00:00 - 07:00)</option>
                    <option value="G">General Shift (08:30 - 17:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Machine</label>
                  <select
                    required
                    value={dailyForm.machine_id}
                    onChange={(e) => setDailyForm({ ...dailyForm, machine_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="">Select Machine</option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>{m.machine_code} - {m.tonnage || 0}T</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Part</label>
                  <select
                    required
                    value={dailyForm.part_id}
                    onChange={(e) => setDailyForm({ ...dailyForm, part_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="">Select Part</option>
                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>{p.shrp_part_code || p.part_code} ({p.part_name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Planned Shots</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={dailyForm.planned_shots}
                    onChange={(e) => {
                      const shots = Number(e.target.value);
                      setDailyForm({
                        ...dailyForm,
                        planned_shots: shots,
                        planned_qty: shots, // will be auto-calculated with cavities
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Planned Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={dailyForm.planned_hours}
                    onChange={(e) => setDailyForm({ ...dailyForm, planned_hours: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDailyModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow"
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
