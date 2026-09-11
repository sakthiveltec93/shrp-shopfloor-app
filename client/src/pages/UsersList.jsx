import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.users().then(setUsers).catch((err) => setError(err.message));
  }, []);

  return (
    <div className="screen">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 className="screen-title" style={{ marginBottom: 0 }}>Users</h1>
        <Link to="/users/new" className="btn btn-primary" style={{ width: 'auto', padding: '10px 16px' }}>
          + Add user
        </Link>
      </div>
      <p className="screen-sub">Accounts and page access</p>

      {error && <div className="error-banner">{error}</div>}

      {users.map((u) => (
        <Link key={u.id} to={`/users/${u.id}/edit`} className="panel" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{u.full_name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{u.username} · {u.role}</div>
            </div>
            {!u.active && <span className="status-pill status-rejected">Inactive</span>}
          </div>
        </Link>
      ))}
    </div>
  );
}
