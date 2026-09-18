import React, { useState, useEffect } from 'react';
import { api } from '../api';
import CameraScanner from './CameraScanner';

export default function FpaModal({ machine, part, mould, assignment, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedFpa, setSubmittedFpa] = useState(null);

  const effMachineId = machine?.id || assignment?.machine_id;
  const effPartId = part?.id || assignment?.part_id;
  const effMouldId = mould?.id || assignment?.mould_id;
  const effAssignmentId = assignment?.assignment_id || assignment?.id;

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
  const [dimensionReadings, setDimensionReadings] = useState([]);

  // FPA Mode: 'first_off' (5 samples) vs 'full_fpa' (all cavities)
  const [fpaMode, setFpaMode] = useState('first_off');

  // Sign-offs & Approval
  const [signoffs, setSignoffs] = useState({
    technician_signed: false,
    qa_signed: false,
    supervisor_signed: false,
  });
  const [approvalStatus, setApprovalStatus] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [customVisualTime, setCustomVisualTime] = useState('');
  const [customApprovalTime, setCustomApprovalTime] = useState('');

  const draftKey = `fpa_draft_${effMachineId}_${effPartId}`;

  // Load initial data
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.fpa.getData(effMachineId, effPartId, effMouldId, effAssignmentId);
        setFpaData(res);

        if (res.recipe && (res.recipe.primary_material_id || res.recipe.material_id)) {
          setRawMaterialId(res.recipe.primary_material_id || res.recipe.material_id);
        }

        const cavityCount = Math.max(1, Number(res.part?.cavity_count) || Number(part?.cavity_count) || Number(assignment?.cavity_count) || 1);

        let defaultDims = [];
        if (res.standardDimensions && res.standardDimensions.length > 0) {
          defaultDims = res.standardDimensions.map((sd) => {
            const nominal = Number(sd.nominal_value) || 0;
            const tolPlus = Number(sd.tol_plus) || 0;
            const tolMinus = Number(sd.tol_minus) || 0;
            const lsl = sd.lsl != null && !isNaN(Number(sd.lsl)) ? Number(sd.lsl) : (nominal - tolMinus);
            const usl = sd.usl != null && !isNaN(Number(sd.usl)) ? Number(sd.usl) : (nominal + tolPlus);
            return {
              parameter_name: sd.dimension_name,
              spec: `${sd.nominal_value ?? '—'} (+${sd.tol_plus ?? 0}/-${sd.tol_minus ?? 0}) ${sd.unit || 'mm'}`,
              nominal,
              lsl,
              usl,
              gauge_code: '',
              cavities: Array(cavityCount).fill(''),
            };
          });
        } else {
          // Zero fake fallback rows — must come from master or operator input
          defaultDims = [];
        }

        if (res.standardProcessParameters && res.standardProcessParameters.length > 0) {
          const paramMap = {};
          res.standardProcessParameters.forEach((p) => {
            const k = p.parameter_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
            paramMap[k] = p.value;
          });
          setProcessParameters((prev) => ({ ...paramMap, ...prev }));
        }

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
    if (effMachineId && effPartId) {
      load();
    } else if (effAssignmentId) {
      load();
    }
  }, [effMachineId, effPartId, effMouldId, effAssignmentId]);

  // Auto-save draft every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      if (!loading && (effMachineId || effAssignmentId)) {
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
  }, [loading, effMachineId, effPartId, effAssignmentId, rawMaterialId, rawMaterialLotNo, regrindPercentage, visualChecks, processParameters, dimensionReadings]);

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
    setRawMaterialLotNo(code.trim());
  };

  const isWithinTol = (val, lsl, usl) => {
    if (val === '' || val == null) return null;
    const num = Number(val);
    if (isNaN(num)) return null;
    return num >= Number(lsl) && num <= Number(usl);
  };

  const validateForm = (isVisualOnly = false) => {
    if (!rawMaterialLotNo) {
      return 'Raw Material Lot / Heat No is required.';
    }
    const maxRegrind = Number(fpaData.recipe?.max_allowed_regrind_pct) || 0;
    if (Number(regrindPercentage) > maxRegrind) {
      return `Regrind % (${regrindPercentage}%) exceeds the approved maximum of ${maxRegrind}% for this part recipe.`;
    }
    if (!isVisualOnly) {
      if (!dimensionReadings || dimensionReadings.length === 0 || dimensionReadings.every((d) => !d.parameter_name || !d.parameter_name.trim())) {
        return 'Cannot submit Full FPA: No critical dimensions are configured for this part. Please configure dimensions in Part Master or click "+ Add Parameter" before submitting.';
      }
    }
    return null;
  };

  const handleVisualSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const valErr = validateForm(true);
    if (valErr) {
      setError(valErr);
      return;
    }

    setSubmitting(true);
    try {
      const visualPassed = Object.values(visualChecks).every(Boolean);
      const payload = {
        assignment_id: effAssignmentId || null,
        machine_id: effMachineId,
        part_id: effPartId,
        mould_id: effMouldId || fpaData.mould?.id || null,
        raw_material_id: rawMaterialId || null,
        raw_material_lot_no: rawMaterialLotNo,
        regrind_percentage: Number(regrindPercentage) || 0,
        visual_check_passed: visualPassed,
        process_parameters: processParameters,
        dimension_readings: dimensionReadings,
        stage_signoffs: signoffs,
        submission_type: fpaMode === 'first_off' ? 'FIRST_OFF_SIGNOFF' : 'FPA',
        approval_status: 'VISUAL_APPROVED',
        remarks: remarks || 'Visual approval granted. Machine unblocked; Full approval due within 2 hours.',
        visual_approved_at: customVisualTime ? new Date(customVisualTime).toISOString() : undefined,
      };

      const res = await api.fpa.submit(payload);
      setSubmittedFpa(res.submission);
      localStorage.removeItem(draftKey);
      if (onSuccess) onSuccess(res.submission);
    } catch (err) {
      setError(err.message || 'Failed to submit Visual Approval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    const valErr = validateForm(false);
    if (valErr) {
      setError(valErr);
      return;
    }

    setSubmitting(true);
    try {
      const visualPassed = Object.values(visualChecks).every(Boolean);
      const payload = {
        assignment_id: effAssignmentId || null,
        machine_id: effMachineId,
        part_id: effPartId,
        mould_id: effMouldId || fpaData.mould?.id || null,
        raw_material_id: rawMaterialId || null,
        raw_material_lot_no: rawMaterialLotNo,
        regrind_percentage: Number(regrindPercentage) || 0,
        visual_check_passed: visualPassed,
        process_parameters: processParameters,
        dimension_readings: dimensionReadings,
        stage_signoffs: signoffs,
        submission_type: fpaMode === 'first_off' ? 'FIRST_OFF_SIGNOFF' : 'FPA',
        approval_status: approvalStatus === 'VISUAL_APPROVED' ? 'APPROVED' : approvalStatus,
        deviation_no: deviationNo || null,
        remarks: remarks || 'Full approval verified per IATF 16949 standards.',
        visual_approved_at: customVisualTime ? new Date(customVisualTime).toISOString() : undefined,
        approved_at: customApprovalTime ? new Date(customApprovalTime).toISOString() : undefined,
      };

      const res = await api.fpa.submit(payload);
      setSubmittedFpa(res.submission);
      localStorage.removeItem(draftKey);
      if (onSuccess) onSuccess(res.submission);
    } catch (err) {
      const submissionType = fpaMode === 'first_off' ? 'First-Off Sign-Off' : 'First-Piece Approval';
      setError(err.message || `Failed to submit ${submissionType}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalCavities = Math.max(1, Number(fpaData.part?.cavity_count) || 1);
  const cavityCount = fpaMode === 'first_off' ? Math.min(5, totalCavities) : totalCavities;
  const maxRegrind = Number(fpaData.recipe?.max_allowed_regrind_pct) || 0;
  const isRegrindExceeded = Number(regrindPercentage) > maxRegrind;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
    }}>
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12,
        width: '100%', maxWidth: 840, maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '14px 18px', borderBottom: '2px solid var(--amber)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(245, 158, 11, 0.08)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <strong style={{ fontSize: 16, color: 'var(--amber)' }}>First-Off Sign-Off Form & IATF 16949 FPA</strong>
              <span style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 4, color: 'var(--text-muted)' }}>
                Clause 8.5.1.1
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Machine: <strong style={{ color: '#fff' }}>{machine?.machine_code || assignment?.machine_code || fpaData.machine?.machine_code || fpaData.assignment?.machine_code || 'Machine'}</strong> · Part: <span className="shrp-code-pill" style={{ fontSize: 11, marginLeft: 4 }}>{part?.shrp_part_code || part?.part_code || assignment?.shrp_part_code || assignment?.part_code || fpaData.part?.shrp_part_code || fpaData.part?.part_code || 'Part'}</span> {part?.part_name || assignment?.part_name || fpaData.part?.part_name || ''}
              <div style={{ fontSize: 11, marginTop: 4, color: 'var(--green)', fontWeight: 600 }}>✓ Collect dimensional, visual, and process parameter data before production entry approval</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading master process standards and dimensional specs...
            </div>
          ) : submittedFpa ? (
            /* Success Screen with PDF Download */
            <div style={{ padding: '30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: submittedFpa.approval_status === 'VISUAL_APPROVED' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34,197,94,0.15)',
                border: `2px solid ${submittedFpa.approval_status === 'VISUAL_APPROVED' ? 'var(--amber)' : 'var(--green)'}`,
                color: submittedFpa.approval_status === 'VISUAL_APPROVED' ? 'var(--amber)' : 'var(--green)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
              }}>
                {submittedFpa.approval_status === 'VISUAL_APPROVED' ? '⚡' : '✓'}
              </div>
              <h3 style={{ margin: 0, fontSize: 18, color: '#fff' }}>
                {submittedFpa.approval_status === 'VISUAL_APPROVED' ? '⚡ Visual Approval Granted!' : 'FPA Approved & Verified!'}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', maxWidth: 460 }}>
                {submittedFpa.approval_status === 'VISUAL_APPROVED' ? (
                  <>
                    Machine is unblocked and permitted to start production. <strong style={{ color: 'var(--amber)' }}>Full measured FPA must be completed by supervisor within 2 hours</strong> (or before 3rd entry).
                  </>
                ) : (
                  <>
                    Inspection Report <strong style={{ color: 'var(--amber)' }}>#{submittedFpa.inspection_no}</strong> is active. Full setup verification complete and certified.
                  </>
                )}
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
                <a
                  href={api.fpa.downloadPdfUrl(submittedFpa.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <span>📄</span>
                  <span>Download IATF Setup Report (PDF)</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: 13 }}
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: 13, fontWeight: 600 }}>
                  ⚠ {error}
                </div>
              )}

              {/* SECTION A: Raw Material & Lot */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 8, marginBottom: 12 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--amber)' }}>
                      Section A: Raw Material & Lot Verification
                    </strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>First-Off Form: Verify resin grade, lot traceability, and regrind percentage</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>📷</span>
                    <span>Scan RM Barcode</span>
                  </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Material Grade</label>
                    <select
                      value={rawMaterialId}
                      onChange={(e) => setRawMaterialId(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
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
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>RM Lot / Heat Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LOT-2026-SEP-0048"
                      value={rawMaterialLotNo}
                      onChange={(e) => setRawMaterialLotNo(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, fontFamily: 'var(--font-num)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                      <span>Regrind % Used</span>
                      <span>Max allowed: {maxRegrind}%</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={regrindPercentage}
                      onChange={(e) => setRegrindPercentage(e.target.value)}
                      style={{
                        width: '100%', padding: '7px 10px', borderRadius: 6,
                        background: isRegrindExceeded ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                        border: isRegrindExceeded ? '1px solid var(--red)' : '1px solid var(--line)',
                        color: isRegrindExceeded ? 'var(--red)' : 'var(--text)',
                        fontSize: 12, fontWeight: 600,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: Visual Inspection */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8, marginBottom: 12 }}>
                  <strong style={{ fontSize: 13, color: 'var(--amber)' }}>
                    Section B: Visual Inspection & Workmanship Standard
                  </strong>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>First-Off Form: 7-point visual defect checklist (flash, sink marks, flow lines, burn marks, color, finish)</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
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
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: 6,
                        cursor: 'pointer', fontSize: 11,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={visualChecks[chk.id]}
                        onChange={(e) => setVisualChecks({ ...visualChecks, [chk.id]: e.target.checked })}
                      />
                      <span>{chk.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION C: Critical Process Parameters */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 8, marginBottom: 12 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--amber)' }}>
                      Section C: Process Parameter Verification (Barrel Temps, Pressures, Cooling Time)
                    </strong>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                      First-Off Form: Record actual barrel zone temps (Z1-Z4), nozzle temp, injection & holding pressures, cooling time
                      {fpaData.standardProcessParameters?.length > 0 && ` — ${fpaData.standardProcessParameters.length} standard parameters configured`}
                    </div>
                  </div>
                </div>

                {fpaData.standardProcessParameters && fpaData.standardProcessParameters.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    {fpaData.standardProcessParameters.map((sp, pIdx) => {
                      const k = sp.parameter_name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                      return (
                        <div key={pIdx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: 6, padding: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{sp.parameter_name}</label>
                            <span style={{ fontSize: 10, color: 'var(--amber)', background: 'rgba(245,158,11,0.1)', padding: '1px 5px', borderRadius: 4 }}>
                              Target: {sp.value} {sp.unit || ''}
                            </span>
                          </div>
                          <input
                            type="text"
                            placeholder={`Actual (${sp.unit || 'val'})`}
                            value={processParameters[k] ?? ''}
                            onChange={(e) => setProcessParameters({ ...processParameters, [k]: e.target.value })}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 11 }}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8 }}>
                    {[
                      { key: 'zone1_temp', label: 'Zone 1 Temp', unit: '°C', range: '180-240' },
                      { key: 'zone2_temp', label: 'Zone 2 Temp', unit: '°C', range: '200-260' },
                      { key: 'zone3_temp', label: 'Zone 3 Temp', unit: '°C', range: '190-250' },
                      { key: 'nozzle_temp', label: 'Nozzle Temp', unit: '°C', range: '210-270' },
                      { key: 'injection_pressure', label: 'Injection Pressure', unit: 'bar', range: '500-1200' },
                      { key: 'holding_pressure', label: 'Holding Pressure', unit: 'bar', range: '300-800' },
                      { key: 'cooling_time_sec', label: 'Cooling Time', unit: 's', range: '5-30' },
                    ].map((param) => (
                      <div key={param.key} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, padding: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{param.label}</label>
                          <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Min-Max: {param.range} {param.unit}</span>
                        </div>
                        <input
                          type="number"
                          placeholder={`Actual ${param.unit}`}
                          value={processParameters[param.key] ?? ''}
                          onChange={(e) => setProcessParameters({ ...processParameters, [param.key]: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 11, fontWeight: 600 }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FPA Mode Selector */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 8, padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: 12, color: 'var(--text)' }}>Inspection Scope:</strong>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px', background: fpaMode === 'first_off' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.02)', borderRadius: 6, border: `1px solid ${fpaMode === 'first_off' ? 'var(--blue)' : 'var(--line)'}` }}>
                  <input
                    type="radio"
                    name="fpa_mode"
                    value="first_off"
                    checked={fpaMode === 'first_off'}
                    onChange={(e) => setFpaMode(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)' }}>📋 First-Off Sign-Off (5 Samples)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px', background: fpaMode === 'full_fpa' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.02)', borderRadius: 6, border: `1px solid ${fpaMode === 'full_fpa' ? 'var(--green)' : 'var(--line)'}` }}>
                  <input
                    type="radio"
                    name="fpa_mode"
                    value="full_fpa"
                    checked={fpaMode === 'full_fpa'}
                    onChange={(e) => setFpaMode(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)' }}>✓ Full FPA (All {cavityCount} Cavities)</span>
                </label>
              </div>

              {/* SECTION D: Multi-Cavity Dimensional Inspection */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)', paddingBottom: 8, marginBottom: 12 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--amber)' }}>
                      Section D: Multi-Cavity Dimensional Tolerance Inspection
                    </strong>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
                      {fpaMode === 'first_off'
                        ? `🎯 First-Off Mode: Measure 5 representative samples (1 part from different cavities). Validates setup correctness.`
                        : `✓ Full FPA Mode: Measure all ${cavityCount} cavities for complete approval. SPC checks auto-detect PASS/FAIL based on LSL/USL.`}
                      Instruments & Tolerances from Part Master.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addDimensionRow}
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                  >
                    + Add Parameter
                  </button>
                </div>

                {fpaMode === 'first_off' && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid var(--blue)', borderRadius: 8, padding: '10px 12px', color: 'var(--blue)', fontSize: 12, marginBottom: 10 }}>
                    <strong>📊 First-Off Sampling Guide:</strong> Measure 5 representative parts from cavities 1, 7, 13, 19, and last cavity. This validates setup correctness without measuring all cavities.
                  </div>
                )}

                {dimensionReadings.length === 0 ? (
                  <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--red)', borderRadius: 8, padding: '14px 16px', color: 'var(--red)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>⚠️</span>
                      <span>No critical dimensions have been configured for this part</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      IATF 16949 requires verified dimensional specifications before First-Piece Approval. Please configure critical dimensions in Part Master before running FPA, or click <strong>+ Add Parameter</strong> above to add dimension rows for this setup.
                    </div>
                    {effPartId && (
                      <div style={{ marginTop: 4 }}>
                        <a href={`/parts/${effPartId}/edit`} target="_blank" rel="noreferrer" style={{ color: 'var(--amber)', fontSize: 12, fontWeight: 700, textDecoration: 'underline' }}>
                          ⚙️ Open Part Master to configure dimensions →
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--line)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '6px 8px' }}>Param & Spec</th>
                          <th style={{ padding: '6px 8px', textAlign: 'center', width: 60 }}>Nominal</th>
                          <th style={{ padding: '6px 8px', textAlign: 'center', width: 60 }}>LSL</th>
                          <th style={{ padding: '6px 8px', textAlign: 'center', width: 60 }}>USL</th>
                          <th style={{ padding: '6px 8px', width: 110 }}>Gauge</th>
                          {Array.from({ length: cavityCount }).map((_, cIdx) => {
                            const sampleLabel = fpaMode === 'first_off'
                              ? ['1', '7', '13', '19', 'End'][cIdx] // Representative samples
                              : String(cIdx + 1);
                            return (
                              <th key={cIdx} style={{ padding: '6px 8px', textAlign: 'center', width: 70, background: fpaMode === 'first_off' ? 'rgba(59, 130, 246, 0.08)' : 'transparent' }}>
                                Cav #{sampleLabel}
                              </th>
                            );
                          })}
                          <th style={{ padding: '6px 8px', textAlign: 'center', width: 60 }}>Status</th>
                          <th style={{ padding: '6px 8px', width: 30 }}></th>
                        </tr>
                      </thead>
                    <tbody>
                      {dimensionReadings.map((dim, dIdx) => {
                        const hasValues = dim.cavities.some((c) => c !== '');
                        const allPass = hasValues && dim.cavities.every((c) => c === '' || isWithinTol(c, dim.lsl, dim.usl));
                        const anyFail = hasValues && dim.cavities.some((c) => c !== '' && !isWithinTol(c, dim.lsl, dim.usl));

                        return (
                          <tr key={dIdx} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                placeholder="Parameter name"
                                value={dim.parameter_name}
                                onChange={(e) => {
                                  const updated = [...dimensionReadings];
                                  updated[dIdx].parameter_name = e.target.value;
                                  setDimensionReadings(updated);
                                }}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 11, marginBottom: 2 }}
                              />
                              <input
                                type="text"
                                placeholder="Spec (25 ± 0.2)"
                                value={dim.spec}
                                onChange={(e) => {
                                  const updated = [...dimensionReadings];
                                  updated[dIdx].spec = e.target.value;
                                  setDimensionReadings(updated);
                                }}
                                style={{ width: '100%', padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', color: 'var(--text-muted)', fontSize: 10 }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                step="any"
                                value={dim.nominal}
                                onChange={(e) => {
                                  const updated = [...dimensionReadings];
                                  updated[dIdx].nominal = Number(e.target.value);
                                  setDimensionReadings(updated);
                                }}
                                style={{ width: '100%', padding: '4px 6px', textAlign: 'center', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 11 }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                step="any"
                                value={dim.lsl}
                                onChange={(e) => {
                                  const updated = [...dimensionReadings];
                                  updated[dIdx].lsl = Number(e.target.value);
                                  setDimensionReadings(updated);
                                }}
                                style={{ width: '100%', padding: '4px 6px', textAlign: 'center', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: '#60a5fa', fontSize: 11 }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                step="any"
                                value={dim.usl}
                                onChange={(e) => {
                                  const updated = [...dimensionReadings];
                                  updated[dIdx].usl = Number(e.target.value);
                                  setDimensionReadings(updated);
                                }}
                                style={{ width: '100%', padding: '4px 6px', textAlign: 'center', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: '#60a5fa', fontSize: 11 }}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <select
                                value={dim.gauge_code || ''}
                                onChange={(e) => handleGaugeChange(dIdx, e.target.value)}
                                style={{ width: '100%', padding: '4px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 10 }}
                              >
                                <option value="">Gauge</option>
                                {fpaData.gauges?.map((g) => (
                                  <option key={g.id} value={g.gauge_code}>{g.gauge_code}</option>
                                ))}
                              </select>
                            </td>

                            {Array.from({ length: cavityCount }).map((_, cIdx) => {
                              const val = dim.cavities[cIdx];
                              const ok = isWithinTol(val, dim.lsl, dim.usl);
                              let borderCol = 'var(--line)';
                              let bgCol = 'rgba(255,255,255,0.04)';
                              if (val !== '' && ok === true) { borderCol = 'var(--green)'; bgCol = 'rgba(34,197,94,0.1)'; }
                              if (val !== '' && ok === false) { borderCol = 'var(--red)'; bgCol = 'rgba(239,68,68,0.15)'; }

                              return (
                                <td key={cIdx} style={{ padding: '6px 8px' }}>
                                  <input
                                    type="number"
                                    step="any"
                                    placeholder={`#${cIdx + 1}`}
                                    value={val}
                                    onChange={(e) => handleDimensionChange(dIdx, cIdx, e.target.value)}
                                    style={{ width: '100%', padding: '4px 6px', textAlign: 'center', borderRadius: 4, background: bgCol, border: `1px solid ${borderCol}`, color: 'var(--text)', fontSize: 11, fontFamily: 'var(--font-num)' }}
                                  />
                                </td>
                              );
                            })}

                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              {anyFail ? (
                                <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.2)', color: '#f87171', fontWeight: 700, fontSize: 10 }}>FAIL</span>
                              ) : allPass ? (
                                <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.2)', color: 'var(--green)', fontWeight: 700, fontSize: 10 }}>PASS</span>
                              ) : (
                                <span className="muted">-</span>
                              )}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => removeDimensionRow(dIdx)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
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
              )}
            </div>

              {/* SECTION E: Digital Sign-off & Overall Decision */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                <div style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8, marginBottom: 12 }}>
                  <strong style={{ fontSize: 13, color: 'var(--amber)' }}>
                    Section E: Multi-Tier Digital Sign-Off & Status
                  </strong>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 14 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={signoffs.technician_signed}
                      onChange={(e) => setSignoffs({ ...signoffs, technician_signed: e.target.checked })}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 11 }}>1. Setup Technician</div>
                      <div className="muted" style={{ fontSize: 10 }}>Mould clamping & heat</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={signoffs.qa_signed}
                      onChange={(e) => setSignoffs({ ...signoffs, qa_signed: e.target.checked })}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 11 }}>2. Quality Inspector (QA)</div>
                      <div className="muted" style={{ fontSize: 10 }}>Visual & dimension check</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: 6, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={signoffs.supervisor_signed}
                      onChange={(e) => setSignoffs({ ...signoffs, supervisor_signed: e.target.checked })}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 11 }}>3. Production Supervisor</div>
                      <div className="muted" style={{ fontSize: 10 }}>Final authorization</div>
                    </div>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Approval Decision *
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      {['APPROVED', 'CONDITIONAL', 'REJECTED'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setApprovalStatus(st)}
                          className={approvalStatus === st ? 'btn btn-primary' : 'btn btn-secondary'}
                          style={{
                            padding: '6px 0', fontSize: 11, fontWeight: 700,
                            background: approvalStatus === st && st === 'APPROVED' ? 'var(--green)' : undefined,
                            borderColor: approvalStatus === st && st === 'APPROVED' ? 'var(--green)' : undefined,
                          }}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Inspector Remarks
                    </label>
                    <input
                      type="text"
                      placeholder="Notes on finish, tool condition, or clearance"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#fbbf24', marginBottom: 4, fontWeight: 600 }}>
                      ⏱️ Backdate Visual Approval Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={customVisualTime}
                      onChange={(e) => setCustomVisualTime(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: '#34d399', marginBottom: 4, fontWeight: 600 }}>
                      ⏱️ Backdate Full FPA Sign-Off Time (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={customApprovalTime}
                      onChange={(e) => setCustomApprovalTime(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: 14, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>●</span> Auto-draft saved locally
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                    style={{ padding: '8px 14px', fontSize: 12 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleVisualSubmit}
                    disabled={submitting || isRegrindExceeded}
                    className="btn"
                    style={{
                      padding: '8px 16px', fontSize: 12, fontWeight: 700,
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#000', border: 'none', borderRadius: 6,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span>⚡</span>
                    <span>{submitting ? 'Processing...' : 'Quick Visual Approval (Unblock Machine)'}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || isRegrindExceeded}
                    className="btn btn-primary"
                    style={{
                      padding: '8px 18px', fontSize: 12, fontWeight: 700,
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    }}
                  >
                    <span>🛡️</span>
                    <span>{submitting ? 'Submitting...' : 'Sign & Submit Full FPA'}</span>
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
