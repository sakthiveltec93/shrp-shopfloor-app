import React, { useState } from 'react';
import MetricDetailModal from './MetricDetailModal';
import MachineDetailModal from './MachineDetailModal';
import ShiftHandoverModal from './ShiftHandoverModal';

export default function SupervisorView({
  data,
  loading,
  error,
  shiftDate,
  setShiftDate,
  shiftCode,
  setShiftCode,
  onRefresh,
  onSubmitHandover,
}) {
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showHandoverModal, setShowHandoverModal] = useState(false);

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-sm font-semibold">Loading Supervisor Dashboard...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 bg-rose-950/40 border border-rose-800 rounded-xl text-center space-y-3">
        <div className="text-2xl">⚠️</div>
        <div className="text-sm font-bold text-rose-400">Failed to load Dashboard Data</div>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={onRefresh}
          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const kpis = {
    activeMachinesCount: data?.kpis?.activeMachinesCount ?? data?.activeCount ?? 0,
    totalMachinesCount: data?.kpis?.totalMachinesCount ?? data?.totalMachines ?? 21,
    actualGoodQty: data?.kpis?.actualGoodQty ?? data?.actualOutput ?? 0,
    targetQty: data?.kpis?.targetQty ?? data?.targetOutput ?? 0,
    rejectionQty: data?.kpis?.rejectionQty ?? data?.rejectionQty ?? 0,
    rejectionPct: data?.kpis?.rejectionPct ?? (typeof data?.rejectionPct === 'number' ? `${data.rejectionPct.toFixed(2)}%` : `${data?.rejectionPct || '0.00%'}`),
    shiftEfficiencyPct: data?.kpis?.shiftEfficiencyPct ?? (typeof data?.efficiency === 'number' ? `${data.efficiency.toFixed(1)}%` : `${data?.efficiency || '0.0%'}`),
    downtimeMinutes: data?.kpis?.downtimeMinutes ?? data?.downtime ?? 0,
    pendingFpaCount: data?.kpis?.pendingFpaCount ?? data?.pendingActions ?? 0,
  };

  const topPerformers = {
    topOperator: data?.topPerformers?.topOperator || data?.topOperator || { name: '—', machine: '—', output: 0, rejection: 0, efficiency: '0%' },
    topMachine: data?.topPerformers?.topMachine || data?.topMachine || { name: '—', shots: 0, uptime: '0%', rejections: 0 },
    topPart: data?.topPerformers?.topPart || data?.topPart || { partNumber: '—', partName: '—', netOK: 0, rejectionPct: '0%' },
  };

  const hourlyProgression = data?.hourlyProgression || data?.hourlyOutput || [
    { hour: 1, actual: 0, target: 5400 },
    { hour: 2, actual: 0, target: 5400 },
    { hour: 3, actual: 0, target: 5400 },
    { hour: 4, actual: 0, target: 5400 },
    { hour: 5, actual: 0, target: 5400 },
    { hour: 6, actual: 0, target: 5400 },
    { hour: 7, actual: 0, target: 5400 },
    { hour: 8, actual: 0, target: 5400 },
  ];

  // Calculate max for SVG bar chart scaling
  const maxHourlyVal = Math.max(
    ...hourlyProgression.map((h) => Math.max(h.actual, h.target)),
    6000
  );

  const defectBreakdown = data?.defectBreakdown || [];
  const dispatchQueue = data?.dispatchQueue || { ready: 0, qcHold: 0, trimming: 0, totalBags: 0 };
  const materialAlerts = data?.materialAlerts || [];
  const pendingFpa = data?.pendingFpa || [];
  const machines = data?.machines || [];

  return (
    <div className="space-y-5 animate-fade-in text-slate-100">
      {/* 1. SHIFT STATUS & CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap justify-between items-center gap-3 shadow-lg">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
              LIVE SHIFT {shiftCode === 'A' ? 'I (08:00 - 16:30)' : shiftCode === 'B' ? 'II (16:30 - 01:00)' : 'III (01:00 - 08:00)'}
            </span>
          </div>
          <div className="text-xs text-slate-300">
            <strong>Date:</strong> {shiftDate} | <strong>Active Plant:</strong> SHRP Shopfloor
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={shiftDate}
            onChange={(e) => setShiftDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500"
          />
          <select
            value={shiftCode}
            onChange={(e) => setShiftCode(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
          >
            <option value="A">Shift I (08:00 - 16:30)</option>
            <option value="B">Shift II (16:30 - 01:00)</option>
            <option value="C">Shift III (01:00 - 08:00)</option>
          </select>
          <button
            onClick={() => setShowHandoverModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-lg text-amber-300 flex items-center gap-1.5 transition-all shadow-sm"
          >
            📝 Shift Handover
          </button>
          <button
            onClick={onRefresh}
            title="Refresh Live Data"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs"
          >
            🔄
          </button>
        </div>
      </div>

      {/* 2. CRITICAL ALERT BANNERS */}
      {pendingFpa.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-600/50 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl animate-bounce">⚠️</span>
            <div>
              <strong className="text-amber-400 font-bold">{pendingFpa.length} First Piece Approvals (FPA) Pending Quality Sign-Off:</strong>{' '}
              <span className="text-slate-300">
                {pendingFpa.map((f) => `${f.machine_code} (${f.part_code || f.shrp_part_code})`).join(', ')}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedMetric('pendingFpa')}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-md text-[11px] whitespace-nowrap"
          >
            Review FPAs
          </button>
        </div>
      )}

      {materialAlerts.some((m) => m.stock_status === 'CRITICAL') && (
        <div className="bg-rose-950/40 border border-rose-600/50 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚨</span>
            <div>
              <strong className="text-rose-400 font-bold">Critical Raw Material Stock Warning:</strong>{' '}
              <span className="text-slate-300">
                {materialAlerts.filter((m) => m.stock_status === 'CRITICAL').map((m) => `${m.material_code} (${Math.round(m.total_stock_kg)}kg)`).join(', ')} below minimum safety buffer!
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedMetric('materialAlerts')}
            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-md text-[11px] whitespace-nowrap"
          >
            View Stock
          </button>
        </div>
      )}

      {/* 3. SHIFT KPI RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Active Machines */}
        <div
          onClick={() => setSelectedMetric('activeMachines')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-3.5 rounded-xl cursor-pointer transition-all shadow-sm"
        >
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Active Machines</div>
          <div className="text-xl font-black text-emerald-400 mt-1">
            {kpis.activeMachinesCount} <span className="text-xs font-normal text-slate-400">/ {kpis.totalMachinesCount}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {machines.filter((m) => m.status === 'MOULD_CHANGE').length} Mould Chg • {machines.filter((m) => m.status === 'IDLE').length} Idle
          </div>
        </div>

        {/* Shift OK Output */}
        <div
          onClick={() => setSelectedMetric('shiftOutput')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-3.5 rounded-xl cursor-pointer transition-all shadow-sm"
        >
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Shift OK Output</div>
          <div className="text-xl font-black text-sky-400 mt-1">
            {kpis.actualGoodQty.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">
            Target: {kpis.targetQty > 0 ? kpis.targetQty.toLocaleString() : '45,000'} pcs
          </div>
        </div>

        {/* Shift Rejection */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Shift Scrap / Rej</div>
          <div className="text-xl font-black text-rose-400 mt-1">
            {kpis.rejectionQty.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs ({kpis.rejectionPct})</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Threshold &lt; 1.20%</div>
        </div>

        {/* Shift Efficiency */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Shift Efficiency</div>
          <div className="text-xl font-black text-amber-400 mt-1">{kpis.shiftEfficiencyPct}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Standard Cycle Basis</div>
        </div>

        {/* Downtime */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-sm">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Shift Downtime</div>
          <div className="text-xl font-black text-orange-400 mt-1">
            {kpis.downtimeMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Mould Chg / QA Check</div>
        </div>

        {/* Pending Actions */}
        <div
          onClick={() => setSelectedMetric('pendingFpa')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-3.5 rounded-xl cursor-pointer transition-all shadow-sm"
        >
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Pending Gates</div>
          <div className="text-xl font-black text-amber-300 mt-1">
            {kpis.pendingFpaCount} <span className="text-xs font-normal text-slate-400">FPA</span>
          </div>
          <div className="text-[10px] text-amber-400 mt-0.5">Click to Inspect</div>
        </div>
      </div>

      {/* 4. BEST OF THE SHIFT (TOP PERFORMERS LEADERBOARD) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Operator */}
        <div className="bg-slate-900 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl">
            👑
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Best Operator (Shift)</div>
            <div className="text-sm font-extrabold text-white mt-0.5">
              {topPerformers.topOperator.name} <span className="text-xs font-normal text-slate-300">({topPerformers.topOperator.machine})</span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Output: <strong>{topPerformers.topOperator.output?.toLocaleString()} pcs</strong> • {topPerformers.topOperator.rejection || 0} Rej • {topPerformers.topOperator.efficiency} Eff
            </div>
          </div>
        </div>

        {/* Best Machine */}
        <div className="bg-slate-900 border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-transparent p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-2xl">
            ⚙️
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Top Output Machine</div>
            <div className="text-sm font-extrabold text-white mt-0.5">
              {topPerformers.topMachine.name}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              <strong>{topPerformers.topMachine.shots?.toLocaleString()} Shots</strong> • {topPerformers.topMachine.uptime} Uptime
            </div>
          </div>
        </div>

        {/* Best Quality Part */}
        <div className="bg-slate-900 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 rounded-xl flex items-center gap-3.5 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
            ⭐
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Star Part Performance</div>
            <div className="text-sm font-extrabold text-white mt-0.5 truncate max-w-[220px]">
              {topPerformers.topPart.partName || topPerformers.topPart.partNumber}
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Net OK: <strong>{topPerformers.topPart.netOK?.toLocaleString()} pcs</strong> • Rejection: <strong>{topPerformers.topPart.rejectionPct}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PICTORIAL VISUALIZATIONS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Hourly Output Bar Chart (SVG) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📈</span> Shift Hourly Output Progression
              </h3>
              <p className="text-xs text-slate-400">Hourly good parts vs standard production target</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-3 rounded bg-sky-500"></span> Actual OK</span>
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-3 h-1 bg-amber-400"></span> Target</span>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full h-44 relative mt-2">
            <svg viewBox="0 0 700 180" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="680" y2="20" stroke="#334155" strokeDasharray="3" />
              <line x1="40" y1="70" x2="680" y2="70" stroke="#334155" strokeDasharray="3" />
              <line x1="40" y1="120" x2="680" y2="120" stroke="#334155" strokeDasharray="3" />
              <line x1="40" y1="160" x2="680" y2="160" stroke="#475569" />

              {/* Y Axis Labels */}
              <text x="10" y="25" fill="#64748b" fontSize="10">{Math.round(maxHourlyVal).toLocaleString()}</text>
              <text x="10" y="75" fill="#64748b" fontSize="10">{Math.round(maxHourlyVal * 0.66).toLocaleString()}</text>
              <text x="10" y="125" fill="#64748b" fontSize="10">{Math.round(maxHourlyVal * 0.33).toLocaleString()}</text>
              <text x="25" y="165" fill="#64748b" fontSize="10">0</text>

              {/* Target Line (Dashed) */}
              <line
                x1="40"
                y1={160 - (5400 / maxHourlyVal) * 140}
                x2="680"
                y2={160 - (5400 / maxHourlyVal) * 140}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4"
              />

              {/* Bars for Hours 1-8 */}
              {hourlyProgression.map((item, idx) => {
                const barHeight = Math.max((item.actual / maxHourlyVal) * 140, 4);
                const x = 60 + idx * 75;
                const y = 160 - barHeight;
                const isOverTarget = item.actual >= item.target && item.actual > 0;
                return (
                  <g key={idx}>
                    <rect
                      x={x}
                      y={y}
                      width="42"
                      height={barHeight}
                      rx="4"
                      fill={isOverTarget ? '#10b981' : item.actual > 0 ? '#38bdf8' : '#334155'}
                      fillOpacity="0.9"
                    />
                    <text x={x + 12} y="175" fill="#94a3b8" fontSize="11">Hr {item.hour}</text>
                    {item.actual > 0 && (
                      <text x={x + 5} y={y - 5} fill={isOverTarget ? '#34d399' : '#38bdf8'} fontSize="10" fontWeight="700">
                        {item.actual >= 1000 ? `${(item.actual / 1000).toFixed(1)}k` : item.actual}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Rejection Defect Pareto Breakdown Donut (SVG) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🥧</span> Shift Rejection Defect Pareto
            </h3>
            <p className="text-xs text-slate-400">Scrap distribution ({kpis.rejectionQty} parts total)</p>
          </div>

          <div className="flex items-center justify-center my-2">
            <svg viewBox="0 0 160 160" className="w-32 h-32">
              <circle cx="80" cy="80" r="55" fill="transparent" stroke="#334155" strokeWidth="22" />
              {defectBreakdown.length > 0 ? (
                <>
                  <circle cx="80" cy="80" r="55" fill="transparent" stroke="#f87171" strokeWidth="22" strokeDasharray="145 200" strokeDashoffset="0" />
                  <circle cx="80" cy="80" r="55" fill="transparent" stroke="#fb923c" strokeWidth="22" strokeDasharray="96 250" strokeDashoffset="-145" />
                  <circle cx="80" cy="80" r="55" fill="transparent" stroke="#fbbf24" strokeWidth="22" strokeDasharray="62 285" strokeDashoffset="-241" />
                  <circle cx="80" cy="80" r="55" fill="transparent" stroke="#38bdf8" strokeWidth="22" strokeDasharray="41 305" strokeDashoffset="-303" />
                </>
              ) : null}
              <text x="80" y="76" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="800">
                {kpis.rejectionQty}
              </text>
              <text x="80" y="92" textAnchor="middle" fill="#94a3b8" fontSize="9">
                DEFECTS
              </text>
            </svg>
          </div>

          {/* Defect Legend */}
          <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-slate-800">
            {defectBreakdown.slice(0, 4).map((d, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className={`w-2.5 h-2.5 rounded shrink-0 ${
                  idx === 0 ? 'bg-rose-400' : idx === 1 ? 'bg-orange-400' : idx === 2 ? 'bg-amber-400' : 'bg-sky-400'
                }`}></span>
                <span className="truncate">{d.defect}: <strong>{d.qty} ({d.pct}%)</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. DISPATCH QUEUE & MOULD AUDIT SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Dispatch Queue Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🚚</span> Dispatch Staging Inventory
            </h3>
            <span className="text-xs text-amber-400 font-bold">{dispatchQueue.totalBags} Bags Staged</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block">Ready Dispatch</span>
              <span className="text-base font-black text-emerald-400 mt-1 block">{dispatchQueue.ready}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-amber-400 font-bold uppercase block">In QC Hold</span>
              <span className="text-base font-black text-amber-400 mt-1 block">{dispatchQueue.qcHold}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-sky-400 font-bold uppercase block">In Trimming</span>
              <span className="text-base font-black text-sky-400 mt-1 block">{dispatchQueue.trimming}</span>
            </div>
          </div>
        </div>

        {/* Recent Mould Change Audit Trail */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 lg:col-span-2 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>⚙️</span> Recent Mould Changes &amp; Reason Audit
            </h3>
            <button
              onClick={() => setSelectedMetric('mouldAudit')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              View Full History →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-1.5">Machine</th>
                  <th className="p-1.5">Part Loaded</th>
                  <th className="p-1.5">Reason</th>
                  <th className="p-1.5">Changed By</th>
                  <th className="p-1.5">Time</th>
                  <th className="p-1.5">1st OK Part</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data?.mouldChanges?.slice(0, 3).map((mc) => (
                  <tr key={mc.assignment_id} className="hover:bg-slate-850">
                    <td className="p-1.5 font-bold text-amber-400">{mc.machine_code}</td>
                    <td className="p-1.5 font-semibold text-white">{mc.shrp_part_code || mc.part_code}</td>
                    <td className="p-1.5"><span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-slate-300">{mc.reason_name || mc.reason || 'Plan Done'}</span></td>
                    <td className="p-1.5 text-slate-300">{mc.changed_by_name || 'Supervisor'}</td>
                    <td className="p-1.5 text-slate-400">{mc.mould_load_started_at ? new Date(mc.mould_load_started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td className="p-1.5 text-emerald-400 font-semibold">{mc.approved_at ? '✅ Approved' : '⏳ Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 7. LIVE MACHINE FLOOR MAP (21 MACHINES GRID) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🏭</span> Live Floor Machine Status Map (21 Machines)
            </h3>
            <p className="text-xs text-slate-400">Click any machine card for live shift production log &amp; speed analysis</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-bold">
              ● {machines.filter((m) => m.status === 'RUNNING').length} RUNNING
            </span>
            <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-400 border border-amber-800 font-bold">
              ● {machines.filter((m) => m.status === 'SLOW').length} SLOW
            </span>
            <span className="px-2.5 py-1 rounded bg-sky-950/80 text-sky-400 border border-sky-800 font-bold">
              ● {machines.filter((m) => m.status === 'MOULD_CHANGE').length} MOULD CHG
            </span>
            <span className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-400 border border-rose-800 font-bold">
              ● {machines.filter((m) => m.status === 'IDLE').length} IDLE / PM
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {machines.map((m) => {
            const isRunning = m.status === 'RUNNING';
            const isSlow = m.status === 'SLOW';
            const isMouldChg = m.status === 'MOULD_CHANGE';
            const isIdle = m.status === 'IDLE';

            return (
              <div
                key={m.machine_id}
                onClick={() => setSelectedMachine(m)}
                className={`bg-slate-900 border rounded-xl p-3.5 cursor-pointer transition-all hover:scale-[1.01] shadow-sm ${
                  isRunning ? 'border-l-4 border-l-emerald-500 border-slate-800 hover:border-emerald-500/50' :
                  isSlow ? 'border-l-4 border-l-amber-500 border-slate-800 hover:border-amber-500/50' :
                  isMouldChg ? 'border-l-4 border-l-sky-500 bg-sky-950/20 border-sky-900 hover:border-sky-500/50' :
                  'border-l-4 border-l-rose-500 border-slate-800 hover:border-rose-500/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-extrabold text-amber-400 text-sm font-mono">{m.machine_code}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isRunning ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    isSlow ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    isMouldChg ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                    'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {m.status} {m.efficiency_pct ? `(${m.efficiency_pct}%)` : ''}
                  </span>
                </div>

                <div className="mt-2 text-xs">
                  <div className="font-bold text-white truncate">
                    {m.shrp_part_code || m.part_code || <span className="text-slate-500 italic">No Part Loaded</span>}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">{m.part_name ? `(${m.part_name})` : ''}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Op: {m.current_operator_name || 'Not Logged In'} • Cav: {m.cavity_count || 1}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs mt-2.5 pt-2 border-t border-slate-800/80">
                  {isMouldChg ? (
                    <div className="text-amber-300 font-semibold text-[11px] flex items-center gap-1">
                      <span>⏳</span> Mould Setup In-Progress
                    </div>
                  ) : (
                    <>
                      <div>
                        OK: <strong className="text-emerald-400">{(m.total_good_qty || 0).toLocaleString()}</strong>
                      </div>
                      <div>
                        Rej: <strong className="text-slate-300">{m.total_reject_qty || 0}</strong>
                      </div>
                    </>
                  )}

                  <span className="text-[10px] font-semibold">
                    {m.fpa_approval_status === 'APPROVED' ? (
                      <span className="text-emerald-400">✅ FPA OK</span>
                    ) : m.fpa_approval_status === 'VISUAL_APPROVED' ? (
                      <span className="text-amber-400">⚡ Visual OK</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drill-down Modals */}
      {selectedMetric && (
        <MetricDetailModal
          metricKey={selectedMetric}
          data={data}
          onClose={() => setSelectedMetric(null)}
        />
      )}

      {selectedMachine && (
        <MachineDetailModal
          machine={selectedMachine}
          shiftDate={shiftDate}
          shiftCode={shiftCode}
          onClose={() => setSelectedMachine(null)}
        />
      )}

      {showHandoverModal && (
        <ShiftHandoverModal
          shiftDate={shiftDate}
          shiftCode={shiftCode}
          onSubmit={onSubmitHandover}
          onClose={() => setShowHandoverModal(false)}
        />
      )}
    </div>
  );
}
