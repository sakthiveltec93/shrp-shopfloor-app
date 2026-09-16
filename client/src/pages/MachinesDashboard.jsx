import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';

const BREAKDOWN_TYPES = [
  { value: 'electrical', label: '⚡ Electrical (Drive, Motor, Sensor, PLC)' },
  { value: 'hydraulic', label: '💧 Hydraulic (Oil leak, Valve, Pump, Filter)' },
  { value: 'mechanical', label: '⚙️ Mechanical (Tie bar, Toggle, Screw, Barrel)' },
  { value: 'heater', label: '🔥 Heater / Thermocouple (Band heater, PID)' },
  { value: 'pneumatic', label: '💨 Pneumatic (Air pressure, Cylinder, Valve)' },
  { value: 'other', label: '🛠️ Other Maintenance Issue' },
];

const MOTOR_TYPES = [
  'Servo Hydraulic',
  'All-Electric Servo',
  'Hydraulic Standard',
  'Rubber Compression / Heating',
  'Hybrid Servo',
];

const emptyMachineForm = {
  machine_code: '',
  description: '',
  tonnage: 100,
  make_model: '',
  year_of_commission: new Date().getFullYear(),
  screw_diameter_mm: 35,
  clamping_force_kn: 1000,
  tie_bar_distance_mm: '410 x 410',
  platen_size_mm: '600 x 600',
  min_mould_height_mm: 150,
  max_mould_height_mm: 450,
  clamping_stroke_mm: 350,
  max_daylight_mm: 800,
  ejector_stroke_mm: 100,
  ejector_force_kn: 35,
  max_shot_weight_g: 180,
  motor_type: 'Servo Hydraulic',
  connected_load_kw: 22,
  hourly_rate_inr: 450,
  pm_due_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
};

