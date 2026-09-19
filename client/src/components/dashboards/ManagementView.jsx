import React, { useState } from 'react';
import CustomerDetailModal from './CustomerDetailModal';

export default function ManagementView({
  data,
  loading,
  error,
  mgmtPeriod,
  handlePeriodChange,
  mgmtStartDate,
  setMgmtStartDate,
  mgmtEndDate,
  setMgmtEndDate,
  onRefresh,
}) {
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-sm font-semibold">Loading Management Dashboard...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 bg-rose-950/40 border border-rose-800 rounded-xl text-center space-y-3">
        <div className="text-2xl">⚠️</div>
        <div className="text-sm font-bold text-rose-400">Failed to load Management Data</div>
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

  const executiveKpis = {
    oee: data?.executiveKpis?.oee || data?.oee || { total: 0, availability: 0, performance: 0, quality: 0 },
    mpsFulfillmentPct: data?.executiveKpis?.mpsFulfillmentPct ?? data?.mpsFulfillment ?? 0,
    totalDemandPlan: data?.executiveKpis?.totalDemandPlan ?? data?.targetQty ?? 0,
    totalProducedQty: data?.executiveKpis?.totalProducedQty ?? data?.actualQty ?? 0,
    totalShots: data?.executiveKpis?.totalShots ?? data?.totalShotCount ?? 0,
    totalRmConsumedKg: data?.executiveKpis?.totalRmConsumedKg ?? data?.rmConsumed_kg ?? 0,
    totalTonnage: data?.executiveKpis?.totalTonnage ?? data?.rmTonnage ?? 0,
    scrapPct: data?.executiveKpis?.scrapPct || (typeof data?.scrapPct === 'number' ? `${data.scrapPct.toFixed(2)}%` : `${data?.scrapPct || '0.00%'}`),
    scrapPpm: data?.executiveKpis?.scrapPpm ?? data?.scrapPPM ?? 0,
    machineUtilizationPct: data?.executiveKpis?.machineUtilizationPct ?? data?.machineUtilization ?? 0,
    totalGrossRunHours: data?.executiveKpis?.totalGrossRunHours ?? data?.totalLoggedHrs ?? 0,
  };

  const bestInPlant = {
    topMoldingOperator: data?.bestInPlant?.topMoldingOperator || (data?.bestOperator ? {
      name: data.bestOperator.name,
      output: data.bestOperator.output,
      quality: data.bestOperator.quality,
    } : { name: '—', output: 0, quality: '0%' }),
    topFinishingOperator: data?.bestInPlant?.topFinishingOperator || (data?.bestFinishing ? {
      name: data.bestFinishing.name,
      output: data.bestFinishing.processed,
    } : { name: '—', output: 0 }),
    topMachine: data?.bestInPlant?.topMachine || (data?.bestMachine ? {
      name: data.bestMachine.name,
      shots: data.bestMachine.shots,
      oee: data.bestMachine.oee,
    } : { name: '—', shots: 0, oee: '0%' }),
    topCustomerPart: data?.bestInPlant?.topCustomerPart || (data?.topCustomerPart ? {
      partName: data.topCustomerPart.name,
      output: data.topCustomerPart.qty,
    } : { partName: '—', output: 0 }),
  };

  const customerPlanVsActual = data?.customerPlanVsActual || data?.customerWisePlan || [];
  const mouldHealth = data?.mouldHealth || [];
  const shiftOeeComparison = data?.shiftOeeComparison || data?.shiftWiseOEE || [];

  // Export Executive MIS CSV
  const handleExportCsv = () => {
    const headers = ['Metric', 'Value', 'Details'];
    const rows = [
      ['Plant Overall OEE', `${executiveKpis.oee.total}%`, `Avail ${executiveKpis.oee.availability}% | Perf ${executiveKpis.oee.performance}% | Qty ${executiveKpis.oee.quality}%`],
      ['MPS Demand Fulfillment', `${executiveKpis.mpsFulfillmentPct}%`, `${executiveKpis.totalProducedQty.toLocaleString()} / ${executiveKpis.totalDemandPlan.toLocaleString()} pcs`],
      ['Total Net Output', `${executiveKpis.totalProducedQty.toLocaleString()} pcs`, `Total Shots: ${executiveKpis.totalShots.toLocaleString()}`],
      ['Raw Material Consumed', `${executiveKpis.totalRmConsumedKg.toLocaleString()} kg`, `${executiveKpis.totalTonnage} Metric Tonnes`],
      ['Plant Scrap %', executiveKpis.scrapPct, `${executiveKpis.scrapPpm} PPM`],
      ['Machine Fleet Utilization', `${executiveKpis.machineUtilizationPct}%`, `${executiveKpis.totalGrossRunHours} Gross Run Hours`],
      ['Top Molding Operator', bestInPlant.topMoldingOperator.name, `${bestInPlant.topMoldingOperator.output?.toLocaleString()} pcs (${bestInPlant.topMoldingOperator.quality} Qty)`],
      ['Top Finishing Operator', bestInPlant.topFinishingOperator.name, `${bestInPlant.topFinishingOperator.output?.toLocaleString()} pcs processed`],
      ['Top Machine Press', bestInPlant.topMachine.name, `${bestInPlant.topMachine.shots?.toLocaleString()} shots (${bestInPlant.topMachine.oee} OEE)`],
      ['Top Customer Part', bestInPlant.topCustomerPart.partName, `${bestInPlant.topCustomerPart.output?.toLocaleString()} pcs produced`],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SHRP_Executive_MIS_${mgmtStartDate}_to_${mgmtEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* 1. EXECUTIVE FILTER & DATE RANGE RIBBON */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-wrap justify-between items-center gap-3 shadow-lg">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-black tracking-wider text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span>👔</span> Executive Analytics MIS
          </span>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
            {[
              { key: 'today', label: 'Today' },
              { key: 'yesterday', label: 'Yesterday' },
              { key: 'week', label: 'This Week' },
              { key: 'mtd', label: 'Month to Date (MTD)' },
              { key: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => handlePeriodChange(p.key)}
                className={`px-3 py-1 rounded transition-all ${
                  mgmtPeriod === p.key
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {mgmtPeriod === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={mgmtStartDate}
                onChange={(e) => setMgmtStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-amber-500"
              />
              <span className="text-slate-500">to</span>
              <input
                type="date"
                value={mgmtEndDate}
                onChange={(e) => setMgmtEndDate(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md transition-all"
          >
            <span>📥</span> Download Executive MIS (Excel/CSV)
          </button>
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs"
          >
            🔄
          </button>
        </div>
      </div>

      {/* 2. HIGH-LEVEL EXECUTIVE METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Plant OEE % */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plant OEE %</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{executiveKpis.oee.total}%</div>
          <div className="text-[10px] text-slate-400 mt-1">
            Avail {executiveKpis.oee.availability}% • Perf {executiveKpis.oee.performance}% • Qty {executiveKpis.oee.quality}%
          </div>
        </div>

        {/* MPS Fulfillment */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">MPS Fulfillment</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{executiveKpis.mpsFulfillmentPct}%</div>
          <div className="text-[10px] text-emerald-400 mt-1">
            {(executiveKpis.totalProducedQty / 1000).toFixed(1)}k / {(executiveKpis.totalDemandPlan / 1000 || 450).toFixed(1)}k Target
          </div>
        </div>

        {/* Total Net Output */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Net Output</div>
          <div className="text-2xl font-black text-sky-400 mt-1">
            {executiveKpis.totalProducedQty.toLocaleString()} <span className="text-xs font-normal">pcs</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Total Shots: <strong>{executiveKpis.totalShots.toLocaleString()}</strong>
          </div>
        </div>

        {/* RM Consumed */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">RM Consumed (Kg)</div>
          <div className="text-2xl font-black text-purple-400 mt-1">
            {executiveKpis.totalRmConsumedKg.toLocaleString()} <span className="text-xs font-normal">kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {executiveKpis.totalTonnage} Metric Tonnes
          </div>
        </div>

        {/* Plant Scrap % */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plant Scrap %</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{executiveKpis.scrapPct}</div>
          <div className="text-[10px] text-emerald-400 mt-1">
            {executiveKpis.scrapPpm.toLocaleString()} PPM (Industry &lt; 15,000)
          </div>
        </div>

        {/* Machine Fleet Utilization */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-center shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fleet Utilization</div>
          <div className="text-2xl font-black text-teal-400 mt-1">{executiveKpis.machineUtilizationPct}%</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {executiveKpis.totalGrossRunHours} Gross Run Hours
          </div>
        </div>
      </div>

      {/* 3. BEST IN PLANT (ALL STAGES LEADERBOARD) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Best Operator (Molding) */}
        <div className="bg-slate-900 border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent p-4 rounded-xl shadow-sm">
          <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">🏆 Best Operator (Molding)</div>
          <div className="text-sm font-extrabold text-white mt-1">{bestInPlant.topMoldingOperator.name}</div>
          <div className="text-xs text-slate-300 mt-0.5">
            {bestInPlant.topMoldingOperator.output?.toLocaleString()} pcs • {bestInPlant.topMoldingOperator.quality} Quality
          </div>
        </div>

        {/* Best Employee (Finishing / Trimming) */}
        <div className="bg-slate-900 border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-transparent p-4 rounded-xl shadow-sm">
          <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">✂️ Best Finishing / Deflashing</div>
          <div className="text-sm font-extrabold text-white mt-1">{bestInPlant.topFinishingOperator.name}</div>
          <div className="text-xs text-slate-300 mt-0.5">
            {bestInPlant.topFinishingOperator.output?.toLocaleString()} pcs processed • Zero Burr Rejection
          </div>
        </div>

        {/* Top Press */}
        <div className="bg-slate-900 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 rounded-xl shadow-sm">
          <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">⚙️ Top Performing Press</div>
          <div className="text-sm font-extrabold text-white mt-1">{bestInPlant.topMachine.name}</div>
          <div className="text-xs text-slate-300 mt-0.5">
            {bestInPlant.topMachine.oee} OEE • {bestInPlant.topMachine.shots?.toLocaleString()} shots
          </div>
        </div>

        {/* Star Customer Part */}
        <div className="bg-slate-900 border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent p-4 rounded-xl shadow-sm">
          <div className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">⭐ Top Customer Part</div>
          <div className="text-sm font-extrabold text-white mt-1 truncate">{bestInPlant.topCustomerPart.partName}</div>
          <div className="text-xs text-slate-300 mt-0.5">
            {bestInPlant.topCustomerPart.output?.toLocaleString()} pcs • High Delivery On-Time
          </div>
        </div>
      </div>

      {/* 4. MANAGEMENT CHARTS (CUSTOMER PLAN VS ACTUAL & MOULD HEALTH) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer-Wise Plan vs Actual SVG Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📊</span> Customer-Wise Plan vs Actual Output
              </h3>
              <p className="text-xs text-slate-400">Automotive customer order demand vs actual fulfillment</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-3 rounded bg-amber-500"></span> Plan</span>
              <span className="flex items-center gap-1.5 text-slate-300"><span className="w-3 h-3 rounded bg-emerald-500"></span> Actual</span>
            </div>
          </div>

          <div className="w-full h-52 relative mt-2">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="480" y2="20" stroke="#334155" strokeDasharray="3" />
              <line x1="50" y1="80" x2="480" y2="80" stroke="#334155" strokeDasharray="3" />
              <line x1="50" y1="140" x2="480" y2="140" stroke="#334155" strokeDasharray="3" />
              <line x1="50" y1="170" x2="480" y2="170" stroke="#475569" />

              {/* Y Axis Labels */}
              <text x="15" y="25" fill="#64748b" fontSize="10">150k</text>
              <text x="15" y="85" fill="#64748b" fontSize="10">100k</text>
              <text x="15" y="145" fill="#64748b" fontSize="10">50k</text>

              {/* Dynamic Customer Bars */}
              {customerPlanVsActual.length > 0 ? customerPlanVsActual.slice(0, 5).map((c, idx) => {
                const maxVal = 150000;
                const planHeight = Math.min((c.planQty / maxVal) * 140, 140);
                const actualHeight = Math.min((c.actualQty / maxVal) * 140, 140);
                const startX = 75 + idx * 85;

                return (
                  <g key={idx} className="cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                    {/* Plan Bar */}
                    <rect x={startX} y={170 - planHeight} width="22" height={planHeight} rx="3" fill="#f59e0b" />
                    {/* Actual Bar */}
                    <rect x={startX + 26} y={170 - actualHeight} width="22" height={actualHeight} rx="3" fill="#10b981" />
                    <text x={startX + 5} y="185" fill="#94a3b8" fontSize="10" fontWeight="700">
                      {c.customerName.slice(0, 7).toUpperCase()}
                    </text>
                  </g>
                );
              }) : (
                <text x="250" y="100" textAnchor="middle" fill="#64748b" fontSize="12">
                  No Customer Schedule Data Available
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* Mould PM Health & Shot Counter Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>🛠️</span> Mould Life &amp; Shot Counter PM Alerts
            </h3>
            <p className="text-xs text-slate-400">Tooling condition and preventive maintenance thresholds</p>
          </div>

          <div className="space-y-3.5 my-3">
            {mouldHealth.slice(0, 4).map((m) => {
              const pct = m.pmIntervalShots > 0 ? Math.round((m.shotsSincePm / m.pmIntervalShots) * 100) : 0;
              const isDue = pct >= 90;
              const isWarning = pct >= 75 && pct < 90;

              return (
                <div key={m.id}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-white truncate max-w-[200px]">{m.mouldCode} ({m.mouldName || 'Tool'})</span>
                    <span className={isDue ? 'text-rose-400 font-bold' : isWarning ? 'text-amber-400' : 'text-emerald-400'}>
                      {m.shotsSincePm.toLocaleString()} / {m.pmIntervalShots.toLocaleString()} shots ({pct}% {isDue ? '- PM DUE' : ''})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isDue ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shift Comparison Summary */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800 text-center text-xs">
            {shiftOeeComparison.map((s, idx) => (
              <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold">{s.shift.toUpperCase()} OEE</div>
                <div className={`text-base font-extrabold mt-0.5 ${
                  idx === 0 ? 'text-emerald-400' : idx === 1 ? 'text-amber-400' : 'text-sky-400'
                }`}>
                  {s.oee}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Detail Drill-Down Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
