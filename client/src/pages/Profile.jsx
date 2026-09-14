import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useLanguage, LANGUAGES } from '../i18n/LanguageContext';

export default function Profile() {
  const { user } = useAuth();
  const { lang, setLang } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'leave' | 'usage' | 'pin'
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    aadhaar_no: '',
    bank_name: '',
    bank_account_no: '',
    bank_ifsc: '',
    nominee_name: '',
    nominee_relation: '',
    default_language: 'en',
    avatar_data: '',
  });

  // PIN Form State
  const [pinForm, setPinForm] = useState({ current_pin: '', new_pin: '', confirm_pin: '' });

  // Leave Form State
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [allStaffRequests, setAllStaffRequests] = useState([]);
  const [leaveForm, setLeaveForm] = useState({
    request_type: 'LEAVE', // 'LEAVE' | 'PERMISSION'
    leave_type: 'Casual',
    from_date: new Date().toISOString().slice(0, 10),
    to_date: new Date().toISOString().slice(0, 10),
    from_time: '14:00',
    to_time: '16:00',
    reason: '',
  });

  const isSupervisorOrAdmin = user?.role === 'admin' || user?.role === 'supervisor';

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const [profData, myLeaves] = await Promise.all([
        api.request('/account/profile'),
        api.request('/account/leave'),
      ]);
      setProfile(profData);
      setLeaveRequests(Array.isArray(myLeaves) ? myLeaves : []);
      setForm({
        full_name: profData.full_name || '',
        phone: profData.phone || '',
        aadhaar_no: profData.aadhaar_no || '',
        bank_name: profData.bank_name || '',
        bank_account_no: profData.bank_account_no || '',
        bank_ifsc: profData.bank_ifsc || '',
        nominee_name: profData.nominee_name || '',
        nominee_relation: profData.nominee_relation || '',
        default_language: profData.default_language || lang || 'en',
        avatar_data: profData.avatar_data || '',
      });

      if (isSupervisorOrAdmin) {
        const allLeaves = await api.request('/account/leave/all');
        setAllStaffRequests(Array.isArray(allLeaves) ? allLeaves : []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await api.request('/account/profile', { method: 'PUT', body: form });
      setProfile(prev => ({ ...prev, ...updated }));
      if (form.default_language) setLang(form.default_language);
      setSuccessMsg('Profile details saved successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm(f => ({ ...f, avatar_data: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    if (pinForm.new_pin !== pinForm.confirm_pin) {
      return setError('New PIN and confirmation do not match');
    }
    setSaving(true);
    setError('');
    try {
      await api.changePin({ current_pin: pinForm.current_pin, new_pin: pinForm.new_pin });
      setPinForm({ current_pin: '', new_pin: '', confirm_pin: '' });
      setSuccessMsg('PIN updated successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to change PIN');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.request('/account/leave', { method: 'POST', body: leaveForm });
      setSuccessMsg(`${leaveForm.request_type === 'LEAVE' ? 'Leave' : 'Permission'} request submitted!`);
      setTimeout(() => setSuccessMsg(''), 5000);
      setLeaveForm(f => ({ ...f, reason: '' }));
      loadProfile();
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setSaving(false);
    }
  };

  const handleDecideLeave = async (id, decision) => {
    try {
      await api.request(`/account/leave/${id}/decide`, { method: 'POST', body: { decision } });
      setSuccessMsg(`Request marked ${decision}.`);
      setTimeout(() => setSuccessMsg(''), 5000);
      loadProfile();
    } catch (err) {
      alert(err.message || 'Failed to process request');
    }
  };

  const formatMinutes = (mins) => {
    if (!mins || mins <= 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  if (loading) {
    return <div className="screen" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading profile...</div>;
  }

  return (
    <div className="screen" style={{ paddingBottom: 32 }}>
      {/* Profile Header Card */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          padding: '16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '2px solid var(--amber)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              color: 'var(--amber)',
              overflow: 'hidden',
            }}
          >
            {form.avatar_data ? (
              <img src={form.avatar_data} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              profile?.full_name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <label
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--amber)',
              color: '#1c1500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              cursor: 'pointer',
              fontWeight: 800,
            }}
            title="Change Photo"
          >
            📷
            <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </label>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile?.full_name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
            @{profile?.username} · <span style={{ textTransform: 'uppercase', color: 'var(--amber)', fontWeight: 700 }}>{profile?.role}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            App Usage Today: <strong style={{ color: '#10b981' }}>{formatMinutes(profile?.today_activity?.active_minutes)}</strong>
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid #10b98144', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div style={{ padding: '8px 12px', background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid #f43f5e44', borderRadius: 6, fontSize: 13, marginBottom: 12 }}>
          ⚠ {error}
        </div>
      )}

      {/* Profile Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
        {[
          { key: 'details', label: '🪪 Details' },
          { key: 'leave', label: '🏖 Leave' },
          { key: 'usage', label: '⏱ Usage' },
          { key: 'pin', label: '🔑 PIN' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 4px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 6,
              background: activeTab === tab.key ? 'var(--amber)' : 'var(--panel)',
              color: activeTab === tab.key ? '#1c1500' : 'var(--text-muted)',
              border: '1px solid var(--line)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Personal & Statutory HR Details */}
      {activeTab === 'details' && (
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="panel" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 10, textTransform: 'uppercase' }}>
              Personal & Language
            </div>
            <div className="field">
              <label>Full Name</label>
              <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div className="field">
              <label>Phone Number</label>
              <input type="tel" placeholder="e.g. 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>Default App Language</label>
              <select value={form.default_language} onChange={(e) => setForm({ ...form, default_language: e.target.value })}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.name} ({l.label})</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Aadhaar Card Number</label>
              <input placeholder="XXXX-XXXX-XXXX" value={form.aadhaar_no} onChange={(e) => setForm({ ...form, aadhaar_no: e.target.value })} />
            </div>
          </div>

          <div className="panel" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 10, textTransform: 'uppercase' }}>
              Bank Account Details
            </div>
            <div className="field">
              <label>Bank Name</label>
              <input placeholder="e.g. SBI, HDFC, Canara" value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
            </div>
            <div className="field">
              <label>Bank Account Number</label>
              <input placeholder="Account number" value={form.bank_account_no} onChange={(e) => setForm({ ...form, bank_account_no: e.target.value })} />
            </div>
            <div className="field">
              <label>IFSC Code</label>
              <input placeholder="e.g. SBIN0001234" value={form.bank_ifsc} onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })} />
            </div>
          </div>

          <div className="panel" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 10, textTransform: 'uppercase' }}>
              Nominee & Emergency Contact
            </div>
            <div className="field">
              <label>Nominee Name</label>
              <input placeholder="Nominee full name" value={form.nominee_name} onChange={(e) => setForm({ ...form, nominee_name: e.target.value })} />
            </div>
            <div className="field">
              <label>Relationship with Nominee</label>
              <input placeholder="e.g. Spouse, Father, Mother" value={form.nominee_relation} onChange={(e) => setForm({ ...form, nominee_relation: e.target.value })} />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile Details'}
          </button>
        </form>
      )}

      {/* Tab 2: Leave & Permission Requests */}
      {activeTab === 'leave' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Apply Form */}
          <form onSubmit={handleSubmitLeave} className="panel" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 10, textTransform: 'uppercase' }}>
              Apply for Leave / Short Permission
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setLeaveForm({ ...leaveForm, request_type: 'LEAVE' })}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 6,
                  background: leaveForm.request_type === 'LEAVE' ? 'var(--amber)' : 'var(--bg)',
                  color: leaveForm.request_type === 'LEAVE' ? '#1c1500' : 'var(--text-muted)',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                }}
              >
                🏖 Full/Half Day Leave
              </button>
              <button
                type="button"
                onClick={() => setLeaveForm({ ...leaveForm, request_type: 'PERMISSION' })}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 6,
                  background: leaveForm.request_type === 'PERMISSION' ? 'var(--amber)' : 'var(--bg)',
                  color: leaveForm.request_type === 'PERMISSION' ? '#1c1500' : 'var(--text-muted)',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                }}
              >
                ⏱ Short Permission (Hours)
              </button>
            </div>

            {leaveForm.request_type === 'LEAVE' ? (
              <>
                <div className="field">
                  <label>Leave Type</label>
                  <select value={leaveForm.leave_type} onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}>
                    <option value="Casual">Casual Leave (CL)</option>
                    <option value="Sick">Sick / Medical Leave (SL)</option>
                    <option value="Festival">Festival Leave</option>
                    <option value="Emergency">Emergency Leave</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div className="field">
                    <label>From Date</label>
                    <input type="date" value={leaveForm.from_date} onChange={(e) => setLeaveForm({ ...leaveForm, from_date: e.target.value })} required />
                  </div>
                  <div className="field">
                    <label>To Date</label>
                    <input type="date" value={leaveForm.to_date} onChange={(e) => setLeaveForm({ ...leaveForm, to_date: e.target.value })} required />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="field">
                  <label>Permission Date</label>
                  <input type="date" value={leaveForm.from_date} onChange={(e) => setLeaveForm({ ...leaveForm, from_date: e.target.value, to_date: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div className="field">
                    <label>From Time</label>
                    <input type="time" value={leaveForm.from_time} onChange={(e) => setLeaveForm({ ...leaveForm, from_time: e.target.value })} required />
                  </div>
                  <div className="field">
                    <label>To Time</label>
                    <input type="time" value={leaveForm.to_time} onChange={(e) => setLeaveForm({ ...leaveForm, to_time: e.target.value })} required />
                  </div>
                </div>
              </>
            )}

            <div className="field">
              <label>Reason / Notes</label>
              <input placeholder="Reason for leave/permission" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} required />
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>

          {/* Supervisor Approval Queue */}
          {isSupervisorOrAdmin && allStaffRequests.length > 0 && (
            <div className="panel" style={{ margin: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 10, textTransform: 'uppercase' }}>
                Staff Requests Pending Review ({allStaffRequests.filter(r => r.status === 'PENDING').length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {allStaffRequests.map((req) => (
                  <div key={req.id} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text)' }}>
                        {req.staff_name} ({req.request_type})
                      </span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: req.status === 'APPROVED' ? '#10b98122' : req.status === 'REJECTED' ? '#f43f5e22' : '#f59e0b22',
                        color: req.status === 'APPROVED' ? '#10b981' : req.status === 'REJECTED' ? '#f43f5e' : '#f59e0b',
                      }}>
                        {req.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {req.from_date} {req.from_time && `(${req.from_time} - ${req.to_time})`} · {req.reason}
                    </div>
                    {req.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        <button
                          onClick={() => handleDecideLeave(req.id, 'APPROVED')}
                          style={{ flex: 1, padding: '4px', fontSize: 11, fontWeight: 700, background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleDecideLeave(req.id, 'REJECTED')}
                          style={{ flex: 1, padding: '4px', fontSize: 11, fontWeight: 700, background: '#f43f5e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Request History */}
          <div className="panel" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 10, textTransform: 'uppercase' }}>
              My Past Requests
            </div>
            {leaveRequests.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>No requests submitted yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {leaveRequests.map((req) => (
                  <div key={req.id} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>
                        {req.request_type === 'LEAVE' ? `${req.leave_type} Leave` : 'Short Permission'} · {req.from_date}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{req.reason}</div>
                    </div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: req.status === 'APPROVED' ? '#10b98122' : req.status === 'REJECTED' ? '#f43f5e22' : '#f59e0b22',
                      color: req.status === 'APPROVED' ? '#10b981' : req.status === 'REJECTED' ? '#f43f5e' : '#f59e0b',
                    }}>
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: App Usage Statistics */}
      {activeTab === 'usage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="panel" style={{ margin: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 12, textTransform: 'uppercase' }}>
              My App Usage & Productivity
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Today Active Time</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                  {formatMinutes(profile?.today_activity?.active_minutes)}
                </div>
              </div>
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last 7 Days Time</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--amber)', marginTop: 2 }}>
                  {formatMinutes(profile?.weekly_activity?.weekly_active_minutes)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: PIN Reset */}
      {activeTab === 'pin' && (
        <form onSubmit={handleChangePin} className="panel" style={{ margin: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', marginBottom: 12, textTransform: 'uppercase' }}>
            Change Secret PIN
          </div>
          <div className="field">
            <label>Current PIN</label>
            <input type="password" inputMode="numeric" value={pinForm.current_pin} onChange={(e) => setPinForm({ ...pinForm, current_pin: e.target.value })} required />
          </div>
          <div className="field">
            <label>New PIN (4-6 digits)</label>
            <input type="password" inputMode="numeric" value={pinForm.new_pin} onChange={(e) => setPinForm({ ...pinForm, new_pin: e.target.value })} required />
          </div>
          <div className="field">
            <label>Confirm New PIN</label>
            <input type="password" inputMode="numeric" value={pinForm.confirm_pin} onChange={(e) => setPinForm({ ...pinForm, confirm_pin: e.target.value })} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Updating PIN...' : 'Update PIN'}
          </button>
        </form>
      )}
    </div>
  );
}
