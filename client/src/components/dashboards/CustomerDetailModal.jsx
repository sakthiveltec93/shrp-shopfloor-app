import React from 'react';

export default function CustomerDetailModal({ customer, onClose }) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-amber-400">🏢 {customer.customerName}</span>
            <span className="text-xs text-slate-400">({customer.fulfillmentPct}% Fulfilled)</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">MPS Demand Plan</span>
              <span className="text-lg font-black text-amber-400 mt-1 block">{(customer.planQty || 0).toLocaleString()} <span className="text-xs font-normal">pcs</span></span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Actual Produced</span>
              <span className="text-lg font-black text-emerald-400 mt-1 block">{(customer.actualQty || 0).toLocaleString()} <span className="text-xs font-normal">pcs</span></span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Variance</span>
              <span className={`text-lg font-black mt-1 block ${(customer.actualQty - customer.planQty) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {((customer.actualQty || 0) - (customer.planQty || 0)).toLocaleString()} pcs
              </span>
            </div>
          </div>

          {/* Fulfillment Progress Bar */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
              <span>Overall Schedule Delivery</span>
              <span className="text-amber-400">{customer.fulfillmentPct}% Complete</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(customer.fulfillmentPct || 0, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="text-xs text-slate-400 italic">
            * Data synchronized with Master Production Schedule (MPS) and customer dispatch logs.
          </div>
        </div>

        {/* Footer */}
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
