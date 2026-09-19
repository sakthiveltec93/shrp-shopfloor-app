import React, { useState, useEffect } from 'react';
import { api } from '../../api';

export default function MachineDetailModal({ machine, shiftDate, shiftCode, onClose }) {
  const [drilldownData, setDrilldownData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!machine?.machine_id) return;
    setLoading(true);
    api.dashboard.machineDrilldown(machine.machine_id, { date: shiftDate })
      .then((res) => {
        if (res && res.ok) {
          setDrilldownData(res.data);
        }
      })
      .catch((err) => console.error('Error fetching machine drilldown:', err))
      .finally(() => setLoading(false));
  }, [machine, shiftDate]);

  if (!machine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-amber-400 font-mono">{machine.machine_code}</span>
            <span className="text-xs text-slate-400 font-semibold">({machine.tonnage || 100} Ton Press)</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              machine.status === 'RUNNING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
              machine.status === 'SLOW' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
              machine.status === 'MOULD_CHANGE' ? 'bg-sky-950 text-sky-400 border border-sky-800' :
              'bg-rose-950 text-rose-400 border border-rose-800'
            }`}>
              ● {machine.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Active Job Information */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Loaded Part:</span>
              <span className="font-extrabold text-white text-sm block mt-0.5">{machine.shrp_part_code || machine.part_code || 'None'}</span>
              <span className="text-[11px] text-slate-400">{machine.part_name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Active Operator:</span>
              <span className="font-bold text-amber-300 text-sm block mt-0.5">{machine.current_operator_name || 'Not Logged In'}</span>
              <span className="text-[11px] text-slate-400">Cavities: {machine.cavity_count || 1}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Shift OK Output:</span>
              <span className="font-black text-emerald-400 text-base block mt-0.5">{(machine.total_good_qty || 0).toLocaleString()} <span className="text-xs text-slate-400">pcs</span></span>
              <span className="text-[11px] text-slate-400">Rejections: {machine.total_reject_qty || 0} pcs</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">IATF FPA Gate:</span>
              <span className="font-bold text-sm block mt-0.5">
                {machine.fpa_approval_status === 'APPROVED' ? (
                  <span className="text-emerald-400">✅ FPA Signed</span>
                ) : machine.fpa_approval_status === 'VISUAL_APPROVED' ? (
                  <span className="text-amber-400">⚡ Visual OK</span>
                ) : machine.fpa_approval_status === 'PENDING' ? (
                  <span className="text-rose-400 animate-pulse">⏳ QA Pending</span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </span>
              <span className="text-[11px] text-slate-400">Standard Cycle: {machine.standard_cycle_time_sec || 20}s</span>
            </div>
          </div>

          {/* Hourly Output Progression on this machine */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Hourly Production Entries</h4>
            {loading ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading machine log...</div>
            ) : drilldownData?.entries?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-2">Hour</th>
                      <th className="p-2">Operator</th>
                      <th className="p-2 text-right">Start Count</th>
                      <th className="p-2 text-right">End Count</th>
                      <th className="p-2 text-right">Shots</th>
                      <th className="p-2 text-right">OK Qty</th>
                      <th className="p-2 text-right">Scrap</th>
                      <th className="p-2 text-right">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {drilldownData.entries.map((pe) => (
                      <tr key={pe.id} className="hover:bg-slate-850">
                        <td className="p-2 font-bold text-sky-400">Hr {pe.hour_slot}</td>
                        <td className="p-2">{pe.operator_name || '—'}</td>
                        <td className="p-2 text-right font-mono">{pe.start_count?.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono">{pe.end_count?.toLocaleString()}</td>
                        <td className="p-2 text-right font-bold text-white">{(pe.end_count - pe.start_count).toLocaleString()}</td>
                        <td className="p-2 text-right font-bold text-emerald-400">{pe.good_qty?.toLocaleString()}</td>
                        <td className="p-2 text-right text-rose-400">{pe.reject_qty || 0}</td>
                        <td className="p-2 text-right font-semibold text-amber-400">{pe.efficiency_pct ? `${pe.efficiency_pct}%` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                No hourly production entries recorded for this machine today.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
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
