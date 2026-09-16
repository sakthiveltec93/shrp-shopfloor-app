import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getToken } from '../api';
import { useAuth } from '../AuthContext';

const ACTION_TYPES = [
  { value: 'pm_service', label: '🛠️ Scheduled PM Service (Full Strip, Clean & Grease)' },
  { value: 'polishing', label: '✨ Core / Cavity Polishing & Vent Cleaning' },
  { value: 'repair', label: '⚡ Emergency Repair (Ejector Pin, Gate, Seal)' },
  { value: 'inspection', label: '🔍 Periodic Tool Audit & Parting Line Check' },
  { value: 'overhaul', label: '🏗️ Major Tool Overhaul / Refurbishment' },
];

const TOOL_TYPES = [
  'Cold Runner (Two Plate)',
  'Hot Runner (Valve Gate)',
  'Hot Runner (Thermal Gate)',
  'Three Plate Mould',
  'Insert / Overmoulding Tool',
  'Rubber Compression Mould',
  'Transfer Mould',
];

const PHOTO_SLOTS = [
  { type: 'photo_top', label: 'Top View (Clamping Top)', icon: '⬆️' },
  { type: 'photo_op_side', label: 'Operator Side (Front)', icon: '👤' },
  { type: 'photo_non_op_side', label: 'Non-Operator Side (Rear)', icon: '🔄' },
  { type: 'photo_parting_line', label: 'Parting Line / Core-Cavity Face', icon: '🔍' },
  { type: 'photo_shot', label: 'First Shot / Molded Article', icon: '📦' },
  { type: 'photo_general', label: 'Tool Nameplate / General View', icon: '🏷️' },
];

