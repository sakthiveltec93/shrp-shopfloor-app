import React, { useState } from 'react';

export default function ShiftHandoverModal({ shiftDate, shiftCode, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    shiftDate: shiftDate || new Date().toISOString().slice(0, 10),
    shiftCode: shiftCode || 'A',
    incomingSupervisor: '',
    mouldNotes: '',
    machineIssues: '',
    materialNotes: '',
    remarks: '',
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fullRemarks = [
        formData.incomingSupervisor ? `Incoming Supervisor: ${formData.incomingSupervisor}` : '',
        formData.mouldNotes ? `Mould Status: ${formData.mouldNotes}` : '',
        formData.machineIssues ? `Machine Issues: ${formData.machineIssues}` : '',
        formData.materialNotes ? `RM Staging: ${formData.materialNotes}` : '',
        formData.remarks ? `Remarks: ${formData.remarks}` : '',
      ].filter(Boolean).join(' | ');

      await onSubmit({
        shiftDate: formData.shiftDate,
        shiftCode: formData.shiftCode,
        remarks: fullRemarks,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to submit handover remarks:', err);
      alert('Failed to save handover: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-amber-400">📝 Shift Handover Communication Log</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        {savedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="text-4xl">✅</div>
            <div className="text-base font-bold text-emerald-400">Handover Remarks Logged Successfully!</div>
            <p className="text-xs text-slate-400">Incoming shift supervisor and management notified.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Shift Date</label>
                <input
                  type="date"
                  value={formData.shiftDate}
                  onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Outgoing Shift</label>
                <select
                  value={formData.shiftCode}
                  onChange={(e) => setFormData({ ...formData, shiftCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="A">Shift I (08:00 - 16:30)</option>
                  <option value="B">Shift II (16:30 - 01:00)</option>
                  <option value="C">Shift III (01:00 - 08:00)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Incoming Shift Supervisor Name</label>
              <input
                type="text"
                placeholder="e.g. Anand R. / Suresh M."
                value={formData.incomingSupervisor}
                onChange={(e) => setFormData({ ...formData, incomingSupervisor: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Mould Setup & Setting In-Progress</label>
              <input
                type="text"
                placeholder="e.g. HSIM-04 mould loaded, waiting for 1st piece QA approval"
                value={formData.mouldNotes}
                onChange={(e) => setFormData({ ...formData, mouldNotes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Machine Breakdown / Temperature / Hydraulic Issues</label>
              <input
                type="text"
                placeholder="e.g. VSIM-02 nozzle heater fluctuating, maintenance informed"
                value={formData.machineIssues}
                onChange={(e) => setFormData({ ...formData, machineIssues: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Raw Material & Compound Staging</label>
              <input
                type="text"
                placeholder="e.g. Black Masterbatch staged for HSIM-01 to HSIM-03"
                value={formData.materialNotes}
                onChange={(e) => setFormData({ ...formData, materialNotes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">General Handover Instructions</label>
              <textarea
                rows={2}
                placeholder="Special instructions for customer priority dispatch, FIFO staging..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md flex items-center gap-1.5"
              >
                {saving ? 'Submitting...' : 'Submit Handover'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
