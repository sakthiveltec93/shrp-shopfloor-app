import { useState } from 'react';
import { api } from '../api';

export default function PinChange() {
  const [form, setForm] = useState({ current_pin: '', new_pin: '', confirm_pin: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (form.new_pin !== form.confirm_pin) {
      setError('New PIN and confirmation do not match.');
      return;
    }
    if (!/^\d{4,6}$/.test(form.new_pin)) {
      setError('New PIN must be 4-6 digits.');
      return;
    }
    setSaving(true);
    try {
      await api.changePin({ current_pin: form.current_pin, new_pin: form.new_pin });
      setSuccess('PIN updated. Use your new PIN next time you log in.');
      setForm({ current_pin: '', new_pin: '', confirm_pin: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Change PIN</h1>
      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}
      <div className="panel">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="current_pin">Current PIN</label>
            <input id="current_pin" type="password" inputMode="numeric" required
              value={form.current_pin} onChange={(e) => setForm((f) => ({ ...f, current_pin: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="new_pin">New PIN (4-6 digits)</label>
            <input id="new_pin" type="password" inputMode="numeric" required
              value={form.new_pin} onChange={(e) => setForm((f) => ({ ...f, new_pin: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="confirm_pin">Confirm new PIN</label>
            <input id="confirm_pin" type="password" inputMode="numeric" required
              value={form.confirm_pin} onChange={(e) => setForm((f) => ({ ...f, confirm_pin: e.target.value }))} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Update PIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
