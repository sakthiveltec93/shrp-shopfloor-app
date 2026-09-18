import { useEffect, useState } from 'react';
import { api } from '../api';
import FpaModal from '../components/FpaModal';

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('moulds'); // 'moulds' | 'deletions' | 'fpa' | 'corrections'
  const [pending, setPending] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [pendingCorrections, setPendingCorrections] = useState([]);
  const [pendingFpas, setPendingFpas] = useState([]);
  const [fpas, setFpas] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectNoteId, setRejectNoteId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectCorrId, setRejectCorrId] = useState(null);
  const [rejectCorrNote, setRejectCorrNote] = useState('');
  const [selectedFpaAssignment, setSelectedFpaAssignment] = useState(null);

  async function load() {
    try {
      const [moulds, dels, corrs, pendingFpaList, fpaList] = await Promise.all([
        api.pendingAssignments(),
        api.deletions.pending().catch(() => []),
        api.corrections.pending().catch(() => []),
        api.fpa.getPending().catch(() => []),
        api.fpa.getHistory().catch(() => []),
      ]);
      setPending(moulds);
      setPendingDeletions(dels);
      setPendingCorrections(corrs);
      setPendingFpas(Array.isArray(pendingFpaList) ? pendingFpaList : []);
      setFpas(Array.isArray(fpaList) ? fpaList : []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function decide(id, decision) {
    setError('');
    setBusyId(id);
    try {
      await api.decideAssignment(id, decision);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleApproveDeletion(id) {
    if (!window.confirm('Are you sure you want to approve this deletion? This action will modify records.')) return;
    setError('');
    setBusyId(id);
    try {
      await api.deletions.approve(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRejectDeletion(id) {
    setError('');
    setBusyId(id);
    try {
      await api.deletions.reject(id, rejectNote);
      setRejectNoteId(null);
      setRejectNote('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleApproveCorrection(id) {
    if (!window.confirm('Are you sure you want to approve and apply this correction to production records?')) return;
    setError('');
    setBusyId(id);
    try {
      await api.corrections.approve(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRejectCorrection(id) {
    if (!rejectCorrNote || !rejectCorrNote.trim()) {
      alert('Please provide a reason for rejecting this correction request.');
      return;
    }
    setError('');
    setBusyId(id);
    try {
      await api.corrections.reject(id, rejectCorrNote.trim());
      setRejectCorrId(null);
      setRejectCorrNote('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Approvals</h1>
      <p className="screen-sub">Authorizations for mould setups, data corrections, and deletion requests</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'moulds' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 'auto', flex: 1, minWidth: 130, padding: '8px 12px', fontSize: 13 }}
          onClick={() => setActiveTab('moulds')}
        >
          Mould Setups ({pending.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'corrections' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 'auto', flex: 1, minWidth: 150, padding: '8px 12px', fontSize: 13 }}
          onClick={() => setActiveTab('corrections')}
        >
          ✏️ Corrections ({pendingCorrections.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'deletions' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 'auto', flex: 1, minWidth: 130, padding: '8px 12px', fontSize: 13 }}
          onClick={() => setActiveTab('deletions')}
        >
          🗑️ Deletions ({pendingDeletions.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'fpa' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 'auto', flex: 1.2, minWidth: 140, padding: '8px 12px', fontSize: 13 }}
          onClick={() => setActiveTab('fpa')}
        >
          🛡️ IATF FPA ({fpas.length})
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Tab 1: Mould Setups */}
      {activeTab === 'moulds' && (
        <>
          {pending.length === 0 && <p className="muted">No pending mould setup requests.</p>}

          {pending.map((p) => (
            <div key={p.id} className="panel" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                <strong style={{ fontSize: 16 }}>{p.machine_code}</strong>
                <span className="status-pill status-pending">Pending</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span className="shrp-code-pill">{p.shrp_part_code || p.part_code}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.part_name}</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                Customer Part No: <strong>{p.customer_part_no || p.part_code}</strong>
              </div>
              <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
                Requested by {p.set_by_name} · {new Date(p.set_at).toLocaleString()}
              </div>
              {p.notes && <div className="muted" style={{ fontSize: 12, marginBottom: 12 }}>Note: {p.notes}</div>}
              <div className="btn-row">
                <button
                  className="btn btn-primary"
                  disabled={busyId === p.id}
                  onClick={() => decide(p.id, 'approved')}
                >
                  Approve
                </button>
                <button
                  className="btn"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', fontWeight: 600, width: 'auto', padding: '8px 14px' }}
                  disabled={busyId === p.id}
                  onClick={async () => {
                    setError('');
                    setBusyId(p.id);
                    try {
                      await api.decideAssignment(p.id, 'approved');
                      await load();
                      setSelectedFpaAssignment({
                        assignment_id: p.id,
                        machine_id: p.machine_id,
                        machine_code: p.machine_code,
                        part_id: p.part_id,
                        part_code: p.part_code,
                        shrp_part_code: p.shrp_part_code,
                        part_name: p.part_name,
                        cavity_count: p.cavity_count,
                        mould_id: p.mould_id,
                        mould_code: p.mould_code,
                      });
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setBusyId(null);
                    }
                  }}
                >
                  🛡️ Approve & Open FPA
                </button>
                <button
                  className="btn btn-secondary"
                  disabled={busyId === p.id}
                  onClick={() => decide(p.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Tab 2: Corrections & Catch-Up Requests */}
      {activeTab === 'corrections' && (
        <>
          {pendingCorrections.length === 0 && <p className="muted">No pending correction or catch-up requests.</p>}

          {pendingCorrections.map((c) => {
            let payloadObj = {};
            try {
              payloadObj = typeof c.payload === 'string' ? JSON.parse(c.payload) : (c.payload || {});
            } catch { /* empty */ }

            return (
              <div key={c.id} className="panel" style={{ marginBottom: 14, borderColor: 'rgba(59, 130, 246, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '2px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                      {c.action.replace('_', ' ')}: {c.entity_type.replace('_', ' ')}
                    </span>
                    <strong style={{ fontSize: 14 }}>{c.entity_code || `Request #${c.id}`}</strong>
                  </div>
                  <span className="status-pill status-pending">Pending Admin Approval</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 6, marginBottom: 10, fontSize: 13 }}>
                  <div className="muted" style={{ fontSize: 11, marginBottom: 4 }}>Proposed Changes / Record Payload:</div>
                  {c.entity_type === 'production_entry' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
                      <div>• Date/Shift: <strong>{payloadObj.entry_date} (Shift {payloadObj.shift})</strong></div>
                      <div>• Time: <strong>{payloadObj.period_start_at ? new Date(payloadObj.period_start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'} – {payloadObj.period_end_at ? new Date(payloadObj.period_end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</strong></div>
                      <div>• Counts: <strong>{payloadObj.start_count} → {payloadObj.end_count}</strong></div>
                      <div>• Good Qty: <strong style={{ color: '#34d399' }}>{payloadObj.good_qty} pcs</strong></div>
                      <div>• Reject: <strong style={{ color: '#f87171' }}>{payloadObj.reject_qty || 0} pcs</strong></div>
                      <div>• Downtime: <strong>{payloadObj.downtime_minutes || 0} min</strong></div>
                    </div>
                  )}
                  {c.entity_type === 'bag' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
                      <div>• Bag Code: <strong>{payloadObj.bag_code || c.entity_code}</strong></div>
                      <div>• Weight: <strong>{payloadObj.base_weight_kg} kg</strong></div>
                      <div>• Quantity: <strong>{payloadObj.qty} pcs</strong></div>
                      <div>• Status: <strong>{payloadObj.status || payloadObj.new_status}</strong></div>
                    </div>
                  )}
                  {c.entity_type === 'trim_entry' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
                      <div>• Trimmed: <strong>{payloadObj.trimmed_wt_kg} kg</strong></div>
                      <div>• Runner: <strong>{payloadObj.runner_wt_kg} kg</strong></div>
                      <div>• Reject: <strong>{payloadObj.reject_wt_kg} kg</strong></div>
                      <div>• Remaining: <strong>{payloadObj.remaining_wt_kg} kg</strong></div>
                    </div>
                  )}
                  {c.entity_type === 'inspection_entry' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
                      <div>• Inspected: <strong>{payloadObj.inspected_wt_kg} kg</strong></div>
                      <div>• Reject: <strong>{payloadObj.reject_wt_kg} kg</strong></div>
                      <div>• Remaining: <strong>{payloadObj.remaining_wt_kg} kg</strong></div>
                    </div>
                  )}
                  {c.entity_type === 'packing_entry' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
                      <div>• Packed Qty: <strong>{payloadObj.packed_qty} pcs</strong></div>
                      <div>• Packed Wt: <strong>{payloadObj.packed_wt_kg} kg</strong></div>
                      <div>• Packets: <strong>{payloadObj.packets_count}</strong></div>
                      <div>• Balance: <strong>{payloadObj.balance_qty} pcs</strong></div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 8, fontSize: 13 }}>
                  <span className="muted">Supervisor Reason: </span>
                  <strong style={{ color: '#93c5fd' }}>"{c.reason}"</strong>
                </div>

                <div className="muted" style={{ fontSize: 11, marginBottom: 12 }}>
                  Requested by <strong>{c.requested_by_name}</strong> ({c.requested_by_role}) · {new Date(c.created_at).toLocaleString()}
                </div>

                {rejectCorrId === c.id ? (
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="text"
                      placeholder="Reason for rejecting this correction request..."
                      value={rejectCorrNote}
                      onChange={(e) => setRejectCorrNote(e.target.value)}
                      style={{ marginBottom: 8, fontSize: 13 }}
                    />
                    <div className="btn-row">
                      <button
                        className="btn"
                        style={{ background: 'var(--red)', color: '#fff' }}
                        disabled={busyId === c.id}
                        onClick={() => handleRejectCorrection(c.id)}
                      >
                        Confirm Rejection
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setRejectCorrId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="btn-row">
                    <button
                      className="btn btn-primary"
                      disabled={busyId === c.id}
                      onClick={() => handleApproveCorrection(c.id)}
                    >
                      Approve & Apply Correction
                    </button>
                    <button
                      className="btn btn-secondary"
                      disabled={busyId === c.id}
                      onClick={() => setRejectCorrId(c.id)}
                    >
                      Reject Request
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Tab 3: Deletion Requests */}
      {activeTab === 'deletions' && (
        <>
          {pendingDeletions.length === 0 && <p className="muted">No pending deletion requests.</p>}

          {pendingDeletions.map((d) => {
            let detailsObj = {};
            try {
              detailsObj = typeof d.details === 'string' ? JSON.parse(d.details) : (d.details || {});
            } catch { /* empty */ }

            return (
              <div key={d.id} className="panel" style={{ marginBottom: 14, borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '2px 8px', borderRadius: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                      {d.entity_type.replace('_', ' ')}
                    </span>
                    <strong style={{ fontSize: 14 }}>Item #{d.entity_id}</strong>
                  </div>
                  <span className="status-pill status-pending">Pending Admin</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 6, marginBottom: 10, fontSize: 13 }}>
                  <div className="muted" style={{ fontSize: 11, marginBottom: 2 }}>Item Details:</div>
                  {d.entity_type === 'part' && (
                    <div>Part: <strong>{detailsObj.shrp_part_code || detailsObj.part_code}</strong> — {detailsObj.part_name}</div>
                  )}
                  {d.entity_type === 'production_entry' && (
                    <div>
                      {detailsObj.machine_code} · Hour {detailsObj.hour_slot} · Part: <strong>{detailsObj.shrp_part_code || detailsObj.part_code}</strong> · Good: {detailsObj.good_qty} · Reject: {detailsObj.reject_qty}
                    </div>
                  )}
                  {d.entity_type === 'bag' && (
                    <div>
                      Bag: <strong>{detailsObj.bag_code}</strong> · Batch: {detailsObj.batch_no} · {detailsObj.qty} pcs ({detailsObj.base_weight_kg} kg)
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 8, fontSize: 13 }}>
                  <span className="muted">Reason: </span>
                  <strong style={{ color: '#fca5a5' }}>"{d.reason}"</strong>
                </div>

                <div className="muted" style={{ fontSize: 11, marginBottom: 12 }}>
                  Requested by <strong>{d.requested_by_name}</strong> ({d.requested_by_role}) · {new Date(d.created_at).toLocaleString()}
                </div>

                {rejectNoteId === d.id ? (
                  <div style={{ marginBottom: 10 }}>
                    <input
                      type="text"
                      placeholder="Optional reason for rejection..."
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      style={{ marginBottom: 8, fontSize: 13 }}
                    />
                    <div className="btn-row">
                      <button
                        className="btn"
                        style={{ background: 'var(--red)', color: '#fff' }}
                        disabled={busyId === d.id}
                        onClick={() => handleRejectDeletion(d.id)}
                      >
                        Confirm Rejection
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setRejectNoteId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="btn-row">
                    <button
                      className="btn"
                      style={{ background: 'var(--red)', color: '#fff', borderColor: 'var(--red)' }}
                      disabled={busyId === d.id}
                      onClick={() => handleApproveDeletion(d.id)}
                    >
                      Approve & Delete
                    </button>
                    <button
                      className="btn btn-secondary"
                      disabled={busyId === d.id}
                      onClick={() => setRejectNoteId(d.id)}
                    >
                      Reject Request
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {/* Tab 4: IATF First-Piece Approvals */}
      {activeTab === 'fpa' && (
        <>
          {/* Section A: Pending FPA for Active Approved Setups */}
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 14, color: 'var(--amber)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🛡️</span>
              <span>Setups Awaiting First-Piece Approval (1st OK Part) ({pendingFpas.length})</span>
            </h2>
            {pendingFpas.length === 0 ? (
              <p className="muted" style={{ fontSize: 12 }}>All active mould setups have approved First-Piece Sign-offs.</p>
            ) : (
              pendingFpas.map((pf) => (
                <div
                  key={pf.assignment_id}
                  className="panel"
                  style={{
                    marginBottom: 10,
                    borderColor: pf.fpa_status === 'VISUAL_APPROVED' ? 'rgba(245, 158, 11, 0.6)' : 'rgba(245, 158, 11, 0.4)',
                    background: pf.fpa_status === 'VISUAL_APPROVED' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                    <strong style={{ fontSize: 15 }}>{pf.machine_code}</strong>
                    {pf.fpa_status === 'VISUAL_APPROVED' ? (
                      <span className="status-pill" style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', fontWeight: 700 }}>
                        ⚡ Visual Approved — Full FPA Due
                      </span>
                    ) : (
                      <span className="status-pill status-pending">FPA Required</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className="shrp-code-pill">{pf.shrp_part_code || pf.part_code}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{pf.part_name}</span>
                    <span className="muted" style={{ fontSize: 11 }}>({pf.customer_part_no || pf.part_code})</span>
                  </div>
                  <div className="muted" style={{ fontSize: 11, marginBottom: 10 }}>
                    Mould Setup Approved {pf.approved_at ? new Date(pf.approved_at).toLocaleString() : ''} · Requested by {pf.set_by_name || 'Operator'}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{
                        width: 'auto', padding: '7px 14px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: pf.fpa_status === 'VISUAL_APPROVED' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : undefined,
                        color: pf.fpa_status === 'VISUAL_APPROVED' ? '#000' : undefined
                      }}
                      onClick={() => setSelectedFpaAssignment(pf)}
                    >
                      <span>{pf.fpa_status === 'VISUAL_APPROVED' ? '⚡' : '📝'}</span>
                      <span>{pf.fpa_status === 'VISUAL_APPROVED' ? 'Complete Full FPA (Measured Readings)' : 'Fill & Approve FPA Sheet (1st Part)'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section B: Completed FPA History */}
          <div style={{ marginTop: 20 }}>
            <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
              FPA History & Quality Records ({fpas.length})
            </h2>
            {fpas.length === 0 && <p className="muted">No First-Piece Approvals logged yet.</p>}

            {fpas.map((fpa) => {
              const isApproved = fpa.approval_status === 'APPROVED';
              const isCond = fpa.approval_status === 'CONDITIONAL';

              return (
                <div key={fpa.id} className="panel" style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>{fpa.machine_code}</strong>
                      <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>
                        Inspection #{fpa.inspection_no}
                      </span>
                    </div>
                    <span
                      className={`status-pill ${
                        isApproved ? 'status-approved' : isCond ? 'status-pending' : 'status-rejected'
                      }`}
                      style={
                        isApproved
                          ? { background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }
                          : isCond
                          ? { background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }
                          : { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }
                      }
                    >
                      {fpa.approval_status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span className="shrp-code-pill">{fpa.shrp_part_code || fpa.part_code}</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{fpa.part_name}</span>
                    <span className="muted" style={{ fontSize: 12 }}>({fpa.customer_part_no || fpa.part_code})</span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--line)', marginBottom: 10, fontSize: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat-auto-fit, minmax(200px, 1fr)', gap: 6 }}>
                      <div>• RM Lot: <strong>{fpa.rm_lot_no || fpa.raw_material_lot_no || '-'}</strong> ({fpa.material_name || 'Standard'})</div>
                      <div>• Regrind: <strong>{fpa.regrind_pct ?? fpa.regrind_percentage ?? 0}%</strong></div>
                      <div>• Visual Inspection: <strong style={{ color: fpa.visual_check_passed ? '#34d399' : '#f87171' }}>{fpa.visual_check_passed ? 'PASS' : 'FAIL'}</strong></div>
                      <div>• Inspector: <strong>{fpa.approved_by_name || fpa.inspector_name || 'QA Lead'}</strong></div>
                    </div>
                    {fpa.remarks && (
                      <div style={{ marginTop: 6, color: 'var(--text-muted)' }}>
                        Remarks: "{fpa.remarks}"
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div className="muted" style={{ fontSize: 11 }}>
                      Submitted {new Date(fpa.created_at).toLocaleString()}
                    </div>
                    <a
                      href={api.fpa.downloadPdfUrl(fpa.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{
                        width: 'auto',
                        padding: '6px 14px',
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'rgba(99, 102, 241, 0.15)',
                        borderColor: 'rgba(99, 102, 241, 0.35)',
                        color: '#a5b4fc',
                        fontWeight: 600,
                      }}
                    >
                      📄 Download IATF Setup Report (PDF)
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedFpaAssignment && (
        <FpaModal
          assignment={selectedFpaAssignment}
          machine={{ id: selectedFpaAssignment.machine_id, machine_code: selectedFpaAssignment.machine_code }}
          part={{
            id: selectedFpaAssignment.part_id,
            part_code: selectedFpaAssignment.part_code,
            shrp_part_code: selectedFpaAssignment.shrp_part_code,
            part_name: selectedFpaAssignment.part_name,
            cavity_count: selectedFpaAssignment.cavity_count,
          }}
          mould={selectedFpaAssignment.mould_id ? { id: selectedFpaAssignment.mould_id, mould_code: selectedFpaAssignment.mould_code } : null}
          onClose={() => setSelectedFpaAssignment(null)}
          onSuccess={() => {
            setSelectedFpaAssignment(null);
            load();
          }}
        />
      )}
    </div>
  );
}