export default function MachinesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [machines, setMachines] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Modals state
  const [breakdownModalMachine, setBreakdownModalMachine] = useState(null);
  const [historyModalMachine, setHistoryModalMachine] = useState(null);
  const [machineHistory, setMachineHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTab, setHistoryTab] = useState('breakdowns'); // 'breakdowns' | 'moulds' | 'production'

  // Add / Edit Machine modal
  const [machineModalMode, setMachineModalMode] = useState(null); // 'add' | 'edit' | null
  const [machineFormData, setMachineFormData] = useState(emptyMachineForm);
  const [machineFormSubmitting, setMachineFormSubmitting] = useState(false);
  const [editMachineId, setEditMachineId] = useState(null);

  // Breakdown Form state
  const [bdType, setBdType] = useState('mechanical');
  const [bdDowntime, setBdDowntime] = useState(30);
  const [bdRootCause, setBdRootCause] = useState('');
  const [bdCorrectiveAction, setBdCorrectiveAction] = useState('');
  const [bdPartsReplaced, setBdPartsReplaced] = useState('');
  const [bdTechnician, setBdTechnician] = useState('');
  const [bdSubmitting, setBdSubmitting] = useState(false);

  function loadOverview() {
    setLoading(true);
    api.machines_mgmt.overview(selectedDate)
      .then((data) => setMachines(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load machines:', err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOverview();
  }, [selectedDate]);

  function openAddMachineModal() {
    setMachineModalMode('add');
    setEditMachineId(null);
    setMachineFormData(emptyMachineForm);
  }

  function openEditMachineModal(m) {
    setMachineModalMode('edit');
    setEditMachineId(m.id);
    setMachineFormData({
      machine_code: m.machine_code || '',
      description: m.description || '',
      tonnage: m.tonnage || 100,
      make_model: m.make_model || '',
      year_of_commission: m.year_of_commission || 2020,
      screw_diameter_mm: m.screw_diameter_mm || 35,
      clamping_force_kn: m.clamping_force_kn || 1000,
      tie_bar_distance_mm: m.tie_bar_distance_mm || '410 x 410',
      platen_size_mm: m.platen_size_mm || '600 x 600',
      min_mould_height_mm: m.min_mould_height_mm || 150,
      max_mould_height_mm: m.max_mould_height_mm || 450,
      clamping_stroke_mm: m.clamping_stroke_mm || 350,
      max_daylight_mm: m.max_daylight_mm || 800,
      ejector_stroke_mm: m.ejector_stroke_mm || 100,
      ejector_force_kn: m.ejector_force_kn || 35,
      max_shot_weight_g: m.max_shot_weight_g || 180,
      motor_type: m.motor_type || 'Servo Hydraulic',
      connected_load_kw: m.connected_load_kw || 22,
      hourly_rate_inr: m.hourly_rate_inr || 450,
      pm_due_date: m.pm_due_date ? String(m.pm_due_date).slice(0, 10) : '',
    });
  }

  async function handleMachineFormSubmit(e) {
    e.preventDefault();
    setMachineFormSubmitting(true);
    try {
      if (machineModalMode === 'add') {
        await api.machines_mgmt.create(machineFormData);
      } else {
        await api.machines_mgmt.update(editMachineId, machineFormData);
      }
      setMachineModalMode(null);
      loadOverview();
    } catch (err) {
      alert('Error saving machine: ' + (err.message || 'Server error'));
    } finally {
      setMachineFormSubmitting(false);
    }
  }

  function openBreakdownModal(m) {
    setBreakdownModalMachine(m);
    setBdType('mechanical');
    setBdDowntime(30);
    setBdRootCause('');
    setBdCorrectiveAction('');
    setBdPartsReplaced('');
    setBdTechnician(user?.full_name || '');
  }

  async function submitBreakdown(e) {
    e.preventDefault();
    if (!breakdownModalMachine) return;
    setBdSubmitting(true);
    try {
      await api.machines_mgmt.logBreakdown(breakdownModalMachine.id, {
        breakdown_type: bdType,
        downtime_minutes: Number(bdDowntime) || 0,
        root_cause: bdRootCause,
        corrective_action: bdCorrectiveAction,
        parts_replaced: bdPartsReplaced,
        technician_name: bdTechnician,
      });
      setBreakdownModalMachine(null);
      loadOverview();
    } catch (err) {
      alert('Error logging breakdown: ' + (err.message || 'Server error'));
    } finally {
      setBdSubmitting(false);
    }
  }

  function openHistoryModal(m) {
    setHistoryModalMachine(m);
    setHistoryLoading(true);
    setHistoryTab('breakdowns');
    api.machines_mgmt.history(m.id)
      .then((data) => setMachineHistory(data))
      .catch((err) => alert('Failed to load history: ' + err.message))
      .finally(() => setHistoryLoading(false));
  }

  // --- Filter & Sort ---
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL | RUNNING | IDLE | BREAKDOWN
  const [sortBy, setSortBy] = useState('code');            // code | output | shots
  const [expandedCard, setExpandedCard] = useState(null);  // machine id with expanded specs

  const filteredMachines = machines
    .filter((m) => {
      if (filterStatus === 'ALL') return true;
      if (filterStatus === 'RUNNING') return m.status === 'RUNNING';
      if (filterStatus === 'IDLE') return m.status === 'IDLE' || m.status === 'STARTED';
      if (filterStatus === 'BREAKDOWN') return m.status === 'BREAKDOWN' || m.status === 'DOWN';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'output') return (b.today?.ok_qty || 0) - (a.today?.ok_qty || 0);
      if (sortBy === 'shots') return (b.today?.shots || 0) - (a.today?.shots || 0);
      return (a.machine_code || '').localeCompare(b.machine_code || '');
    });

  // KPI summary computations
  const totalMachines = machines.length;
  const runningMachines = machines.filter((m) => m.status === 'RUNNING').length;
  const idleMachines = machines.filter((m) => m.status === 'IDLE' || m.status === 'STARTED').length;
  const totalOkToday = machines.reduce((sum, m) => sum + (m.today?.ok_qty || 0), 0);
  const totalDowntimeToday = machines.reduce((sum, m) => sum + (m.today?.downtime_minutes || 0), 0);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}
            >
              ← Home
            </button>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
              🖥️ Machines
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
          />
          <button
            onClick={openAddMachineModal}
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ➕ Add Machine
          </button>
        </div>
      </div>

      {/* KPI Summary Cards — Compact 2-5 per row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8, marginBottom: 12 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Fleet</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>{totalMachines} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>M/C</span></div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 10, color: '#34d399', textTransform: 'uppercase', fontWeight: 600 }}>🟢 Running</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#34d399', marginTop: 2 }}>{runningMachines}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 10, color: '#fbbf24', textTransform: 'uppercase', fontWeight: 600 }}>🟡 Idle/Setup</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24', marginTop: 2 }}>{idleMachines}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Output Today</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#60a5fa', marginTop: 2 }}>{totalOkToday.toLocaleString()} <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>pcs</span></div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px' }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Downtime</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: totalDowntimeToday > 60 ? '#f87171' : 'var(--text)', marginTop: 2 }}>{totalDowntimeToday} <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-muted)' }}>min</span></div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
        {['ALL', 'RUNNING', 'IDLE', 'BREAKDOWN'].map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid',
              background: filterStatus === f ? (f === 'RUNNING' ? '#10b981' : f === 'IDLE' ? '#f59e0b' : f === 'BREAKDOWN' ? '#ef4444' : 'var(--amber)') : 'transparent',
              color: filterStatus === f ? '#fff' : 'var(--text-muted)',
              borderColor: filterStatus === f ? 'transparent' : 'var(--line)',
            }}
          >
            {f === 'ALL' ? 'All' : f === 'RUNNING' ? '🟢 Running' : f === 'IDLE' ? '🟡 Idle/Setup' : '🔴 Breakdown'}
          </button>
        ))}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginLeft: 12 }}>Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '5px 10px', fontSize: 12, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6 }}
        >
          <option value="code">Machine Code</option>
          <option value="output">Output Today ↓</option>
          <option value="shots">Shots Today ↓</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
          Showing {filteredMachines.length} of {machines.length}
        </span>
      </div>

      {/* Machines Grid — Compact Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading machine status...</div>
      ) : filteredMachines.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No machines match the selected filter.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {filteredMachines.map((m) => {
            const isRunning = m.status === 'RUNNING';
            const isStarted = m.status === 'STARTED';
            const isBreakdown = m.status === 'BREAKDOWN' || m.status === 'DOWN';
            const statusColor = isRunning ? '#10b981' : isBreakdown ? '#ef4444' : isStarted ? '#f59e0b' : '#6b7280';
            const statusBg = isRunning ? 'rgba(16,185,129,0.1)' : isBreakdown ? 'rgba(239,68,68,0.1)' : isStarted ? 'rgba(245,158,11,0.1)' : 'rgba(107,114,128,0.08)';
            const isExpanded = expandedCard === m.id;

            return (
              <div
                key={m.id}
                style={{
                  background: 'var(--surface)',
                  border: `1.5px solid ${isRunning ? 'rgba(16,185,129,0.35)' : isBreakdown ? 'rgba(239,68,68,0.35)' : 'var(--line)'}`,
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* Row 1: Code + Tonnage + Status + Edit */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.02em' }}>{m.machine_code}</span>
                    <span style={{ background: 'var(--line)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>{m.tonnage}T</span>
                    <button onClick={() => openEditMachineModal(m)} title="Edit specs" style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 13, padding: 0 }}>✏️</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: statusBg, color: statusColor, border: `1px solid ${statusColor}44` }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
                    {m.status_label || m.status}
                  </div>
                </div>

                {/* Row 2: Current Mould / Part */}
                <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 7, padding: '8px 10px', fontSize: 12 }}>
                  {m.current_part ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{m.current_part.shrp_part_code}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{m.current_part.part_name}</span>
                      {m.active_session && <span style={{ color: '#34d399', fontSize: 11 }}>👤 {m.active_session.operator_name}</span>}
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No mould assigned</span>
                  )}
                </div>

                {/* Row 3: Today's 3-stat row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, textAlign: 'center' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 4px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shots</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{(m.today?.shots || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.06)', borderRadius: 6, padding: '6px 4px' }}>
                    <div style={{ fontSize: 10, color: '#34d399', textTransform: 'uppercase' }}>OK Output</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#34d399' }}>{(m.today?.ok_qty || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ background: m.today?.reject_qty > 0 ? 'rgba(248,113,113,0.06)' : 'rgba(255,255,255,0.03)', borderRadius: 6, padding: '6px 4px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rejects</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: m.today?.reject_qty > 0 ? '#f87171' : 'var(--text-muted)' }}>{m.today?.reject_qty || 0}</div>
                  </div>
                </div>

                {/* Row 4: MTBF / MTTR inline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                  <span>MTBF <strong style={{ color: 'var(--text)' }}>{m.tpm?.mtbf_hours || 0} hrs</strong></span>
                  <span>MTTR <strong style={{ color: 'var(--text)' }}>{m.tpm?.mttr_minutes || 0} min</strong></span>
                  <span>Breakdowns <strong style={{ color: m.tpm?.total_breakdowns > 0 ? '#fbbf24' : 'var(--text)' }}>{m.tpm?.total_breakdowns || 0}</strong></span>
                </div>

                {/* Expandable Specs (collapsed by default) */}
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : m.id)}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 11, cursor: 'pointer', textAlign: 'left', padding: 0, fontWeight: 600 }}
                >
                  {isExpanded ? '▲ Hide specs' : '▼ Show specs (Tie Bar, Platen, Shot Wt…)'}
                </button>
                {isExpanded && (
                  <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 10px', fontSize: 11, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', color: 'var(--text-muted)' }}>
                    <div>Tie Bar: <strong style={{ color: 'var(--text)' }}>{m.tie_bar_distance_mm || '-'}</strong> mm</div>
                    <div>Platen: <strong style={{ color: 'var(--text)' }}>{m.platen_size_mm || '-'}</strong> mm</div>
                    <div>Mould Ht: <strong style={{ color: 'var(--text)' }}>{m.min_mould_height_mm || 0}–{m.max_mould_height_mm || 0}</strong> mm</div>
                    <div>Max Shot: <strong style={{ color: 'var(--text)' }}>{m.max_shot_weight_g || '-'}</strong> g</div>
                    <div>Motor: <strong style={{ color: 'var(--text)' }}>{m.motor_type || '-'}</strong></div>
                    <div>Rate: <strong style={{ color: '#34d399' }}>₹{m.hourly_rate_inr || 450}/hr</strong></div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openBreakdownModal(m)}
                    style={{ flex: 1, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '7px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    ⚡ Log Breakdown
                  </button>
                  <button
                    onClick={() => openHistoryModal(m)}
                    style={{ flex: 1, background: 'var(--line)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text)', padding: '7px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    📜 History &amp; TPM
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Add / Edit Machine with Engineering Specs */}
      {machineModalMode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#181a1b', border: '1px solid var(--line)', borderRadius: 12, width: '100%', maxWidth: 720, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)' }}>
                  {machineModalMode === 'add' ? '➕ Add New Machine to Fleet' : `✏️ Edit Machine Specifications: ${machineFormData.machine_code}`}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Engineering capacity parameters for quote planning, mould fitting & costing
                </div>
              </div>
              <button onClick={() => setMachineModalMode(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleMachineFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Machine Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HSIM - 06"
                    disabled={machineModalMode === 'edit'}
                    value={machineFormData.machine_code}
                    onChange={(e) => setMachineFormData({ ...machineFormData, machine_code: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Clamping Tonnage (T) *</label>
                  <input
                    type="number"
                    required
                    min="10"
                    max="3000"
                    value={machineFormData.tonnage}
                    onChange={(e) => setMachineFormData({ ...machineFormData, tonnage: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Commission Year</label>
                  <input
                    type="number"
                    min="1990"
                    max="2030"
                    value={machineFormData.year_of_commission}
                    onChange={(e) => setMachineFormData({ ...machineFormData, year_of_commission: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Make & Model</label>
                  <input
                    type="text"
                    placeholder="e.g. L&T Demag Ergotech 100"
                    value={machineFormData.make_model}
                    onChange={(e) => setMachineFormData({ ...machineFormData, make_model: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Motor / Drive Type</label>
                  <select
                    value={machineFormData.motor_type}
                    onChange={(e) => setMachineFormData({ ...machineFormData, motor_type: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                  >
                    {MOTOR_TYPES.map((mt) => (
                      <option key={mt} value={mt}>{mt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Physical & Dimensional Specifications */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginBottom: 10 }}>📐 Mould Clamping & Dimensional Limits</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Tie Bar Distance (H x V mm)</label>
                    <input
                      type="text"
                      placeholder="e.g. 410 x 410"
                      value={machineFormData.tie_bar_distance_mm}
                      onChange={(e) => setMachineFormData({ ...machineFormData, tie_bar_distance_mm: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Platen Size (H x V mm)</label>
                    <input
                      type="text"
                      placeholder="e.g. 600 x 600"
                      value={machineFormData.platen_size_mm}
                      onChange={(e) => setMachineFormData({ ...machineFormData, platen_size_mm: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Max Daylight (mm)</label>
                    <input
                      type="number"
                      value={machineFormData.max_daylight_mm}
                      onChange={(e) => setMachineFormData({ ...machineFormData, max_daylight_mm: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Min Mould Height (mm)</label>
                    <input
                      type="number"
                      value={machineFormData.min_mould_height_mm}
                      onChange={(e) => setMachineFormData({ ...machineFormData, min_mould_height_mm: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Max Mould Height (mm)</label>
                    <input
                      type="number"
                      value={machineFormData.max_mould_height_mm}
                      onChange={(e) => setMachineFormData({ ...machineFormData, max_mould_height_mm: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Clamping Stroke (mm)</label>
                    <input
                      type="number"
                      value={machineFormData.clamping_stroke_mm}
                      onChange={(e) => setMachineFormData({ ...machineFormData, clamping_stroke_mm: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>

              {/* Injection & Power Specs */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#34d399', marginBottom: 10 }}>⚡ Injection, Ejector & Hourly Rate</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Screw Diameter (mm)</label>
                    <input
                      type="number"
                      value={machineFormData.screw_diameter_mm}
                      onChange={(e) => setMachineFormData({ ...machineFormData, screw_diameter_mm: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Max Shot Weight (PS/PP g)</label>
                    <input
                      type="number"
                      value={machineFormData.max_shot_weight_g}
                      onChange={(e) => setMachineFormData({ ...machineFormData, max_shot_weight_g: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Clamping Force (kN)</label>
                    <input
                      type="number"
                      value={machineFormData.clamping_force_kn}
                      onChange={(e) => setMachineFormData({ ...machineFormData, clamping_force_kn: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Ejector Stroke (mm)</label>
                    <input
                      type="number"
                      value={machineFormData.ejector_stroke_mm}
                      onChange={(e) => setMachineFormData({ ...machineFormData, ejector_stroke_mm: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Connected Load (kW)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={machineFormData.connected_load_kw}
                      onChange={(e) => setMachineFormData({ ...machineFormData, connected_load_kw: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Hourly Rate (₹/hr for costing)</label>
                    <input
                      type="number"
                      value={machineFormData.hourly_rate_inr}
                      onChange={(e) => setMachineFormData({ ...machineFormData, hourly_rate_inr: Number(e.target.value) })}
                      style={{ width: '100%', padding: '7px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setMachineModalMode(null)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={machineFormSubmitting}
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                >
                  {machineFormSubmitting ? 'Saving...' : '💾 Save Machine Specifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: Log Breakdown / Issue */}
      {breakdownModalMachine && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#181a1b', border: '1px solid var(--line)', borderRadius: 12, width: '100%', maxWidth: 540, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)' }}>⚡ Log Machine Breakdown / Issue</h3>
                <div style={{ fontSize: 12, color: '#f87171', fontWeight: 600, marginTop: 2 }}>
                  {breakdownModalMachine.machine_code} ({breakdownModalMachine.tonnage}T - {breakdownModalMachine.make_model})
                </div>
              </div>
              <button onClick={() => setBreakdownModalMachine(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={submitBreakdown} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Breakdown Category</label>
                <select
                  value={bdType}
                  onChange={(e) => setBdType(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                >
                  {BREAKDOWN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Downtime Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={bdDowntime}
                  onChange={(e) => setBdDowntime(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Root Cause (Why did it happen?)</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Band heater burn out on Zone 2, Thermocouple wire loose"
                  value={bdRootCause}
                  onChange={(e) => setBdRootCause(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Corrective Action Taken</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Replaced band heater, calibrated PID temperature controller"
                  value={bdCorrectiveAction}
                  onChange={(e) => setBdCorrectiveAction(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Spares / Parts Replaced (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 230V 1.5kW Ceramic Band Heater"
                  value={bdPartsReplaced}
                  onChange={(e) => setBdPartsReplaced(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Maintenance Technician Name</label>
                <input
                  type="text"
                  required
                  value={bdTechnician}
                  onChange={(e) => setBdTechnician(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setBreakdownModalMachine(null)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bdSubmitting}
                  style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                >
                  {bdSubmitting ? 'Saving...' : '💾 Save Breakdown Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Machine Detailed History & Audit */}
      {historyModalMachine && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#181a1b', border: '1px solid var(--line)', borderRadius: 12, width: '100%', maxWidth: 880, padding: 24, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, color: 'var(--text)' }}>
                  📜 Machine History & TPM Audit Log: {historyModalMachine.machine_code}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {historyModalMachine.tonnage}T · {historyModalMachine.make_model} · Commissioned: {historyModalMachine.year_of_commission} · Clamping: {historyModalMachine.clamping_force_kn} kN
                </div>
              </div>
              <button onClick={() => setHistoryModalMachine(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setHistoryTab('breakdowns')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: historyTab === 'breakdowns' ? '#ef4444' : 'var(--surface)',
                  color: historyTab === 'breakdowns' ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--line)',
                }}
              >
                ⚡ Breakdown & Repair History ({machineHistory?.breakdowns?.length || 0})
              </button>
              <button
                onClick={() => setHistoryTab('moulds')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: historyTab === 'moulds' ? '#3b82f6' : 'var(--surface)',
                  color: historyTab === 'moulds' ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--line)',
                }}
              >
                ⚙️ Mould Change History ({machineHistory?.assignments?.length || 0})
              </button>
              <button
                onClick={() => setHistoryTab('production')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: historyTab === 'production' ? '#10b981' : 'var(--surface)',
                  color: historyTab === 'production' ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--line)',
                }}
              >
                📊 Recent Production Runs ({machineHistory?.entries?.length || 0})
              </button>
            </div>

            {/* Tab Body */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading history...</div>
              ) : historyTab === 'breakdowns' ? (
                <div>
                  {(!machineHistory?.breakdowns || machineHistory.breakdowns.length === 0) ? (
                    <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No breakdowns recorded for this machine. Excellent TPM compliance!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {machineHistory.breakdowns.map((b) => (
                        <div key={b.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                {b.breakdown_type}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                                {new Date(b.incident_date).toLocaleDateString()}
                              </span>
                            </div>
                            <span style={{ color: '#f87171', fontWeight: 700, fontSize: 13 }}>
                              ⏱️ {b.downtime_minutes} min downtime
                            </span>
                          </div>

                          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text)' }}>
                            <strong>Root Cause:</strong> {b.root_cause || '-'}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 13, color: '#34d399' }}>
                            <strong>Action Taken:</strong> {b.corrective_action || '-'}
                          </div>
                          {b.parts_replaced && (
                            <div style={{ marginTop: 4, fontSize: 12, color: '#fbbf24' }}>
                              <strong>Parts Replaced:</strong> {b.parts_replaced}
                            </div>
                          )}
                          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Technician: <strong>{b.technician_name}</strong></span>
                            <span>Logged: {new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : historyTab === 'moulds' ? (
                <div>
                  {(!machineHistory?.assignments || machineHistory.assignments.length === 0) ? (
                    <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No mould assignments recorded.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--surface)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                          <th style={{ padding: '8px 10px' }}>Date/Time</th>
                          <th style={{ padding: '8px 10px' }}>SHRP Code</th>
                          <th style={{ padding: '8px 10px' }}>Part Name</th>
                          <th style={{ padding: '8px 10px' }}>Status</th>
                          <th style={{ padding: '8px 10px' }}>Set By</th>
                          <th style={{ padding: '8px 10px' }}>Approved By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {machineHistory.assignments.map((a) => (
                          <tr key={a.id} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{new Date(a.set_at).toLocaleString()}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#fbbf24' }}>{a.shrp_part_code || a.part_code}</td>
                            <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{a.part_name}</td>
                            <td style={{ padding: '8px 10px' }}>
                              <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: a.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: a.status === 'approved' ? '#34d399' : '#fbbf24' }}>
                                {a.status}
                              </span>
                            </td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{a.set_by_name}</td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{a.approved_by_name || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : (
                <div>
                  {(!machineHistory?.entries || machineHistory.entries.length === 0) ? (
                    <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No production entries recorded yet.
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--surface)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                          <th style={{ padding: '8px 10px' }}>Date</th>
                          <th style={{ padding: '8px 10px' }}>Shift</th>
                          <th style={{ padding: '8px 10px' }}>Slot</th>
                          <th style={{ padding: '8px 10px' }}>Part</th>
                          <th style={{ padding: '8px 10px' }}>Counter Diff</th>
                          <th style={{ padding: '8px 10px' }}>OK Qty</th>
                          <th style={{ padding: '8px 10px' }}>Rejects</th>
                          <th style={{ padding: '8px 10px' }}>Operator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {machineHistory.entries.map((e) => (
                          <tr key={e.id} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{e.entry_date}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>Shift {e.shift}</td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>H{e.hour_slot}</td>
                            <td style={{ padding: '8px 10px', color: '#fbbf24', fontWeight: 600 }}>{e.shrp_part_code || e.part_code}</td>
                            <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{e.end_count - e.start_count}</td>
                            <td style={{ padding: '8px 10px', color: '#34d399', fontWeight: 700 }}>{e.good_qty}</td>
                            <td style={{ padding: '8px 10px', color: e.reject_qty > 0 ? '#f87171' : 'var(--text-muted)' }}>{e.reject_qty}</td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{e.operator_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
