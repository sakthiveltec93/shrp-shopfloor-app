import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function PartsList() {
  const [parts, setParts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.parts().then(setParts).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 className="screen-title" style={{ marginBottom: 0 }}>Parts</h1>
        <Link to="/parts/new" className="btn btn-primary" style={{ width: 'auto', padding: '10px 16px' }}>
          + Add part
        </Link>
      </div>
      <p className="screen-sub">Part master — process parameters, dimensions, SOP/PPAP, photos</p>

      {error && <div className="error-banner">{error}</div>}

      {parts.map((p) => (
        <Link key={p.id} to={`/parts/${p.id}/edit`} className="panel" style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span className="shrp-code-pill">{p.shrp_part_code || p.part_code}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.part_name}</span>
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                Customer Part No: <strong>{p.customer_part_no || p.part_code}</strong>
              </div>
            </div>
            <div className="muted" style={{ fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap', marginLeft: 8 }}>
              {p.cavity_count} cav · {p.standard_cycle_time_sec}s
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
