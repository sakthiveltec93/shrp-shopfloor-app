import SearchableSelect from '../components/SearchableSelect';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../api';
import { useAuth } from '../AuthContext';
import DeletionModal from '../components/DeletionModal';

const emptyBasic = {
  part_code: '', shrp_part_code: '', customer_part_no: '', part_name: '', cavity_count: '1', standard_cycle_time_sec: '',
  unit_weight_g: '', part_weight_g: '', batch_part_code: '', standard_pack_qty: '', customer_id: '', notes: '',
  tolerance_pct: '2', mould_id: '',
  trim_required: false, inspection_required: false, packing_required: true, dispatch_required: true,
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function PartForm() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [basic, setBasic] = useState(emptyBasic);
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState('');
  const [machines, setMachines] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [files, setFiles] = useState([]);
  const [allMoulds, setAllMoulds] = useState([]);
  const [linkedMoulds, setLinkedMoulds] = useState([]);
  const [selectedMouldToLink, setSelectedMouldToLink] = useState('');
  const [linkCavities, setLinkCavities] = useState(1);
  const [showQuickMouldModal, setShowQuickMouldModal] = useState(false);
  const [quickMouldData, setQuickMouldData] = useState({
    mould_code: '',
    mould_name: '',
    tool_type: 'Cold Runner (Two Plate)',
    total_cavities: 1,
    tool_maker: 'SHRP In-House',
    storage_location: 'Rack A-01',
    suitable_machines: 'HSIM - 01',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    api.customers().then(setCustomers);
    api.machines().then(setMachines);
    api.moulds.list().then((data) => setAllMoulds(Array.isArray(data) ? data : [])).catch(console.error);

    if (!isNew) {
      api.partDetail(id).then((d) => {
        setBasic({
          part_code: d.part_code, shrp_part_code: d.shrp_part_code || '', customer_part_no: d.customer_part_no || '',
          part_name: d.part_name, cavity_count: String(d.cavity_count),
          standard_cycle_time_sec: String(d.standard_cycle_time_sec), unit_weight_g: d.unit_weight_g ? String(d.unit_weight_g) : '',
          part_weight_g: d.part_weight_g ? String(d.part_weight_g) : '', batch_part_code: d.batch_part_code || '',
          standard_pack_qty: d.standard_pack_qty ? String(d.standard_pack_qty) : '', customer_id: d.customer_id || '',
          notes: d.notes || '', tolerance_pct: d.tolerance_pct != null ? String(d.tolerance_pct) : '2',
          trim_required: d.trim_required, inspection_required: d.inspection_required,
          packing_required: d.packing_required, dispatch_required: d.dispatch_required,
          mould_id: '',
        });
        setSelectedMachines(d.suitable_machine_ids || []);
        setParameters((d.process_parameters || []).map((p) => ({ parameter_name: p.parameter_name, value: p.value, unit: p.unit || '' })));
        setDimensions((d.critical_dimensions || []).map((dd) => ({
          dimension_name: dd.dimension_name, nominal_value: dd.nominal_value ?? '', tol_plus: dd.tol_plus ?? '',
          tol_minus: dd.tol_minus ?? '', unit: dd.unit || '',
        })));
        setFiles(d.files || []);
        setLinkedMoulds(d.linked_moulds || []);
      }).catch((err) => setError(err.message));
    }
  }, [id, isNew]);

  function updateBasic(field, value) {
    setBasic((b) => ({ ...b, [field]: value }));
  }

  async function addCustomer() {
    if (!newCustomer.trim()) return;
    const c = await api.createCustomer(newCustomer.trim());
    setCustomers((cs) => [...cs, c].sort((a, b) => a.name.localeCompare(b.name)));
    setBasic((b) => ({ ...b, customer_id: c.id }));
    setNewCustomer('');
  }

  async function handleSaveBasic(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        ...basic,
        cavity_count: Number(basic.cavity_count),
        standard_cycle_time_sec: Number(basic.standard_cycle_time_sec),
        unit_weight_g: basic.unit_weight_g ? Number(basic.unit_weight_g) : null,
        part_weight_g: basic.part_weight_g ? Number(basic.part_weight_g) : null,
        standard_pack_qty: basic.standard_pack_qty ? Number(basic.standard_pack_qty) : null,
        tolerance_pct: basic.tolerance_pct ? Number(basic.tolerance_pct) : 2,
        customer_id: basic.customer_id || null,
        mould_id: basic.mould_id || null,
      };
      if (isNew) {
        const created = await api.createPart(payload);
        navigate(`/parts/${created.id}/edit`, { replace: true });
      } else {
        await api.updatePart(id, payload);
        setSuccess('Saved.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLinkMould() {
    if (!selectedMouldToLink) return;
    try {
      await api.linkPartMould(id, selectedMouldToLink, Number(linkCavities) || 1);
      // Reload part details
      const d = await api.partDetail(id);
      setLinkedMoulds(d.linked_moulds || []);
      setSelectedMouldToLink('');
      setSuccess('Mould linked successfully.');
    } catch (err) {
      setError('Failed to link mould: ' + err.message);
    }
  }

  async function handleUnlinkMould() {
    if (!confirm('Are you sure you want to unlink this mould from the part?')) return;
    try {
      await api.linkPartMould(id, null, 1);
      const d = await api.partDetail(id);
      setLinkedMoulds(d.linked_moulds || []);
      setSuccess('Mould unlinked.');
    } catch (err) {
      setError('Failed to unlink mould: ' + err.message);
    }
  }

  async function handleQuickCreateMould(e) {
    e.preventDefault();
    try {
      const created = await api.moulds.create({
        ...quickMouldData,
        total_cavities: Number(quickMouldData.total_cavities) || 1,
        active_cavities: Number(quickMouldData.total_cavities) || 1,
      });
      // Link to this part
      await api.linkPartMould(id, created.id, Number(quickMouldData.total_cavities) || 1);
      // Reload moulds list and part detail
      const [mList, d] = await Promise.all([api.moulds.list(), api.partDetail(id)]);
      setAllMoulds(mList);
      setLinkedMoulds(d.linked_moulds || []);
      setShowQuickMouldModal(false);
      setSuccess(`Mould ${created.mould_code} created and linked!`);
    } catch (err) {
      alert('Failed to create mould: ' + err.message);
    }
  }

  function addParamRow() {
    setParameters((p) => [...p, { parameter_name: '', value: '', unit: '' }]);
  }
  function updateParam(i, field, value) {
    setParameters((p) => p.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  function removeParam(i) {
    setParameters((p) => p.filter((_, idx) => idx !== i));
  }
  async function saveParameters() {
    setError('');
    try {
      const saved = await api.setPartParameters(id, parameters.filter((p) => p.parameter_name));
      setParameters(saved.map((p) => ({ parameter_name: p.parameter_name, value: p.value, unit: p.unit || '' })));
      setSuccess('Process parameters saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  function addDimRow() {
    setDimensions((d) => [...d, { dimension_name: '', nominal_value: '', tol_plus: '', tol_minus: '', unit: '' }]);
  }
  function updateDim(i, field, value) {
    setDimensions((d) => d.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }
  function removeDim(i) {
    setDimensions((d) => d.filter((_, idx) => idx !== i));
  }
  async function saveDimensions() {
    setError('');
    try {
      const payload = dimensions.filter((d) => d.dimension_name).map((d) => ({
        dimension_name: d.dimension_name,
        nominal_value: d.nominal_value === '' ? null : Number(d.nominal_value),
        tol_plus: d.tol_plus === '' ? null : Number(d.tol_plus),
        tol_minus: d.tol_minus === '' ? null : Number(d.tol_minus),
        unit: d.unit || null,
      }));
      const saved = await api.setPartDimensions(id, payload);
      setDimensions(saved.map((dd) => ({
        dimension_name: dd.dimension_name,
        nominal_value: dd.nominal_value ?? '',
        tol_plus: dd.tol_plus ?? '',
        tol_minus: dd.tol_minus ?? '',
        unit: dd.unit || '',
      })));
      setSuccess('Critical dimensions saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleMachine(mid) {
    setSelectedMachines((mids) => (mids.includes(mid) ? mids.filter((x) => x !== mid) : [...mids, mid]));
  }
  async function saveMachines() {
    setError('');
    try {
      await api.setPartMachines(id, selectedMachines);
      setSuccess('Machines saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleFileUpload(fileType, fileList) {
    const file = fileList?.[0];
    if (!file) return;
    setError('');
    try {
      const data_base64 = await fileToBase64(file);
      const meta = await api.uploadPartFile(id, {
        file_type: fileType,
        filename: file.name,
        mime_type: file.type || 'application/octet-stream',
        data_base64,
      });
      setFiles((fs) => [meta, ...fs]);
      setSuccess('File uploaded.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeFile(fileId) {
    setError('');
    try {
      await api.deletePartFile(id, fileId);
      setFiles((fs) => fs.filter((f) => f.id !== fileId));
      setSuccess('File removed.');
    } catch (err) {
      setError(err.message);
    }
  }

  const photo = files.find((f) => f.file_type === 'photo');
  const sops = files.filter((f) => f.file_type === 'sop');
  const ppaps = files.filter((f) => f.file_type === 'ppap');

  function fileUrl(fileId) {
    const token = getToken();
    return `/api/masters/parts/${id}/files/${fileId}?token=${encodeURIComponent(token || '')}`;
  }

  return (
    <div className="flow-card" style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '4px 10px', fontSize: 12, marginBottom: 6 }}
            onClick={() => navigate('/parts')}
          >
            ← Back to parts list
          </button>
          <h1 className="flow-title" style={{ margin: 0 }}>
            {isNew ? 'New Part Master' : `Edit Part: ${basic.shrp_part_code || basic.part_code}`}
          </h1>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div style={{ color: 'var(--green)', marginBottom: 12 }}>{success}</div>}

      <form onSubmit={handleSaveBasic} className="panel">
        <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0 }}>Basic info</h2>

        <div className="grid-2">
          <div className="field">
            <label>SHRP Part Code (e.g. SH01)</label>
            <input
              value={basic.shrp_part_code}
              onChange={(e) => updateBasic('shrp_part_code', e.target.value)}
              placeholder="e.g. SH01"
              style={{ fontWeight: 600, color: 'var(--amber)' }}
            />
          </div>
          <div className="field">
            <label>Internal Part Code *</label>
            <input
              required
              value={basic.part_code}
              onChange={(e) => updateBasic('part_code', e.target.value)}
              placeholder="e.g. CEEAA-ORANGE"
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Customer Part Number</label>
            <input
              value={basic.customer_part_no}
              onChange={(e) => updateBasic('customer_part_no', e.target.value)}
              placeholder="e.g. CEEAA / 7183-0000"
            />
          </div>
          <div className="field">
            <label>Part Name *</label>
            <input required value={basic.part_name} onChange={(e) => updateBasic('part_name', e.target.value)} />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Customer</label>
            <div className="btn-row">
              <SearchableSelect
                value={basic.customer_id}
                onChange={(e) => updateBasic('customer_id', e.target.value)}
                options={customers}
                placeholder="-- Select Customer --"
                searchPlaceholder="🔍 Type customer name..."
                getOptionValue={(c) => c.id}
                getOptionLabel={(c) => c.name}
                allowClear
              />
            </div>
            <div className="btn-row" style={{ marginTop: 6 }}>
              <input
                placeholder="Or add new customer"
                value={newCustomer}
                onChange={(e) => setNewCustomer(e.target.value)}
              />
              <button type="button" className="btn btn-secondary" style={{ width: 80 }} onClick={addCustomer}>Add</button>
            </div>
          </div>
          <div className="field">
            <label>Batch Part Code</label>
            <input
              value={basic.batch_part_code}
              onChange={(e) => updateBasic('batch_part_code', e.target.value)}
              placeholder="e.g. CEEAA"
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Cavity Count *</label>
            <input
              type="number"
              min="1"
              required
              value={basic.cavity_count}
              onChange={(e) => updateBasic('cavity_count', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Standard Cycle Time (seconds) *</label>
            <input
              type="number"
              step="0.1"
              required
              value={basic.standard_cycle_time_sec}
              onChange={(e) => updateBasic('standard_cycle_time_sec', e.target.value)}
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Shot Weight (grams)</label>
            <input
              type="number"
              step="0.01"
              value={basic.unit_weight_g}
              onChange={(e) => updateBasic('unit_weight_g', e.target.value)}
              placeholder="Total shot weight"
            />
          </div>
          <div className="field">
            <label>Individual Part Weight (grams)</label>
            <input
              type="number"
              step="0.01"
              value={basic.part_weight_g}
              onChange={(e) => updateBasic('part_weight_g', e.target.value)}
              placeholder="Single piece net weight"
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Standard Pack Quantity</label>
            <input
              type="number"
              min="1"
              value={basic.standard_pack_qty}
              onChange={(e) => updateBasic('standard_pack_qty', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Weight Tolerance (±%)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="20"
              value={basic.tolerance_pct}
              onChange={(e) => updateBasic('tolerance_pct', e.target.value)}
              placeholder="Default 2.0%"
            />
          </div>
        </div>

        {/* In New Part mode, allow selecting an existing Mould */}
        {isNew && (
          <div className="field" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: 12, borderRadius: 8, marginTop: 10 }}>
            <label style={{ color: '#fbbf24', fontWeight: 700 }}>⚙️ Primary Mould / Tool (Optional)</label>
            <SearchableSelect
              value={basic.mould_id}
              onChange={(e) => updateBasic('mould_id', e.target.value)}
              options={allMoulds}
              placeholder="-- No Mould Linked Yet (Can link later) --"
              searchPlaceholder="🔍 Type mould code / name..."
              getOptionValue={(m) => m.id}
              getOptionLabel={(m) => m.mould_name ? (m.mould_name + ' (' + m.total_cavities + 'C - ' + (m.storage_location || '') + ')') : m.mould_code}
              getOptionBadge={(m) => m.mould_code}
              allowClear
            />
          </div>
        )}

        <div className="field">
          <label>Routing</label>
          <div className="btn-row">
            {[
              ['trim_required', 'Trim'], ['inspection_required', 'Inspection'],
              ['packing_required', 'Packing'], ['dispatch_required', 'Dispatch'],
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <input type="checkbox" checked={basic[key]} onChange={(e) => updateBasic(key, e.target.checked)} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Notes</label>
          <textarea rows={2} value={basic.notes} onChange={(e) => updateBasic('notes', e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
            {saving ? 'Saving…' : isNew ? 'Create part' : 'Save basic info'}
          </button>
          {!isNew && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{
                width: 'auto',
                padding: '0 16px',
                color: 'var(--red)',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.08)',
              }}
              onClick={() => setShowDeleteModal(true)}
              title={user?.role === 'admin' ? 'Delete Part' : 'Request Deletion Approval'}
            >
              🗑️ Delete Part
            </button>
          )}
        </div>
      </form>

      {!isNew && (
        <>
          {/* TOOLING & MOULD MASTER SECTION */}
          <div className="panel" style={{ border: '1.5px solid rgba(245, 158, 11, 0.35)', background: 'rgba(245, 158, 11, 0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fbbf24', margin: 0 }}>
                  ⚙️ Tooling & Mould Master Linkage
                </h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  IATF 16949 Clause 8.5.1.5 Tool Tracking & Automatic Shot Count Accumulation
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setQuickMouldData({
                    mould_code: `SH HC${String(allMoulds.length + 1).padStart(2, '0')}`,
                    mould_name: `${basic.part_name || 'PART'} MOULD`,
                    tool_type: 'Cold Runner (Two Plate)',
                    total_cavities: Number(basic.cavity_count) || 1,
                    tool_maker: 'SHRP In-House',
                    storage_location: 'Rack A-01',
                    suitable_machines: 'HSIM - 01',
                  });
                  setShowQuickMouldModal(true);
                }}
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                ➕ Quick Create New Mould
              </button>
            </div>

            {linkedMoulds && linkedMoulds.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {linkedMoulds.map((m) => (
                  <div
                    key={m.mould_id}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      borderRadius: 8,
                      padding: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24' }}>{m.mould_code}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{m.mould_name}</span>
                        <span style={{ background: 'var(--line)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                          {m.cavities_for_part || m.total_cavities} Cavities
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)', marginTop: 6, flexWrap: 'wrap' }}>
                        <span>Type: <strong style={{ color: 'var(--text)' }}>{m.tool_type || 'Cold Runner'}</strong></span>
                        <span>Maker: <strong style={{ color: 'var(--text)' }}>{m.tool_maker || 'SHRP'}</strong></span>
                        <span>Rack: <strong style={{ color: '#fbbf24' }}>{m.storage_location || 'Rack A-01'}</strong></span>
                        <span>Machines: <strong style={{ color: '#60a5fa' }}>{m.suitable_machines || 'All'}</strong></span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => navigate('/moulds')}
                        style={{ background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', color: '#60a5fa', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        🔍 Mould Dashboard →
                      </button>
                      <button
                        type="button"
                        onClick={handleUnlinkMould}
                        style={{ background: 'none', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
                      >
                        Unlink
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 13, marginBottom: 8 }}>No mould currently linked to this part.</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', maxWidth: 480, margin: '0 auto' }}>
                  <SearchableSelect
                    value={selectedMouldToLink}
                    onChange={(e) => setSelectedMouldToLink(e.target.value)}
                    options={allMoulds}
                    placeholder="-- Select Existing Mould from Master --"
                    searchPlaceholder="🔍 Type mould code / name..."
                    getOptionValue={(m) => m.id}
                    getOptionLabel={(m) => m.mould_name ? (m.mould_name + ' (' + m.total_cavities + 'C)') : m.mould_code}
                    getOptionBadge={(m) => m.mould_code}
                    allowClear
                  />
                  <input
                    type="number"
                    min="1"
                    value={linkCavities}
                    onChange={(e) => setLinkCavities(e.target.value)}
                    placeholder="Cav"
                    style={{ width: 65, padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                  />
                  <button
                    type="button"
                    onClick={handleLinkMould}
                    disabled={!selectedMouldToLink}
                    style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                  >
                    Link
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="panel">
            <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0 }}>Process parameters</h2>
            {parameters.map((p, i) => (
              <div key={i} className="btn-row" style={{ marginBottom: 8 }}>
                <input placeholder="Name" value={p.parameter_name} onChange={(e) => updateParam(i, 'parameter_name', e.target.value)} />
                <input placeholder="Value" value={p.value} onChange={(e) => updateParam(i, 'value', e.target.value)} />
                <input placeholder="Unit" style={{ maxWidth: 70 }} value={p.unit} onChange={(e) => updateParam(i, 'unit', e.target.value)} />
                <button type="button" className="btn btn-secondary" style={{ width: 40 }} onClick={() => removeParam(i)}>✕</button>
              </div>
            ))}
            <div className="btn-row">
              <button type="button" className="btn btn-secondary" onClick={addParamRow}>+ Add row</button>
              <button type="button" className="btn btn-primary" onClick={saveParameters}>Save parameters</button>
            </div>
          </div>

          <div className="panel">
            <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0 }}>Critical dimensions</h2>
            {dimensions.map((d, i) => (
              <div key={i} className="btn-row" style={{ marginBottom: 8, flexWrap: 'wrap' }}>
                <input placeholder="Name" value={d.dimension_name} onChange={(e) => updateDim(i, 'dimension_name', e.target.value)} />
                <input placeholder="Nominal" type="number" style={{ maxWidth: 90 }} value={d.nominal_value} onChange={(e) => updateDim(i, 'nominal_value', e.target.value)} />
                <input placeholder="+Tol" type="number" style={{ maxWidth: 70 }} value={d.tol_plus} onChange={(e) => updateDim(i, 'tol_plus', e.target.value)} />
                <input placeholder="-Tol" type="number" style={{ maxWidth: 70 }} value={d.tol_minus} onChange={(e) => updateDim(i, 'tol_minus', e.target.value)} />
                <input placeholder="Unit" style={{ maxWidth: 60 }} value={d.unit} onChange={(e) => updateDim(i, 'unit', e.target.value)} />
                <button type="button" className="btn btn-secondary" style={{ width: 40 }} onClick={() => removeDim(i)}>✕</button>
              </div>
            ))}
            <div className="btn-row">
              <button type="button" className="btn btn-secondary" onClick={addDimRow}>+ Add row</button>
              <button type="button" className="btn btn-primary" onClick={saveDimensions}>Save dimensions</button>
            </div>
          </div>

          <div className="panel">
            <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0 }}>Suitable machines</h2>
            <div className="btn-row" style={{ flexWrap: 'wrap' }}>
              {machines.map((m) => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, width: '45%' }}>
                  <input type="checkbox" checked={selectedMachines.includes(m.id)} onChange={() => toggleMachine(m.id)} />
                  {m.machine_code}
                </label>
              ))}
            </div>
            <button type="button" className="btn btn-primary" style={{ marginTop: 10 }} onClick={saveMachines}>Save machines</button>
          </div>

          <div className="panel">
            <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0 }}>Photo</h2>
            {photo && <img src={fileUrl(photo.id)} alt={photo.filename} style={{ maxWidth: '100%', marginBottom: 10, border: '1px solid var(--line)' }} />}
            <input type="file" accept="image/*" onChange={(e) => handleFileUpload('photo', e.target.files)} />
            {photo && <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => removeFile(photo.id)}>Remove photo</button>}
          </div>

          <div className="panel">
            <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0 }}>SOP</h2>
            {sops.map((f) => (
              <div key={f.id} className="btn-row" style={{ marginBottom: 6 }}>
                <a href={fileUrl(f.id)} target="_blank" rel="noreferrer" style={{ color: 'var(--amber)' }}>{f.filename}</a>
                <button type="button" className="btn btn-secondary" style={{ width: 90 }} onClick={() => removeFile(f.id)}>Remove</button>
              </div>
            ))}
            <input type="file" onChange={(e) => handleFileUpload('sop', e.target.files)} />
          </div>

          <div className="panel">
            <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0 }}>PPAP</h2>
            {ppaps.map((f) => (
              <div key={f.id} className="btn-row" style={{ marginBottom: 6 }}>
                <a href={fileUrl(f.id)} target="_blank" rel="noreferrer" style={{ color: 'var(--amber)' }}>{f.filename}</a>
                <button type="button" className="btn btn-secondary" style={{ width: 90 }} onClick={() => removeFile(f.id)}>Remove</button>
              </div>
            ))}
            <input type="file" onChange={(e) => handleFileUpload('ppap', e.target.files)} />
          </div>
        </>
      )}

      {/* QUICK CREATE MOULD MODAL */}
      {showQuickMouldModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#181a1b', border: '1px solid var(--line)', borderRadius: 12, width: '100%', maxWidth: 540, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)' }}>⚡ Quick Create & Link Mould</h3>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Instantly creates a new tool entry and binds it to {basic.part_name || basic.part_code}
                </div>
              </div>
              <button onClick={() => setShowQuickMouldModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleQuickCreateMould} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Mould Code *</label>
                <input
                  type="text"
                  required
                  value={quickMouldData.mould_code}
                  onChange={(e) => setQuickMouldData({ ...quickMouldData, mould_code: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Mould Name / Description *</label>
                <input
                  type="text"
                  required
                  value={quickMouldData.mould_name}
                  onChange={(e) => setQuickMouldData({ ...quickMouldData, mould_name: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Cavity Count *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quickMouldData.total_cavities}
                    onChange={(e) => setQuickMouldData({ ...quickMouldData, total_cavities: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Tool Maker</label>
                  <input
                    type="text"
                    value={quickMouldData.tool_maker}
                    onChange={(e) => setQuickMouldData({ ...quickMouldData, tool_maker: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Storage Location</label>
                  <input
                    type="text"
                    value={quickMouldData.storage_location}
                    onChange={(e) => setQuickMouldData({ ...quickMouldData, storage_location: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Suitable Machines</label>
                  <input
                    type="text"
                    value={quickMouldData.suitable_machines}
                    onChange={(e) => setQuickMouldData({ ...quickMouldData, suitable_machines: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowQuickMouldModal(false)}
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#10b981', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}
                >
                  Create & Link Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <DeletionModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          entityType="part"
          entityId={id}
          entityTitle={`${basic.part_name} (${basic.shrp_part_code || basic.part_code})`}
          isAdmin={user?.role === 'admin'}
          onSuccess={() => {
            if (user?.role === 'admin') {
              navigate('/parts');
            } else {
              setSuccess('Part deletion approval request submitted to Administrator.');
            }
          }}
        />
      )}
    </div>
  );
}
