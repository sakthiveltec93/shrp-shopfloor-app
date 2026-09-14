import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function RMInward() {
  const { user } = useAuth();
  const [inwards, setInwards] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [showInspectModal, setShowInspectModal] = useState(false);
  const [selectedInward, setSelectedInward] = useState(null);
  const [inspectParams, setInspectParams] = useState([]);
  const [inspectStatus, setInspectStatus] = useState('ACCEPTED');
  const [inspectRemarks, setInspectRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // New Inward Form State
  const [form, setForm] = useState({
    material_id: '',
    supplier_name: '',
    invoice_no: '',
    invoice_date: new Date().toISOString().slice(0, 10),
    supplier_lot_no: '',
    received_bags: 10,
    standard_bag_wt_kg: 25.0,
    sample_size_bags: 5,
    has_supplier_tc: true,
    tc_document_data: '',
    tc_filename: '',
    remarks: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [inwList, matList] = await Promise.all([
        api.rawMaterials.inwardList(),
        api.rawMaterials.list(),
      ]);
      setInwards(Array.isArray(inwList) ? inwList : []);
      setMaterials(Array.isArray(matList) ? matList : []);
      if (matList && matList.length > 0 && !form.material_id) {
        setForm(f => ({ ...f, material_id: matList[0].id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load inward data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateInward = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const totalWt = Number(form.received_bags) * Number(form.standard_bag_wt_kg);
      await api.rawMaterials.createInward({
        ...form,
        received_wt_kg: totalWt,
      });
      setShowInwardModal(false);
      setSuccessMsg('Inward receipt logged successfully! Ready for incoming inspection.');
      setTimeout(() => setSuccessMsg(''), 5000);
      setForm({
        material_id: materials[0]?.id || '',
        supplier_name: '',
        invoice_no: '',
        invoice_date: new Date().toISOString().slice(0, 10),
        supplier_lot_no: '',
        received_bags: 10,
        standard_bag_wt_kg: 25.0,
        sample_size_bags: 5,
        has_supplier_tc: true,
        tc_document_data: '',
        tc_filename: '',
        remarks: '',
      });
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create inward receipt');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenInspect = async (inward) => {
    try {
      const details = await api.rawMaterials.inwardDetail(inward.id);
      setSelectedInward(details);
      setInspectParams(details.parameters || []);
      setInspectStatus(details.status === 'PENDING_INSPECTION' ? 'ACCEPTED' : details.status);
      setInspectRemarks(details.remarks || '');
      setShowInspectModal(true);
    } catch (err) {
      alert('Error fetching inspection details: ' + err.message);
    }
  };

  const handleParamChange = (index, field, value) => {
    const updated = [...inspectParams];
    updated[index][field] = value;
    setInspectParams(updated);
  };

  const handleAddParam = () => {
    setInspectParams([
      ...inspectParams,
      {
        parameter_name: '',
        specification: '',
        method_of_checking: '',
        obs_b1: '',
        obs_b2: '',
        obs_b3: '',
        obs_b4: '',
        obs_b5: '',
        result: 'OK',
        remarks: '',
      },
    ]);
  };

  const handleSaveInspection = async (statusOverride) => {
    const finalStatus = statusOverride || inspectStatus;
    setSaving(true);
    setError(null);
    try {
      await api.rawMaterials.inspectInward(selectedInward.id, {
        status: finalStatus,
        remarks: inspectRemarks,
        parameters: inspectParams,
      });
      setShowInspectModal(false);
      setSuccessMsg(`Inspection saved! Receipt marked ${finalStatus}. ${finalStatus === 'ACCEPTED' ? 'Stock credited to RM Register.' : ''}`);
      setTimeout(() => setSuccessMsg(''), 5000);
      loadData();
    } catch (err) {
      alert('Inspection submit failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((f) => ({
        ...f,
        tc_filename: file.name,
        tc_document_data: event.target.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const filteredInwards = inwards.filter((inw) => {
    if (filterStatus !== 'ALL' && inw.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNo = inw.inward_no?.toLowerCase().includes(q);
      const matchMat = inw.material_name?.toLowerCase().includes(q) || inw.material_code?.toLowerCase().includes(q);
      const matchLot = inw.supplier_lot_no?.toLowerCase().includes(q);
      const matchSupp = inw.supplier_name?.toLowerCase().includes(q);
      return matchNo || matchMat || matchLot || matchSupp;
    }
    return true;
  });

  const pendingCount = inwards.filter((i) => i.status === 'PENDING_INSPECTION').length;
  const acceptedKg = inwards.filter((i) => i.status === 'ACCEPTED').reduce((s, i) => s + Number(i.received_wt_kg || 0), 0);

  return (
    <div className="screen">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="screen-title">Raw Material Inward & Inspection</h1>
          <p className="screen-sub">Format: SHRP / QA / R / 01 Rev.02 · Technical Receiving & IATF 16949 QA</p>
        </div>
        <button
          onClick={() => setShowInwardModal(true)}
          className="btn btn-primary shadow-sm"
          style={{ padding: '0.6rem 1.2rem', fontWeight: 600 }}
        >
          + Log Inward Receipt
        </button>
      </div>

      {successMsg && (
        <div className="p-3 mb-4 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="p-3 mb-4 rounded bg-rose-50 text-rose-800 border border-rose-200 text-sm font-medium">
          ⚠ {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inward Lots</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{inwards.length}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-amber-200 bg-amber-50/30 shadow-sm">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending QA Inspection</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{pendingCount}</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Accepted Stock Inward</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{acceptedKg.toFixed(1)} <span className="text-sm font-normal">kg</span></div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-indigo-200 bg-indigo-50/30 shadow-sm">
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Available Grades</div>
          <div className="text-2xl font-bold text-indigo-800 mt-1">{materials.length}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-2 items-center justify-between mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div className="flex gap-1">
          {['ALL', 'PENDING_INSPECTION', 'ACCEPTED', 'QUARANTINE', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All Receipts' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search lot, inward no, material..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 w-64"
        />
      </div>

      {/* Inward List Table */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading inward receipts...</div>
      ) : filteredInwards.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg border border-slate-200 text-slate-500">
          No inward receipts found matching filter.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-3">Inward No / Date</th>
                <th className="p-3">Material Grade</th>
                <th className="p-3">Supplier & Invoice</th>
                <th className="p-3">Lot No</th>
                <th className="p-3 text-right">Bags / Total Wt</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInwards.map((inw) => {
                let badgeCls = 'bg-slate-100 text-slate-700';
                if (inw.status === 'PENDING_INSPECTION') badgeCls = 'bg-amber-100 text-amber-800 border border-amber-300';
                if (inw.status === 'ACCEPTED') badgeCls = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
                if (inw.status === 'QUARANTINE') badgeCls = 'bg-purple-100 text-purple-800 border border-purple-300';
                if (inw.status === 'REJECTED') badgeCls = 'bg-rose-100 text-rose-800 border border-rose-300';

                return (
                  <tr key={inw.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{inw.inward_no}</div>
                      <div className="text-slate-400 text-[11px]">{new Date(inw.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{inw.material_name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{inw.material_code} · {inw.grade_code || inw.material_category}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-700">{inw.supplier_name}</div>
                      <div className="text-slate-500 text-[11px]">Inv: {inw.invoice_no} ({new Date(inw.invoice_date).toLocaleDateString()})</div>
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-800">
                      {inw.supplier_lot_no}
                      {inw.has_supplier_tc && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] border border-blue-200">TC Attached</span>}
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-bold text-slate-800">{Number(inw.received_wt_kg).toFixed(1)} kg</div>
                      <div className="text-slate-500 text-[11px]">{inw.received_bags} bags ({inw.standard_bag_wt_kg} kg/bag)</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeCls}`}>
                        {inw.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenInspect(inw)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors ${
                          inw.status === 'PENDING_INSPECTION'
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {inw.status === 'PENDING_INSPECTION' ? '🔍 Inspect QA' : '📄 View Report'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal 1: Log New Inward Receipt */}
      {showInwardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 relative my-8">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Log Raw Material Inward Receipt</h2>
                <p className="text-xs text-slate-500">Record physical delivery before technical incoming inspection</p>
              </div>
              <button onClick={() => setShowInwardModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleCreateInward} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Raw Material Grade *</label>
                <select
                  required
                  value={form.material_id}
                  onChange={(e) => {
                    const m = materials.find((mat) => mat.id === Number(e.target.value));
                    setForm({
                      ...form,
                      material_id: e.target.value,
                      supplier_name: m?.supplier_name || form.supplier_name,
                    });
                  }}
                  className="w-full p-2 text-xs border rounded bg-white font-medium"
                >
                  <option value="">-- Choose Material Grade --</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.material_code} - {m.material_name} ({m.category} / {m.grade_code || 'Standard'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Manufacturer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reliance, IOCL, Supreme"
                    value={form.supplier_name}
                    onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Batch / Lot Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. REL-2026-LD400"
                    value={form.supplier_lot_no}
                    onChange={(e) => setForm({ ...form, supplier_lot_no: e.target.value })}
                    className="w-full p-2 text-xs border rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice / Delivery Challan No *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. INV-2026-8891"
                    value={form.invoice_no}
                    onChange={(e) => setForm({ ...form, invoice_no: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    required
                    value={form.invoice_date}
                    onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded border">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Received Bags *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.received_bags}
                    onChange={(e) => setForm({ ...form, received_bags: e.target.value })}
                    className="w-full p-2 text-xs border rounded font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Std Bag Wt (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.standard_bag_wt_kg}
                    onChange={(e) => setForm({ ...form, standard_bag_wt_kg: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Weight</label>
                  <div className="p-2 text-xs bg-slate-200/80 rounded font-bold text-slate-800">
                    {(Number(form.received_bags) * Number(form.standard_bag_wt_kg)).toFixed(1)} kg
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sample Size (Bags for QA)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.sample_size_bags}
                    onChange={(e) => setForm({ ...form, sample_size_bags: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier TC (Test Certificate)</label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Receiving Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Received intact on wooden pallets, lot seals checked"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  className="w-full p-2 text-xs border rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowInwardModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Logging...' : 'Save Inward Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Technical Incoming Inspection (Format: SHRP / QA / R / 01 Rev.02) */}
      {showInspectModal && selectedInward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full p-6 relative my-6 max-h-[90vh] flex flex-col">
            {/* Report Header */}
            <div className="border-b pb-4 mb-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wider">IATF 16949:2016</span>
                  <span className="text-xs font-mono font-semibold text-slate-500">Format: SHRP / QA / R / 01 Rev.02</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">INCOMING INSPECTION REPORT (RAW MATERIAL)</h2>
                <div className="text-xs text-slate-600 mt-0.5">
                  Material: <strong className="text-slate-900">{selectedInward.material_name}</strong> ({selectedInward.material_code}) · Lot: <strong className="text-slate-900 font-mono">{selectedInward.supplier_lot_no}</strong> · Supplier: <strong>{selectedInward.supplier_name}</strong>
                </div>
              </div>
              <button onClick={() => setShowInspectModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold">×</button>
            </div>

            {/* Inward Details Summary Bar */}
            <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border text-xs text-slate-700 mb-4">
              <div><strong>Inward No:</strong> {selectedInward.inward_no}</div>
              <div><strong>Invoice No:</strong> {selectedInward.invoice_no}</div>
              <div><strong>Received Quantity:</strong> {selectedInward.received_wt_kg} kg ({selectedInward.received_bags} bags)</div>
              <div><strong>Sample Bags Checked:</strong> {selectedInward.sample_size_bags || 5} bags</div>
            </div>

            {/* Checklist Table */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quality Inspection Parameters</span>
                <button
                  onClick={handleAddParam}
                  className="px-2.5 py-1 rounded text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border"
                >
                  + Add Custom Test Parameter
                </button>
              </div>

              <table className="w-full text-left text-xs border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b">
                    <th className="p-2 border-r w-8 text-center">#</th>
                    <th className="p-2 border-r w-48">Parameter Name</th>
                    <th className="p-2 border-r">Specification / Limit</th>
                    <th className="p-2 border-r w-32">Method of Checking</th>
                    <th className="p-1 border-r text-center w-40" colSpan="5">Sample Observations (B1-B5)</th>
                    <th className="p-2 border-r w-24 text-center">Result</th>
                    <th className="p-2 w-32">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {inspectParams.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 border-r text-center font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-1.5 border-r font-medium text-slate-800">
                        <input
                          type="text"
                          value={p.parameter_name}
                          onChange={(e) => handleParamChange(idx, 'parameter_name', e.target.value)}
                          className="w-full p-1 border rounded text-xs"
                        />
                      </td>
                      <td className="p-1.5 border-r text-slate-600">
                        <input
                          type="text"
                          value={p.specification || ''}
                          onChange={(e) => handleParamChange(idx, 'specification', e.target.value)}
                          className="w-full p-1 border rounded text-xs"
                        />
                      </td>
                      <td className="p-1.5 border-r text-slate-600">
                        <input
                          type="text"
                          value={p.method_of_checking || ''}
                          onChange={(e) => handleParamChange(idx, 'method_of_checking', e.target.value)}
                          className="w-full p-1 border rounded text-xs"
                        />
                      </td>
                      <td className="p-1 border-r" colSpan="5">
                        <div className="grid grid-cols-5 gap-1">
                          {['obs_b1', 'obs_b2', 'obs_b3', 'obs_b4', 'obs_b5'].map((key, bIdx) => (
                            <input
                              key={key}
                              type="text"
                              placeholder={`B${bIdx + 1}`}
                              value={p[key] || ''}
                              onChange={(e) => handleParamChange(idx, key, e.target.value)}
                              className="p-1 text-center border rounded text-[11px]"
                            />
                          ))}
                        </div>
                      </td>
                      <td className="p-1.5 border-r text-center">
                        <select
                          value={p.result || 'OK'}
                          onChange={(e) => handleParamChange(idx, 'result', e.target.value)}
                          className={`p-1 border rounded font-bold text-xs ${
                            p.result === 'OK' ? 'text-emerald-700 bg-emerald-50' : p.result === 'NOT_OK' ? 'text-rose-700 bg-rose-50' : 'text-slate-600'
                          }`}
                        >
                          <option value="OK">OK</option>
                          <option value="NOT_OK">NOT OK</option>
                          <option value="NA">NA</option>
                        </select>
                      </td>
                      <td className="p-1.5">
                        <input
                          type="text"
                          placeholder="Notes"
                          value={p.remarks || ''}
                          onChange={(e) => handleParamChange(idx, 'remarks', e.target.value)}
                          className="w-full p-1 border rounded text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TC Document Viewer / Attachment */}
            {selectedInward.tc_document_data && (
              <div className="mt-3 p-2 bg-blue-50/50 border border-blue-200 rounded flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-900">📄 Attached Supplier Test Certificate: {selectedInward.tc_filename || 'Certificate Document'}</span>
                <a
                  href={selectedInward.tc_document_data}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
                >
                  View Certificate
                </a>
              </div>
            )}

            {/* QA Decision & Submission Footer */}
            <div className="pt-4 mt-3 border-t flex flex-wrap justify-between items-center gap-3">
              <div className="flex-1 min-w-[250px]">
                <input
                  type="text"
                  placeholder="Inspector remarks / IATF disposition notes..."
                  value={inspectRemarks}
                  onChange={(e) => setInspectRemarks(e.target.value)}
                  className="w-full p-2 text-xs border rounded"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveInspection('REJECTED')}
                  disabled={saving}
                  className="px-4 py-2 rounded text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                >
                  ❌ Reject Lot
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInspection('QUARANTINE')}
                  disabled={saving}
                  className="px-4 py-2 rounded text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                >
                  ⏸ Quarantine
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveInspection('ACCEPTED')}
                  disabled={saving}
                  className="px-5 py-2 rounded text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  ✓ Accept & Credit Stock ({selectedInward.received_wt_kg} kg)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
