import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function PartsList() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

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
        <Link key={p.id} to={`/parts/${p.id}/edit`} className="panel" style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
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
            <div className="muted" style={{ fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }}>
              <div>{p.cavity_count} cav {p.unit_weight_g ? `· ${p.unit_weight_g}g shot` : ''}</div>
              <div style={{ marginTop: 2, color: 'var(--text-muted)', fontSize: 11 }}>
                {p.standard_pack_qty ? `Std Pack: ${p.standard_pack_qty}` : ''}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
