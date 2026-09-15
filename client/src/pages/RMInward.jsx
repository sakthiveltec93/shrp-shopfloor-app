import SearchableSelect from '../components/SearchableSelect';
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
        api.rawMaterials.inwardList().catch(() => []),
        api.rawMaterials.list().catch(() => []),
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
    if (!form.material_id) {
      setError('Please select a material grade');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const totalWt = Number(form.received_bags || 0) * Number(form.standard_bag_wt_kg || 25);
      await api.rawMaterials.createInward({
        ...form,
        received_wt_kg: totalWt,
      });
      setShowInwardModal(false);
      setSuccessMsg('Inward receipt logged! Ready for technical inspection.');
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
      
      const defaultParams = [
        { parameter_name: 'Visual & Granule Color', specification: 'Uniform pellets, no discoloration', method_of_checking: 'Visual check', result: 'OK', remarks: '' },
        { parameter_name: 'Foreign Contamination / Specks', specification: 'Nil black specks / dust', method_of_checking: 'Visual check', result: 'OK', remarks: '' },
        { parameter_name: 'Density (g/cm³)', specification: details.density_g_cm3 ? details.density_g_cm3 + ' ± 0.005' : 'As per TDS', method_of_checking: 'Density balance', result: 'OK', remarks: '' },
        { parameter_name: 'Melt Flow Index (g/10min)', specification: details.mfi_g_10min ? details.mfi_g_10min + ' ± 10%' : 'As per TDS', method_of_checking: 'MFI Tester (190°C/2.16kg)', result: 'OK', remarks: '' },
        { parameter_name: 'Packaging & Bag Integrity', specification: 'Intact sealed 25kg bags with lot label', method_of_checking: 'Physical inspection', result: 'OK', remarks: '' },
      ];

      setInspectParams(details.parameters && details.parameters.length > 0 ? details.parameters : defaultParams);
      setInspectStatus(details.status === 'PENDING_INSPECTION' ? 'ACCEPTED' : details.status);
      setInspectRemarks(details.remarks || '');
      setShowInspectModal(true);
    } catch (err) {
      alert('Error fetching inspection details: ' + err.message);
    }
  };

  const handleParamResultToggle = (index) => {
    const updated = [...inspectParams];
    updated[index].result = updated[index].result === 'OK' ? 'NOT_OK' : 'OK';
    setInspectParams(updated);
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
      setSuccessMsg('Inspection saved! Lot marked ' + finalStatus + '. ' + (finalStatus === 'ACCEPTED' ? 'Stock credited to Warehouse Register.' : ''));
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
    reader.onload = () => {
      setForm(f => ({
        ...f,
        tc_document_data: reader.result,
        tc_filename: file.name,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Filtered List
  const filteredInwards = inwards.filter((item) => {
    if (filterStatus !== 'ALL' && item.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchLot = item.supplier_lot_no && item.supplier_lot_no.toLowerCase().includes(q);
      const matchInw = item.inward_no && item.inward_no.toLowerCase().includes(q);
      const matchMat = item.material_name && item.material_name.toLowerCase().includes(q);
      const matchCode = item.material_code && item.material_code.toLowerCase().includes(q);
      const matchSup = item.supplier_name && item.supplier_name.toLowerCase().includes(q);
      if (!matchLot && !matchInw && !matchMat && !matchCode && !matchSup) return false;
    }
    return true;
  });

  const pendingCount = inwards.filter((i) => i.status === 'PENDING_INSPECTION').length;
  const acceptedKg = inwards.filter((i) => i.status === 'ACCEPTED').reduce((s, i) => s + Number(i.received_wt_kg || 0), 0);
  const quarantineCount = inwards.filter((i) => i.status === 'QUARANTINE').length;

  const getCategoryIcon = (cat) => {
    if (!cat) return '📦';
    if (cat.includes('VIRGIN')) return '🛢️';
    if (cat.includes('REGRIND')) return '♻️';
    if (cat.includes('MASTERBATCH')) return '🎨';
    return '🧪';
  };

  return (
    <div className="screen" style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h1 className="screen-title" style={{ margin: 0, fontSize: 20 }}>📦 Raw Material Inward & Inspection</h1>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Receiving, Supplier TC Verification & IATF 16949 QA Signoff
          </p>
        </div>
        <button
          onClick={() => setShowInwardModal(true)}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <span>➕</span>
          <span>Log Inward Receipt</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid var(--green)', color: 'var(--green)', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.12)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          ⚠ {error}
        </div>
      )}

      {/* KPI Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 10,
        marginBottom: 16,
      }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Inwards</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: 'var(--text)' }}>{inwards.length} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>lots</span></div>
        </div>

        <div style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600, textTransform: 'uppercase' }}>Pending QA</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: 'var(--amber)' }}>{pendingCount} <span style={{ fontSize: 12, fontWeight: 400 }}>lots</span></div>
        </div>

        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, textTransform: 'uppercase' }}>Accepted Stock</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: 'var(--green)' }}>{acceptedKg.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 400 }}>kg</span></div>
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Material Grades</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: 'var(--text)' }}>{materials.length} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>types</span></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 16,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--line)',
              color: 'var(--text)',
              fontSize: 12,
              fontWeight: 600,
              flex: 1,
              maxWidth: 220,
            }}
          >
            <option value="ALL">All Receipts ({inwards.length})</option>
            <option value="PENDING_INSPECTION">🟡 Pending QA ({pendingCount})</option>
            <option value="ACCEPTED">🟢 Accepted Stock</option>
            <option value="QUARANTINE">🟠 Quarantine ({quarantineCount})</option>
            <option value="REJECTED">🔴 Rejected</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="🔍 Search lot, inward no, material..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--line)',
            color: 'var(--text)',
            fontSize: 12,
            minWidth: 220,
            flex: 1,
          }}
        />
      </div>

      {/* Inward List Cards */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          🔄 Loading inward receipts...
        </div>
      ) : filteredInwards.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          color: 'var(--text-muted)',
          fontSize: 13,
        }}>
          No inward receipts found matching filter. Tap <strong>"+ Log Inward Receipt"</strong> to add one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredInwards.map((inw) => {
            const isPending = inw.status === 'PENDING_INSPECTION';
            const isAccepted = inw.status === 'ACCEPTED';
            const isQuarantine = inw.status === 'QUARANTINE';

            const statusBg = isAccepted
              ? 'rgba(34,197,94,0.12)'
              : isPending
              ? 'rgba(217,119,6,0.15)'
              : isQuarantine
              ? 'rgba(249,115,22,0.15)'
              : 'rgba(239,68,68,0.15)';

            const statusColor = isAccepted
              ? 'var(--green)'
              : isPending
              ? 'var(--amber)'
              : isQuarantine
              ? '#f97316'
              : 'var(--red)';

            return (
              <div
                key={inw.id}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* Top Row: Material & Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}>
                      {getCategoryIcon(inw.material_category)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                        {inw.material_name || inw.material_code}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {inw.material_code} {inw.grade_code && '• Grade: ' + inw.grade_code} • {inw.supplier_name || 'Generic Supplier'}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: statusBg,
                    border: '1px solid ' + statusColor,
                    color: statusColor,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    {isPending ? '🟡 Pending QA' : isAccepted ? '🟢 Accepted' : isQuarantine ? '🟠 Quarantine' : '🔴 Rejected'}
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 8,
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 12,
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Lot Number:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--amber)', marginTop: 2 }}>
                      {inw.supplier_lot_no || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Quantity:</span>
                    <div style={{ fontWeight: 700, color: 'var(--text)', marginTop: 2 }}>
                      {Number(inw.received_wt_kg || 0).toFixed(1)} kg ({inw.received_bags} bags)
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Inward Ref:</span>
                    <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
                      {inw.inward_no} ({new Date(inw.created_at).toLocaleDateString()})
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Supplier TC:</span>
                    <div style={{ fontWeight: 600, marginTop: 2, color: inw.has_supplier_tc ? 'var(--green)' : 'var(--text-muted)' }}>
                      {inw.has_supplier_tc ? '📄 Attached' : '⚠️ No TC'}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {inw.inspector_name ? 'Inspected by: ' + inw.inspector_name : 'Awaiting QA Verification'}
                  </div>

                  <button
                    onClick={() => handleOpenInspect(inw)}
                    className={'btn ' + (isPending ? 'btn-primary' : 'btn-secondary')}
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>🔬</span>
                    <span>{isPending ? 'Perform QA Inspection' : 'View Inspection Report'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. Modal: Log Inward Receipt */}
      {/* ============================================================ */}
      {showInwardModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
        }}>
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12,
            width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', padding: 20,
            boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <strong style={{ fontSize: 16 }}>📦 Log Raw Material Inward Receipt</strong>
              <button
                type="button"
                onClick={() => setShowInwardModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInward} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Select Raw Material Grade *
                </label>
                <SearchableSelect
                  value={form.material_id}
                  onChange={(e) => setForm({ ...form, material_id: e.target.value })}
                  options={materials}
                  placeholder="-- Choose Material Grade --"
                  searchPlaceholder="🔍 Type material name, grade..."
                  getOptionValue={(m) => m.id}
                  getOptionLabel={(m) => m.material_name}
                  getOptionBadge={(m) => m.material_code}
                  getOptionSublabel={(m) => m.grade_code || m.category || ''}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Supplier / Manufacturer *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Reliance, Supreme"
                    value={form.supplier_name}
                    onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Supplier Batch / Lot No *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REL-2026-LD400"
                    value={form.supplier_lot_no}
                    onChange={(e) => setForm({ ...form, supplier_lot_no: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Invoice / Challan No *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-8891"
                    value={form.invoice_no}
                    onChange={(e) => setForm({ ...form, invoice_no: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    value={form.invoice_date}
                    onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Weight Calculation Preview */}
              <div style={{
                background: 'rgba(217,119,6,0.08)',
                border: '1px solid rgba(217,119,6,0.3)',
                borderRadius: 8,
                padding: 12,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--amber)', marginBottom: 4, fontWeight: 600 }}>
                      Received Bags *
                    </label>
                    <input
                      type="number"
                      value={form.received_bags}
                      onChange={(e) => setForm({ ...form, received_bags: e.target.value })}
                      required
                      min="1"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--amber)', marginBottom: 4, fontWeight: 600 }}>
                      Bag Wt (kg)
                    </label>
                    <input
                      type="number"
                      value={form.standard_bag_wt_kg}
                      onChange={(e) => setForm({ ...form, standard_bag_wt_kg: e.target.value })}
                      required
                      step="0.1"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Total Calculated Weight:</span>
                  <strong style={{ fontSize: 14, color: 'var(--green)' }}>
                    {(Number(form.received_bags || 0) * Number(form.standard_bag_wt_kg || 25)).toFixed(1)} kg
                  </strong>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Supplier TC Document (Test Certificate)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  style={{ fontSize: 12, color: 'var(--text-muted)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Receiving Remarks / Package Condition
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bags intact, received on wooden pallet"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowInwardModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: 10 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: 10, fontWeight: 700 }}
                >
                  {saving ? 'Saving…' : '✓ Log Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. Modal: Technical QA Inspection */}
      {/* ============================================================ */}
      {showInspectModal && selectedInward && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
        }}>
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12,
            width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 20,
            boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <strong style={{ fontSize: 16 }}>🔬 Incoming QA Inspection</strong>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Format: SHRP/QA/R/01 Rev.02 • Lot: {selectedInward.supplier_lot_no}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInspectModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Inward Meta Summary */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              padding: 10,
              marginBottom: 14,
              fontSize: 12,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
            }}>
              <div><strong>Material:</strong> {selectedInward.material_name}</div>
              <div><strong>Supplier:</strong> {selectedInward.supplier_name}</div>
              <div><strong>Weight:</strong> {selectedInward.received_wt_kg} kg ({selectedInward.received_bags} bags)</div>
              <div><strong>Invoice No:</strong> {selectedInward.invoice_no}</div>
            </div>

            {/* Inspection Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase' }}>
                Inspection Parameters & Tests
              </div>

              {inspectParams.map((param, idx) => {
                const isOk = param.result === 'OK';
                return (
                  <div
                    key={idx}
                    style={{
                      background: isOk ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                      border: '1px solid ' + (isOk ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'),
                      borderRadius: 8,
                      padding: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>
                        {param.parameter_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Spec: {param.specification} • {param.method_of_checking}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleParamResultToggle(idx)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: 'none',
                        background: isOk ? 'var(--green)' : 'var(--red)',
                        color: isOk ? '#000' : '#fff',
                        fontWeight: 800,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      {isOk ? '✓ PASS' : '✕ FAIL'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Remarks */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                QA Inspector Remarks & Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Granules tested, visually OK, free of dust"
                value={inspectRemarks}
                onChange={(e) => setInspectRemarks(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveInspection('ACCEPTED')}
                style={{
                  padding: '10px 4px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--green)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ✓ ACCEPT LOT
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveInspection('QUARANTINE')}
                style={{
                  padding: '10px 4px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#f97316',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ⚠ QUARANTINE
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSaveInspection('REJECTED')}
                style={{
                  padding: '10px 4px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--red)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                ✕ REJECT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
