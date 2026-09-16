import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import CameraScanner from './CameraScanner';

export default function FpaModal({ machine, part, mould, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submittedFpa, setSubmittedFpa] = useState(null);

  // Master pre-loaded data
  const [fpaData, setFpaData] = useState({
    part: null,
    machine: null,
    mould: null,
    recipe: null,
    raw_materials: [],
    gauges: [],
    recent_fpa: null,
  });

  // Camera scanner modal
  const [showScanner, setShowScanner] = useState(false);

  // Form State
  const [rawMaterialId, setRawMaterialId] = useState('');
  const [rawMaterialLotNo, setRawMaterialLotNo] = useState('');
  const [regrindPercentage, setRegrindPercentage] = useState(0);

  // Visual Checks
  const [visualChecks, setVisualChecks] = useState({
    no_flash: true,
    no_sink_marks: true,
    no_short_shot: true,
    no_flow_lines: true,
    no_burn_marks: true,
    color_acceptable: true,
    surface_finish_ok: true,
  });

  // Process Parameters
  const [processParameters, setProcessParameters] = useState({
    zone1_temp: '',
    zone2_temp: '',
    zone3_temp: '',
    nozzle_temp: '',
    injection_pressure: '',
    holding_pressure: '',
    clamping_force: '',
    cooling_time_sec: '',
    cycle_time_sec: '',
  });

  // Multi-cavity Dimension Readings
  // array of { parameter_name, spec, nominal, lsl, usl, gauge_code, cavities: [val1, val2, ...] }
  const [dimensionReadings, setDimensionReadings] = useState([]);

  // Sign-offs & Approval
  const [signoffs, setSignoffs] = useState({
    technician_signed: false,
    qa_signed: false,
    supervisor_signed: false,
  });
  const [approvalStatus, setApprovalStatus] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');

  const draftKey = `fpa_draft_${machine?.id}_${part?.id}`;

  // Load initial data
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.fpa.getData(machine.id, part.id, mould?.id);
        setFpaData(res);

        // Pre-populate raw material from recipe if available
        if (res.recipe && res.recipe.material_id) {
          setRawMaterialId(res.recipe.material_id);
        }

        // Initialize cavities based on part cavity count
        const cavityCount = Math.max(1, Number(res.part?.cavity_count) || 1);

        // Set default dimensional parameters if none exist
        const defaultDims = [
          { parameter_name: 'Outer Diameter (OD)', spec: '25.0 ± 0.2 mm', nominal: 25.0, lsl: 24.8, usl: 25.2, gauge_code: '', cavities: Array(cavityCount).fill('') },
          { parameter_name: 'Wall Thickness', spec: '2.5 ± 0.1 mm', nominal: 2.5, lsl: 2.4, usl: 2.6, gauge_code: '', cavities: Array(cavityCount).fill('') },
          { parameter_name: 'Total Height / Length', spec: '50.0 ± 0.3 mm', nominal: 50.0, lsl: 49.7, usl: 50.3, gauge_code: '', cavities: Array(cavityCount).fill('') },
          { parameter_name: 'Inner Diameter (ID)', spec: '15.0 ± 0.15 mm', nominal: 15.0, lsl: 14.85, usl: 15.15, gauge_code: '', cavities: Array(cavityCount).fill('') },
        ];

        // Check if there is saved draft in localStorage
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            if (parsed.raw_material_id) setRawMaterialId(parsed.raw_material_id);
            if (parsed.raw_material_lot_no) setRawMaterialLotNo(parsed.raw_material_lot_no);
            if (parsed.regrind_percentage !== undefined) setRegrindPercentage(parsed.regrind_percentage);
            if (parsed.visual_checks) setVisualChecks(parsed.visual_checks);
            if (parsed.process_parameters) setProcessParameters(parsed.process_parameters);
            if (parsed.dimension_readings && parsed.dimension_readings.length > 0) {
              setDimensionReadings(parsed.dimension_readings);
            } else {
              setDimensionReadings(defaultDims);
            }
          } catch {
            setDimensionReadings(defaultDims);
          }
        } else {
          setDimensionReadings(defaultDims);
        }
      } catch (err) {
        setError(err.message || 'Failed to load FPA standards');
      } finally {
        setLoading(false);
      }
    }
    if (machine?.id && part?.id) {
      load();
    }
  }, [machine?.id, part?.id, mould?.id]);

  // Auto-save draft every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      if (!loading && machine?.id && part?.id) {
        const draft = {
          raw_material_id: rawMaterialId,
          raw_material_lot_no: rawMaterialLotNo,
          regrind_percentage: regrindPercentage,
          visual_checks: visualChecks,
          process_parameters: processParameters,
          dimension_readings: dimensionReadings,
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [loading, machine?.id, part?.id, rawMaterialId, rawMaterialLotNo, regrindPercentage, visualChecks, processParameters, dimensionReadings]);

  const handleDimensionChange = (dimIndex, cavityIndex, val) => {
    const updated = [...dimensionReadings];
    updated[dimIndex].cavities[cavityIndex] = val;
    setDimensionReadings(updated);
  };

  const handleGaugeChange = (dimIndex, gaugeCode) => {
    const updated = [...dimensionReadings];
    updated[dimIndex].gauge_code = gaugeCode;
    setDimensionReadings(updated);
  };

  const addDimensionRow = () => {
    const cavityCount = Math.max(1, Number(fpaData.part?.cavity_count) || 1);
    setDimensionReadings([
      ...dimensionReadings,
      { parameter_name: '', spec: '', nominal: 0, lsl: 0, usl: 0, gauge_code: '', cavities: Array(cavityCount).fill('') },
    ]);
  };

  const removeDimensionRow = (index) => {
    setDimensionReadings(dimensionReadings.filter((_, idx) => idx !== index));
  };

  const handleScanResult = (code) => {
    setShowScanner(false);
    // Code could be LOT:XYZ or direct lot number or RM code
    setRawMaterialLotNo(code.trim());
  };

  // Check if dimensional reading is within tolerance
  const isWithinTol = (val, lsl, usl) => {
    if (val === '' || val == null) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    return num >= Number(lsl) && num <= Number(usl);
  };

  // Validation before submission
  const validateForm = () => {
    if (!rawMaterialLotNo) {
      return 'Raw Material Lot / Heat No is required.';
    }
    const maxRegrind = Number(fpaData.recipe?.max_allowed_regrind_pct) || 0;
    if (Number(regrindPercentage) > maxRegrind) {
      return `Regrind % (${regrindPercentage}%) exceeds the approved maximum of ${maxRegrind}% for this part recipe.`;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const valErr = validateForm();
    if (valErr) {
      setError(valErr);
      return;
    }

    setSubmitting(true);
    try {
      const visualPassed = Object.values(visualChecks).every(Boolean);
      const payload = {
        machine_id: machine.id,
        part_id: part.id,
        mould_id: mould?.id || fpaData.mould?.id || null,
        raw_material_id: rawMaterialId || null,
        raw_material_lot_no: rawMaterialLotNo,
        regrind_percentage: Number(regrindPercentage) || 0,
        visual_check_passed: visualPassed,
        process_parameters: processParameters,
        dimension_readings: dimensionReadings,
        stage_signoffs: signoffs,
        approval_status: approvalStatus,
        remarks: remarks || 'Initial setup verification complete per IATF 16949 standards.',
      };

      const res = await api.fpa.submit(payload);
      setSubmittedFpa(res.submission);
      setSuccessMsg(`FPA Successfully Approved & Recorded (Inspection #${res.submission.inspection_no})`);
      localStorage.removeItem(draftKey);
      if (onSuccess) onSuccess(res.submission);
    } catch (err) {
      setError(err.message || 'Failed to submit First-Piece Approval');
    } finally {
      setSubmitting(false);
    }
  };

  const cavityCount = Math.max(1, Number(fpaData.part?.cavity_count) || 1);
  const maxRegrind = Number(fpaData.recipe?.max_allowed_regrind_pct) || 0;
  const isRegrindExceeded = Number(regrindPercentage) > maxRegrind;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/10 rounded-lg text-xl">🛡️</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">IATF 16949 First-Piece Approval (FPA)</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/30 border border-white/20 rounded">Clause 8.5.1.1</span>
              </div>
              <p className="text-xs text-blue-100">
                Machine: <span className="font-semibold text-white">{machine?.machine_code}</span> | Part: <span className="font-semibold text-white">{part?.shrp_part_code || part?.part_code}</span> ({part?.part_name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800 dark:text-slate-100 text-sm">
          {loading ? (
            <div className="py-16 text-center text-slate-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
              <p>Loading master process parameters & dimensional standards...</p>
            </div>
          ) : submittedFpa ? (
            /* Success & PDF Download Screen */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                ✓
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                FPA Approved Successfully!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Inspection Report <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">#{submittedFpa.inspection_no}</span> is now active. The machine session can now be started safely.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <a
                  href={api.fpa.downloadPdfUrl(submittedFpa.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow inline-flex items-center gap-2"
                >
                  <span>📄</span> Download IATF Setup Approval Report (PDF)
                </a>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-medium rounded-xl"
                >
                  Done & Start Production
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-3">
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* SECTION A: Raw Material & Lot Verification */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-xs">A</span>
                    Section A: Raw Material & Lot Verification
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    <span>📷</span> Scan RM Lot Barcode
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      Raw Material Grade
                    </label>
                    <select
                      value={rawMaterialId}
                      onChange={(e) => setRawMaterialId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                    >
                      <option value="">-- Select Material Grade --</option>
                      {fpaData.raw_materials?.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          {rm.material_code} - {rm.material_name} ({rm.grade})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      RM Lot / Heat Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LOT-2026-SEP-0048"
                      value={rawMaterialLotNo}
                      onChange={(e) => setRawMaterialLotNo(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Regrind % Used
                      </label>
                      <span className="text-xs text-slate-400">Max allowed: {maxRegrind}%</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={regrindPercentage}
                      onChange={(e) => setRegrindPercentage(e.target.value)}
                      className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border rounded-lg text-sm ${
                        isRegrindExceeded ? 'border-rose-500 bg-rose-50/50 text-rose-600' : 'border-slate-300 dark:border-slate-700'
                      }`}
                    />
                    {isRegrindExceeded && (
                      <p className="text-xs text-rose-500 mt-1">⚠️ Exceeds max allowed regrind ({maxRegrind}%)!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION B: Visual Inspection Standards */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-xs">B</span>
                    Section B: Visual Inspection & Workmanship Standard
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'no_flash', label: 'No Parting Line Flash' },
                    { id: 'no_sink_marks', label: 'No Sink Marks / Voids' },
                    { id: 'no_short_shot', label: 'No Short Shot / Incomplete' },
                    { id: 'no_flow_lines', label: 'No Weld / Flow Lines' },
                    { id: 'no_burn_marks', label: 'No Burn Marks / Charring' },
                    { id: 'color_acceptable', label: 'Color / Gloss Matches Master' },
                    { id: 'surface_finish_ok', label: 'Smooth Surface Texture' },
                  ].map((chk) => (
                    <label
                      key={chk.id}
                      className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={visualChecks[chk.id]}
                        onChange={(e) => setVisualChecks({ ...visualChecks, [chk.id]: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{chk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION C: Critical Process Parameters */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-xs">C</span>
                    Section C: Injection Molding Process Parameter Verification
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Zone 1 Temp (°C)</label>
                    <input
                      type="number"
                      placeholder="e.g. 190"
                      value={processParameters.zone1_temp}
                      onChange={(e) => setProcessParameters({ ...processParameters, zone1_temp: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Zone 2 Temp (°C)</label>
                    <input
                      type="number"
                      placeholder="e.g. 200"
                      value={processParameters.zone2_temp}
                      onChange={(e) => setProcessParameters({ ...processParameters, zone2_temp: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Zone 3 Temp (°C)</label>
                    <input
                      type="number"
                      placeholder="e.g. 210"
                      value={processParameters.zone3_temp}
                      onChange={(e) => setProcessParameters({ ...processParameters, zone3_temp: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Nozzle Temp (°C)</label>
                    <input
                      type="number"
                      placeholder="e.g. 215"
                      value={processParameters.nozzle_temp}
                      onChange={(e) => setProcessParameters({ ...processParameters, nozzle_temp: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Inj Pressure (bar)</label>
                    <input
                      type="number"
                      placeholder="e.g. 95"
                      value={processParameters.injection_pressure}
                      onChange={(e) => setProcessParameters({ ...processParameters, injection_pressure: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Clamping Force (T)</label>
                    <input
                      type="number"
                      placeholder="e.g. 150"
                      value={processParameters.clamping_force}
                      onChange={(e) => setProcessParameters({ ...processParameters, clamping_force: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Cooling Time (sec)</label>
                    <input
                      type="number"
                      placeholder="e.g. 18"
                      value={processParameters.cooling_time_sec}
                      onChange={(e) => setProcessParameters({ ...processParameters, cooling_time_sec: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Total Cycle Time (sec)</label>
                    <input
                      type="number"
                      placeholder="e.g. 32"
                      value={processParameters.cycle_time_sec}
                      onChange={(e) => setProcessParameters({ ...processParameters, cycle_time_sec: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION D: Multi-Cavity Dimensional Inspection */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-xs">D</span>
                      Section D: Multi-Cavity Dimensional Tolerance Inspection
                    </h3>
                    <p className="text-xs text-slate-500">Mould Cavities: {cavityCount} | Auto Pass/Fail vs LSL & USL</p>
                  </div>
                  <button
                    type="button"
                    onClick={addDimensionRow}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg"
                  >
                    + Add Parameter
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 uppercase font-semibold">
                      <tr>
                        <th className="p-2">Param Name & Spec</th>
                        <th className="p-2 text-center">Nominal</th>
                        <th className="p-2 text-center">LSL</th>
                        <th className="p-2 text-center">USL</th>
                        <th className="p-2">Gauge Code</th>
                        {Array.from({ length: cavityCount }).map((_, cIdx) => (
                          <th key={cIdx} className="p-2 text-center">Cav #{cIdx + 1}</th>
                        ))}
                        <th className="p-2 text-center">Status</th>
                        <th className="p-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {dimensionReadings.map((dim, dIdx) => {
                        // Check overall row status
                        const hasValues = dim.cavities.some((c) => c !== '');
                        const allPass = hasValues && dim.cavities.every((c) => c === '' || isWithinTol(c, dim.lsl, dim.usl));
                        const anyFail = hasValues && dim.cavities.some((c) => c !== '' && !isWithinTol(c, dim.lsl, dim.usl));

                        return (
                          <tr key={dIdx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                            <td className="p-2">
                              <input
                                type="text"
                                placeholder="Parameter name"
                                value={dim.parameter_name}
                                onChange={(e) => {
                                  const updated = [...dimensionReadings];
                                  updated[dIdx].parameter_name = e.target.value;
                                  setDimensionReadings(updated);
                                }}
                                className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-medium mb-1"
                              />
                              <input
                                type="text"
                                placeholder="Spec (e.g. 25 ± 0.2)"
                                value={dim.spec}
                                onChange={(e) => {
                                  const updated = [...dimensionReadings];
                                  updated[dIdx].spec = e.target.value;
                                  setDimensionReadings(updated);
                                }}
                                className="w-full px-2 py-0.5 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-500"
                              />
                            </td>
                            <td className="p-2 w-16">
                              <input
                                type="number"
                                step="any"
                                value={dim.nominal}
                                onChange={(e) => {
                                  const updated = [...dimensionReadings];
                                  updated[dIdx].nominal = Number(e.target.value);
                                  setDimensionReadings(updated);
                                }}
                                className="w-full px-1.5 py-1 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono"
                              />
                            </td>
                            <td className="p-2 w-16">
                              <input
                                type="number"
                                step="any"
                                value={dim.lsl}
                                onChange={(e) => {
                                  const updated = [...dimensionReadings];
                                  updated[dIdx].lsl = Number(e.target.value);
                                  setDimensionReadings(updated);
                                }}
                                className="w-full px-1.5 py-1 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-blue-600"
                              />
                            </td>
                            <td className="p-2 w-16">
                              <input
                                type="number"
                                step="any"
                                value={dim.usl}
                                onChange={(e) => {
                                  const updated = [...dimensionReadings];
                                  updated[dIdx].usl = Number(e.target.value);
                                  setDimensionReadings(updated);
                                }}
                                className="w-full px-1.5 py-1 text-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded font-mono text-blue-600"
                              />
                            </td>
                            <td className="p-2 w-28">
                              <select
                                value={dim.gauge_code || ''}
                                onChange={(e) => handleGaugeChange(dIdx, e.target.value)}
                                className="w-full px-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs"
                              >
                                <option value="">Select Gauge</option>
                                {fpaData.gauges?.map((g) => (
                                  <option key={g.id} value={g.gauge_code}>
                                    {g.gauge_code} ({g.gauge_name})
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Cavity Readings */}
                            {Array.from({ length: cavityCount }).map((_, cIdx) => {
                              const val = dim.cavities[cIdx];
                              const ok = isWithinTol(val, dim.lsl, dim.usl);
                              let borderCls = 'border-slate-300 dark:border-slate-700';
                              if (val !== '' && ok === true) borderCls = 'border-emerald-500 bg-emerald-50/40 text-emerald-700 dark:text-emerald-300';
                              if (val !== '' && ok === false) borderCls = 'border-rose-500 bg-rose-50/40 text-rose-700 dark:text-rose-300 font-bold';

                              return (
                                <td key={cIdx} className="p-2 w-20">
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder={`Cav ${cIdx + 1}`}
                                    value={val}
                                    onChange={(e) => handleDimensionChange(dIdx, cIdx, e.target.value)}
                                    className={`w-full px-1.5 py-1 text-center bg-white dark:bg-slate-900 border rounded font-mono ${borderCls}`}
                                  />
                                </td>
                              );
                            })}

                            <td className="p-2 text-center">
                              {anyFail ? (
                                <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 rounded-full font-bold">FAIL</span>
                              ) : allPass ? (
                                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">PASS</span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeDimensionRow(dIdx)}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION E: Digital Sign-off & Overall Decision */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-xs">E</span>
                    Section E: Multi-Tier Digital Sign-Off & Status Determination
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signoffs.technician_signed}
                      onChange={(e) => setSignoffs({ ...signoffs, technician_signed: e.target.checked })}
                      className="rounded text-blue-600 h-4 w-4"
                    />
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">1. Mould Setup Technician</div>
                      <div className="text-[11px] text-slate-500">Mould clamping & heat verification</div>
                    </div>
                  </label>

                  <label className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signoffs.qa_signed}
                      onChange={(e) => setSignoffs({ ...signoffs, qa_signed: e.target.checked })}
                      className="rounded text-blue-600 h-4 w-4"
                    />
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">2. Quality Inspector (QA)</div>
                      <div className="text-[11px] text-slate-500">Visual & dimensional tolerance check</div>
                    </div>
                  </label>

                  <label className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={signoffs.supervisor_signed}
                      onChange={(e) => setSignoffs({ ...signoffs, supervisor_signed: e.target.checked })}
                      className="rounded text-blue-600 h-4 w-4"
                    />
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">3. Production Supervisor</div>
                      <div className="text-[11px] text-slate-500">Final production authorization</div>
                    </div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Final Approval Decision
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['APPROVED', 'CONDITIONAL', 'REJECTED'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setApprovalStatus(st)}
                          className={`py-2 text-xs font-bold rounded-lg border transition ${
                            approvalStatus === st
                              ? st === 'APPROVED'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                                : st === 'CONDITIONAL'
                                ? 'bg-amber-600 text-white border-amber-600 shadow'
                                : 'bg-rose-600 text-white border-rose-600 shadow'
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Inspector Remarks & Notes
                    </label>
                    <input
                      type="text"
                      placeholder="Notes on visual finish, tool condition, or conditional clearance"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Auto-draft saved locally
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || isRegrindExceeded}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? 'Submitting...' : 'Sign & Submit FPA Approval'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

      </div>

      {/* Embedded Barcode Scanner Camera Modal */}
      {showScanner && (
        <CameraScanner
          title="Scan Raw Material Lot QR / Barcode"
          onScan={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
