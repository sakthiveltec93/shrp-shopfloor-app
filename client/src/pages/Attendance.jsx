import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location is not available on this device/browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message || 'Could not get your location. Enable location permission and try again.')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

export default function Attendance() {
  const { user } = useAuth();
  const isSupervisor = user.role === 'supervisor' || user.role === 'admin';
  const isAdmin = user.role === 'admin';

  const [today, setToday] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState(null);
  const [radiusInput, setRadiusInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [locatingForSettings, setLocatingForSettings] = useState(false);
  const [pendingCenter, setPendingCenter] = useState(null);

  const [rosterDate, setRosterDate] = useState(todayLocal());
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    api.attendance.today().then(setToday).catch(() => setToday(null));
    api.attendance.settings().then((s) => { setSettings(s); setRadiusInput(String(s.radius_m)); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isSupervisor) {
      api.attendance.roster(rosterDate).then(setRoster).catch(() => {});
    }
  }, [isSupervisor, rosterDate]);

  async function handleCheckIn() {
    setError(''); setSuccess(''); setBusy(true);
    try {
      const pos = await getPosition();
      const row = await api.attendance.checkIn(pos.lat, pos.lng);
      setToday(row);
      setSuccess(`Checked in at ${new Date(row.check_in_at).toLocaleTimeString()}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    setError(''); setSuccess(''); setBusy(true);
    try {
      const pos = await getPosition();
      const row = await api.attendance.checkOut(pos.lat, pos.lng);
      setToday(row);
      setSuccess(`Checked out at ${new Date(row.check_out_at).toLocaleTimeString()}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function useMyLocationForSettings() {
    setError(''); setLocatingForSettings(true);
    try {
      const pos = await getPosition();
      setPendingCenter(pos);
    } catch (err) {
      setError(err.message);
    } finally {
      setLocatingForSettings(false);
    }
  }

  async function saveSettings(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const center = pendingCenter || (settings ? { lat: settings.lat, lng: settings.lng } : null);
    if (!center || center.lat == null) {
      setError("Set the factory location first - tap \"Use my current location\" while standing at the site.");
      return;
    }
    setSavingSettings(true);
    try {
      const updated = await api.attendance.updateSettings({ lat: center.lat, lng: center.lng, radius_m: Number(radiusInput) || undefined });
      setSettings(updated);
      setPendingCenter(null);
      setSuccess('Factory location saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">Attendance</h1>
      <p className="screen-sub">Check in and out using your phone's location.</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <div className="panel">
        {today === undefined && <p className="muted">Loading today's status…</p>}
        {today !== undefined && (
          <>
            <div className="readout" style={{ marginBottom: 14 }}>
              <div className="readout-label">Today</div>
              {today?.check_in_at
                ? `Checked in at ${new Date(today.check_in_at).toLocaleTimeString()}`
                : 'Not checked in yet'}
              {today?.check_out_at && ` · Checked out at ${new Date(today.check_out_at).toLocaleTimeString()}`}
            </div>
            {!today?.check_in_at && (
              <button className="btn btn-primary" disabled={busy} onClick={handleCheckIn}>
                {busy ? 'Getting location…' : 'Check In'}
              </button>
            )}
            {today?.check_in_at && !today?.check_out_at && (
              <button className="btn btn-primary" disabled={busy} onClick={handleCheckOut}>
                {busy ? 'Getting location…' : 'Check Out'}
              </button>
            )}
            {today?.check_in_at && today?.check_out_at && (
              <p className="muted" style={{ fontSize: 13 }}>You're all done for today.</p>
            )}
          </>
        )}
      </div>

      {isSupervisor && (
        <>
          <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>Team roster</h2>
          <div className="field">
            <label htmlFor="roster_date">Date</label>
            <input id="roster_date" type="date" value={rosterDate} onChange={(e) => setRosterDate(e.target.value)} />
          </div>
          <div className="panel" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Check in</th><th>Check out</th><th>Within site?</th></tr>
              </thead>
              <tbody>
                {roster.map((r) => (
                  <tr key={r.id}>
                    <td>{r.full_name}</td>
                    <td>{r.check_in_at ? new Date(r.check_in_at).toLocaleTimeString() : '—'}</td>
                    <td>{r.check_out_at ? new Date(r.check_out_at).toLocaleTimeString() : '—'}</td>
                    <td>{r.check_in_within_geofence == null ? '—' : r.check_in_within_geofence ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr><td colSpan={4} className="muted">No attendance recorded for this date.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isAdmin && (
        <>
          <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>Factory location (geofence)</h2>
          <form onSubmit={saveSettings} className="panel">
            <p className="muted" style={{ fontSize: 12, marginTop: 0 }}>
              {settings?.lat != null
                ? `Current center: ${settings.lat.toFixed(5)}, ${settings.lng.toFixed(5)} · radius ${settings.radius_m}m`
                : 'Not set yet - operators can check in from anywhere until this is configured.'}
            </p>
            {pendingCenter && (
              <p className="muted" style={{ fontSize: 12 }}>
                New center ready: {pendingCenter.lat.toFixed(5)}, {pendingCenter.lng.toFixed(5)}
              </p>
            )}
            <button type="button" className="btn btn-secondary" disabled={locatingForSettings} onClick={useMyLocationForSettings} style={{ marginBottom: 12 }}>
              {locatingForSettings ? 'Getting location…' : 'Use my current location'}
            </button>
            <div className="field">
              <label htmlFor="radius">Radius (meters)</label>
              <input id="radius" type="number" inputMode="numeric" value={radiusInput} onChange={(e) => setRadiusInput(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={savingSettings}>
              {savingSettings ? 'Saving…' : 'Save factory location'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
