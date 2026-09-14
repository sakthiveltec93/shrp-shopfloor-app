import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Approvals() {
  const [activeTab, setActiveTab] = useState('moulds'); // 'moulds' | 'deletions'
  const [pending, setPending] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejectNoteId, setRejectNoteId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  async function load() {
    try {
      const [moulds, dels] = await Promise.all([
        api.pendingAssignments(),
        api.deletions.pending().catch(() => []),
      ]);
      setPending(moulds);
      setPendingDeletions(dels);
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
          🗑️ Deletion Requests ({pendingDeletions.length})
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
    </div>
  );
}
