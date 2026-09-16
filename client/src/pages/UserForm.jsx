import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

const PAGES = [
  { key: 'planning', label: 'Production Planning (MPS)' },
  { key: 'mould_setup', label: 'Mould Setup' },
  { key: 'entry', label: 'Production Entry' },
  { key: 'bag_entry', label: 'Bag Entry' },
  { key: 'trimming', label: 'Trimming' },
  { key: 'inspection', label: 'Inspection' },
  { key: 'packing', label: 'Packing' },
  { key: 'dispatch', label: 'Dispatch' },
  { key: 'log', label: "Today's Log" },
  { key: 'approvals', label: 'Approvals' },
  { key: 'parts', label: 'Parts' },
  { key: 'users', label: 'Users' },
  { key: 'attendance', label: 'Attendance' },
];

const DEFAULTS_BY_ROLE = {
  operator: ['mould_setup', 'entry', 'bag_entry', 'trimming', 'inspection', 'packing', 'dispatch', 'log', 'attendance'],
  supervisor: ['planning', 'mould_setup', 'entry', 'bag_entry', 'trimming', 'inspection', 'packing', 'dispatch', 'log', 'approvals', 'parts', 'attendance'],
  admin: PAGES.map((p) => p.key),
};

export default function UserForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('operator');
  const [active, setActive] = useState(true);
  const [pin, setPin] = useState('');
  const [pages, setPages] = useState(DEFAULTS_BY_ROLE.operator);
  const [canOverrideFifo, setCanOverrideFifo] = useState(false);
  const [canApproveTolerance, setCanApproveTolerance] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      api.users().then((list) => {
        const u = list.find((x) => String(x.id) === String(id));
        if (u) {
          setUsername(u.username);
          setFullName(u.full_name);
          setRole(u.role);
          setActive(u.active);
          setPages(u.pages);
          setCanOverrideFifo(!!u.can_override_fifo);
          setCanApproveTolerance(!!u.can_approve_tolerance);
        }
      });
    }
  }, [id, isNew]);

  function togglePage(key) {
    setPages((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  }

  function useRoleDefaults() {
    setPages(DEFAULTS_BY_ROLE[role] || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);
    try {
      if (isNew) {
        await api.createUser({
          username: username.trim(),
          pin,
          full_name: fullName,
          role,
          pages,
          can_override_fifo: canOverrideFifo,
          can_approve_tolerance: canApproveTolerance,
        });
        navigate('/users');
      } else {
        const payload = {
          full_name: fullName,
          role,
          active,
          pages,
          can_override_fifo: canOverrideFifo,
          can_approve_tolerance: canApproveTolerance,
        };
        if (pin) payload.pin = pin;
        await api.updateUser(id, payload);
        setSuccess('Saved.');
        setPin('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">{isNew ? 'Add User' : `Edit ${username}`}</h1>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="panel">
        <div className="field">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} disabled={!isNew} required />
        </div>
        <div className="field">
          <label>Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="field">
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="operator">Operator</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="field">
          <label>{isNew ? 'PIN (4-6 digits)' : 'Reset PIN (leave blank to keep current)'}</label>
          <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} required={isNew} />
        </div>
        {!isNew && (
          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Active
            </label>
          </div>
        )}

        <div className="field">
          <label style={{ fontWeight: 600 }}>Special Permissions</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={canOverrideFifo || role === 'admin' || role === 'supervisor'}
                disabled={role === 'admin' || role === 'supervisor'}
                onChange={(e) => setCanOverrideFifo(e.target.checked)}
              />
              Can Override FIFO (Admin & Supervisor always allowed)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={canApproveTolerance || role === 'admin' || role === 'supervisor'}
                disabled={role === 'admin' || role === 'supervisor'}
                onChange={(e) => setCanApproveTolerance(e.target.checked)}
              />
              Can Approve Tolerance Excess (Supervisor PIN approval)
            </label>
          </div>
        </div>

        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ marginBottom: 0 }}>Page access</label>
            <button type="button" className="btn btn-secondary" style={{ width: 'auto', padding: '6px 10px', fontSize: 12 }}
              onClick={useRoleDefaults}>
              Use defaults for {role}
            </button>
          </div>
          <div className="btn-row" style={{ flexWrap: 'wrap', marginTop: 8 }}>
            {PAGES.map((p) => (
              <label key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, width: '45%' }}>
                <input type="checkbox" checked={pages.includes(p.key)} onChange={() => togglePage(p.key)} />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
            {saving ? 'Saving…' : isNew ? 'Create user' : 'Save changes'}
          </button>
          {!isNew && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' }}
              onClick={async () => {
                if (window.confirm(`Are you sure you want to delete user "${username}"? Their access will be revoked and this username will be released.`)) {
                  try {
                    await api.deleteUser(id);
                    navigate('/users');
                  } catch (err) {
                    setError(err.message || 'Failed to delete user');
                  }
                }
              }}
            >
              🗑 Delete
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
