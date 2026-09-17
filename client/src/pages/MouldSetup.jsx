import SearchableSelect from '../components/SearchableSelect';
import FpaModal from '../components/FpaModal';
import { useEffect, useState } from 'react';
import { api, getToken } from '../api';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

// Local "now" formatted for a datetime-local input's default value
function nowForInput() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MouldSetup() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const canCorrect = user.role === 'supervisor' || user.role === 'admin';
  const [machines, setMachines] = useState([]);
  const [parts, setParts] = useState([]);
  const [current, setCurrent] = useState([]);
  const [machineId, setMachineId] = useState('');
  const [partId, setPartId] = useState('');
  const [notes, setNotes] = useState('');
  const [loadStarted, setLoadStarted] = useState(nowForInput());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [okTimes, setOkTimes] = useState({}); // { [assignment_id]: 'YYYY-MM-DDTHH:mm' }
  const [editingId, setEditingId] = useState(null);
  const [selectedFpaAssignment, setSelectedFpaAssignment] = useState(null);

  async function loadData() {
    const [m, p, c] = await Promise.all([api.machines(), api.parts(), api.currentAssignments()]);
    setMachines(m);
    setParts(p);
    setCurrent(c);
  }

  useEffect(() => { loadData(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.createAssignment({
        machine_id: Number(machineId),
        part_id: Number(partId),
        notes,
        mould_load_started_at: loadStarted ? new Date(loadStarted).toISOString() : undefined,
      });
      setSuccess(t('mouldSetup.submittedSuccess'));
      setPartId('');
      setNotes('');
      setLoadStarted(nowForInput());
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function timeFor(assignmentId) {
    return okTimes[assignmentId] ?? nowForInput();
  }

  async function markFirstOk(assignmentId) {
    setError('');
    setMarkingId(assignmentId);
    try {
      const takenAt = okTimes[assignmentId];
      await api.markFirstOkPart(assignmentId, takenAt ? new Date(takenAt).toISOString() : undefined);
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setMarkingId(null);
    }
  }

  function currentFor(mid) {
    return current.find((c) => String(c.machine_id) === String(mid));
  }

  return (
    <div className="screen">
      <h1 className="screen-title">{t('mouldSetup.title')}</h1>
      <p className="screen-sub">{t('mouldSetup.subtitle')}</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <form onSubmit={handleSubmit} className="panel">
        <div className="field">
          <label htmlFor="machine">{t('common.machine')}</label>
          <SearchableSelect
            id="machine"
            value={machineId}
            onChange={(e) => setMachineId(e.target.value)}
            options={machines}
            placeholder={t('common.selectMachine')}
            searchPlaceholder="🔍 Type machine code..."
            getOptionValue={(m) => m.id}
            getOptionLabel={(m) => m.machine_code}
            required
          />
        </div>

        {machineId && (
          <div className="readout" style={{ marginBottom: 14 }}>
            <div className="readout-label">{t('mouldSetup.currentlyRunning')}</div>
            {currentFor(machineId) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span className="shrp-code-pill">{currentFor(machineId).shrp_part_code || currentFor(machineId).part_code}</span>
                <span style={{ fontWeight: 600 }}>{currentFor(machineId).part_name}</span>
                <span className="muted" style={{ fontSize: 11 }}>({currentFor(machineId).customer_part_no || currentFor(machineId).part_code})</span>
              </div>
            ) : t('mouldSetup.noApprovedPart')}
          </div>
        )}

        <div className="field">
          <label htmlFor="part">{t('mouldSetup.newPart')}</label>
          <SearchableSelect
            id="part"
            value={partId}
            onChange={(e) => setPartId(e.target.value)}
            options={parts}
            placeholder={t('common.selectPart')}
            searchPlaceholder="🔍 Type part code, name, customer no..."
            getOptionValue={(p) => p.id}
            getOptionLabel={(p) => p.part_name}
            getOptionBadge={(p) => p.shrp_part_code || p.part_code}
            getOptionSublabel={(p) => p.customer_part_no ? ('Cust: ' + p.customer_part_no) : p.part_code}
            required
          />
        </div>

        {partId && (() => {
          const sel = parts.find((p) => String(p.id) === String(partId));
          if (!sel) return null;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
              {sel.photo_file_id ? (
                <img
                  src={`/api/masters/parts/${sel.id}/files/${sel.photo_file_id}?token=${getToken()}`}
                  alt={sel.part_name}
                  style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}
                />
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: 8, border: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  📷
                </div>
              )}
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: '#fbbf24' }}>[{sel.shrp_part_code || sel.part_code}] {sel.part_name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Customer No: {sel.customer_part_no || sel.part_code}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>Cavities: {sel.cavity_count} · Shot Wt: {sel.unit_weight_g || '-'}g</div>
              </div>
            </div>
          );
        })()}

        <div className="field">
          <label htmlFor="load_started">{t('mouldSetup.loadStarted')}</label>
          <input id="load_started" type="datetime-local"
            value={loadStarted} onChange={(e) => setLoadStarted(e.target.value)} required />
        </div>

        <div className="field">
          <label htmlFor="notes">{t('mouldSetup.notes')}</label>
          <textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? t('mouldSetup.submitting') : t('mouldSetup.submitForApproval')}
        </button>
      </form>

      <h2 style={{ fontSize: 14, color: 'var(--text-muted)', margin: '20px 0 10px' }}>{t('mouldSetup.runningNow')}</h2>
      {current.map((c) => {
        const isFpaApproved = c.fpa_approval_status === 'APPROVED' || c.fpa_approval_status === 'CONDITIONAL';

        return (
          <div key={c.machine_id} className="panel" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{c.machine_code}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <span className="shrp-code-pill" style={{ fontSize: 12, padding: '2px 8px' }}>{c.shrp_part_code || c.part_code}</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.part_name}</span>
                  <span className="muted" style={{ fontSize: 11 }}>({c.customer_part_no || c.part_code})</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span className="status-pill status-approved">{t('mouldSetup.approved')}</span>
                <span
                  className="status-pill"
                  style={
                    isFpaApproved
                      ? { background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }
                      : { background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }
                  }
                >
                  {isFpaApproved ? '🛡️ FPA Approved' : '🛡️ FPA Pending'}
                </span>
              </div>
            </div>

            {c.mould_load_started_at && (
              <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                {t('mouldSetup.loadingStartedLabel', { time: new Date(c.mould_load_started_at).toLocaleString() })}
              </div>
            )}

            {!isFpaApproved ? (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: 12, marginTop: 10 }}>
                <div style={{ color: '#f87171', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🛡️ IATF 16949 Clause 8.5.1.1 First-Piece Approval Required
                </div>
                <div style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>
                  Mould setup is approved. Before regular production begins, enter machine parameters, visual check, and cavity dimensional readings on the FPA sheet.
                </div>
                <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedFpaAssignment(c)}
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '8px 16px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>📝</span>
                    <span>Open Digital FPA Sheet & First Part Approval</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 8, padding: 12, marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ color: '#34d399', fontSize: 12, fontWeight: 600 }}>
                    ✅ 1st OK Part Approved: {c.first_ok_part_at ? new Date(c.first_ok_part_at).toLocaleString() : new Date(c.approved_at).toLocaleString()}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {c.fpa_submission_id && (
                      <a
                        href={api.fpa.downloadPdfUrl(c.fpa_submission_id)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ width: 'auto', padding: '4px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                      >
                        <span>📄</span>
                        <span>View FPA PDF</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedFpaAssignment(c)}
                      className="btn btn-secondary"
                      style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                    >
                      <span>📝</span>
                      <span>Edit FPA Sheet</span>
                    </button>
                    {canCorrect && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ width: 'auto', padding: '4px 10px', fontSize: 11 }}
                        onClick={() => {
                          setOkTimes((ot) => ({ ...ot, [c.assignment_id]: nowForInput() }));
                          setEditingId(c.assignment_id);
                        }}
                      >
                        {t('mouldSetup.correctTime')}
                      </button>
                    )}
                  </div>
                </div>

                {editingId === c.assignment_id && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div className="field" style={{ marginBottom: 8 }}>
                      <label style={{ fontSize: 12 }} htmlFor={`ok_time_${c.assignment_id}`}>
                        {t('mouldSetup.correctedLabel')}
                      </label>
                      <input
                        id={`ok_time_${c.assignment_id}`}
                        type="datetime-local"
                        value={timeFor(c.assignment_id)}
                        onChange={(e) => setOkTimes((ot) => ({ ...ot, [c.assignment_id]: e.target.value }))}
                      />
                    </div>
                    <div className="btn-row">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={markingId === c.assignment_id}
                        onClick={() => markFirstOk(c.assignment_id)}
                      >
                        {markingId === c.assignment_id ? t('mouldSetup.saving') : t('mouldSetup.saveCorrectedTime')}
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)}>
                        {t('mouldSetup.cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {selectedFpaAssignment && (
        <FpaModal
          assignment={selectedFpaAssignment}
          machine={{ id: selectedFpaAssignment.machine_id, machine_code: selectedFpaAssignment.machine_code }}
          part={{
            id: selectedFpaAssignment.part_id,
            part_code: selectedFpaAssignment.part_code,
            shrp_part_code: selectedFpaAssignment.shrp_part_code,
            part_name: selectedFpaAssignment.part_name,
            cavity_count: selectedFpaAssignment.cavity_count,
          }}
          mould={selectedFpaAssignment.mould_id ? { id: selectedFpaAssignment.mould_id, mould_code: selectedFpaAssignment.mould_code } : null}
          onClose={() => setSelectedFpaAssignment(null)}
          onSuccess={() => {
            setSelectedFpaAssignment(null);
            setSuccess('✅ IATF First-Piece Approval saved & verified successfully!');
            loadData();
          }}
        />
      )}
    </div>
  );
}
