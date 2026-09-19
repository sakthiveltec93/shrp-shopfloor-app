import React from 'react';

export default function MetricDetailModal({ metricKey, data, onClose }) {
  if (!metricKey) return null;

  const renderContent = () => {
    switch (metricKey) {
      case 'activeMachines':
        return (
          <div>
            <h4 className="text-sm font-bold text-amber-400 mb-2">Active Machines Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-2">Machine</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Part</th>
                    <th className="p-2">Operator</th>
                    <th className="p-2 text-right">OK Qty</th>
                    <th className="p-2 text-right">Rej Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.machines?.map((m) => (
                    <tr key={m.machine_id} className="hover:bg-slate-850">
                      <td className="p-2 font-bold text-white">{m.machine_code}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.status === 'RUNNING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          m.status === 'SLOW' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          m.status === 'MOULD_CHANGE' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
                          'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-2">{m.part_code || m.part_name || '—'}</td>
                      <td className="p-2">{m.current_operator_name || '—'}</td>
                      <td className="p-2 text-right font-bold text-emerald-400">{(m.total_good_qty || 0).toLocaleString()}</td>
                      <td className="p-2 text-right text-rose-400">{(m.total_reject_qty || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'shiftOutput':
        return (
          <div>
            <h4 className="text-sm font-bold text-sky-400 mb-2">Shift Output by Part</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-2">Part Code</th>
                    <th className="p-2">Part Name</th>
                    <th className="p-2 text-right">Cavity</th>
                    <th className="p-2 text-right">Total OK (pcs)</th>
                    <th className="p-2 text-right">Total Shots</th>
                    <th className="p-2 text-right">Rejection %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.topPerformers?.partSummary?.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-850">
                      <td className="p-2 font-mono font-bold text-white">{p.partCode}</td>
                      <td className="p-2">{p.partName}</td>
                      <td className="p-2 text-right">{p.cavityCount}</td>
                      <td className="p-2 text-right font-bold text-sky-400">{p.goodQty.toLocaleString()}</td>
                      <td className="p-2 text-right">{p.shots.toLocaleString()}</td>
                      <td className="p-2 text-right text-slate-300">{p.rejectionPct}%</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500">No shift output logs recorded yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'pendingFpa':
        return (
          <div>
            <h4 className="text-sm font-bold text-amber-400 mb-2">Pending First Piece Approvals (FPA Gate)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-2">FPA ID</th>
                    <th className="p-2">Machine</th>
                    <th className="p-2">Part</th>
                    <th className="p-2">Submitted By</th>
                    <th className="p-2">Waiting Status</th>
                    <th className="p-2 text-right">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.pendingFpa?.map((f) => (
                    <tr key={f.fpa_id} className="hover:bg-slate-850">
                      <td className="p-2 font-mono font-bold text-amber-400">#{f.fpa_id}</td>
                      <td className="p-2 font-bold text-white">{f.machine_code}</td>
                      <td className="p-2">{f.part_code || f.shrp_part_code}</td>
                      <td className="p-2">{f.submitted_by_name || 'Technician'}</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          {f.approval_status}
                        </span>
                      </td>
                      <td className="p-2 text-right text-rose-400 font-bold">{Math.round(f.pending_minutes || 0)} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'materialAlerts':
        return (
          <div>
            <h4 className="text-sm font-bold text-rose-400 mb-2">Critical Material Stock Alert Register</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-2">Code</th>
                    <th className="p-2">Material Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2 text-right">Current Stock</th>
                    <th className="p-2 text-right">Min Threshold</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.materialAlerts?.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-850">
                      <td className="p-2 font-mono font-bold text-white">{m.material_code}</td>
                      <td className="p-2">{m.material_name}</td>
                      <td className="p-2 text-slate-400">{m.category || 'Compound'}</td>
                      <td className="p-2 text-right font-bold text-amber-400">{Math.round(m.total_stock_kg)} kg</td>
                      <td className="p-2 text-right text-slate-400">{Math.round(m.min_stock_kg)} kg</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          m.stock_status === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {m.stock_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'mouldAudit':
        return (
          <div>
            <h4 className="text-sm font-bold text-sky-400 mb-2">Recent Mould Change Audit Records</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-2">Machine</th>
                    <th className="p-2">Loaded Part</th>
                    <th className="p-2">Previous Part</th>
                    <th className="p-2">Reason</th>
                    <th className="p-2">Changed By</th>
                    <th className="p-2">Loaded At</th>
                    <th className="p-2">Approved At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.mouldChanges?.map((mc) => (
                    <tr key={mc.assignment_id} className="hover:bg-slate-850">
                      <td className="p-2 font-bold text-amber-400">{mc.machine_code}</td>
                      <td className="p-2 font-semibold text-white">{mc.shrp_part_code || mc.part_code}</td>
                      <td className="p-2 text-slate-400">{mc.previous_shrp_part_code || mc.previous_part_code || '—'}</td>
                      <td className="p-2"><span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300">{mc.reason_name || mc.reason || 'Plan Done'}</span></td>
                      <td className="p-2 text-slate-300">{mc.changed_by_name || 'Supervisor'}</td>
                      <td className="p-2 text-slate-400">{mc.mould_load_started_at ? new Date(mc.mould_load_started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="p-2 text-emerald-400 font-semibold">{mc.approved_at ? new Date(mc.approved_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return <div className="text-sm text-slate-400">Detailed metric records preview.</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-slate-800 bg-slate-950">
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <span>🔍</span> Metric Deep Dive
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {renderContent()}
        </div>
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
