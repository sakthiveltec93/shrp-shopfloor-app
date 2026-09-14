import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { translations } from '../i18n/translations';

function todayLocal() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getPosition(lang) {
  const dict = translations[lang]?.attendance || translations.en.attendance;
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(dict.locationUnavailable));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message || dict.locationError)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

export default function Attendance() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
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
      const pos = await getPosition(lang);
      const row = await api.attendance.checkIn(pos.lat, pos.lng);
      setToday(row);
      setSuccess(t('attendance.checkedInSuccess', { time: new Date(row.check_in_at).toLocaleTimeString() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    setError(''); setSuccess(''); setBusy(true);
    try {
      const pos = await getPosition(lang);
      const row = await api.attendance.checkOut(pos.lat, pos.lng);
      setToday(row);
      setSuccess(t('attendance.checkedOutAt', { time: new Date(row.check_out_at).toLocaleTimeString() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function useMyLocationForSettings() {
    setError(''); setLocatingForSettings(true);
    try {
      const pos = await getPosition(lang);
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
      setError(t('attendance.setFactoryLocationError'));
      return;
    }
    setSavingSettings(true);
    try {
      const updated = await api.attendance.updateSettings({ lat: center.lat, lng: center.lng, radius_m: Number(radiusInput) || undefined });
      setSettings(updated);
      setPendingCenter(null);
      setSuccess(t('attendance.factoryLocationSaved'));
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <div className="screen">
      <h1 className="screen-title">{t('attendance.title')}</h1>
      <p className="screen-sub">{t('attendance.subtitle')}</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <div className="panel">
        {today === undefined && <p className="muted">{t('attendance.loadingToday')}</p>}
        {today !== undefined && (
          <>
            <div className="readout" style={{ marginBottom: 14 }}>
              <div className="readout-label">{t('attendance.today')}</div>
              {today?.check_in_at
                ? t('attendance.checkedInAt', { time: new Date(today.check_in_at).toLocaleTimeString() })
                : t('attendance.notCheckedIn')}
              {today?.check_out_at && t('attendance.checkedOutAtSuffix', { time: new Date(today.check_out_at).toLocaleTimeString() })}
            </div>
            {!today?.check_in_at && (
              <button className="btn btn-primary" disabled={busy} onClick={handleCheckIn}>
                {busy ? t('attendance.gettingLocation') : t('attendance.checkIn')}
              </button>
            )}
            {today?.check_in_at && !today?.check_out_at && (
              <button className="btn btn-primary" disabled={busy} onClick={handleCheckOut}>
                {busy ? t('attendance.gettingLocation') : t('attendance.checkOut')}
              </button>
            )}
            {today?.check_in_at && today?.check_out_at && (
              <p className="muted" style={{ fontSize: 13 }}>{t('attendance.allDone')}</p>
            )}
          </>
        )}
      </div>

      {isSupervisor && (
        <>
          <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>{t('attendance.teamRoster')}</h2>
          <div className="field">
            <label htmlFor="roster_date">{t('attendance.date')}</label>
            <input id="roster_date" type="date" value={rosterDate} onChange={(e) => setRosterDate(e.target.value)} />
          </div>
          <div className="panel" style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>{t('attendance.colName')}</th><th>{t('attendance.colCheckIn')}</th><th>{t('attendance.colCheckOut')}</th><th>{t('attendance.colWithinSite')}</th></tr>
              </thead>
              <tbody>
                {roster.map((r) => (
                  <tr key={r.id}>
                    <td>{r.full_name}</td>
                    <td>{r.check_in_at ? new Date(r.check_in_at).toLocaleTimeString() : '—'}</td>
                    <td>{r.check_out_at ? new Date(r.check_out_at).toLocaleTimeString() : '—'}</td>
                    <td>{r.check_in_within_geofence == null ? '—' : r.check_in_within_geofence ? t('common.yes') : t('common.no')}</td>
                  </tr>
                ))}
                {roster.length === 0 && (
                  <tr><td colSpan={4} className="muted">{t('attendance.noRecords')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isAdmin && (
        <>
          <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>{t('attendance.factoryLocation')}</h2>
          <form onSubmit={saveSettings} className="panel">
            <p className="muted" style={{ fontSize: 12, marginTop: 0 }}>
              {settings?.lat != null
                ? t('attendance.currentCenter', { lat: settings.lat.toFixed(5), lng: settings.lng.toFixed(5), radius: settings.radius_m })
                : t('attendance.notSetYet')}
            </p>
            {pendingCenter && (
              <p className="muted" style={{ fontSize: 12 }}>
                {t('attendance.newCenterReady', { lat: pendingCenter.lat.toFixed(5), lng: pendingCenter.lng.toFixed(5) })}
              </p>
            )}
            <button type="button" className="btn btn-secondary" disabled={locatingForSettings} onClick={useMyLocationForSettings} style={{ marginBottom: 12 }}>
              {locatingForSettings ? t('attendance.gettingLocation') : t('attendance.useMyLocation')}
            </button>
            <div className="field">
              <label htmlFor="radius">{t('attendance.radius')}</label>
              <input id="radius" type="number" inputMode="numeric" value={radiusInput} onChange={(e) => setRadiusInput(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={savingSettings}>
              {savingSettings ? t('attendance.saving') : t('attendance.saveFactoryLocation')}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