const emptyMouldForm = {
  mould_code: '',
  mould_name: '',
  tool_type: 'Cold Runner (Two Plate)',
  ownership: 'SHRP',
  customer_name: '',
  tool_maker: '',
  funded_by: 'SHRP',
  suitable_machines: 'HSIM - 01, HSIM - 02',
  total_cavities: 1,
  active_cavities: 1,
  total_rated_life_shots: 500000,
  pm_interval_shots: 20000,
  cumulative_shots: 0,
  storage_location: 'Rack A-01',
  status: 'ready',
  notes: '',
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MouldsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [moulds, setMoulds] = useState([]);
  const [partsList, setPartsList] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ok' | 'due_soon' | 'overdue'

  // PM Service Modal state
  const [pmModalMould, setPmModalMould] = useState(null);
  const [pmActionType, setPmActionType] = useState('pm_service');
  const [pmDescription, setPmDescription] = useState('');
  const [pmTechnician, setPmTechnician] = useState('');
  const [pmSubmitting, setPmSubmitting] = useState(false);

  // History & Detail Modal state
  const [detailModalMouldId, setDetailModalMouldId] = useState(null);
  const [mouldDetail, setMouldDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('overview'); // 'overview' | 'parts' | 'drawings' | 'photos' | 'maintenance'

  // Add / Edit Mould Modal state
  const [mouldModalMode, setMouldModalMode] = useState(null); // 'add' | 'edit' | null
  const [editMouldId, setEditMouldId] = useState(null);
  const [mouldFormData, setMouldFormData] = useState(emptyMouldForm);
  const [mouldFormTab, setMouldFormTab] = useState('basic'); // 'basic' | 'tech' | 'life' | 'parts' | 'files'
  const [selectedPartsForMould, setSelectedPartsForMould] = useState([]); // [{ part_id, cavities }]
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Lightbox preview for photos
  const [lightboxImg, setLightboxImg] = useState(null);

  function loadMoulds() {
    setLoading(true);
    api.moulds.list()
      .then((data) => setMoulds(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load moulds:', err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMoulds();
    api.parts().then((res) => setPartsList(Array.isArray(res) ? res : [])).catch(console.error);
  }, []);

  function openAddMouldModal() {
    setMouldModalMode('add');
    setEditMouldId(null);
    setMouldFormData(emptyMouldForm);
    setSelectedPartsForMould([]);
    setMouldFormTab('basic');
  }

  function openEditMouldModal(m) {
    setMouldModalMode('edit');
    setEditMouldId(m.id);
    setMouldFormData({
      mould_code: m.mould_code || '',
      mould_name: m.mould_name || '',
      tool_type: m.tool_type || 'Cold Runner (Two Plate)',
      ownership: m.ownership || 'SHRP',
      customer_name: m.customer_name || '',
      tool_maker: m.tool_maker || '',
      funded_by: m.funded_by || 'SHRP',
      suitable_machines: m.suitable_machines || 'HSIM - 01',
      total_cavities: m.total_cavities || 1,
      active_cavities: m.active_cavities || 1,
      total_rated_life_shots: m.total_rated_life_shots || 500000,
      pm_interval_shots: m.pm_interval_shots || 20000,
      cumulative_shots: m.cumulative_shots || 0,
      storage_location: m.storage_location || 'Rack A-01',
      status: m.status || 'ready',
      notes: m.notes || '',
    });
    setSelectedPartsForMould(
      (m.linked_parts || []).map((p) => ({ part_id: p.part_id, cavities: p.cavity_count || 1 }))
    );
    setMouldFormTab('basic');
  }

  async function handleMouldFormSubmit(e) {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      let mouldId = editMouldId;
      if (mouldModalMode === 'add') {
        const created = await api.moulds.create(mouldFormData);
        mouldId = created.id;
      } else {
        await api.moulds.update(editMouldId, mouldFormData);
      }

      // Update linked parts if any
      if (selectedPartsForMould.length > 0 && mouldId) {
        await api.moulds.updateParts(mouldId, selectedPartsForMould);
      }

      setMouldModalMode(null);
      loadMoulds();
      if (detailModalMouldId === mouldId) {
        openDetailModal({ id: mouldId });
      }
    } catch (err) {
      alert('Error saving mould: ' + (err.message || 'Server error'));
    } finally {
      setFormSubmitting(false);
    }
  }

  function openPmModal(m) {
    setPmModalMould(m);
    setPmActionType('pm_service');
    setPmDescription('Scheduled 20K Shot PM: Cavity/core ultrasonic cleaning, ejector pins check, guide pillar lubrication, parting line venting inspection.');
    setPmTechnician(user?.full_name || '');
  }

  async function submitPm(e) {
    e.preventDefault();
    if (!pmModalMould) return;
    setPmSubmitting(true);
    try {
      await api.moulds.logMaintenance(pmModalMould.id, {
        action_type: pmActionType,
        description: pmDescription,
        technician_name: pmTechnician,
        reset_pm_counter: true,
      });
      setPmModalMould(null);
      loadMoulds();
      if (detailModalMouldId === pmModalMould.id) {
        openDetailModal(pmModalMould);
      }
    } catch (err) {
      alert('Error recording PM service: ' + (err.message || 'Server error'));
    } finally {
      setPmSubmitting(false);
    }
  }

  function openDetailModal(m) {
    setDetailModalMouldId(m.id);
    setDetailLoading(true);
    setDetailTab('overview');
    api.moulds.detail(m.id)
      .then((data) => setMouldDetail(data))
      .catch((err) => alert('Failed to load mould detail: ' + err.message))
      .finally(() => setDetailLoading(false));
  }

  async function handleFileUpload(e, fileType) {
    const file = e.target.files?.[0];
    if (!file || !detailModalMouldId) return;
    setUploadingFile(true);
    try {
      const base64 = await fileToBase64(file);
      await api.moulds.uploadFile(detailModalMouldId, {
        file_type: fileType,
        filename: file.name,
        mime_type: file.type || 'application/octet-stream',
        data_base64: base64,
      });
      // Refresh detail
      const updated = await api.moulds.detail(detailModalMouldId);
      setMouldDetail(updated);
      loadMoulds();
    } catch (err) {
      alert('Upload failed: ' + (err.message || 'Server error'));
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  }

  async function handleDeleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.moulds.deleteFile(detailModalMouldId, fileId);
      const updated = await api.moulds.detail(detailModalMouldId);
      setMouldDetail(updated);
      loadMoulds();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  }

  // Filter logic
  const [sortBy, setSortBy] = useState('pm_urgency'); // 'pm_urgency' | 'code' | 'total_shots' | 'shots_since_pm'
  const [expandedMouldId, setExpandedMouldId] = useState(null);

  const filteredMoulds = moulds
    .filter((m) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        m.mould_code?.toLowerCase().includes(q) ||
        m.mould_name?.toLowerCase().includes(q) ||
        m.customer_name?.toLowerCase().includes(q) ||
        m.tool_maker?.toLowerCase().includes(q) ||
        m.storage_location?.toLowerCase().includes(q) ||
        (m.linked_parts && m.linked_parts.some((p) => p.shrp_part_code?.toLowerCase().includes(q) || p.part_name?.toLowerCase().includes(q)));

      if (!matchSearch) return false;
      if (filterStatus === 'ok') return m.pm_status === 'ok';
      if (filterStatus === 'due_soon') return m.pm_status === 'due_soon';
      if (filterStatus === 'overdue') return m.pm_status === 'overdue';
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'pm_urgency') return (b.pm_progress_pct || 0) - (a.pm_progress_pct || 0);
      if (sortBy === 'total_shots') return (b.cumulative_shots || 0) - (a.cumulative_shots || 0);
      if (sortBy === 'shots_since_pm') return (b.shots_since_pm || 0) - (a.shots_since_pm || 0);
      return (a.mould_code || '').localeCompare(b.mould_code || '');
    });

  // KPI calculations
  const totalCount = moulds.length;
  const okCount = moulds.filter((m) => m.pm_status === 'ok').length;
  const dueSoonCount = moulds.filter((m) => m.pm_status === 'due_soon').length;
  const overdueCount = moulds.filter((m) => m.pm_status === 'overdue').length;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-muted)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}
            >
              ← Home
            </button>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>
              ⚙️ Moulds
            </h1>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={openAddMouldModal}
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            ➕ Add New Mould
          </button>
        </div>
      </div>

      {/* KPI Cards — Compact 2-4 per row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 12 }}>
        <div
          onClick={() => setFilterStatus('ALL')}
          style={{ background: 'var(--surface)', border: `1px solid ${filterStatus === 'ALL' ? 'var(--amber)' : 'var(--line)'}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Bank</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>{totalCount} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>Moulds</span></div>
        </div>
        <div
          onClick={() => setFilterStatus('ok')}
          style={{ background: 'var(--surface)', border: `1.5px solid ${filterStatus === 'ok' ? '#10b981' : 'rgba(16, 185, 129, 0.3)'}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 10, color: '#34d399', textTransform: 'uppercase', fontWeight: 600 }}>🟢 Healthy</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#34d399', marginTop: 2 }}>{okCount}</div>
        </div>
        <div
          onClick={() => setFilterStatus('due_soon')}
          style={{ background: 'var(--surface)', border: `1.5px solid ${filterStatus === 'due_soon' ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)'}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 10, color: '#fbbf24', textTransform: 'uppercase', fontWeight: 600 }}>🟡 Due Soon (≥80%)</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24', marginTop: 2 }}>{dueSoonCount}</div>
        </div>
        <div
          onClick={() => setFilterStatus('overdue')}
          style={{ background: 'var(--surface)', border: `1.5px solid ${filterStatus === 'overdue' ? '#ef4444' : 'rgba(239, 68, 68, 0.3)'}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}
        >
          <div style={{ fontSize: 10, color: '#f87171', textTransform: 'uppercase', fontWeight: 600 }}>🔴 Overdue (≥100%)</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: overdueCount > 0 ? '#f87171' : 'var(--text-muted)', marginTop: 2 }}>{overdueCount}</div>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Search mould code, part name, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: '1 1 240px', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
        />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
          {['ALL', 'ok', 'due_soon', 'overdue'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '5px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: filterStatus === st ? (st === 'ok' ? '#10b981' : st === 'due_soon' ? '#f59e0b' : st === 'overdue' ? '#ef4444' : 'var(--amber)') : 'transparent',
                color: filterStatus === st ? '#fff' : 'var(--text-muted)',
                borderColor: filterStatus === st ? 'transparent' : 'var(--line)',
                borderWidth: 1,
                borderStyle: 'solid',
              }}
            >
              {st === 'ALL' ? 'All' : st === 'ok' ? '🟢 Healthy' : st === 'due_soon' ? '🟡 Due Soon' : '🔴 Overdue'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginLeft: 'auto' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '5px 10px', fontSize: 12, background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6 }}
          >
            <option value="pm_urgency">PM Urgency (% used) ↓</option>
            <option value="code">Mould Code A-Z</option>
            <option value="shots_since_pm">Shots Since PM ↓</option>
            <option value="total_shots">Total Life Shots ↓</option>
          </select>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            ({filteredMoulds.length})
          </span>
        </div>
      </div>

      {/* Moulds Grid — Compact Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading mould database...</div>
      ) : filteredMoulds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No moulds match your search/filter.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {filteredMoulds.map((m) => {
            const isOverdue = m.pm_status === 'overdue';
            const isDueSoon = m.pm_status === 'due_soon';
            const barColor = isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#10b981';
            const badgeBg = isOverdue ? 'rgba(239, 68, 68, 0.15)' : isDueSoon ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
            const badgeBorder = isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#10b981';
            const isExpanded = expandedMouldId === m.id;

            return (
              <div
                key={m.id}
                style={{
                  background: 'var(--surface)',
                  border: `1.5px solid ${isOverdue ? 'rgba(239, 68, 68, 0.5)' : isDueSoon ? 'rgba(245, 158, 11, 0.4)' : 'var(--line)'}`,
                  borderRadius: 10,
                  padding: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  boxShadow: isOverdue ? '0 0 12px rgba(239, 68, 68, 0.12)' : 'none',
                }}
              >
                {/* Header: Code + Cavities + Status + Edit */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.02em' }}>
                        {m.mould_code}
                      </span>
                      <span style={{ background: 'var(--line)', color: 'var(--text-muted)', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>
                        {m.total_cavities}C
                      </span>
                      <button
                        onClick={() => openEditMouldModal(m)}
                        title="Edit Mould Master"
                        style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 13, padding: 0 }}
                      >
                        ✏️
                      </button>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
                      {m.mould_name}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span style={{ padding: '3px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: badgeBg, color: barColor, border: `1px solid ${badgeBorder}55`, whiteSpace: 'nowrap' }}>
                    {m.pm_status_label}
                  </span>
                </div>

                {/* Tool Life Progress Gauge */}
                <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                    <span>PM Life: <strong style={{ color: 'var(--text)' }}>{(m.shots_since_pm || 0).toLocaleString()}</strong> / {(m.pm_interval_shots || 20000).toLocaleString()} shots</span>
                    <span style={{ fontWeight: 700, color: barColor }}>{m.pm_progress_pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: 7, background: 'var(--line)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, m.pm_progress_pct || 0)}%`, height: '100%', background: barColor, borderRadius: 999 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>
                    <span>Total Lifetime: <strong style={{ color: 'var(--text)' }}>{(m.cumulative_shots || 0).toLocaleString()}</strong></span>
                    <span>Rack: <strong style={{ color: '#fbbf24' }}>{m.storage_location || 'Rack A-01'}</strong></span>
                  </div>
                </div>

                {/* Expandable Details Button */}
                <button
                  onClick={() => setExpandedMouldId(isExpanded ? null : m.id)}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 11, cursor: 'pointer', textAlign: 'left', padding: 0, fontWeight: 600 }}
                >
                  {isExpanded ? '▲ Hide details' : `▼ Show details (${m.linked_parts?.length || 0} parts, maker, machine)`}
                </button>

                {isExpanded && (
                  <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 10px', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--text-muted)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px' }}>
                      <div>Type: <strong style={{ color: 'var(--text)' }}>{m.tool_type || 'Cold Runner'}</strong></div>
                      <div>Maker: <strong style={{ color: 'var(--text)' }}>{m.tool_maker || 'SHRP In-House'}</strong></div>
                      <div style={{ gridColumn: 'span 2' }}>Suitable Machines: <strong style={{ color: '#60a5fa' }}>{m.suitable_machines || 'All'}</strong></div>
                    </div>
                    {m.linked_parts && m.linked_parts.length > 0 && (
                      <div style={{ borderTop: '1px dashed var(--line)', paddingTop: 6 }}>
                        <div style={{ marginBottom: 3, fontWeight: 600 }}>Linked Parts:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {m.linked_parts.map((p) => (
                            <span key={p.part_id} style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>
                              {p.shrp_part_code || p.part_code} ({p.cavities_for_part || p.cavity_count}C)
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button
                    onClick={() => openPmModal(m)}
                    style={{
                      flex: 1,
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#34d399',
                      padding: '7px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🛠️ Record PM
                  </button>
                  <button
                    onClick={() => openDetailModal(m)}
                    style={{
                      flex: 1,
                      background: 'var(--line)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text)',
                      padding: '7px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🔍 Details &amp; CAD
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Add / Edit Mould Master */}
      {mouldModalMode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#181a1b', border: '1px solid var(--line)', borderRadius: 12, width: '100%', maxWidth: 740, padding: 24, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)' }}>
                  {mouldModalMode === 'add' ? '➕ Create New Mould Master' : `✏️ Edit Mould Master: ${mouldFormData.mould_code}`}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  IATF 16949 Tool Management Master · Tool maker, rated life, machines & storage
                </div>
              </div>
              <button onClick={() => setMouldModalMode(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              {[
                { id: 'basic', label: '1. Basic & Commercial' },
                { id: 'tech', label: '2. Technical & Machines' },
                { id: 'life', label: '3. Life & PM Limits' },
                { id: 'parts', label: `4. Linked Parts (${selectedPartsForMould.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMouldFormTab(tab.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: mouldFormTab === tab.id ? '#f59e0b' : 'var(--surface)',
                    color: mouldFormTab === tab.id ? '#000' : 'var(--text-muted)',
                    border: '1px solid var(--line)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleMouldFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
              {mouldFormTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Mould Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SH HC45"
                        disabled={mouldModalMode === 'edit'}
                        value={mouldFormData.mould_code}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, mould_code: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Mould Name / Description *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. UPPER HOUSING 2-CAV MOULD"
                        value={mouldFormData.mould_name}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, mould_name: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tool Type</label>
                      <select
                        value={mouldFormData.tool_type}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, tool_type: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      >
                        {TOOL_TYPES.map((tt) => (
                          <option key={tt} value={tt}>{tt}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tool Ownership</label>
                      <select
                        value={mouldFormData.ownership}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, ownership: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      >
                        <option value="SHRP">SHRP Owned</option>
                        <option value="Customer">Customer Owned</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Customer Name</label>
                      <input
                        type="text"
                        placeholder="e.g. HASI CHENNAI"
                        value={mouldFormData.customer_name}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, customer_name: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tool Maker</label>
                      <input
                        type="text"
                        placeholder="e.g. Classic Toolings / In-House"
                        value={mouldFormData.tool_maker}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, tool_maker: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Funded By</label>
                      <input
                        type="text"
                        placeholder="e.g. SHRP / Customer"
                        value={mouldFormData.funded_by}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, funded_by: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Notes & Tooling Remarks</label>
                    <textarea
                      rows="2"
                      placeholder="Special sliding mechanism, core pulling, hot runner controller settings..."
                      value={mouldFormData.notes}
                      onChange={(e) => setMouldFormData({ ...mouldFormData, notes: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    />
                  </div>
                </div>
              )}

              {mouldFormTab === 'tech' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Cavities *</label>
                      <input
                        type="number"
                        min="1"
                        max="128"
                        required
                        value={mouldFormData.total_cavities}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, total_cavities: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Active Working Cavities *</label>
                      <input
                        type="number"
                        min="1"
                        max="128"
                        required
                        value={mouldFormData.active_cavities}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, active_cavities: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Suitable Machines (comma separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. HSIM - 01, HSIM - 02, HSIM - 03"
                        value={mouldFormData.suitable_machines}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, suitable_machines: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Storage Rack Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Rack A-01"
                        value={mouldFormData.storage_location}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, storage_location: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current Tool Status</label>
                    <select
                      value={mouldFormData.status}
                      onChange={(e) => setMouldFormData({ ...mouldFormData, status: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    >
                      <option value="ready">🟢 Ready for Production</option>
                      <option value="running">⚡ Running on Machine</option>
                      <option value="under_maintenance">🛠️ Under Maintenance / Tool Room</option>
                      <option value="damaged">🔴 Damaged / Needs Overhaul</option>
                    </select>
                  </div>
                </div>
              )}

              {mouldFormTab === 'life' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Total Rated Life (Shots)</label>
                      <input
                        type="number"
                        step="10000"
                        value={mouldFormData.total_rated_life_shots}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, total_rated_life_shots: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>PM Service Interval (Shots)</label>
                      <input
                        type="number"
                        step="1000"
                        value={mouldFormData.pm_interval_shots}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, pm_interval_shots: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Initial Cumulative Shots</label>
                      <input
                        type="number"
                        value={mouldFormData.cumulative_shots}
                        onChange={(e) => setMouldFormData({ ...mouldFormData, cumulative_shots: Number(e.target.value) })}
                        style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      />
                    </div>
                  </div>
                  <div style={{ padding: 12, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 6, fontSize: 12, color: '#fbbf24' }}>
                    💡 <strong>Automatic TPM Tracking:</strong> The system automatically increments cumulative shots and shots-since-PM whenever operators log production entries for linked parts.
                  </div>
                </div>
              )}

              {mouldFormTab === 'parts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Link master parts produced by this mould and specify cavity allocation:
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select
                      id="part-select-add"
                      style={{ flex: 1, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                    >
                      <option value="">-- Select Master Part to Link --</option>
                      {partsList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.shrp_part_code || p.part_code} - {p.part_name} ({p.cavity_count}C)
                        </option>
                      ))}
                    </select>
                    <input
                      id="part-cav-add"
                      type="number"
                      min="1"
                      defaultValue="1"
                      style={{ width: 80, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                      placeholder="Cavities"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const sel = document.getElementById('part-select-add');
                        const cav = document.getElementById('part-cav-add');
                        const partId = Number(sel.value);
                        if (!partId) return;
                        if (selectedPartsForMould.some((x) => x.part_id === partId)) {
                          alert('Part is already linked.');
                          return;
                        }
                        setSelectedPartsForMould([...selectedPartsForMould, { part_id: partId, cavities: Number(cav.value) || 1 }]);
                        sel.value = '';
                      }}
                      style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Link
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                    {selectedPartsForMould.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-muted)', fontSize: 12 }}>
                        No parts linked yet. Select a part above.
                      </div>
                    ) : (
                      selectedPartsForMould.map((item, idx) => {
                        const p = partsList.find((x) => x.id === item.part_id);
                        return (
                          <div key={item.part_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--line)', padding: '6px 12px', borderRadius: 6 }}>
                            <div>
                              <strong style={{ color: '#fbbf24' }}>{p?.shrp_part_code || p?.part_code}</strong> - {p?.part_name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                Cavities: <strong>{item.cavities}</strong>
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelectedPartsForMould(selectedPartsForMould.filter((_, i) => i !== idx))}
                                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14 }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                <button
                  type="button"
                  onClick={() => setMouldModalMode(null)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                >
                  {formSubmitting ? 'Saving...' : '💾 Save Mould Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: PM Service Record */}
      {pmModalMould && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#181a1b', border: '1px solid var(--line)', borderRadius: 12, width: '100%', maxWidth: 540, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)' }}>🛠️ Record Tool PM / Service</h3>
                <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600, marginTop: 2 }}>
                  {pmModalMould.mould_code} - {pmModalMould.mould_name} ({pmModalMould.total_cavities} Cavities)
                </div>
              </div>
              <button onClick={() => setPmModalMould(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={submitPm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Action / Service Type</label>
                <select
                  value={pmActionType}
                  onChange={(e) => setPmActionType(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                >
                  {ACTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Current Cumulative Shots</label>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', background: 'var(--surface)', border: '1px solid var(--line)', padding: '8px 10px', borderRadius: 6 }}>
                  {pmModalMould.cumulative_shots?.toLocaleString()} shots ({pmModalMould.shots_since_pm?.toLocaleString()} since last PM)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Maintenance Details & Actions Taken</label>
                <textarea
                  rows="3"
                  required
                  value={pmDescription}
                  onChange={(e) => setPmDescription(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tool Room / Maintenance Technician Name</label>
                <input
                  type="text"
                  required
                  value={pmTechnician}
                  onChange={(e) => setPmTechnician(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setPmModalMould(null)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pmSubmitting}
                  style={{ background: '#10b981', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                >
                  {pmSubmitting ? 'Saving...' : '💾 Complete & Reset PM Counter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Mould Details, CAD Drawings, Photos & Maintenance History */}
      {detailModalMouldId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#181a1b', border: '1px solid var(--line)', borderRadius: 12, width: '100%', maxWidth: 880, padding: 24, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, color: 'var(--text)' }}>
                  ⚙️ Mould Detail & CAD Documentation: {mouldDetail?.mould_code}
                </h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {mouldDetail?.mould_name} · {mouldDetail?.total_cavities} Cavities · Rack: {mouldDetail?.storage_location}
                </div>
              </div>
              <button onClick={() => setDetailModalMouldId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              {[
                { id: 'overview', label: '📊 Tool Overview' },
                { id: 'parts', label: `🔗 Linked Parts (${mouldDetail?.linked_parts?.length || 0})` },
                { id: 'drawings', label: `📐 3D/2D CAD (${mouldDetail?.files?.filter((f) => f.file_type.startsWith('drawing')).length || 0})` },
                { id: 'photos', label: `📸 Tool Photos (${mouldDetail?.files?.filter((f) => f.file_type.startsWith('photo')).length || 0})` },
                { id: 'maintenance', label: `🛠️ PM History (${mouldDetail?.maintenance_history?.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: detailTab === tab.id ? '#3b82f6' : 'var(--surface)',
                    color: detailTab === tab.id ? '#fff' : 'var(--text-muted)',
                    border: '1px solid var(--line)',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading mould detail...</div>
              ) : detailTab === 'overview' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                    <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tool Maker</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>{mouldDetail?.tool_maker || 'SHRP In-House'}</div>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Funded By</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#34d399', marginTop: 2 }}>{mouldDetail?.funded_by || 'SHRP'}</div>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Suitable Machines</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#60a5fa', marginTop: 2 }}>{mouldDetail?.suitable_machines || 'HSIM - 01'}</div>
                    </div>
                    <div style={{ background: 'var(--surface)', padding: 12, borderRadius: 8, border: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Storage Location</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24', marginTop: 2 }}>{mouldDetail?.storage_location || 'Rack A-01'}</div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Tool Life & PM Status</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, textAlign: 'center' }}>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Cumulative Shots</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>{mouldDetail?.cumulative_shots?.toLocaleString()}</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Shots Since Last PM</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399', marginTop: 2 }}>{mouldDetail?.shots_since_pm?.toLocaleString()}</div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Rated Tool Life</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#fbbf24', marginTop: 2 }}>{mouldDetail?.total_rated_life_shots?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {mouldDetail?.notes && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tooling Remarks</div>
                      <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 4, whiteSpace: 'pre-wrap' }}>{mouldDetail.notes}</div>
                    </div>
                  )}
                </div>
              ) : detailTab === 'parts' ? (
                <div>
                  {(!mouldDetail?.linked_parts || mouldDetail.linked_parts.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No parts linked to this mould.</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: 'var(--surface)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--line)' }}>
                          <th style={{ padding: '8px 10px' }}>SHRP Part Code</th>
                          <th style={{ padding: '8px 10px' }}>Part Name</th>
                          <th style={{ padding: '8px 10px' }}>Customer Part No</th>
                          <th style={{ padding: '8px 10px' }}>Cavities Allocated</th>
                          <th style={{ padding: '8px 10px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mouldDetail.linked_parts.map((p) => (
                          <tr key={p.part_id} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#fbbf24' }}>{p.shrp_part_code || p.part_code}</td>
                            <td style={{ padding: '8px 10px', color: 'var(--text)' }}>{p.part_name}</td>
                            <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{p.customer_part_no || '-'}</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>{p.cavity_count} Cavities</td>
                            <td style={{ padding: '8px 10px' }}>
                              <button
                                onClick={() => navigate(`/parts/${p.part_id}/edit`)}
                                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}
                              >
                                View Part Form →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : detailTab === 'drawings' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: 12, borderRadius: 8, border: '1px solid var(--line)' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Upload 3D CAD or 2D Drawing</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Supported: .STEP, .STP, .IGES, .PDF, .DWG, .DXF</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <label style={{ background: '#3b82f6', color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        {uploadingFile ? 'Uploading...' : '📁 Upload 3D STEP/CAD'}
                        <input type="file" accept=".step,.stp,.iges,.igs,.x_t,.sldprt,.zip,.pdf" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'drawing_3d')} />
                      </label>
                      <label style={{ background: 'var(--line)', color: 'var(--text)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        📄 Upload 2D PDF
                        <input type="file" accept=".pdf,.dwg,.dxf,.png,.jpg" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'drawing_2d')} />
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {mouldDetail?.files?.filter((f) => f.file_type.startsWith('drawing')).map((f) => (
                      <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--line)', padding: '10px 14px', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 20 }}>{f.file_type === 'drawing_3d' ? '📐' : '📄'}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{f.filename}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              Type: <strong>{f.file_type === 'drawing_3d' ? '3D CAD Model' : '2D Tool Drawing'}</strong> · Uploaded: {new Date(f.uploaded_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <a
                            href={`/api/moulds/${mouldDetail.id}/files/${f.id}`}
                            download={f.filename}
                            style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '6px 12px', borderRadius: 6, fontSize: 12, textDecoration: 'none', fontWeight: 600 }}
                          >
                            ⬇️ Download
                          </a>
                          <button
                            onClick={() => handleDeleteFile(f.id)}
                            style={{ background: 'none', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : detailTab === 'photos' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    IATF Tool Inspection Photos: Capture all sides of the mould, parting line, and sample molded article.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                    {PHOTO_SLOTS.map((slot) => {
                      const existing = mouldDetail?.files?.find((f) => f.file_type === slot.type);
                      return (
                        <div key={slot.type} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{slot.icon}</span> {slot.label}
                          </div>

                          {existing ? (
                            <div style={{ position: 'relative' }}>
                              <img
                                src={`/api/moulds/${mouldDetail.id}/files/${existing.id}`}
                                alt={slot.label}
                                onClick={() => setLightboxImg(`/api/moulds/${mouldDetail.id}/files/${existing.id}`)}
                                style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)', cursor: 'pointer' }}
                              />
                              <button
                                onClick={() => handleDeleteFile(existing.id)}
                                style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#f87171', borderRadius: 4, padding: '2px 6px', fontSize: 11, cursor: 'pointer' }}
                              >
                                ✕ Delete
                              </button>
                            </div>
                          ) : (
                            <div style={{ height: 120, border: '1.5px dashed var(--line)', borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                              <span style={{ fontSize: 24, opacity: 0.4 }}>📷</span>
                              <label style={{ background: 'var(--line)', color: 'var(--text)', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                                Upload Photo
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, slot.type)} />
                              </label>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div>
                  {(!mouldDetail?.maintenance_history || mouldDetail.maintenance_history.length === 0) ? (
                    <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No maintenance logs recorded yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {mouldDetail.maintenance_history.map((log) => (
                        <div key={log.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                                {log.action_type}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                                {new Date(log.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              At shot: <strong style={{ color: 'var(--text)' }}>{log.shots_at_service?.toLocaleString()}</strong>
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 8 }}>{log.description}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                            Technician: <strong>{log.technician_name}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: 20, cursor: 'zoom-out' }}
        >
          <img src={lightboxImg} alt="Mould Photo Full View" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}
