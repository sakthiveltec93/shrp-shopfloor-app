import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('moulds'); // 'moulds' | 'deletions' | 'fpa'
  const [pending, setPending] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [fpas, setFpas] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectNoteId, setRejectNoteId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  async function load() {
    try {
      const [moulds, dels, fpaList] = await Promise.all([
        api.pendingAssignments(),
        api.deletions.pending().catch(() => []),
        api.fpa.getHistory().catch(() => []),
      ]);
      setPending(moulds);
      setPendingDeletions(dels);
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

  return (
    <div className="screen">
      <h1 className="screen-title">Approvals</h1>
      <p className="screen-sub">Authorizations for mould setups and operator deletion requests</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={`btn ${activeTab === 'moulds' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 'auto', flex: 1, padding: '8px 12px', fontSize: 13 }}
          onClick={() => setActiveTab('moulds')}
        >
          Mould Setups ({pending.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'deletions' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 'auto', flex: 1, padding: '8px 12px', fontSize: 13 }}
          onClick={() => setActiveTab('deletions')}
        >
          🗑️ Deletions ({pendingDeletions.length})
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'fpa' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ width: 'auto', flex: 1.2, padding: '8px 12px', fontSize: 13 }}
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

      {/* Tab 2: Deletion Requests */}
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

      {/* Tab 3: IATF First-Piece Approvals */}
      {activeTab === 'fpa' && (
        <>
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 6 }}>
                    <div>• RM Lot: <strong>{fpa.raw_material_lot_no}</strong> ({fpa.material_name || 'Standard'})</div>
                    <div>• Regrind: <strong>{fpa.regrind_percentage}%</strong> (max allowed per recipe)</div>
                    <div>• Visual Inspection: <strong style={{ color: fpa.visual_check_passed ? '#34d399' : '#f87171' }}>{fpa.visual_check_passed ? 'PASS' : 'FAIL'}</strong></div>
                    <div>• Inspector: <strong>{fpa.inspector_name}</strong></div>
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
                      fontWeight: 600
                    }}
                  >
                    📄 Download IATF Setup Report (PDF)
                  </a>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
