import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../api';
import { useAuth } from '../AuthContext';
import DeletionModal from '../components/DeletionModal';

export default function PartsList() {
  const { user } = useAuth();
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [targetPart, setTargetPart] = useState(null);

  useEffect(() => {
    api.parts().then(setParts).catch((err) => setError(err.message));
  }, []);

  const filtered = parts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.shrp_part_code && p.shrp_part_code.toLowerCase().includes(q)) ||
      (p.customer_part_no && p.customer_part_no.toLowerCase().includes(q)) ||
      (p.part_code && p.part_code.toLowerCase().includes(q)) ||
      (p.part_name && p.part_name.toLowerCase().includes(q)) ||
      (p.batch_part_code && p.batch_part_code.toLowerCase().includes(q))
    );
  });

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 className="screen-title" style={{ marginBottom: 0 }}>Parts ({filtered.length})</h1>
        <Link to="/parts/new" className="btn btn-primary" style={{ width: 'auto', padding: '10px 16px' }}>
          + Add part
        </Link>
      </div>
      <p className="screen-sub">Master parts list — 77 parts with routing, batch codes, tolerance and packing specs</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner" style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--accent)', borderRadius: 8, color: 'var(--accent)', marginBottom: 14, fontSize: 13 }}>{success}</div>}

      <div style={{ marginBottom: 14 }}>
        <input
          type="text"
          placeholder="🔍 Search by SHRP code, customer part no, batch code, or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', fontSize: 14 }}
        />
      </div>

      {filtered.map((p) => (
        <div key={p.id} className="panel" style={{ marginBottom: 10, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <Link to={`/parts/${p.id}/edit`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', gap: 12 }}>
              {p.photo_file_id ? (
                <img
                  src={`/api/masters/parts/${p.id}/files/${p.photo_file_id}?token=${getToken()}`}
                  alt={p.part_name}
                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)', background: '#111', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: 8, border: '1px dashed var(--line)', background: 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="Click to edit and attach photo">
                  <span style={{ fontSize: 16 }}>📷</span>
                </div>
              )}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span className="shrp-code-pill">{p.shrp_part_code || p.part_code}</span>
                  {p.batch_part_code && (
                    <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-muted)' }}>
                      Batch: {p.batch_part_code}
                    </span>
                  )}
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.part_name}</span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>
                  Customer Part No: <strong style={{ color: 'var(--text)' }}>{p.customer_part_no || p.part_code}</strong>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11 }}>
                  <span style={{ color: p.trim_required ? 'var(--accent)' : 'var(--text-muted)' }}>
                    Trim: {p.trim_required ? 'Y' : 'N'}
                  </span>
                  <span>•</span>
                  <span style={{ color: p.inspection_required ? 'var(--accent)' : 'var(--text-muted)' }}>
                    Insp: {p.inspection_required ? 'Y' : 'N'}
                  </span>
                  <span>•</span>
                  <span style={{ color: p.packing_required ? 'var(--accent)' : 'var(--text-muted)' }}>
                    Pack: {p.packing_required ? 'Y' : 'N'}
                  </span>
                  <span>•</span>
                  <span style={{ color: p.dispatch_required ? 'var(--accent)' : 'var(--text-muted)' }}>
                    Disp: {p.dispatch_required ? 'Y' : 'N'}
                  </span>
                  {p.tolerance_pct && (
                    <>
                      <span>•</span>
                      <span style={{ color: 'var(--text-muted)' }}>Tol: {p.tolerance_pct}%</span>
                    </>
                  )}
                </div>
              </div>
            </Link>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div className="muted" style={{ fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }}>
                <div>{p.cavity_count} cav {p.unit_weight_g ? `· ${p.unit_weight_g}g shot` : ''}</div>
                <div style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: 11 }}>
                  {p.standard_pack_qty ? `Std Pack: ${p.standard_pack_qty}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <Link to={`/parts/${p.id}/edit`} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 11, width: 'auto' }}>
                  Edit
                </Link>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    padding: '4px 10px',
                    fontSize: 11,
                    width: 'auto',
                    color: 'var(--red)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.08)',
                  }}
                  onClick={() => setTargetPart(p)}
                  title={user?.role === 'admin' ? 'Direct Delete Part' : 'Request Part Deletion Approval'}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {targetPart && (
        <DeletionModal
          isOpen={!!targetPart}
          onClose={() => setTargetPart(null)}
          entityType="part"
          entityId={targetPart.id}
          entityTitle={`${targetPart.part_name} (${targetPart.shrp_part_code || targetPart.part_code})`}
          isAdmin={user?.role === 'admin'}
          onSuccess={() => {
            setSuccess(
              user?.role === 'admin'
                ? `Part ${targetPart.shrp_part_code || targetPart.part_name} deleted successfully.`
                : `Deletion request submitted for part ${targetPart.shrp_part_code || targetPart.part_name}. Awaiting Admin approval.`
            );
            api.parts().then(setParts).catch((err) => setError(err.message));
          }}
        />
      )}
    </div>
  );
}
