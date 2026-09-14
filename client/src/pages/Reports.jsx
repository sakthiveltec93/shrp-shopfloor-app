import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getFirstOfMonthStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

// Convert table data to downloadable CSV with UTF-8 BOM for Microsoft Excel
function downloadCSV(filename, rows, customHeaders = null) {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }
  const headers = customHeaders || Object.keys(rows[0]);
  const headerKeys = customHeaders ? Object.keys(customHeaders) : headers;
  const headerLabels = customHeaders ? Object.values(customHeaders) : headers;

  const csvRows = [
    headerLabels.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
  ];

  for (const row of rows) {
    const values = headerKeys.map((key) => {
      const val = row[key];
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily', 'process', 'trend'
  const [date, setDate] = useState(getTodayStr());
  const [shift, setShift] = useState('ALL');
  const [startDate, setStartDate] = useState(getFirstOfMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());

  const [dailyData, setDailyData] = useState(null);
  const [processData, setProcessData] = useState(null);
  const [trendData, setTrendData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState('');

  // Load Daily Summary
  useEffect(() => {
    if (activeTab === 'daily') {
      setLoading(true);
      setError('');
      api.reports
        .dailySummary(date, shift)
        .then(setDailyData)
        .catch((err) => setError(err.message || 'Failed to load daily summary'))
        .finally(() => setLoading(false));
    }
  }, [activeTab, date, shift]);

  // Load Process Summary
  useEffect(() => {
    if (activeTab === 'process') {
      setLoading(true);
      setError('');
      api.reports
        .processSummary(date)
        .then(setProcessData)
        .catch((err) => setError(err.message || 'Failed to load process summary'))
        .finally(() => setLoading(false));
    }
  }, [activeTab, date]);

  // Load Trend Summary
  useEffect(() => {
    if (activeTab === 'trend') {
      setLoading(true);
      setError('');
      api.reports
        .trendSummary(startDate, endDate)
        .then(setTrendData)
        .catch((err) => setError(err.message || 'Failed to load trend summary'))
        .finally(() => setLoading(false));
    }
  }, [activeTab, startDate, endDate]);

  // Export raw stage data
  async function handleExportStage(stage, stageName) {
    setExportLoading(stage);
    try {
      const data = await api.reports.stageRaw(stage, date);
      downloadCSV(`SHRP_${stageName}_${date}`, data);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExportLoading('');
    }
  }

  // Export current daily table
  function handleExportDailyTable() {
    if (!dailyData || !dailyData.machine_performance) return;
    const headers = {
      machine_code: 'Machine No',
      status: 'Status',
      parts: 'Part Codes',
      operators: 'Operators',
      shots: 'Shots',
      production_qty: 'Gross Production Qty',
      ok_qty: 'OK Qty',
      reject_qty: 'Reject Qty',
      run_time_str: 'Run Time (HH:MM)',
      idle_time_str: 'Idle Time (HH:MM)',
      part_weight_kg: 'Part Wt (kg)',
      runner_weight_kg: 'Runner Wt (kg)',
      reject_weight_kg: 'Reject Wt (kg)',
      lumps_weight_kg: 'Lumps Wt (kg)',
      efficiency_pct: 'Efficiency %',
      oee_availability_pct: 'OEE Availability %',
    };
    downloadCSV(`SHRP_Daily_Machine_Summary_${date}_Shift_${shift}`, dailyData.machine_performance, headers);
  }

  // Export operator leaderboard
  function handleExportOperators() {
    if (!dailyData || !dailyData.operator_performance) return;
    const headers = {
      rank: 'Rank',
      operator_name: 'Operator Name',
      run_time_str: 'Run Time (HH:MM)',
      production_qty: 'Production Qty',
      ok_qty: 'OK Qty',
      reject_qty: 'Reject Qty',
      reject_rate_pct: 'Rejection %',
      efficiency_pct: 'Efficiency %',
      balanced_score: 'Balanced Score (100 Max)',
    };
    downloadCSV(`SHRP_Operator_Performance_${date}`, dailyData.operator_performance, headers);
  }

  // Export historical trends
  function handleExportTrends() {
    if (!trendData) return;
    const headers = {
      date: 'Date',
      running_machines: 'Running Machines',
      machine_utilisation_pct: 'Machine Utilisation %',
      parts_produced: 'Gross Parts Produced',
      ok_parts: 'OK Parts',
      total_rejection: 'Total Rejection',
      rejection_pct: 'Scrap %',
      overall_efficiency_pct: 'Overall Efficiency %',
      part_material_kg: 'Part Mat (kg)',
      runner_material_kg: 'Runner Mat (kg)',
      reject_material_kg: 'Scrap Mat (kg)',
      lumps_material_kg: 'Lumps Mat (kg)',
      total_material_kg: 'Total Material (kg)',
    };
    downloadCSV(`SHRP_Historical_Trends_${startDate}_to_${endDate}`, trendData, headers);
  }

  return (
    <div className="screen reports-screen" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Header & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h1 className="screen-title" style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📊</span> Production & Process Reports
          </h1>
          <p className="screen-sub" style={{ margin: 0 }}>
            Executive KPI tracking, machine efficiency, operator balanced scores, and IATF audit trail
          </p>
        </div>

        {/* Global Export & Print Toolbar */}
        <div className="no-print" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => window.print()}
            style={{ width: 'auto', padding: '8px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>🖨️</span> Print / PDF
          </button>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <select
              style={{ padding: '8px 12px', fontSize: 12, background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--line)', borderRadius: 6 }}
              onChange={(e) => {
                if (!e.target.value) return;
                const [type, stage] = e.target.value.split(':');
                if (type === 'stage') handleExportStage(stage, stage.toUpperCase());
                else if (type === 'daily') handleExportDailyTable();
                else if (type === 'operator') handleExportOperators();
                else if (type === 'trend') handleExportTrends();
                e.target.value = '';
              }}
              defaultValue=""
            >
              <option value="" disabled>📥 Export Excel / CSV ▾</option>
              <option value="daily:table">📄 Daily Machine Summary</option>
              <option value="operator:table">🏆 Operator Leaderboard</option>
              <option value="stage:production">⚙️ Hourly Production Log</option>
              <option value="stage:bag">◧ Bagging & Weighing Log</option>
              <option value="stage:trimming">✂️ Trimming Entries</option>
              <option value="stage:inspection">◎ Inspection Entries</option>
              <option value="stage:packing">▧ Packing Entries</option>
              <option value="stage:dispatch">🚚 Dispatch Records</option>
              <option value="trend:table">📈 Historical Trends (Range)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="no-print" style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
        {[
          { id: 'daily', label: '📊 Daily Production Summary', icon: '📊' },
          { id: 'process', label: '⚙️ Process Daily Summary', icon: '⚙️' },
          { id: 'trend', label: '📈 Historical Trends', icon: '📈' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 700 : 500,
              background: activeTab === tab.id ? 'var(--panel)' : 'transparent',
              color: activeTab === tab.id ? 'var(--amber)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid var(--amber)' : '3px solid transparent',
              cursor: 'pointer',
              borderRadius: '6px 6px 0 0',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="panel no-print" style={{ marginBottom: 20, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {activeTab !== 'trend' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Date:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                />
              </div>

              {activeTab === 'daily' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>Shift:</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {['ALL', '1', '2', '3'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setShift(s)}
                        style={{
                          padding: '6px 12px',
                          fontSize: 12,
                          fontWeight: shift === s ? 700 : 400,
                          background: shift === s ? 'var(--amber)' : 'rgba(255,255,255,0.05)',
                          color: shift === s ? '#000' : 'var(--text)',
                          border: '1px solid var(--line)',
                          borderRadius: 4,
                          cursor: 'pointer',
                        }}
                      >
                        {s === 'ALL' ? 'All Shifts' : `Shift ${s}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: 'auto', padding: '6px 10px', fontSize: 13 }}
                />
              </div>
            </div>
          )}

          <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            {loading ? 'Refreshing report data…' : `Viewing: ${date}`}
          </div>
        </div>
      </div>

      {error && <div className="error-banner" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Printable Header (visible only on print) */}
      <div className="print-only" style={{ display: 'none', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, color: '#000' }}>SHRP PLASTICS PVT LTD</h2>
            <div style={{ fontSize: 12, color: '#333' }}>Shop Floor MES & ERP System — Production Report</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: '#333' }}>
            <div>Date: <strong>{date}</strong> | Shift: <strong>{shift}</strong></div>
            <div>Printed By: {user?.full_name} ({user?.role})</div>
            <div>Generated: {new Date().toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY PRODUCTION SUMMARY                                          */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && dailyData && (
        <div>
          {/* Top 10 KPIs Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Total Shots', val: dailyData.kpis.total_shots?.toLocaleString(), icon: '🎯' },
              { label: 'Production Qty', val: dailyData.kpis.production_qty?.toLocaleString(), icon: '📦' },
              { label: 'OK Qty', val: dailyData.kpis.ok_qty?.toLocaleString(), icon: '✅', color: 'var(--accent)' },
              {
                label: 'Efficiency',
                val: `${dailyData.kpis.efficiency_pct}%`,
                icon: '⚡',
                color: dailyData.kpis.efficiency_pct >= 85 ? 'var(--accent)' : dailyData.kpis.efficiency_pct >= 70 ? 'var(--amber)' : 'var(--red)',
              },
              { label: 'Idle Time', val: dailyData.kpis.idle_time_str, icon: '⏸️' },
              { label: 'Run Time', val: dailyData.kpis.total_run_time_str, icon: '⏱️' },
              { label: 'Part Wt (kg)', val: dailyData.kpis.part_weight_kg, icon: '⚖️' },
              { label: 'Runner Wt (kg)', val: dailyData.kpis.runner_weight_kg, icon: '🔄' },
              { label: 'Total Scrap', val: dailyData.kpis.total_rejection_qty?.toLocaleString(), icon: '❌', color: 'var(--red)' },
              { label: 'Total Material (kg)', val: dailyData.kpis.total_material_kg, icon: '🧱' },
            ].map((kpi, idx) => (
              <div key={idx} className="panel" style={{ padding: '12px 10px', textAlign: 'center', marginBottom: 0 }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{kpi.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: kpi.color || 'var(--text)', letterSpacing: '-0.02em' }}>
                  {kpi.val ?? '0'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>

          {/* Visual Charts: Machine Efficiency & Material Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* Machine Efficiency Horizontal Bar Chart */}
            <div className="panel" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 14, color: 'var(--text)' }}>Machine Efficiency Benchmark</h3>
                <span style={{ fontSize: 11, color: 'var(--accent)' }}>Target: 85%</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dailyData.machine_performance.map((m) => {
                  const eff = Number(m.efficiency_pct) || 0;
                  const barColor = eff >= 85 ? 'var(--accent)' : eff >= 70 ? 'var(--amber)' : eff > 0 ? 'var(--red)' : 'var(--line)';
                  return (
                    <div key={m.machine_id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                      <span style={{ width: 44, fontWeight: 600, color: 'var(--text-muted)' }}>{m.machine_code}</span>
                      <div style={{ flex: 1, height: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(100, eff)}%`,
                            background: barColor,
                            borderRadius: 4,
                            transition: 'width 0.3s ease',
                          }}
                        />
                        {/* 85% Target Indicator Line */}
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: '85%',
                            width: 2,
                            background: 'rgba(255,255,255,0.4)',
                            zIndex: 2,
                          }}
                        />
                      </div>
                      <span style={{ width: 48, textAlign: 'right', fontWeight: 600, color: barColor }}>
                        {eff > 0 ? `${eff}%` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Material Consumption & Scrap Pareto */}
            <div className="panel" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text)' }}>Material Weight Consumption</h3>
                {dailyData.kpis.total_material_kg > 0 ? (
                  <div>
                    {/* Stacked Percentage Bar */}
                    <div style={{ display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
                      <div
                        style={{
                          width: `${(dailyData.kpis.part_weight_kg / dailyData.kpis.total_material_kg) * 100}%`,
                          background: 'var(--accent)',
                        }}
                        title={`Part: ${dailyData.kpis.part_weight_kg} kg`}
                      />
                      <div
                        style={{
                          width: `${(dailyData.kpis.runner_weight_kg / dailyData.kpis.total_material_kg) * 100}%`,
                          background: 'var(--amber)',
                        }}
                        title={`Runner: ${dailyData.kpis.runner_weight_kg} kg`}
                      />
                      <div
                        style={{
                          width: `${(dailyData.kpis.reject_weight_kg / dailyData.kpis.total_material_kg) * 100}%`,
                          background: 'var(--red)',
                        }}
                        title={`Reject: ${dailyData.kpis.reject_weight_kg} kg`}
                      />
                      <div
                        style={{
                          width: `${(dailyData.kpis.lumps_weight_kg / dailyData.kpis.total_material_kg) * 100}%`,
                          background: '#8b5cf6',
                        }}
                        title={`Lumps: ${dailyData.kpis.lumps_weight_kg} kg`}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)' }} />
                        <span>Part Material: <strong>{dailyData.kpis.part_weight_kg} kg</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--amber)' }} />
                        <span>Runner: <strong>{dailyData.kpis.runner_weight_kg} kg</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)' }} />
                        <span>Rejection: <strong>{dailyData.kpis.reject_weight_kg} kg</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: '#8b5cf6' }} />
                        <span>Lumps: <strong>{dailyData.kpis.lumps_weight_kg} kg</strong></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="muted" style={{ fontSize: 12, margin: '20px 0' }}>No bags or weighed material logged yet for this date.</p>
                )}
              </div>

              {/* Rejection Pareto */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 14 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 13, color: 'var(--text-muted)' }}>Top Rejection Reasons (Pareto)</h4>
                {dailyData.rejection_pareto && dailyData.rejection_pareto.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {dailyData.rejection_pareto.slice(0, 4).map((r, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                        <span style={{ color: 'var(--text)' }}>{r.reason}</span>
                        <span style={{ color: 'var(--red)', fontWeight: 600 }}>{r.qty} pcs</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted" style={{ fontSize: 12, margin: 0 }}>Zero rejections reported today (100% First-Pass Yield).</p>
                )}
              </div>
            </div>
          </div>

          {/* Machine Performance Details Table */}
          <div className="panel" style={{ marginBottom: 24, overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>Machine Performance Summary</h3>
              <button
                type="button"
                className="btn btn-secondary no-print"
                onClick={handleExportDailyTable}
                style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
              >
                📥 Export CSV
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '8px 10px' }}>Machine</th>
                  <th style={{ padding: '8px 10px' }}>Status</th>
                  <th style={{ padding: '8px 10px' }}>Part Codes</th>
                  <th style={{ padding: '8px 10px' }}>Operator</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Shots</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Gross Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>OK Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rej Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Run Time</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Idle Time</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Part (kg)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Runner (kg)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Scrap (kg)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Eff %</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.machine_performance.map((m) => {
                  const isRunning = m.production_qty > 0;
                  return (
                    <tr key={m.machine_id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 600 }}>{m.machine_code}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                            background: isRunning ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isRunning ? 'var(--accent)' : 'var(--text-muted)',
                          }}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.parts}
                      </td>
                      <td style={{ padding: '8px 10px', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.operators}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{m.shots || '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{m.production_qty || '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)' }}>{m.ok_qty || '—'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: m.reject_qty > 0 ? 'var(--red)' : 'inherit' }}>
                        {m.reject_qty || 0}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{m.run_time_str}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: m.idle_minutes > 0 ? 'var(--amber)' : 'inherit' }}>
                        {m.idle_time_str}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{m.part_weight_kg || '0.00'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{m.runner_weight_kg || '0.00'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>{m.reject_weight_kg || '0.00'}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: m.efficiency_pct >= 85 ? 'var(--accent)' : m.efficiency_pct > 0 ? 'var(--amber)' : 'inherit' }}>
                        {m.efficiency_pct > 0 ? `${m.efficiency_pct}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 700, background: 'rgba(255,255,255,0.04)', borderTop: '2px solid var(--line)' }}>
                  <td style={{ padding: '10px' }} colSpan={4}>TOTALS</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{dailyData.kpis.total_shots?.toLocaleString()}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{dailyData.kpis.production_qty?.toLocaleString()}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: 'var(--accent)' }}>{dailyData.kpis.ok_qty?.toLocaleString()}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: 'var(--red)' }}>{dailyData.kpis.total_rejection_qty?.toLocaleString()}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{dailyData.kpis.total_run_time_str}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{dailyData.kpis.idle_time_str}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{dailyData.kpis.part_weight_kg}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{dailyData.kpis.runner_weight_kg}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{dailyData.kpis.reject_weight_kg}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: 'var(--accent)' }}>{dailyData.kpis.efficiency_pct}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Operator Performance Leaderboard & Best Operator Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* Best Operator of the Day Showcase Card */}
            {dailyData.best_operator && (
              <div
                className="panel"
                style={{
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
                  border: '1px solid var(--amber)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, background: 'var(--amber)', color: '#000', fontWeight: 800, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase' }}>
                      ★ BEST OPERATOR OF THE DAY
                    </span>
                    <span style={{ fontSize: 24 }}>🏆</span>
                  </div>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: 20, color: 'var(--text)' }}>
                    {dailyData.best_operator.operator_name}
                  </h2>
                  <p className="muted" style={{ fontSize: 12, margin: 0 }}>
                    Highest IATF Balanced Score based on Run Time, Output Qty, Efficiency & Quality Yield.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 14, textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--amber)' }}>{dailyData.best_operator.balanced_score}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Score (100)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{dailyData.best_operator.production_qty}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Output (Pcs)</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>{dailyData.best_operator.efficiency_pct}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Efficiency</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: dailyData.best_operator.reject_rate_pct === 0 ? 'var(--accent)' : 'var(--red)' }}>
                      {dailyData.best_operator.reject_rate_pct}%
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Scrap Rate</div>
                  </div>
                </div>
              </div>
            )}

            {/* Operator Rankings List */}
            <div className="panel" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontSize: 14 }}>Operator Balanced Scorecard (25% Weight)</h3>
                <button
                  type="button"
                  className="btn btn-secondary no-print"
                  onClick={handleExportOperators}
                  style={{ width: 'auto', padding: '2px 8px', fontSize: 11 }}
                >
                  📥 Export
                </button>
              </div>

              {dailyData.operator_performance && dailyData.operator_performance.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>#</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Operator</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Run Time</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Output</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Eff %</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Rej %</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right' }}>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyData.operator_performance.map((op) => (
                        <tr key={op.operator_id} style={{ borderBottom: '1px solid var(--line)' }}>
                          <td style={{ padding: '6px 8px' }}>
                            {op.rank === 1 ? '🥇' : op.rank === 2 ? '🥈' : op.rank === 3 ? '🥉' : op.rank}
                          </td>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>{op.operator_name}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{op.run_time_str}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right' }}>{op.production_qty}</td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: op.efficiency_pct >= 85 ? 'var(--accent)' : 'inherit' }}>
                            {op.efficiency_pct}%
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', color: op.reject_rate_pct > 2 ? 'var(--red)' : 'inherit' }}>
                            {op.reject_rate_pct}%
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--amber)' }}>
                            {op.balanced_score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="muted" style={{ fontSize: 12 }}>No operators active on this date/shift.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROCESS DAILY SUMMARY (TRIMMING, INSPECTION, PACKING)             */}
      {/* ========================================================================= */}
      {activeTab === 'process' && processData && (
        <div>
          {/* Top 4 Process KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div className="panel" style={{ textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>✂️</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                {processData.kpis.trimmed_pieces?.toLocaleString() || 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trimmed Pieces</div>
            </div>

            <div className="panel" style={{ textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>◎</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>
                {processData.kpis.inspected_pieces?.toLocaleString() || 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inspected Pieces</div>
            </div>

            <div className="panel" style={{ textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>📦</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--amber)' }}>
                {processData.kpis.packets_packed?.toLocaleString() || 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Packets Packed</div>
            </div>

            <div className="panel" style={{ textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>🏷️</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
                {processData.kpis.packed_qty?.toLocaleString() || 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Packed Qty</div>
            </div>
          </div>

          {/* 3 Process Tables (Trimming, Inspection, Packing) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 1. Trimming Summary */}
            <div className="panel" style={{ marginBottom: 0, overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>✂️</span> 1. Trimming Summary by Operator
                </h3>
                <button
                  type="button"
                  className="btn btn-secondary no-print"
                  onClick={() => handleExportStage('trimming', 'Trimming')}
                  style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                >
                  📥 Export CSV
                </button>
              </div>

              {processData.trimming && processData.trimming.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Operator Name</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Trim Pieces</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Trim Weight (kg)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Reject Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rework Times</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rework Qty (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processData.trimming.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.operator}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.trim_pieces?.toLocaleString()}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.trim_weight_kg}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.trim_reject_qty}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.rework_times}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.rework_qty_kg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="muted" style={{ fontSize: 12 }}>No trimming entries recorded on this date.</p>
              )}
            </div>

            {/* 2. Inspection Summary */}
            <div className="panel" style={{ marginBottom: 0, overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>◎</span> 2. Inspection Summary by Inspector
                </h3>
                <button
                  type="button"
                  className="btn btn-secondary no-print"
                  onClick={() => handleExportStage('inspection', 'Inspection')}
                  style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                >
                  📥 Export CSV
                </button>
              </div>

              {processData.inspection && processData.inspection.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Inspector Name</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Accepted Pieces</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Accepted (kg)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Reject Pieces</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Reject (kg)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rework Times</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rework Qty (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processData.inspection.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.operator}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 600 }}>
                          {row.accepted_pieces?.toLocaleString()}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.accepted_kg}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', color: row.reject_pieces > 0 ? 'var(--red)' : 'inherit' }}>
                          {row.reject_pieces}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.reject_kg}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.rework_times}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.rework_qty_kg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="muted" style={{ fontSize: 12 }}>No inspection entries recorded on this date.</p>
              )}
            </div>

            {/* 3. Packing Summary */}
            <div className="panel" style={{ marginBottom: 0, overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>▧</span> 3. Packing Summary by Packer
                </h3>
                <button
                  type="button"
                  className="btn btn-secondary no-print"
                  onClick={() => handleExportStage('packing', 'Packing')}
                  style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                >
                  📥 Export CSV
                </button>
              </div>

              {processData.packing && processData.packing.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Packer Name</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Packets Packed</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Packed Qty</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Packed Weight (kg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processData.packing.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.operator}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.packets_packed}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--amber)' }}>
                          {row.packed_qty?.toLocaleString()}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.packed_weight_kg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="muted" style={{ fontSize: 12 }}>No packing entries recorded on this date.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HISTORICAL TRENDS (ALL DATES SUMMARY)                              */}
      {/* ========================================================================= */}
      {activeTab === 'trend' && trendData && (
        <div className="panel" style={{ marginBottom: 20, overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15 }}>All Dates Production & Material Summary</h3>
              <p className="muted" style={{ fontSize: 12, margin: '2px 0 0 0' }}>
                Day-by-day machine utilization, production throughput, scrap rate, and material consumption
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary no-print"
              onClick={handleExportTrends}
              style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
            >
              📥 Export All Dates CSV
            </button>
          </div>

          {trendData.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--line)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '8px 10px' }}>Date</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Running Mc</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Utilisation %</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Produced Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>OK Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rejection</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Scrap %</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Eff %</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Part (kg)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Runner (kg)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Scrap (kg)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>Total Mat (kg)</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.date}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.running_machines}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.machine_utilisation_pct}%</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{row.parts_produced?.toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)' }}>{row.ok_parts?.toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: row.total_rejection > 0 ? 'var(--red)' : 'inherit' }}>
                      {row.total_rejection?.toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: row.rejection_pct > 2 ? 'var(--red)' : 'inherit' }}>
                      {row.rejection_pct}%
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: row.overall_efficiency_pct >= 85 ? 'var(--accent)' : 'inherit' }}>
                      {row.overall_efficiency_pct}%
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.part_material_kg}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.runner_material_kg}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{row.reject_material_kg}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{row.total_material_kg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted" style={{ fontSize: 12, padding: 12 }}>No historical entries found in selected date range.</p>
          )}
        </div>
      )}
    </div>
  );
}
