import { useState } from 'react';
import { api } from '../api';

export default function DeletionModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle,
  isAdmin = false,
  onSuccess,
}) {
  const [reason, setReason] = useState('');
  const [direct, setDirect] = useState(isAdmin);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a mandatory reason for deletion.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (isAdmin && direct) {
        await api.deletions.directDelete(entityType, entityId, reason.trim());
      } else {
        await api.deletions.request({
          entity_type: entityType,
          entity_id: entityId,
          reason: reason.trim(),
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to process deletion');
    } finally {
      setSubmitting(false);
    }
  }

  const typeLabels = {
    part: 'Part Definition',
    production_entry: 'Hourly Production Entry',
    bag: 'Bag Record',
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16,
    }}>
      <div className="modal-card panel" style={{ maxWidth: 480, width: '100%', background: 'var(--surface)', border: '1px solid var(--red)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🗑️</span>
            {isAdmin && direct ? `Delete ${typeLabels[entityType] || entityType}` : `Request Deletion Approval`}
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
          Target: <strong style={{ color: 'var(--text)' }}>{entityTitle || `#${entityId}`}</strong>
        </p>

        {!isAdmin && (
          <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 6, fontSize: 12, marginBottom: 14, color: '#fca5a5' }}>
            ⚠️ <strong>Admin Approval Required:</strong> As an operator, submitting this form will send an approval request to the Administrator. The record will only be deleted once an Admin reviews and approves it.
          </div>
        )}

        {isAdmin && (
          <div style={{ marginBottom: 14, display: 'flex', gap: 12 }}>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" checked={direct} onChange={() => setDirect(true)} />
              <span>Delete Immediately (Admin Override)</span>
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="radio" checked={!direct} onChange={() => setDirect(false)} />
              <span>Log Pending Request</span>
            </label>
          </div>
        )}

        {error && <div className="error-banner" style={{ marginBottom: 12 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label style={{ fontSize: 12, fontWeight: 600 }}>
              Mandatory Reason for Deletion *
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Wrong counter value entered by mistake / Duplicate entry / Mould setup changed"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', fontSize: 13, resize: 'vertical' }}
            />
          </div>

          <div className="btn-row" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={submitting}
              style={{
                flex: 1,
                background: 'var(--red)',
                color: '#fff',
                borderColor: 'var(--red)',
              }}
            >
              {submitting ? 'Submitting...' : (isAdmin && direct ? 'Confirm & Delete' : 'Submit for Admin Approval')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
