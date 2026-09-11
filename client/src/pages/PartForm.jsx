import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getToken } from '../api';

const emptyBasic = {
  part_code: '', part_name: '', cavity_count: '1', standard_cycle_time_sec: '',
  unit_weight_g: '', part_weight_g: '', batch_part_code: '', standard_pack_qty: '', customer_id: '', notes: '',
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

  const [basic, setBasic] = useState(emptyBasic);
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState('');
  const [machines, setMachines] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.customers().then(setCustomers);
    api.machines().then(setMachines);
    if (!isNew) {
      api.partDetail(id).then((d) => {
        setBasic({
          part_code: d.part_code, part_name: d.part_name, cavity_count: String(d.cavity_count),
          standard_cycle_time_sec: String(d.standard_cycle_time_sec), unit_weight_g: d.unit_weight_g ? String(d.unit_weight_g) : '',
          part_weight_g: d.part_weight_g ? String(d.part_weight_g) : '', batch_part_code: d.batch_part_code || '',
          standard_pack_qty: d.standard_pack_qty ? String(d.standard_pack_qty) : '', customer_id: d.customer_id || '',
          notes: d.notes || '', trim_required: d.trim_required, inspection_required: d.inspection_required,
          packing_required: d.packing_required, dispatch_required: d.dispatch_required,
        });
        setSelectedMachines(d.suitable_machine_ids);
        setParameters(d.process_parameters.map((p) => ({ parameter_name: p.parameter_name, value: p.value, unit: p.unit || '' })));
        setDimensions(d.critical_dimensions.map((dd) => ({
          dimension_name: dd.dimension_name, nominal_value: dd.nominal_value ?? '', tol_plus: dd.tol_plus ?? '',
          tol_minus: dd.tol_minus ?? '', unit: dd.unit || '',
        })));
        setFiles(d.files);
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
        customer_id: basic.customer_id || null,
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
        dimension_name: dd.dimension_name, nominal_value: dd.nominal_value ?? '', tol_plus: dd.tol_plus ?? '',
        tol_minus: dd.tol_minus ?? '', unit: dd.unit || '',
      })));
      setSuccess('Critical dimensions saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  function toggleMachine(mid) {
    setSelectedMachines((sel) => sel.includes(mid) ? sel.filter((x) => x !== mid) : [...sel, mid]);
  }
  async function saveMachines() {
    setError('');
    try {
      await api.setPartMachines(id, selectedMachines);
      setSuccess('Suitable machines saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleFileUpload(fileType, fileList) {
    const file = fileList[0];
    if (!file) return;
    setError('');
    try {
      const data_base64 = await fileToBase64(file);
      const uploaded = await api.uploadPartFile(id, { file_type: fileType, filename: file.name, mime_type: file.type, data_base64 });
      setFiles((f) => [uploaded, ...f]);
    } catch (err) {
      setError(err.message);
    }
  }
  async function removeFile(fileId) {
    await api.deletePartFile(id, fileId);
    setFiles((f) => f.filter((x) => x.id !== fileId));
  }

  function fileUrl(fileId) {
    return `/api/masters/parts/${id}/files/${fileId}?token=${getToken()}`;
  }

  const photo = files.find((f) => f.file_type === 'photo');
  const sops = files.filter((f) => f.file_type === 'sop');
  const ppaps = files.filter((f) => f.file_type === 'ppap');

  return (
    <div className="screen">
      <h1 className="screen-title">{isNew ? 'Add Part' : `Edit ${basic.part_code}`}</h1>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="panel" style={{ borderColor: 'var(--green)', color: 'var(--green)' }}>{success}</div>}

      <form onSubmit={handleSaveBasic} className="panel">
        <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0 }}>Basic info</h2>
        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Part code</label>
            <input value={basic.part_code} onChange={(e) => updateBasic('part_code', e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Part name</label>
            <input value={basic.part_name} onChange={(e) => updateBasic('part_name', e.target.value)} required />
          </div>
        </div>

        <div className="field">
          <label>Customer</label>
          <select value={basic.customer_id} onChange={(e) => updateBasic('customer_id', e.target.value)}>
            <option value="">— none —</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="btn-row" style={{ marginTop: 8 }}>
            <input placeholder="New customer name" value={newCustomer} onChange={(e) => setNewCustomer(e.target.value)} />
            <button type="button" className="btn btn-secondary" style={{ width: 140 }} onClick={addCustomer}>+ Add</button>
          </div>
        </div>

        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Cavities</label>
            <input type="number" value={basic.cavity_count} onChange={(e) => updateBasic('cavity_count', e.target.value)} required />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Cycle time (sec)</label>
            <input type="number" step="0.1" value={basic.standard_cycle_time_sec} onChange={(e) => updateBasic('standard_cycle_time_sec', e.target.value)} required />
          </div>
        </div>

        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Shot weight (g, incl. runner)</label>
            <input type="number" step="0.01" value={basic.unit_weight_g} onChange={(e) => updateBasic('unit_weight_g', e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Part weight (g, no runner)</label>
            <input type="number" step="0.01" value={basic.part_weight_g} onChange={(e) => updateBasic('part_weight_g', e.target.value)} />
          </div>
        </div>

        <div className="btn-row" style={{ marginBottom: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Batch code</label>
            <input value={basic.batch_part_code} onChange={(e) => updateBasic('batch_part_code', e.target.value)}
              placeholder="e.g. 33" />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Standard pack qty</label>
            <input type="number" value={basic.standard_pack_qty} onChange={(e) => updateBasic('standard_pack_qty', e.target.value)} />
          </div>
        </div>

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

        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : isNew ? 'Create part' : 'Save basic info'}
        </button>
      </form>

      {!isNew && (
        <>
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
    </div>
  );
}
