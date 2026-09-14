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
        <Link key={p.id} to={`/parts/${p.id}/edit`} className="panel" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.shrp_part_code ? `${p.shrp_part_code} (${p.part_code})` : p.part_code}</div>
              <div className="muted" style={{ fontSize: 12 }}>{p.part_name}</div>
            </div>
            <div className="muted" style={{ fontSize: 12, textAlign: 'right' }}>
              {p.cavity_count} cav · {p.standard_cycle_time_sec}s
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
