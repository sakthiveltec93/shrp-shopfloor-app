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

  // Plant summary stats
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
              🖥️ Machine Management & TPM
            </h1>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
            IATF 16949 Clause 8.5.1.5 · Total Productive Maintenance, Machine Status & Historical Tracking
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', padding: '8px 12px', borderRadius: 6, fontSize: 13 }}
          />
          <button
            onClick={() => navigate('/moulds')}
            style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '8px 14px', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}
          >
            ⚙️ View Moulds & Tool Life →
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Fleet</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>{totalMachines} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Machines</span></div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Running Now</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399', marginTop: 4 }}>{runningMachines} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>Active</span></div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Idle / In Setup</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24', marginTop: 4 }}>{idleMachines}</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Output Today</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa', marginTop: 4 }}>{totalOkToday.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>pcs</span></div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Downtime</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: totalDowntimeToday > 60 ? '#f87171' : 'var(--text)', marginTop: 4 }}>{totalDowntimeToday} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>min</span></div>
        </div>
      </div>

      {/* Machines Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading machine status...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {machines.map((m) => {
            const isRunning = m.status === 'RUNNING';
            const isStarted = m.status === 'STARTED';
            const statusColor = isRunning ? '#10b981' : isStarted ? '#f59e0b' : '#6b7280';
            const statusBg = isRunning ? 'rgba(16, 185, 129, 0.12)' : isStarted ? 'rgba(245, 158, 11, 0.12)' : 'rgba(107, 114, 128, 0.12)';

            return (
              <div
                key={m.id}
                style={{
                  background: 'var(--surface)',
                  border: `1.5px solid ${isRunning ? 'rgba(16, 185, 129, 0.4)' : 'var(--line)'}`,
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  boxShadow: isRunning ? '0 4px 20px rgba(16, 185, 129, 0.08)' : 'none',
                }}
              >
                {/* Machine Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '0.02em' }}>
                        {m.machine_code}
                      </span>
                      <span style={{ background: 'var(--line)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>
                        {m.tonnage}T
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {m.make_model}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: statusBg, color: statusColor, border: `1px solid ${statusColor}44` }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: statusColor }} />
                    {m.status_label}
                  </div>
                </div>

                {/* Technical Specs Pill Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                  <span style={{ background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--line)' }}>
                    Clamp: <strong>{m.clamping_force_kn} kN</strong>
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--line)' }}>
                    Screw: <strong>{m.screw_diameter_mm} mm</strong>
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--line)' }}>
                    YOM: <strong>{m.year_of_commission}</strong>
                  </span>
                </div>

                {/* Running Part Card */}
                <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Active Assignment
                  </div>
                  {m.current_part ? (
                    <div style={{ marginTop: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                          {m.current_part.shrp_part_code}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.current_part.part_name}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Cavities: {m.current_part.cavity_count} · Shot Wt: {m.current_part.unit_weight_g || '-'}g
                        {m.active_session && (
                          <span style={{ marginLeft: 8, color: '#34d399' }}>
                            👤 {m.active_session.operator_name}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
                      No mould currently assigned.
                    </div>
                  )}
                </div>

                {/* Today's Production Counters */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Today Shots</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{m.today.shots.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>OK Output</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#34d399', marginTop: 2 }}>{m.today.ok_qty.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rejects</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: m.today.reject_qty > 0 ? '#f87171' : 'var(--text-muted)', marginTop: 2 }}>{m.today.reject_qty}</div>
                  </div>
                </div>

                {/* TPM Health Metrics */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', borderTop: '1px dashed var(--line)', paddingTop: 8 }}>
                  <span>MTBF: <strong style={{ color: 'var(--text)' }}>{m.tpm.mtbf_hours} hrs</strong></span>
                  <span>MTTR: <strong style={{ color: 'var(--text)' }}>{m.tpm.mttr_minutes} min</strong></span>
                  <span>Total BDs: <strong style={{ color: m.tpm.total_breakdowns > 0 ? '#fbbf24' : 'var(--text)' }}>{m.tpm.total_breakdowns}</strong></span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => openBreakdownModal(m)}
                    style={{
                      flex: 1,
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '7px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ⚡ Log Breakdown
                  </button>
                  <button
                    onClick={() => openHistoryModal(m)}
                    style={{
                      flex: 1,
                      background: 'var(--line)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text)',
                      padding: '7px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    📜 History & TPM
                  </button>
                </div>
              </div>
            );
          })}
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
