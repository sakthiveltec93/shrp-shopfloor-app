import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import SearchableSelect from '../components/SearchableSelect';

function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysAgoStr(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
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
  
  // Navigation Tabs: 'daily', 'part360', 'machine360', 'mould360', 'operator360', 'bag360', 'trend'
  const [activeTab, setActiveTab] = useState('daily');
  
  // Universal Timeframe Filter
  const [date, setDate] = useState(getTodayStr());
  const [shift, setShift] = useState('ALL');
  const [startDate, setStartDate] = useState(getFirstOfMonthStr());
  const [endDate, setEndDate] = useState(getTodayStr());

  // Entity Selection Lists
  const [partsList, setPartsList] = useState([]);
  const [machinesList, setMachinesList] = useState([]);
  const [mouldsList, setMouldsList] = useState([]);
  const [operatorsList, setOperatorsList] = useState([]);

  // Selected Entities
  const [selectedPartId, setSelectedPartId] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [selectedMouldId, setSelectedMouldId] = useState('');
  const [selectedOperatorId, setSelectedOperatorId] = useState('');
  const [bagSearchCode, setBagSearchCode] = useState('');

  // 360 Data Stores
  const [dailyData, setDailyData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [part360Data, setPart360Data] = useState(null);
  const [machine360Data, setMachine360Data] = useState(null);
  const [mould360Data, setMould360Data] = useState(null);
  const [operator360Data, setOperator360Data] = useState(null);
  const [bag360Data, setBag360Data] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exportLoading, setExportLoading] = useState('');

  // Load masters for dropdown pickers once
  useEffect(() => {
    Promise.all([
      api.parts().catch(() => []),
      api.machines().catch(() => []),
      api.moulds?.list ? api.moulds.list().catch(() => []) : Promise.resolve([]),
      api.operators ? api.operators().catch(() => []) : api.users().catch(() => []),
    ]).then(([p, m, mo, ops]) => {
      if (p && p.length) { setPartsList(p); if (!selectedPartId) setSelectedPartId(String(p[0].id)); }
      if (m && m.length) { setMachinesList(m); if (!selectedMachineId) setSelectedMachineId(String(m[0].id)); }
      if (mo && mo.length) { setMouldsList(mo); if (!selectedMouldId) setSelectedMouldId(String(mo[0].id)); }
      if (ops && ops.length) { setOperatorsList(ops); if (!selectedOperatorId) setSelectedOperatorId(String(ops[0].id)); }
    });
  }, []);

  // Set quick preset date range
  const applyPreset = (preset) => {
    const today = getTodayStr();
    if (preset === 'today') {
      setDate(today);
      setStartDate(today);
      setEndDate(today);
    } else if (preset === 'yesterday') {
      const yest = getDaysAgoStr(1);
      setDate(yest);
      setStartDate(yest);
      setEndDate(yest);
    } else if (preset === '7d') {
      setStartDate(getDaysAgoStr(7));
      setEndDate(today);
    } else if (preset === '30d') {
      setStartDate(getDaysAgoStr(30));
      setEndDate(today);
    } else if (preset === 'month') {
      setStartDate(getFirstOfMonthStr());
      setEndDate(today);
    } else if (preset === 'all') {
      setStartDate('2026-01-01');
      setEndDate(today);
    }
  };

  // 1. Load Daily Summary
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

  // 2. Load Part 360
  useEffect(() => {
    if (activeTab === 'part360' && selectedPartId) {
      setLoading(true);
      setError('');
      api.reports
        .part360(selectedPartId, startDate, endDate, shift)
        .then(setPart360Data)
        .catch((err) => setError(err.message || 'Failed to load part 360 analytics'))
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedPartId, startDate, endDate, shift]);

  // 3. Load Machine 360
  useEffect(() => {
    if (activeTab === 'machine360' && selectedMachineId) {
      setLoading(true);
      setError('');
      api.reports
        .machine360(selectedMachineId, startDate, endDate, shift)
        .then(setMachine360Data)
        .catch((err) => setError(err.message || 'Failed to load machine 360 analytics'))
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedMachineId, startDate, endDate, shift]);

  // 4. Load Mould 360
  useEffect(() => {
    if (activeTab === 'mould360' && selectedMouldId) {
      setLoading(true);
      setError('');
      api.reports
        .mould360(selectedMouldId, startDate, endDate)
        .then(setMould360Data)
        .catch((err) => setError(err.message || 'Failed to load mould 360 analytics'))
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedMouldId, startDate, endDate]);

  // 5. Load Operator 360
  useEffect(() => {
    if (activeTab === 'operator360' && selectedOperatorId) {
      setLoading(true);
      setError('');
      api.reports
        .operator360(selectedOperatorId, startDate, endDate, shift)
        .then(setOperator360Data)
        .catch((err) => setError(err.message || 'Failed to load operator 360 analytics'))
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedOperatorId, startDate, endDate, shift]);

  // 6. Load Bag 360
  const handleBagSearch = (e) => {
    if (e) e.preventDefault();
    if (!bagSearchCode.trim()) return;
    setLoading(true);
    setError('');
    api.reports
      .bag360(bagSearchCode.trim())
      .then(setBag360Data)
      .catch((err) => setError(err.message || 'Bag not found'))
      .finally(() => setLoading(false));
  };

  // 7. Load Trend Summary
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

  // CSV Export Handlers
  const exportPartHistory = () => {
    if (!part360Data || !part360Data.entries || !part360Data.entries.length) {
      alert('No entries available to export for this part.');
      return;
    }
    const partCode = part360Data.part.shrp_part_code || part360Data.part.part_code;
    const customHeaders = {
      entry_date: 'Production Date',
      shift: 'Shift',
      hour_slot: 'Shift Hour',
      machine_code: 'Machine',
      operator_name: 'Operator',
      start_count: 'Start Count',
      end_count: 'End Count',
      gross_qty: 'Gross Output',
      good_qty: 'Good Qty',
      reject_qty: 'Scrap Qty',
      target_cycle_time_sec: 'Target Cycle Time (s)',
      actual_cycle_time_sec: 'Actual Cycle Time (s)',
      cycle_efficiency_pct: 'Cycle Efficiency %',
      efficiency_pct: 'Hourly Efficiency %',
      remarks: 'Remarks',
    };
    downloadCSV(`SHRP_Part_History_${partCode}_${startDate}_to_${endDate}`, part360Data.entries, customHeaders);
  };

  const exportMachineHistory = () => {
    if (!machine360Data || !machine360Data.entries || !machine360Data.entries.length) {
      alert('No entries available to export for this machine.');
      return;
    }
    const mCode = machine360Data.machine.machine_code;
    const customHeaders = {
      entry_date: 'Production Date',
      shift: 'Shift',
      hour_slot: 'Hour',
      shrp_part_code: 'SHRP Part Code',
      part_name: 'Part Name',
      operator_name: 'Operator',
      start_count: 'Start Count',
      end_count: 'End Count',
      gross_qty: 'Gross Output',
      good_qty: 'Good Qty',
      reject_qty: 'Reject Qty',
      efficiency_pct: 'Efficiency %',
      remarks: 'Remarks',
    };
    downloadCSV(`SHRP_Machine_History_${mCode}_${startDate}_to_${endDate}`, machine360Data.entries, customHeaders);
  };

  const exportOperatorHistory = () => {
    if (!operator360Data || !operator360Data.entries || !operator360Data.entries.length) {
      alert('No entries available to export for this operator.');
      return;
    }
    const opName = operator360Data.operator.full_name || operator360Data.operator.username;
    const customHeaders = {
      entry_date: 'Date',
      shift: 'Shift',
      hour_slot: 'Hour',
      machine_code: 'Machine',
      shrp_part_code: 'Part Code',
      part_name: 'Part Name',
      good_qty: 'Good Qty',
      reject_qty: 'Reject Qty',
      efficiency_pct: 'Efficiency %',
      remarks: 'Remarks',
    };
    downloadCSV(`SHRP_Operator_History_${opName}_${startDate}_to_${endDate}`, operator360Data.entries, customHeaders);
  };

  return (
    <div className="screen">
      {/* Header Title */}
      <div style={{ marginBottom: 16 }}>
        <h1 className="screen-title" style={{ margin: 0 }}>Reports</h1>
      </div>

      {/* Main Navigation Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 16,
        background: 'rgba(255,255,255,0.04)',
        padding: 4,
        borderRadius: 8,
        border: '1px solid var(--line)'
      }}>
        {[
          { id: 'daily', label: '📊 Daily Summary', icon: '📊' },
          { id: 'part360', label: '🧩 Part 360°', icon: '🧩' },
          { id: 'machine360', label: '🖥️ Machine 360°', icon: '🖥️' },
          { id: 'mould360', label: '⚙️ Mould 360°', icon: '⚙️' },
          { id: 'operator360', label: '👤 Operator 360°', icon: '👤' },
          { id: 'bag360', label: '🎒 Bag Trace 360°', icon: '🎒' },
          { id: 'trend', label: '📈 Trend Analytics', icon: '📈' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="btn"
            style={{
              flex: '1 1 auto',
              minWidth: 110,
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 700 : 500,
              background: activeTab === tab.id ? 'var(--amber)' : 'transparent',
              color: activeTab === tab.id ? '#000' : 'var(--text)',
              border: 'none',
              borderRadius: 6,
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Universal Timeframe & Preset Toolbar (Visible across multi-date tabs) */}
      {['part360', 'machine360', 'mould360', 'operator360', 'trend'].includes(activeTab) && (
        <div className="panel" style={{ padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📅 Timeframe & Range Filter
            </span>
            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: '7d', label: 'Last 7D' },
                { id: '30d', label: 'Last 30D' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All Time' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  style={{
                    padding: '3px 8px',
                    fontSize: 11,
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text)',
                    border: '1px solid var(--line)',
                    cursor: 'pointer'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: 11 }}>Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: 11 }}>End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            {['part360', 'machine360', 'operator360'].includes(activeTab) && (
              <div className="field" style={{ margin: 0 }}>
                <label style={{ fontSize: 11 }}>Shift</label>
                <select value={shift} onChange={(e) => setShift(e.target.value)}>
                  <option value="ALL">All Shifts</option>
                  <option value="A">Shift A</option>
                  <option value="B">Shift B</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <div className="error-banner" style={{ marginBottom: 14 }}>{error}</div>}

      {/* ========================================================================= */}
      {/* TAB 1: DAILY SUMMARY                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <div>
          <div className="panel" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, padding: 12, marginBottom: 16 }}>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="daily_date">Select Date</label>
              <input id="daily_date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="daily_shift">Shift</label>
              <select id="daily_shift" value={shift} onChange={(e) => setShift(e.target.value)}>
                <option value="ALL">All Shifts</option>
                <option value="A">Shift A</option>
                <option value="B">Shift B</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="muted">Loading daily report...</p>
          ) : dailyData ? (
            <div>
              {/* Executive Metrics Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, marginBottom: 16 }}>
                <div className="readout" style={{ padding: 10 }}>
                  <div className="readout-label" style={{ fontSize: 10 }}>Total Produced</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--amber)' }}>{dailyData.kpis?.production_qty ?? dailyData.kpis?.total_production_qty ?? 0}</div>
                </div>
                <div className="readout" style={{ padding: 10 }}>
                  <div className="readout-label" style={{ fontSize: 10 }}>Good Qty</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>{dailyData.kpis?.ok_qty ?? dailyData.kpis?.total_ok_qty ?? 0}</div>
                </div>
                <div className="readout" style={{ padding: 10 }}>
                  <div className="readout-label" style={{ fontSize: 10 }}>Rejection Qty</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: (dailyData.kpis?.total_rejection_qty || 0) > 0 ? 'var(--red)' : 'var(--text)' }}>
                    {dailyData.kpis?.total_rejection_qty ?? 0}
                  </div>
                </div>
                <div className="readout" style={{ padding: 10 }}>
                  <div className="readout-label" style={{ fontSize: 10 }}>Run Time</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{dailyData.kpis?.total_run_time_str ?? '0:00'}</div>
                </div>
                <div className="readout" style={{ padding: 10 }}>
                  <div className="readout-label" style={{ fontSize: 10 }}>Efficiency</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--amber)' }}>{dailyData.kpis?.efficiency_pct ?? 0}%</div>
                </div>
              </div>

              {/* Machine Production Table */}
              <div className="panel" style={{ overflowX: 'auto', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--text)' }}>Machine Output Summary</div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Machine</th>
                      <th>Parts</th>
                      <th>Shots</th>
                      <th>Good</th>
                      <th>Rej</th>
                      <th>Eff %</th>
                      <th>Idle (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dailyData.machine_performance || []).map((e, idx) => (
                      <tr key={idx}>
                        <td><strong>{e.machine_code}</strong></td>
                        <td>{e.parts || '—'}</td>
                        <td>{e.shots || 0}</td>
                        <td style={{ color: 'var(--green)' }}>{e.ok_qty || 0}</td>
                        <td style={{ color: (e.reject_qty || 0) > 0 ? 'var(--red)' : 'inherit' }}>{e.reject_qty || 0}</td>
                        <td>{e.efficiency_pct ?? 0}%</td>
                        <td>{e.idle_time_str || '0:00'}</td>
                      </tr>
                    ))}
                    {(!dailyData.machine_performance || dailyData.machine_performance.length === 0) && (
                      <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No production entries for this date/shift.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PART 360° DEEP DIVE & CYCLE TIMES                                   */}
      {/* ========================================================================= */}
      {activeTab === 'part360' && (
        <div>
          <div className="panel" style={{ padding: '12px 14px', marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              🔍 Select Part to Analyze & Download History
            </label>
            <SearchableSelect
              id="part-select-360"
              value={selectedPartId}
              onChange={(e) => setSelectedPartId(e.target.value)}
              options={partsList}
              placeholder="-- Choose Part --"
              searchPlaceholder="🔍 Type part code, name, customer no..."
              getOptionValue={(p) => p.id}
              getOptionLabel={(p) => p.part_name}
              getOptionBadge={(p) => p.shrp_part_code || p.part_code}
              getOptionSublabel={(p) => p.customer_part_no ? `Cust: ${p.customer_part_no}` : ''}
            />
          </div>

          {loading ? (
            <p className="muted">Analyzing part production & cycle times...</p>
          ) : part360Data ? (
            <div>
              {/* Part Meta Card & Action */}
              <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16, borderLeft: '4px solid var(--amber)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="shrp-code-pill" style={{ fontSize: 13, padding: '3px 8px' }}>
                      {part360Data.part.shrp_part_code || part360Data.part.part_code}
                    </span>
                    <h2 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>{part360Data.part.part_name}</h2>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Customer Part No: <strong>{part360Data.part.customer_part_no || '—'}</strong> · Cavities: <strong>{part360Data.part.cavity_count}</strong> · Unit Wt: <strong>{part360Data.part.unit_weight_g}g</strong>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px' }}
                  onClick={exportPartHistory}
                >
                  📥 Download Full Part History (CSV)
                </button>
              </div>

              {/* Cycle Time & KPIs Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
                <div className="readout" style={{ borderTop: '3px solid var(--amber)' }}>
                  <div className="readout-label">Target Cycle Time</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)' }}>
                    {part360Data.summary.target_cycle_time_sec}s
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Standard/Shot</div>
                </div>

                <div className="readout" style={{ borderTop: '3px solid #38bdf8' }}>
                  <div className="readout-label">Actual Cycle Time</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8' }}>
                    {part360Data.summary.actual_cycle_time_sec ? `${part360Data.summary.actual_cycle_time_sec}s` : '—'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    Efficiency: {part360Data.summary.cycle_efficiency_pct ? `${part360Data.summary.cycle_efficiency_pct}%` : '—'}
                  </div>
                </div>

                <div className="readout" style={{ borderTop: '3px solid var(--green)' }}>
                  <div className="readout-label">Total Good Qty</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>
                    {part360Data.summary.total_good_qty}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Gross: {part360Data.summary.total_gross_qty}</div>
                </div>

                <div className="readout" style={{ borderTop: '3px solid var(--red)' }}>
                  <div className="readout-label">Scrap Qty / Rate</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)' }}>
                    {part360Data.summary.total_reject_qty} ({part360Data.summary.scrap_rate_pct}%)
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total Rejections</div>
                </div>

                <div className="readout" style={{ borderTop: '3px solid #a855f7' }}>
                  <div className="readout-label">Machine Run Hours</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#a855f7' }}>
                    {part360Data.summary.total_run_hours} hrs
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{part360Data.summary.total_shots} shots</div>
                </div>
              </div>

              {/* Rejection Pareto & Bags Pipeline */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 16 }}>
                {/* Rejection Reasons */}
                <div className="panel">
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--amber)' }}>
                    ⚠️ Defect / Scrap Reasons Breakdown
                  </div>
                  {part360Data.rejection_pareto && part360Data.rejection_pareto.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr><th>Reason</th><th>Qty</th><th>% Share</th></tr>
                      </thead>
                      <tbody>
                        {part360Data.rejection_pareto.map((r, i) => {
                          const pct = part360Data.summary.total_reject_qty > 0
                            ? ((r.total_rejects / part360Data.summary.total_reject_qty) * 100).toFixed(1)
                            : 0;
                          return (
                            <tr key={i}>
                              <td>{r.reason_name}</td>
                              <td style={{ color: 'var(--red)', fontWeight: 600 }}>{r.total_rejects}</td>
                              <td>{pct}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <p className="muted" style={{ fontSize: 12 }}>No rejections recorded for this timeframe.</p>
                  )}
                </div>

                {/* Bags Stage Pipeline */}
                <div className="panel">
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#38bdf8' }}>
                    📦 Bag Pipeline & Inventory Stages
                  </div>
                  {part360Data.bags_summary && part360Data.bags_summary.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr><th>Stage Status</th><th>Bags</th><th>Total Qty</th><th>Weight</th></tr>
                      </thead>
                      <tbody>
                        {part360Data.bags_summary.map((b, i) => (
                          <tr key={i}>
                            <td><strong>{b.status}</strong></td>
                            <td>{b.bag_count}</td>
                            <td>{b.total_qty} nos</td>
                            <td>{Number(b.total_kg).toFixed(2)} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="muted" style={{ fontSize: 12 }}>No bag batches created for this timeframe.</p>
                  )}
                </div>
              </div>

              {/* Detailed Production Entries Table */}
              <div className="panel" style={{ overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    📋 Granular Production Entries ({part360Data.entries.length} records)
                  </div>
                  <button type="button" className="btn btn-secondary" style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }} onClick={exportPartHistory}>
                    📥 Export CSV
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Shift</th>
                      <th>Machine</th>
                      <th>Operator</th>
                      <th>Gross</th>
                      <th>Good</th>
                      <th>Rej</th>
                      <th>Target CT</th>
                      <th>Actual CT</th>
                      <th>Eff %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {part360Data.entries.map((e, idx) => (
                      <tr key={idx}>
                        <td>{e.entry_date}</td>
                        <td>{e.shift} (Hr {e.hour_slot})</td>
                        <td><strong>{e.machine_code}</strong></td>
                        <td>{e.operator_name}</td>
                        <td>{e.gross_qty}</td>
                        <td style={{ color: 'var(--green)' }}>{e.good_qty}</td>
                        <td style={{ color: e.reject_qty > 0 ? 'var(--red)' : 'inherit' }}>{e.reject_qty}</td>
                        <td>{e.target_cycle_time_sec}s</td>
                        <td style={{ color: e.actual_cycle_time_sec > e.target_cycle_time_sec * 1.1 ? '#f87171' : 'inherit' }}>
                          {e.actual_cycle_time_sec ? `${e.actual_cycle_time_sec}s` : '—'}
                        </td>
                        <td>{e.cycle_efficiency_pct ? `${e.cycle_efficiency_pct}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MACHINE 360° & DOWNTIME PARETO                                     */}
      {/* ========================================================================= */}
      {activeTab === 'machine360' && (
        <div>
          <div className="panel" style={{ padding: '12px 14px', marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              🖥️ Select Machine to Analyze
            </label>
            <SearchableSelect
              id="machine-select-360"
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              options={machinesList}
              placeholder="-- Choose Machine --"
              searchPlaceholder="🔍 Type machine code..."
              getOptionValue={(m) => m.id}
              getOptionLabel={(m) => `${m.machine_code} (${m.description || ''})`}
              getOptionBadge={(m) => m.machine_code}
            />
          </div>

          {loading ? (
            <p className="muted">Analyzing machine performance & downtime...</p>
          ) : machine360Data ? (
            <div>
              <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16, borderLeft: '4px solid var(--amber)' }}>
                <div>
                  <h2 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>
                    {machine360Data.machine.machine_code} — {machine360Data.machine.description}
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Max Shot: {machine360Data.machine.max_shot_weight_g || '—'}g · Tie Bar: {machine360Data.machine.tie_bar_distance_mm || '—'}mm
                  </div>
                </div>
                <button type="button" className="btn btn-primary" style={{ width: 'auto' }} onClick={exportMachineHistory}>
                  📥 Download Full Machine History (CSV)
                </button>
              </div>

              {/* Machine KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
                <div className="readout">
                  <div className="readout-label">Good Output</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>{machine360Data.summary.total_good_qty}</div>
                </div>
                <div className="readout">
                  <div className="readout-label">Scrap Qty (%)</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)' }}>
                    {machine360Data.summary.total_reject_qty} ({machine360Data.summary.scrap_rate_pct}%)
                  </div>
                </div>
                <div className="readout">
                  <div className="readout-label">Downtime</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)' }}>{machine360Data.summary.total_downtime_minutes} min</div>
                </div>
                <div className="readout">
                  <div className="readout-label">Run Hours</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{machine360Data.summary.total_run_hours} hrs</div>
                </div>
                <div className="readout">
                  <div className="readout-label">Uptime Efficiency</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>{machine360Data.summary.efficiency_pct}%</div>
                </div>
              </div>

              {/* Downtime Pareto */}
              <div className="panel" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--amber)' }}>
                  ⚡ Downtime Reasons Breakdown (Pareto)
                </div>
                {machine360Data.downtime_pareto && machine360Data.downtime_pareto.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr><th>Reason / Breakdown Cause</th><th>Total Minutes</th><th>% Share</th></tr>
                    </thead>
                    <tbody>
                      {machine360Data.downtime_pareto.map((d, i) => {
                        const pct = machine360Data.summary.total_downtime_minutes > 0
                          ? ((d.total_minutes / machine360Data.summary.total_downtime_minutes) * 100).toFixed(1)
                          : 0;
                        return (
                          <tr key={i}>
                            <td><strong>{d.reason_name}</strong></td>
                            <td>{d.total_minutes} mins</td>
                            <td>{pct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="muted" style={{ fontSize: 12 }}>No downtime logged for this machine in timeframe.</p>
                )}
              </div>

              {/* Machine History */}
              <div className="panel" style={{ overflowX: 'auto' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Production History</div>
                <table className="data-table">
                  <thead>
                    <tr><th>Date</th><th>Shift</th><th>Part</th><th>Operator</th><th>Good</th><th>Rej</th><th>Remarks</th></tr>
                  </thead>
                  <tbody>
                    {machine360Data.entries.map((e, i) => (
                      <tr key={i}>
                        <td>{e.entry_date}</td>
                        <td>{e.shift}</td>
                        <td>{e.shrp_part_code || e.part_code} ({e.part_name})</td>
                        <td>{e.operator_name}</td>
                        <td style={{ color: 'var(--green)' }}>{e.good_qty}</td>
                        <td style={{ color: e.reject_qty > 0 ? 'var(--red)' : 'inherit' }}>{e.reject_qty}</td>
                        <td>{e.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MOULD 360° TOOL LIFE                                               */}
      {/* ========================================================================= */}
      {activeTab === 'mould360' && (
        <div>
          <div className="panel" style={{ padding: '12px 14px', marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              ⚙️ Select Mould to Analyze Tool Life
            </label>
            <SearchableSelect
              id="mould-select-360"
              value={selectedMouldId}
              onChange={(e) => setSelectedMouldId(e.target.value)}
              options={mouldsList}
              placeholder="-- Choose Mould --"
              searchPlaceholder="🔍 Type mould code, name..."
              getOptionValue={(m) => m.id}
              getOptionLabel={(m) => `${m.mould_code} — ${m.mould_name || ''}`}
              getOptionBadge={(m) => m.mould_code}
            />
          </div>

          {loading ? (
            <p className="muted">Analyzing mould shots & tool life...</p>
          ) : mould360Data ? (
            <div>
              <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16, borderLeft: '4px solid var(--amber)' }}>
                <div>
                  <h2 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>
                    [{mould360Data.mould.mould_code}] {mould360Data.mould.mould_name}
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Storage Rack: <strong>{mould360Data.mould.tool_storage_rack || '—'}</strong> · Tool Maker: <strong>{mould360Data.mould.tool_maker || '—'}</strong>
                  </div>
                </div>
              </div>

              {/* Tool Life Visual Progress */}
              <div className="panel" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 700 }}>
                  <span>Tool Life Consumption ({mould360Data.summary.life_consumed_pct}%)</span>
                  <span>{mould360Data.summary.total_shots} / {mould360Data.summary.rated_life_shots} shots</span>
                </div>
                <div style={{ height: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, mould360Data.summary.life_consumed_pct)}%`,
                    height: '100%',
                    background: mould360Data.summary.life_consumed_pct > 80 ? 'var(--red)' : 'var(--amber)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Remaining Shots: <strong>{mould360Data.summary.remaining_shots} shots</strong> · PM Frequency: Every {mould360Data.summary.pm_frequency_shots} shots
                </div>
              </div>

              {/* Compatible Parts */}
              <div className="panel">
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Compatible Parts Master</div>
                <table className="data-table">
                  <thead>
                    <tr><th>SHRP Code</th><th>Part Name</th><th>Customer Part No</th><th>Cavities</th></tr>
                  </thead>
                  <tbody>
                    {mould360Data.compatible_parts.map((p) => (
                      <tr key={p.id}>
                        <td><span className="shrp-code-pill">{p.shrp_part_code || p.part_code}</span></td>
                        <td>{p.part_name}</td>
                        <td>{p.customer_part_no || '—'}</td>
                        <td>{p.cavity_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: OPERATOR 360° & EFFICIENCY                                         */}
      {/* ========================================================================= */}
      {activeTab === 'operator360' && (
        <div>
          <div className="panel" style={{ padding: '12px 14px', marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              👤 Select Operator to Analyze
            </label>
            <SearchableSelect
              id="operator-select-360"
              value={selectedOperatorId}
              onChange={(e) => setSelectedOperatorId(e.target.value)}
              options={operatorsList}
              placeholder="-- Choose Operator --"
              searchPlaceholder="🔍 Type operator name..."
              getOptionValue={(u) => u.id}
              getOptionLabel={(u) => u.full_name || u.username}
              getOptionBadge={(u) => u.role}
            />
          </div>

          {loading ? (
            <p className="muted">Analyzing operator performance...</p>
          ) : operator360Data ? (
            <div>
              <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16, borderLeft: '4px solid var(--amber)' }}>
                <div>
                  <h2 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>
                    {operator360Data.operator.full_name || operator360Data.operator.username}
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Role: <strong>{operator360Data.operator.role}</strong> · Status: <strong>{operator360Data.operator.active ? 'Active' : 'Inactive'}</strong>
                  </div>
                </div>
                <button type="button" className="btn btn-primary" style={{ width: 'auto' }} onClick={exportOperatorHistory}>
                  📥 Download Full Operator History (CSV)
                </button>
              </div>

              {/* Operator KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
                <div className="readout">
                  <div className="readout-label">Good Produced</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>{operator360Data.summary.total_good_qty}</div>
                </div>
                <div className="readout">
                  <div className="readout-label">Total Rejections</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--red)' }}>
                    {operator360Data.summary.total_reject_qty} ({operator360Data.summary.scrap_rate_pct}%)
                  </div>
                </div>
                <div className="readout">
                  <div className="readout-label">Avg Efficiency</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)' }}>
                    {operator360Data.summary.avg_efficiency_pct ? `${operator360Data.summary.avg_efficiency_pct}%` : '—'}
                  </div>
                </div>
                <div className="readout">
                  <div className="readout-label">Entries Logged</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{operator360Data.summary.total_entries_count}</div>
                </div>
              </div>

              {/* Operator Entries Table */}
              <div className="panel" style={{ overflowX: 'auto' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Hourly Log Entries</div>
                <table className="data-table">
                  <thead>
                    <tr><th>Date</th><th>Shift</th><th>Machine</th><th>Part</th><th>Good</th><th>Rej</th><th>Eff %</th></tr>
                  </thead>
                  <tbody>
                    {operator360Data.entries.map((e, idx) => (
                      <tr key={idx}>
                        <td>{e.entry_date}</td>
                        <td>{e.shift} (Hr {e.hour_slot})</td>
                        <td><strong>{e.machine_code}</strong></td>
                        <td>{e.shrp_part_code || e.part_code} ({e.part_name})</td>
                        <td style={{ color: 'var(--green)' }}>{e.good_qty}</td>
                        <td style={{ color: e.reject_qty > 0 ? 'var(--red)' : 'inherit' }}>{e.reject_qty}</td>
                        <td>{e.efficiency_pct ? `${e.efficiency_pct}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: BAG 360° CRADLE-TO-GRAVE TRACEABILITY                               */}
      {/* ========================================================================= */}
      {activeTab === 'bag360' && (
        <div>
          <form onSubmit={handleBagSearch} className="panel" style={{ padding: '12px 14px', marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
              🎒 Trace Bag Across All Stages (Moulding → Trimming → Inspection → Packing → Dispatch)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="e.g. 34240826A-001 or HC442L3LBB01..."
                value={bagSearchCode}
                onChange={(e) => setBagSearchCode(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={loading || !bagSearchCode.trim()}>
                🔍 Search Trace
              </button>
            </div>
          </form>

          {loading ? (
            <p className="muted">Tracing bag cradle-to-grave lifecycle...</p>
          ) : bag360Data ? (
            <div>
              {/* Bag Overview Card */}
              <div className="panel" style={{ borderLeft: '4px solid var(--amber)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h2 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>
                      Bag: {bag360Data.bag.bag_code}
                    </h2>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      Batch: <strong>{bag360Data.bag.batch_no}</strong> · Part: <strong>{bag360Data.bag.shrp_part_code || bag360Data.bag.part_code} ({bag360Data.bag.part_name})</strong>
                    </div>
                  </div>
                  <span className={`status-pill status-${bag360Data.bag.status?.toLowerCase()}`} style={{ fontSize: 13, padding: '4px 12px' }}>
                    {bag360Data.bag.status}
                  </span>
                </div>
              </div>

              {/* Stage Lifecycle Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* 1. Moulding / Bagging */}
                <div className="panel" style={{ borderLeft: '4px solid #38bdf8' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#38bdf8', marginBottom: 6 }}>
                    1. 🏭 Moulding & Bagging Stage
                  </div>
                  <div style={{ fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
                    <div>Machine: <strong>{bag360Data.stages.moulding.machine_code}</strong></div>
                    <div>Base Weight: <strong>{bag360Data.stages.moulding.base_weight_kg} kg</strong></div>
                    <div>Qty: <strong>{bag360Data.stages.moulding.qty} nos</strong></div>
                    <div>Operator: <strong>{bag360Data.stages.moulding.operator || '—'}</strong></div>
                    <div>Timestamp: <strong>{new Date(bag360Data.stages.moulding.timestamp).toLocaleString()}</strong></div>
                  </div>
                </div>

                {/* 2. Trimming */}
                <div className="panel" style={{ borderLeft: '4px solid #fbbf24' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fbbf24', marginBottom: 6 }}>
                    2. ✂️ Trimming Stage
                  </div>
                  {bag360Data.stages.trimming ? (
                    <div style={{ fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
                      <div>Operator: <strong>{bag360Data.stages.trimming.operator_name || '—'}</strong></div>
                      <div>Remaining Wt: <strong>{bag360Data.stages.trimming.weight_kg} kg</strong></div>
                      <div>Runner/Scrap Wt: <strong>{bag360Data.stages.trimming.runner_weight_kg || 0} kg</strong></div>
                      <div>Trimmed Qty: <strong>{bag360Data.stages.trimming.qty} nos</strong></div>
                      <div>Completed: <strong>{new Date(bag360Data.stages.trimming.created_at).toLocaleString()}</strong></div>
                    </div>
                  ) : (
                    <p className="muted" style={{ fontSize: 12, margin: 0 }}>Pending Trimming</p>
                  )}
                </div>

                {/* 3. Inspection */}
                <div className="panel" style={{ borderLeft: '4px solid #34d399' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#34d399', marginBottom: 6 }}>
                    3. 🔍 Quality Inspection Stage
                  </div>
                  {bag360Data.stages.inspection ? (
                    <div style={{ fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
                      <div>Inspector: <strong>{bag360Data.stages.inspection.inspector_name || '—'}</strong></div>
                      <div>OK Qty: <strong style={{ color: 'var(--green)' }}>{bag360Data.stages.inspection.ok_qty} nos</strong></div>
                      <div>Reject Qty: <strong style={{ color: 'var(--red)' }}>{bag360Data.stages.inspection.reject_qty || 0} nos</strong></div>
                      <div>Completed: <strong>{new Date(bag360Data.stages.inspection.created_at).toLocaleString()}</strong></div>
                    </div>
                  ) : (
                    <p className="muted" style={{ fontSize: 12, margin: 0 }}>Pending Inspection</p>
                  )}
                </div>

                {/* 4. Packing */}
                <div className="panel" style={{ borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#10b981', marginBottom: 6 }}>
                    4. 📦 Packing Stage
                  </div>
                  {bag360Data.stages.packing ? (
                    <div style={{ fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
                      <div>Packer: <strong>{bag360Data.stages.packing.packer_name || '—'}</strong></div>
                      <div>Box / Carton Code: <strong>{bag360Data.stages.packing.carton_code || '—'}</strong></div>
                      <div>Packed Qty: <strong>{bag360Data.stages.packing.packed_qty} nos</strong></div>
                      <div>Completed: <strong>{new Date(bag360Data.stages.packing.created_at).toLocaleString()}</strong></div>
                    </div>
                  ) : (
                    <p className="muted" style={{ fontSize: 12, margin: 0 }}>Pending Packing</p>
                  )}
                </div>

                {/* 5. Dispatch */}
                <div className="panel" style={{ borderLeft: '4px solid #a855f7' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#a855f7', marginBottom: 6 }}>
                    5. 🚚 Customer Dispatch Stage
                  </div>
                  {bag360Data.stages.dispatch ? (
                    <div style={{ fontSize: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
                      <div>Dispatcher: <strong>{bag360Data.stages.dispatch.dispatcher_name || '—'}</strong></div>
                      <div>Customer: <strong>{bag360Data.stages.dispatch.customer_name || '—'}</strong></div>
                      <div>DC Ref: <strong>{bag360Data.stages.dispatch.dc_reference || '—'}</strong></div>
                      <div>Vehicle: <strong>{bag360Data.stages.dispatch.vehicle_number || '—'}</strong></div>
                      <div>Completed: <strong>{new Date(bag360Data.stages.dispatch.created_at).toLocaleString()}</strong></div>
                    </div>
                  ) : (
                    <p className="muted" style={{ fontSize: 12, margin: 0 }}>Pending Dispatch</p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: TREND ANALYTICS                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'trend' && trendData && (
        <div className="panel">
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
            📈 Multi-Day Production Trends ({startDate} to {endDate})
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Gross</th>
                <th>Good Qty</th>
                <th>Rejects</th>
                <th>Rejection %</th>
                <th>OEE %</th>
              </tr>
            </thead>
            <tbody>
              {trendData.daily_trends.map((t, idx) => (
                <tr key={idx}>
                  <td><strong>{t.date}</strong></td>
                  <td>{t.total_gross}</td>
                  <td style={{ color: 'var(--green)' }}>{t.total_ok}</td>
                  <td style={{ color: t.total_reject > 0 ? 'var(--red)' : 'inherit' }}>{t.total_reject}</td>
                  <td>{t.reject_pct}%</td>
                  <td style={{ color: 'var(--amber)' }}><strong>{t.oee_pct}%</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
