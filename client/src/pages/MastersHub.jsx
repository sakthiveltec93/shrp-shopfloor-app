import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

const TABS = [
  { key: 'parts', label: 'Parts', icon: '📋' },
  { key: 'raw_materials', label: 'Raw Materials', icon: '🧪' },
  { key: 'gauges', label: 'Gauges', icon: '📏' },
  { key: 'suppliers', label: 'Suppliers', icon: '🏭' },
  { key: 'customers', label: 'Customers', icon: '🏢' },
  { key: 'machines', label: 'Machines', icon: '🖥️' },
  { key: 'moulds', label: 'Moulds', icon: '⚙️' },
  { key: 'defaults', label: 'Checksheets', icon: '📑' },
];

export default function MastersHub() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab') || 'parts';
  const [activeTab, setActiveTab] = useState(tabParam);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // 1. PARTS STATE
  const [parts, setParts] = useState([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [showInactiveParts, setShowInactiveParts] = useState(false);
  const [partSearch, setPartSearch] = useState('');

  // 2. RAW MATERIALS STATE
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [rmSearch, setRmSearch] = useState('');
  const [rmModal, setRmModal] = useState(null); // { isEdit: boolean, data?: obj }
  const [rmForm, setRmForm] = useState({
    material_code: '',
    material_name: '',
    category: 'VIRGIN_POLYMER',
    supplier_name: '',
    grade_code: '',
    color: 'Natural',
    density_g_cm3: '1.14',
    mfi_g_10min: '',
    standard_bag_wt_kg: 25.0,
    min_stock_kg: 100.0,
    drying_temp_c: 80,
    drying_time_hrs: 4,
    melt_temp_c: '',
    active: true,
  });

  // 3. GAUGES STATE
  const [gauges, setGauges] = useState([]);
  const [gaugesLoading, setGaugesLoading] = useState(false);
  const [gaugeSummary, setGaugeSummary] = useState(null);
  const [gaugeModal, setGaugeModal] = useState(null);
  const [gaugeForm, setGaugeForm] = useState({
    gauge_code: '',
    gauge_name: '',
    gauge_type: 'Vernier',
    range_spec: '',
    accuracy: '',
    location: 'QA Inspection Lab',
    calibration_interval_days: 365,
    last_calibrated_at: '',
    calibration_cert_no: '',
    status: 'active',
  });

  // 4. SUPPLIERS STATE
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierModal, setSupplierModal] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    supplier_code: '',
    supplier_name: '',
    gstin: '',
    pan_no: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hosur',
    state: 'Tamil Nadu',
    pincode: '',
    materials_supplied: '',
    payment_terms: '30 Days',
    lead_time_days: 7,
    vendor_rating: 100,
    iso_iatf_certified: true,
    active: true,
  });

  // 5. CUSTOMERS STATE
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerModal, setCustomerModal] = useState(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    customer_code: '',
    name: '',
    gstin: '',
    pan_no: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hosur',
    state: 'Tamil Nadu',
    pincode: '',
    payment_terms: '30 Days',
    active: true,
  });

  // 6. MACHINES STATE
  const [machines, setMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(false);

  // 7. MOULDS STATE
  const [moulds, setMoulds] = useState([]);
  const [mouldsLoading, setMouldsLoading] = useState(false);
  const [pmModal, setPmModal] = useState(null);
  const [pmForm, setPmForm] = useState({ action_type: 'pm_service', technician_name: '', description: '' });

  // 8. DEFAULTS & CHECKSHEETS
  const [checkItems, setCheckItems] = useState([]);
  const [rejectReasons, setRejectReasons] = useState([]);
  const [downtimeReasons, setDowntimeReasons] = useState([]);

  useEffect(() => {
    setError('');
    setSuccess('');
    if (activeTab === 'parts') loadParts();
    if (activeTab === 'raw_materials') loadMaterials();
    if (activeTab === 'gauges') loadGauges();
    if (activeTab === 'suppliers') loadSuppliers();
    if (activeTab === 'customers') loadCustomers();
    if (activeTab === 'machines') loadMachines();
    if (activeTab === 'moulds') loadMoulds();
    if (activeTab === 'defaults') loadDefaults();
  }, [activeTab]);

  const loadParts = () => {
    setPartsLoading(true);
    api.parts()
      .then(setParts)
      .catch((e) => setError(e.message))
      .finally(() => setPartsLoading(false));
  };

  const loadMaterials = () => {
    setMaterialsLoading(true);
    api.rawMaterials.list()
      .then((m) => setMaterials(m || []))
      .catch((e) => setError(e.message))
      .finally(() => setMaterialsLoading(false));
  };

  const loadGauges = () => {
    setGaugesLoading(true);
    Promise.all([
      api.gauges.list('all'),
      api.gauges.calibrationSummary ? api.gauges.calibrationSummary() : Promise.resolve(null),
    ])
      .then(([gList, gSum]) => {
        setGauges(gList || []);
        setGaugeSummary(gSum);
      })
      .catch((e) => setError(e.message))
      .finally(() => setGaugesLoading(false));
  };

  const loadSuppliers = () => {
    setSuppliersLoading(true);
    api.suppliers.list('all')
      .then(setSuppliers)
      .catch((e) => setError(e.message))
      .finally(() => setSuppliersLoading(false));
  };

  const loadCustomers = () => {
    setCustomersLoading(true);
    api.customers.list()
      .then(setCustomers)
      .catch((e) => setError(e.message))
      .finally(() => setCustomersLoading(false));
  };

  const loadMachines = () => {
    setMachinesLoading(true);
    api.machines()
      .then(setMachines)
      .catch((e) => setError(e.message))
      .finally(() => setMachinesLoading(false));
  };

  const loadMoulds = () => {
    setMouldsLoading(true);
    if (api.moulds?.list) {
      api.moulds.list()
        .then(setMoulds)
        .catch((e) => setError(e.message))
        .finally(() => setMouldsLoading(false));
    } else {
      setMouldsLoading(false);
    }
  };

  const loadDefaults = () => {
    Promise.all([
      api.checkSheetItems ? api.checkSheetItems().catch(() => []) : Promise.resolve([]),
      api.checkItems ? api.checkItems('reject_reason').catch(() => []) : Promise.resolve([]),
      api.checkItems ? api.checkItems('downtime_reason').catch(() => []) : Promise.resolve([]),
    ])
      .then(([ci, rr, dr]) => {
        // API returns arrays of row objects; guard against non-array responses
        setCheckItems(Array.isArray(ci) ? ci : (ci?.items || ci?.rows || []));
        setRejectReasons(Array.isArray(rr) ? rr : (rr?.items || rr?.rows || []));
        setDowntimeReasons(Array.isArray(dr) ? dr : (dr?.items || dr?.rows || []));
      })
      .catch((e) => setError(e.message));
  };

  // --- PART ACTIONS ---
  const handleDeletePart = async (part) => {
    if (!window.confirm(`Are you sure you want to delete part [${part.shrp_part_code || part.part_code}] ${part.part_name}?`)) return;
    try {
      await api.deletePart(part.id);
      setSuccess(`✅ Part '${part.part_name}' deleted.`);
      loadParts();
    } catch (err) {
      setError(err.message || 'Cannot delete part with active records.');
    }
  };

  // --- RAW MATERIAL ACTIONS ---
  const handleSaveRM = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (rmModal?.isEdit) {
        await api.rawMaterials.update(rmModal.data.id, rmForm);
        setSuccess(`✅ Raw Material '${rmForm.material_name}' (${rmForm.material_code}) updated.`);
      } else {
        await api.rawMaterials.create(rmForm);
        setSuccess(`✅ Raw Material '${rmForm.material_name}' (${rmForm.material_code}) registered.`);
      }
      setRmModal(null);
      loadMaterials();
    } catch (err) {
      setError(err.message || 'Failed to save raw material');
    }
  };

  const handleDeleteRM = async (rm) => {
    if (!window.confirm(`Are you sure you want to permanently delete raw material [${rm.material_code}] ${rm.material_name}?`)) return;
    try {
      await api.rawMaterials.delete(rm.id);
      setSuccess(`✅ Raw Material '${rm.material_name}' deleted.`);
      loadMaterials();
    } catch (err) {
      setError(err.message || 'Cannot delete material linked to receipts or recipes. Deactivate it instead.');
    }
  };

  // --- GAUGE ACTIONS ---
  const handleSaveGauge = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (gaugeModal?.isEdit) {
        await api.gauges.update(gaugeModal.data.id, gaugeForm);
        setSuccess(`✅ Gauge '${gaugeForm.gauge_code}' updated.`);
      } else {
        await api.gauges.create(gaugeForm);
        setSuccess(`✅ Gauge '${gaugeForm.gauge_code}' added.`);
      }
      setGaugeModal(null);
      loadGauges();
    } catch (err) {
      setError(err.message || 'Failed to save gauge');
    }
  };

  const handleDeleteGauge = async (g) => {
    if (!window.confirm(`Are you sure you want to delete instrument [${g.gauge_code}] ${g.gauge_name}?`)) return;
    try {
      await api.gauges.delete(g.id);
      setSuccess(`✅ Instrument '${g.gauge_code}' deleted.`);
      loadGauges();
    } catch (err) {
      setError(err.message || 'Failed to delete instrument');
    }
  };

  // --- SUPPLIER ACTIONS ---
  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (supplierModal?.isEdit) {
        await api.suppliers.update(supplierModal.data.id, supplierForm);
        setSuccess(`✅ Supplier '${supplierForm.supplier_name}' updated.`);
      } else {
        await api.suppliers.create(supplierForm);
        setSuccess(`✅ Supplier '${supplierForm.supplier_name}' created.`);
      }
      setSupplierModal(null);
      loadSuppliers();
    } catch (err) {
      setError(err.message || 'Failed to save supplier');
    }
  };

  const handleDeleteSupplier = async (s) => {
    if (!window.confirm(`Are you sure you want to delete supplier [${s.supplier_code}] ${s.supplier_name}?`)) return;
    try {
      await api.suppliers.delete(s.id);
      setSuccess(`✅ Supplier '${s.supplier_name}' deleted.`);
      loadSuppliers();
    } catch (err) {
      setError(err.message || 'Cannot delete supplier with linked records.');
    }
  };

  // --- CUSTOMER ACTIONS ---
  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (customerModal?.isEdit) {
        await api.customers.update(customerModal.data.id, customerForm);
        setSuccess(`✅ Customer '${customerForm.name}' updated.`);
      } else {
        await api.customers.create(customerForm);
        setSuccess(`✅ Customer '${customerForm.name}' registered.`);
      }
      setCustomerModal(null);
      loadCustomers();
    } catch (err) {
      setError(err.message || 'Failed to save customer');
    }
  };

  const handleDeleteCustomer = async (c) => {
    if (!window.confirm(`Are you sure you want to delete customer [${c.customer_code || c.name}] ${c.name}?`)) return;
    try {
      await api.customers.delete(c.id);
      setSuccess(`✅ Customer '${c.name}' deleted.`);
      loadCustomers();
    } catch (err) {
      setError(err.message || 'Cannot delete customer with linked parts or dispatches.');
    }
  };

  // --- MOULD PM ACTIONS ---
  const handleLogPm = async (e) => {
    e.preventDefault();
    if (!pmModal) return;
    setError('');
    try {
      await api.moulds.logMaintenance(pmModal.id, pmForm);
      setSuccess(`✅ PM logged for mould '${pmModal.mould_code}'! Counter reset to 0.`);
      setPmModal(null);
      loadMoulds();
    } catch (err) {
      setError(err.message || 'Failed to log mould maintenance');
    }
  };

  const filteredParts = parts.filter((p) => {
    if (!showInactiveParts && p.active === false) return false;
    if (!partSearch.trim()) return true;
    const q = partSearch.toLowerCase();
    return (
      (p.part_code || '').toLowerCase().includes(q) ||
      (p.part_name || '').toLowerCase().includes(q) ||
      (p.shrp_part_code || '').toLowerCase().includes(q) ||
      (p.customer_name || '').toLowerCase().includes(q) ||
      (p.mould_code || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="screen" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <h1 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
        Item Master
      </h1>

      {error && (
        <div className="error-banner" style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 6 }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '10px 14px', borderRadius: 6, marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
          {success}
        </div>
      )}

      {/* 8-Tab Navigation Switcher */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 16,
          borderBottom: '1px solid var(--line)',
        }}
      >
        {TABS.map((tItem) => {
          const isActive = activeTab === tItem.key;
          return (
            <button
              key={tItem.key}
              type="button"
              onClick={() => handleTabChange(tItem.key)}
              style={{
                padding: '9px 14px',
                fontSize: 13,
                fontWeight: 700,
                borderRadius: 6,
                border: isActive ? '1px solid var(--amber)' : '1px solid var(--line)',
                background: isActive ? 'var(--amber)' : 'var(--panel)',
                color: isActive ? '#1c1500' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>{tItem.icon}</span>
              <span>{tItem.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PARTS MASTER */}
      {activeTab === 'parts' && (
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 260 }}>
              <input
                type="text"
                placeholder="🔍 Search part code, name, customer, mould..."
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text)' }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={showInactiveParts}
                  onChange={(e) => setShowInactiveParts(e.target.checked)}
                />
                Show Inactive
              </label>
            </div>
            <Link to="/parts/new" className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: 13 }}>
              + Add New Part
            </Link>
          </div>

          {partsLoading ? (
            <p className="muted">Loading parts master…</p>
          ) : filteredParts.length === 0 ? (
            <p className="muted">No parts match search criteria.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="log-table" style={{ width: '100%', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Part Code</th>
                    <th>Part Name</th>
                    <th>Customer</th>
                    <th>Mould &amp; Cavities</th>
                    <th>Cycle Time</th>
                    <th>Net / Gross Wt</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((p) => {
                    const cycleTime = p.standard_cycle_time_sec || p.cycle_time_seconds;
                    const netWt = p.unit_weight_g || p.net_weight_grams;
                    const grossWt = p.part_weight_g || p.gross_weight_grams;
                    const mouldInfo = p.mould_code
                      ? `${p.mould_code} (${p.cavities_for_part || p.cavity_count || 1} cav)`
                      : (p.cavity_count ? `${p.cavity_count} cav (Standard)` : '—');

                    return (
                      <tr key={p.id} style={{ opacity: p.active === false ? 0.6 : 1 }}>
                        <td style={{ fontWeight: 700, color: 'var(--amber)' }}>
                          <div>{p.shrp_part_code || p.part_code}</div>
                          {p.customer_part_no && p.customer_part_no !== p.part_code && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Cust: {p.customer_part_no}</div>
                          )}
                        </td>
                        <td>
                          <strong>{p.part_name}</strong>
                          {p.notes && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.notes}</div>}
                        </td>
                        <td>
                          {p.customer_name ? (
                            <span style={{ fontWeight: 600, color: 'var(--text)' }}>{p.customer_name}</span>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                        <td>
                          {p.mould_code ? (
                            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{mouldInfo}</span>
                          ) : (
                            <span className="muted">{mouldInfo}</span>
                          )}
                        </td>
                        <td>{cycleTime ? `${cycleTime}s` : '—'}</td>
                        <td>
                          {netWt ? `${netWt}g` : '—'} {grossWt ? `/ ${grossWt}g` : ''}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontSize: 10,
                              fontWeight: 700,
                              background: p.active !== false ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: p.active !== false ? '#34d399' : '#f87171',
                              border: `1px solid ${p.active !== false ? '#10b981' : '#ef4444'}`,
                            }}
                          >
                            {p.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <Link
                            to={`/parts/${p.id}/edit`}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: 11, width: 'auto', display: 'inline-block', marginRight: 6 }}
                          >
                            ✏️ Edit
                          </Link>
                          {user.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeletePart(p)}
                              style={{ padding: '4px 8px', fontSize: 11, width: 'auto', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 4, cursor: 'pointer' }}
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RAW MATERIALS */}
      {activeTab === 'raw_materials' && (
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <input
              type="text"
              placeholder="🔍 Search materials, grade, supplier..."
              value={rmSearch}
              onChange={(e) => setRmSearch(e.target.value)}
              style={{ width: 280, padding: '8px 12px', fontSize: 13, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text)' }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }}
                onClick={() => {
                  setRmForm({
                    material_code: '',
                    material_name: '',
                    category: 'VIRGIN_POLYMER',
                    supplier_name: '',
                    grade_code: '',
                    color: 'Natural',
                    density_g_cm3: '1.14',
                    mfi_g_10min: '',
                    standard_bag_wt_kg: 25.0,
                    min_stock_kg: 100.0,
                    drying_temp_c: 80,
                    drying_time_hrs: 4,
                    melt_temp_c: '',
                    active: true,
                  });
                  setRmModal({ isEdit: false });
                }}
              >
                + Add Raw Material
              </button>
              <Link to="/rm-inward" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }}>
                📥 RM Inward QA
              </Link>
              <Link to="/rm-stock" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }}>
                📦 Stock Register
              </Link>
              <Link to="/recipes" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }}>
                🧪 Blend Recipes
              </Link>
            </div>
          </div>

          {materialsLoading ? (
            <p className="muted">Loading raw materials…</p>
          ) : materials.length === 0 ? (
            <p className="muted">No raw materials registered in system.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="log-table" style={{ width: '100%', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Material Code</th>
                    <th>Material Name &amp; Category</th>
                    <th>Grade &amp; Color</th>
                    <th>Supplier</th>
                    <th>Density / MFI</th>
                    <th>Drying Specs</th>
                    <th>Stock / Min Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {materials
                    .filter((m) => {
                      if (!rmSearch.trim()) return true;
                      const q = rmSearch.toLowerCase();
                      return (
                        (m.material_code || '').toLowerCase().includes(q) ||
                        (m.material_name || '').toLowerCase().includes(q) ||
                        (m.grade_code || '').toLowerCase().includes(q) ||
                        (m.supplier_name || '').toLowerCase().includes(q)
                      );
                    })
                    .map((m) => (
                      <tr key={m.id} style={{ opacity: m.active === false ? 0.6 : 1 }}>
                        <td style={{ fontWeight: 700, color: 'var(--amber)' }}>{m.material_code}</td>
                        <td>
                          <strong>{m.material_name}</strong>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {m.category ? m.category.replace('_', ' ') : 'VIRGIN POLYMER'}
                          </div>
                        </td>
                        <td>
                          <div>{m.grade_code || '—'}</div>
                          {m.color && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Color: {m.color}</div>}
                        </td>
                        <td>{m.supplier_name || 'Standard Vendor'}</td>
                        <td>
                          <div>{m.density_g_cm3 ? `${m.density_g_cm3} g/cm³` : '—'}</div>
                          {m.mfi_g_10min && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>MFI: {m.mfi_g_10min}</div>}
                        </td>
                        <td>
                          {m.drying_temp_c ? `${m.drying_temp_c}°C / ${m.drying_time_hrs || 4}h` : '80°C / 4h'}
                        </td>
                        <td>
                          <span style={{ color: Number(m.total_stock_kg || 0) < Number(m.min_stock_kg || 100) ? '#f87171' : '#34d399', fontWeight: 700 }}>
                            {Number(m.total_stock_kg || 0).toLocaleString()} kg
                          </span>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Min: {m.min_stock_kg || 100} kg</div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontSize: 10,
                              fontWeight: 700,
                              background: m.active !== false ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: m.active !== false ? '#34d399' : '#f87171',
                              border: `1px solid ${m.active !== false ? '#10b981' : '#ef4444'}`,
                            }}
                          >
                            {m.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: 11, width: 'auto', display: 'inline-block', marginRight: 6 }}
                            onClick={() => {
                              setRmForm({
                                material_code: m.material_code,
                                material_name: m.material_name,
                                category: m.category || 'VIRGIN_POLYMER',
                                supplier_name: m.supplier_name || '',
                                grade_code: m.grade_code || '',
                                color: m.color || 'Natural',
                                density_g_cm3: m.density_g_cm3 || '',
                                mfi_g_10min: m.mfi_g_10min || '',
                                standard_bag_wt_kg: m.standard_bag_wt_kg || 25.0,
                                min_stock_kg: m.min_stock_kg || 100.0,
                                drying_temp_c: m.drying_temp_c || 80,
                                drying_time_hrs: m.drying_time_hrs || 4,
                                melt_temp_c: m.melt_temp_c || '',
                                active: m.active !== false,
                              });
                              setRmModal({ isEdit: true, data: m });
                            }}
                          >
                            ✏️ Edit
                          </button>
                          {user.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRM(m)}
                              style={{ padding: '3px 8px', fontSize: 11, width: 'auto', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 4, cursor: 'pointer' }}
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add / Edit Raw Material Modal */}
          {rmModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
              <div className="panel" style={{ width: '100%', maxWidth: 540, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 20, maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>
                  {rmModal.isEdit ? '✏️ Edit Raw Material' : '➕ Add Raw Material Master'}
                </h3>
                <form onSubmit={handleSaveRM} style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Material Code *</label>
                      <input
                        required
                        value={rmForm.material_code}
                        onChange={(e) => setRmForm({ ...rmForm, material_code: e.target.value })}
                        placeholder="e.g. RM-PA66-01"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Material Name *</label>
                      <input
                        required
                        value={rmForm.material_name}
                        onChange={(e) => setRmForm({ ...rmForm, material_name: e.target.value })}
                        placeholder="e.g. Polyamide 66 Natural (Nylon 66)"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Category *</label>
                      <select
                        value={rmForm.category}
                        onChange={(e) => setRmForm({ ...rmForm, category: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      >
                        <option value="VIRGIN_POLYMER">Virgin Polymer</option>
                        <option value="MASTERBATCH">Masterbatch (Color/Additive)</option>
                        <option value="RUBBER_COMPOUND">Rubber Compound</option>
                        <option value="CHEMICAL_ADDITIVE">Chemical Additive</option>
                        <option value="REGRIND">Regrind Material</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Supplier / Vendor</label>
                      <input
                        value={rmForm.supplier_name}
                        onChange={(e) => setRmForm({ ...rmForm, supplier_name: e.target.value })}
                        placeholder="e.g. Supreme Polymers / Dupont"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Grade Code</label>
                      <input
                        value={rmForm.grade_code}
                        onChange={(e) => setRmForm({ ...rmForm, grade_code: e.target.value })}
                        placeholder="e.g. Zytel 101L / Novamid"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Color</label>
                      <input
                        value={rmForm.color}
                        onChange={(e) => setRmForm({ ...rmForm, color: e.target.value })}
                        placeholder="e.g. Natural / Black / Red"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Density (g/cm³)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={rmForm.density_g_cm3}
                        onChange={(e) => setRmForm({ ...rmForm, density_g_cm3: e.target.value })}
                        placeholder="1.14"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>MFI (g/10min)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={rmForm.mfi_g_10min}
                        onChange={(e) => setRmForm({ ...rmForm, mfi_g_10min: e.target.value })}
                        placeholder="12.0"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Melt Temp (°C)</label>
                      <input
                        type="number"
                        value={rmForm.melt_temp_c}
                        onChange={(e) => setRmForm({ ...rmForm, melt_temp_c: e.target.value })}
                        placeholder="260"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Bag Wt (kg)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={rmForm.standard_bag_wt_kg}
                        onChange={(e) => setRmForm({ ...rmForm, standard_bag_wt_kg: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Safety Stock (kg)</label>
                      <input
                        type="number"
                        value={rmForm.min_stock_kg}
                        onChange={(e) => setRmForm({ ...rmForm, min_stock_kg: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Drying Temp (°C)</label>
                      <input
                        type="number"
                        value={rmForm.drying_temp_c}
                        onChange={(e) => setRmForm({ ...rmForm, drying_temp_c: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Drying Time (hrs)</label>
                      <input
                        type="number"
                        value={rmForm.drying_time_hrs}
                        onChange={(e) => setRmForm({ ...rmForm, drying_time_hrs: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={rmForm.active}
                        onChange={(e) => setRmForm({ ...rmForm, active: e.target.checked })}
                      />
                      Active Material
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                    <button type="button" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => setRmModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>
                      Save Raw Material
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GAUGES & INSTRUMENTS */}
      {activeTab === 'gauges' && (
        <div className="panel" style={{ padding: 16 }}>
          {/* Calibration Health Cards */}
          {gaugeSummary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 6, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Fleet</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{gaugeSummary.total || 0} Instruments</div>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: 12, borderRadius: 6, border: '1px solid #10b981' }}>
                <div style={{ fontSize: 11, color: '#34d399' }}>🟢 Valid &amp; Active</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#34d399' }}>{gaugeSummary.healthy || 0}</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: 12, borderRadius: 6, border: '1px solid #f59e0b' }}>
                <div style={{ fontSize: 11, color: '#fbbf24' }}>🟡 Due Soon (&lt;15d)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>{gaugeSummary.due_soon || 0}</div>
              </div>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 6, border: '1px solid #ef4444' }}>
                <div style={{ fontSize: 11, color: '#f87171' }}>🔴 Overdue Calibration</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f87171' }}>{gaugeSummary.overdue || 0}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Measuring Instruments &amp; Calibration Health</h3>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '7px 14px', fontSize: 12 }}
              onClick={() => {
                setGaugeForm({
                  gauge_code: '',
                  gauge_name: '',
                  gauge_type: 'Vernier',
                  range_spec: '',
                  accuracy: '',
                  location: 'QA Inspection Lab',
                  calibration_interval_days: 365,
                  last_calibrated_at: new Date().toISOString().slice(0, 10),
                  calibration_cert_no: '',
                  status: 'active',
                });
                setGaugeModal({ isEdit: false });
              }}
            >
              + Add Instrument
            </button>
          </div>

          {gaugesLoading ? (
            <p className="muted">Loading instruments…</p>
          ) : gauges.length === 0 ? (
            <p className="muted">No instruments found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="log-table" style={{ width: '100%', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Instrument Name</th>
                    <th>Type &amp; Range</th>
                    <th>Accuracy</th>
                    <th>Location</th>
                    <th>Last Calibrated</th>
                    <th>Next Due / Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gauges.map((g) => {
                    const isOverdue = g.calib_status === 'overdue' || g.calibration_status === 'OVERDUE';
                    const isDueSoon = g.calib_status === 'due_soon' || g.calibration_status === 'DUE_SOON';
                    const badgeColor = isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#10b981';
                    const badgeText = isOverdue ? '🔴 Overdue' : isDueSoon ? '🟡 Due Soon' : '🟢 Valid';

                    return (
                      <tr key={g.id}>
                        <td style={{ fontWeight: 700, color: 'var(--amber)' }}>{g.gauge_code}</td>
                        <td>
                          <strong>{g.gauge_name}</strong>
                          {g.calibration_cert_no && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Cert: {g.calibration_cert_no}</div>}
                        </td>
                        <td>{g.gauge_type} {g.range_spec ? `(${g.range_spec})` : ''}</td>
                        <td>{g.accuracy || '—'}</td>
                        <td>{g.location || 'QA Lab'}</td>
                        <td>{g.last_calibrated_at ? new Date(g.last_calibrated_at).toLocaleDateString() : 'Never'}</td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 10,
                              fontSize: 10,
                              fontWeight: 700,
                              background: `${badgeColor}22`,
                              color: badgeColor,
                              border: `1px solid ${badgeColor}`,
                            }}
                          >
                            {badgeText} {g.days_remaining != null ? `(${g.days_remaining}d)` : ''}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: 11, width: 'auto', display: 'inline-block', marginRight: 6 }}
                            onClick={() => {
                              setGaugeForm({
                                gauge_code: g.gauge_code,
                                gauge_name: g.gauge_name,
                                gauge_type: g.gauge_type || '',
                                range_spec: g.range_spec || '',
                                accuracy: g.accuracy || '',
                                location: g.location || '',
                                calibration_interval_days: g.calibration_interval_days || 365,
                                last_calibrated_at: g.last_calibrated_at ? String(g.last_calibrated_at).slice(0, 10) : '',
                                calibration_cert_no: g.calibration_cert_no || '',
                                status: g.status || 'active',
                              });
                              setGaugeModal({ isEdit: true, data: g });
                            }}
                          >
                            ✏️ Edit
                          </button>
                          {user.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteGauge(g)}
                              style={{ padding: '3px 8px', fontSize: 11, width: 'auto', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 4, cursor: 'pointer' }}
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add / Edit Gauge Modal */}
          {gaugeModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
              <div className="panel" style={{ width: '100%', maxWidth: 480, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>
                  {gaugeModal.isEdit ? '✏️ Edit Instrument' : '➕ Register New Instrument'}
                </h3>
                <form onSubmit={handleSaveGauge} style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Gauge Code *</label>
                      <input
                        required
                        value={gaugeForm.gauge_code}
                        onChange={(e) => setGaugeForm({ ...gaugeForm, gauge_code: e.target.value })}
                        placeholder="e.g. VC-01"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Instrument Name *</label>
                      <input
                        required
                        value={gaugeForm.gauge_name}
                        onChange={(e) => setGaugeForm({ ...gaugeForm, gauge_name: e.target.value })}
                        placeholder="e.g. Digital Vernier Caliper 150mm"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Type</label>
                      <input
                        value={gaugeForm.gauge_type}
                        onChange={(e) => setGaugeForm({ ...gaugeForm, gauge_type: e.target.value })}
                        placeholder="Vernier / Micrometer / Scale"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Range Spec</label>
                      <input
                        value={gaugeForm.range_spec}
                        onChange={(e) => setGaugeForm({ ...gaugeForm, range_spec: e.target.value })}
                        placeholder="e.g. 0-150mm"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Accuracy</label>
                      <input
                        value={gaugeForm.accuracy}
                        onChange={(e) => setGaugeForm({ ...gaugeForm, accuracy: e.target.value })}
                        placeholder="e.g. ±0.01mm"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Location</label>
                      <input
                        value={gaugeForm.location}
                        onChange={(e) => setGaugeForm({ ...gaugeForm, location: e.target.value })}
                        placeholder="e.g. QA Inspection Lab"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Calib Interval (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={gaugeForm.calibration_interval_days}
                        onChange={(e) => setGaugeForm({ ...gaugeForm, calibration_interval_days: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Last Calibrated Date</label>
                      <input
                        type="date"
                        value={gaugeForm.last_calibrated_at}
                        onChange={(e) => setGaugeForm({ ...gaugeForm, last_calibrated_at: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700 }}>Calibration Certificate No.</label>
                    <input
                      value={gaugeForm.calibration_cert_no}
                      onChange={(e) => setGaugeForm({ ...gaugeForm, calibration_cert_no: e.target.value })}
                      placeholder="e.g. CAL-2026-081"
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                    <button type="button" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => setGaugeModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>
                      Save Instrument
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SUPPLIERS & VENDORS MASTER */}
      {activeTab === 'suppliers' && (
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <input
              type="text"
              placeholder="🔍 Search supplier, GSTIN, materials..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              style={{ width: 280, padding: '8px 12px', fontSize: 13, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text)' }}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '7px 14px', fontSize: 12 }}
              onClick={() => {
                setSupplierForm({
                  supplier_code: '',
                  supplier_name: '',
                  gstin: '',
                  pan_no: '',
                  contact_person: '',
                  phone: '',
                  email: '',
                  address: '',
                  city: 'Hosur',
                  state: 'Tamil Nadu',
                  pincode: '',
                  materials_supplied: '',
                  payment_terms: '30 Days',
                  lead_time_days: 7,
                  vendor_rating: 100,
                  iso_iatf_certified: true,
                  active: true,
                });
                setSupplierModal({ isEdit: false });
              }}
            >
              + Add Supplier / Vendor
            </button>
          </div>

          {suppliersLoading ? (
            <p className="muted">Loading suppliers…</p>
          ) : suppliers.length === 0 ? (
            <p className="muted">No suppliers registered.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="log-table" style={{ width: '100%', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Supplier / Company</th>
                    <th>GSTIN &amp; PAN</th>
                    <th>Contact &amp; Phone</th>
                    <th>Materials Supplied</th>
                    <th>Terms &amp; Lead Time</th>
                    <th>IATF Quality</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers
                    .filter((s) => {
                      if (!supplierSearch.trim()) return true;
                      const q = supplierSearch.toLowerCase();
                      return (
                        (s.supplier_code || '').toLowerCase().includes(q) ||
                        (s.supplier_name || '').toLowerCase().includes(q) ||
                        (s.gstin || '').toLowerCase().includes(q) ||
                        (s.materials_supplied || '').toLowerCase().includes(q)
                      );
                    })
                    .map((s) => (
                      <tr key={s.id} style={{ opacity: s.active === false ? 0.6 : 1 }}>
                        <td style={{ fontWeight: 700, color: 'var(--amber)' }}>{s.supplier_code}</td>
                        <td>
                          <strong>{s.supplier_name}</strong>
                          {(s.city || s.state) && (
                            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                              {[s.city, s.state, s.pincode].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </td>
                        <td>
                          <div>{s.gstin ? <span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{s.gstin}</span> : '—'}</div>
                          {s.pan_no && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>PAN: {s.pan_no}</div>}
                        </td>
                        <td>
                          <div>{s.contact_person || '—'}</div>
                          {s.phone && <a href={`tel:${s.phone}`} style={{ fontSize: 11, color: '#38bdf8' }}>{s.phone}</a>}
                        </td>
                        <td>{s.materials_supplied || 'Polymer / Pigments'}</td>
                        <td>
                          <div>{s.payment_terms || '30 Days'}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Lead: {s.lead_time_days || 7} days</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#34d399' }}>
                            Score: {s.vendor_rating || 100}%
                          </div>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 9,
                              fontWeight: 700,
                              background: s.iso_iatf_certified !== false ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                              color: s.iso_iatf_certified !== false ? '#34d399' : 'var(--text-muted)',
                              border: `1px solid ${s.iso_iatf_certified !== false ? '#10b981' : 'var(--line)'}`,
                            }}
                          >
                            {s.iso_iatf_certified !== false ? 'IATF/ISO Certified' : 'Uncertified'}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: s.active !== false ? '#34d399' : '#f87171', fontWeight: 700 }}>
                            {s.active !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: 11, width: 'auto', display: 'inline-block', marginRight: 6 }}
                            onClick={() => {
                              setSupplierForm({
                                supplier_code: s.supplier_code,
                                supplier_name: s.supplier_name,
                                gstin: s.gstin || '',
                                pan_no: s.pan_no || '',
                                contact_person: s.contact_person || '',
                                phone: s.phone || '',
                                email: s.email || '',
                                address: s.address || '',
                                city: s.city || 'Hosur',
                                state: s.state || 'Tamil Nadu',
                                pincode: s.pincode || '',
                                materials_supplied: s.materials_supplied || '',
                                payment_terms: s.payment_terms || '30 Days',
                                lead_time_days: s.lead_time_days || 7,
                                vendor_rating: s.vendor_rating || 100,
                                iso_iatf_certified: s.iso_iatf_certified !== false,
                                active: s.active !== false,
                              });
                              setSupplierModal({ isEdit: true, data: s });
                            }}
                          >
                            ✏️ Edit
                          </button>
                          {user.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSupplier(s)}
                              style={{ padding: '3px 8px', fontSize: 11, width: 'auto', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 4, cursor: 'pointer' }}
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Supplier Modal */}
          {supplierModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
              <div className="panel" style={{ width: '100%', maxWidth: 540, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 20, maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>
                  {supplierModal.isEdit ? '✏️ Edit Supplier / Vendor' : '➕ Register Supplier / Vendor Master'}
                </h3>
                <form onSubmit={handleSaveSupplier} style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Vendor Code *</label>
                      <input
                        required
                        value={supplierForm.supplier_code}
                        onChange={(e) => setSupplierForm({ ...supplierForm, supplier_code: e.target.value })}
                        placeholder="e.g. SUP-05"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Company Name *</label>
                      <input
                        required
                        value={supplierForm.supplier_name}
                        onChange={(e) => setSupplierForm({ ...supplierForm, supplier_name: e.target.value })}
                        placeholder="e.g. Supreme Polymers Ltd"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>GSTIN (GST Number)</label>
                      <input
                        value={supplierForm.gstin}
                        onChange={(e) => setSupplierForm({ ...supplierForm, gstin: e.target.value.toUpperCase() })}
                        placeholder="33AAAAA0000A1Z5"
                        maxLength={15}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>PAN Number</label>
                      <input
                        value={supplierForm.pan_no}
                        onChange={(e) => setSupplierForm({ ...supplierForm, pan_no: e.target.value.toUpperCase() })}
                        placeholder="AAAAA0000A"
                        maxLength={10}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Contact Person</label>
                      <input
                        value={supplierForm.contact_person}
                        onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                        placeholder="Key contact"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Phone / Mobile</label>
                      <input
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                        placeholder="+91..."
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Email</label>
                      <input
                        type="email"
                        value={supplierForm.email}
                        onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                        placeholder="sales@vendor.com"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700 }}>Office / Plant Address</label>
                    <input
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                      placeholder="Plot No, Industrial Area, SIPCOT"
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>City</label>
                      <input
                        value={supplierForm.city}
                        onChange={(e) => setSupplierForm({ ...supplierForm, city: e.target.value })}
                        placeholder="e.g. Hosur"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>State</label>
                      <input
                        value={supplierForm.state}
                        onChange={(e) => setSupplierForm({ ...supplierForm, state: e.target.value })}
                        placeholder="Tamil Nadu"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Pincode</label>
                      <input
                        value={supplierForm.pincode}
                        onChange={(e) => setSupplierForm({ ...supplierForm, pincode: e.target.value })}
                        placeholder="635126"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Materials Supplied</label>
                      <input
                        value={supplierForm.materials_supplied}
                        onChange={(e) => setSupplierForm({ ...supplierForm, materials_supplied: e.target.value })}
                        placeholder="e.g. PA66 Natural, Black MB"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Payment Terms</label>
                      <input
                        value={supplierForm.payment_terms}
                        onChange={(e) => setSupplierForm({ ...supplierForm, payment_terms: e.target.value })}
                        placeholder="30 Days"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Lead Time (Days)</label>
                      <input
                        type="number"
                        value={supplierForm.lead_time_days}
                        onChange={(e) => setSupplierForm({ ...supplierForm, lead_time_days: e.target.value })}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 4 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={supplierForm.iso_iatf_certified}
                        onChange={(e) => setSupplierForm({ ...supplierForm, iso_iatf_certified: e.target.checked })}
                      />
                      ISO / IATF 16949 Certified
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={supplierForm.active}
                        onChange={(e) => setSupplierForm({ ...supplierForm, active: e.target.checked })}
                      />
                      Active Vendor
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                    <button type="button" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => setSupplierModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>
                      Save Supplier
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CUSTOMERS MASTER */}
      {activeTab === 'customers' && (
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <input
              type="text"
              placeholder="🔍 Search customer name, GSTIN, code..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              style={{ width: 280, padding: '8px 12px', fontSize: 13, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text)' }}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '7px 14px', fontSize: 12 }}
              onClick={() => {
                setCustomerForm({
                  customer_code: '',
                  name: '',
                  gstin: '',
                  pan_no: '',
                  contact_person: '',
                  phone: '',
                  email: '',
                  address: '',
                  city: 'Hosur',
                  state: 'Tamil Nadu',
                  pincode: '',
                  payment_terms: '30 Days',
                  active: true,
                });
                setCustomerModal({ isEdit: false });
              }}
            >
              + Add Customer Master
            </button>
          </div>

          {customersLoading ? (
            <p className="muted">Loading customers…</p>
          ) : customers.length === 0 ? (
            <p className="muted">No customers registered.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {customers
                .filter((c) => {
                  if (!customerSearch.trim()) return true;
                  const q = customerSearch.toLowerCase();
                  return (
                    (c.customer_name || c.name || '').toLowerCase().includes(q) ||
                    (c.customer_code || '').toLowerCase().includes(q) ||
                    (c.gstin || '').toLowerCase().includes(q)
                  );
                })
                .map((c, i) => {
                  const isExpanded = expandedCustomerId === (c.id || i);
                  const activeParts = c.active_parts_count != null ? c.active_parts_count : parts.filter((p) => (p.customer_name || '').toLowerCase() === (c.name || '').toLowerCase()).length;
                  const custCode = c.customer_code || `CUST-${String(c.id || i + 1).padStart(3, '0')}`;
                  const custName = c.name || c.customer_name;
                  const location = [c.city, c.state].filter(Boolean).join(', ') || 'Tamil Nadu';

                  return (
                    <div
                      key={c.id || i}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        opacity: c.active === false ? 0.6 : 1,
                      }}
                    >
                      {/* Top Row: Customer Code + Name + Edit/Delete */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, color: 'var(--amber)', fontSize: 13 }}>
                              {custCode}
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {custName}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            📍 {location} · <span style={{ color: c.active !== false ? '#34d399' : '#f87171', fontWeight: 600 }}>{c.active !== false ? 'Active' : 'Inactive'}</span> · <strong style={{ color: 'var(--amber)' }}>{activeParts} parts</strong>
                          </div>
                        </div>

                        {/* Action buttons — Always visible on right, no scrolling needed! */}
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: 11, width: 'auto' }}
                            onClick={() => {
                              setCustomerForm({
                                customer_code: c.customer_code || '',
                                name: c.name || c.customer_name || '',
                                gstin: c.gstin || '',
                                pan_no: c.pan_no || '',
                                contact_person: c.contact_person || '',
                                phone: c.phone || '',
                                email: c.email || '',
                                address: c.address || '',
                                city: c.city || 'Hosur',
                                state: c.state || 'Tamil Nadu',
                                pincode: c.pincode || '',
                                payment_terms: c.payment_terms || '30 Days',
                                active: c.active !== false,
                              });
                              setCustomerModal({ isEdit: true, data: c });
                            }}
                          >
                            ✏️ Edit
                          </button>
                          {user.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomer(c)}
                              style={{ padding: '3px 7px', fontSize: 11, width: 'auto', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 4, cursor: 'pointer' }}
                              title="Delete Customer"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expand/Collapse Toggle */}
                      <button
                        type="button"
                        onClick={() => setExpandedCustomerId(isExpanded ? null : (c.id || i))}
                        style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: 11, cursor: 'pointer', textAlign: 'left', padding: 0, fontWeight: 600, marginTop: 2 }}
                      >
                        {isExpanded ? '▲ Hide details' : '▼ More details (GSTIN, Contact, Terms)'}
                      </button>

                      {/* Expanded details section */}
                      {isExpanded && (
                        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '8px 10px', fontSize: 11, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px', color: 'var(--text-muted)', borderTop: '1px solid var(--line)', marginTop: 4 }}>
                          <div>GSTIN: <strong style={{ color: '#38bdf8', fontFamily: 'monospace' }}>{c.gstin || '—'}</strong></div>
                          <div>PAN: <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{c.pan_no || '—'}</strong></div>
                          <div>Contact: <strong style={{ color: 'var(--text)' }}>{c.contact_person || '—'}</strong></div>
                          <div>Phone: {c.phone ? <a href={`tel:${c.phone}`} style={{ color: '#38bdf8' }}>{c.phone}</a> : '—'}</div>
                          <div>Terms: <strong style={{ color: 'var(--text)' }}>{c.payment_terms || '30 Days'}</strong></div>
                          <div>Email: <strong style={{ color: 'var(--text)' }}>{c.email || '—'}</strong></div>
                          {c.address && <div style={{ gridColumn: 'span 2' }}>Address: <span style={{ color: 'var(--text)' }}>{c.address}</span></div>}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Customer Modal */}
          {customerModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
              <div className="panel" style={{ width: '100%', maxWidth: 540, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 20, maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>
                  {customerModal.isEdit ? '✏️ Edit Customer Master' : '➕ Register Customer Master'}
                </h3>
                <form onSubmit={handleSaveCustomer} style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Customer Code *</label>
                      <input
                        required
                        value={customerForm.customer_code}
                        onChange={(e) => setCustomerForm({ ...customerForm, customer_code: e.target.value })}
                        placeholder="e.g. CUST-01"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Customer / Company Name *</label>
                      <input
                        required
                        value={customerForm.name}
                        onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                        placeholder="e.g. Motherson Automotive Ltd"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>GSTIN (GST Number)</label>
                      <input
                        value={customerForm.gstin}
                        onChange={(e) => setCustomerForm({ ...customerForm, gstin: e.target.value.toUpperCase() })}
                        placeholder="33AAAAA0000A1Z5"
                        maxLength={15}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>PAN Number</label>
                      <input
                        value={customerForm.pan_no}
                        onChange={(e) => setCustomerForm({ ...customerForm, pan_no: e.target.value.toUpperCase() })}
                        placeholder="AAAAA0000A"
                        maxLength={10}
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontFamily: 'monospace' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Contact Person</label>
                      <input
                        value={customerForm.contact_person}
                        onChange={(e) => setCustomerForm({ ...customerForm, contact_person: e.target.value })}
                        placeholder="Buyer / Manager"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Phone / Mobile</label>
                      <input
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        placeholder="+91..."
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Email</label>
                      <input
                        type="email"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        placeholder="purchase@client.com"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700 }}>Factory / Office Address</label>
                    <input
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      placeholder="Plot No, SIPCOT Industrial Park"
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>City</label>
                      <input
                        value={customerForm.city}
                        onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                        placeholder="Hosur"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>State</label>
                      <input
                        value={customerForm.state}
                        onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                        placeholder="Tamil Nadu"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Pincode</label>
                      <input
                        value={customerForm.pincode}
                        onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value })}
                        placeholder="635126"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Payment Terms</label>
                      <input
                        value={customerForm.payment_terms}
                        onChange={(e) => setCustomerForm({ ...customerForm, payment_terms: e.target.value })}
                        placeholder="e.g. 30 Days / 45 Days / Advance"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', paddingTop: 16 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={customerForm.active}
                          onChange={(e) => setCustomerForm({ ...customerForm, active: e.target.checked })}
                        />
                        Active Customer
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                    <button type="button" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => setCustomerModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>
                      Save Customer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: MACHINES TPM */}
      {activeTab === 'machines' && (
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Injection Moulding Machines Fleet</h3>
            <Link to="/machines" className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}>
              Open Full Machines TPM Dashboard →
            </Link>
          </div>

          {machinesLoading ? (
            <p className="muted">Loading machines…</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {machines.map((m) => (
                <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: 8, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--amber)' }}>{m.machine_code}</span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontSize: 10,
                        fontWeight: 700,
                        background: m.status === 'RUNNING' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                        color: m.status === 'RUNNING' ? '#34d399' : '#fbbf24',
                        border: `1px solid ${m.status === 'RUNNING' ? '#10b981' : '#f59e0b'}`,
                      }}
                    >
                      {m.status || 'AVAILABLE'}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    {m.tonnage ? `${m.tonnage} Ton` : '150 Ton'} · {m.make || 'Injection Machine'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary, #aaa)' }}>
                    Active Mould: <strong style={{ color: 'var(--text)' }}>{m.active_mould_code || 'None'}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: MOULDS & TOOL LIFE (WITH LIVE SHOT COUNTER & PM TRIGGER) */}
      {activeTab === 'moulds' && (
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Moulds Tool Life &amp; Automatic PM Counter</h3>
              <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                Real-time cumulative shot counter with stroke-wear PM threshold alerts
              </p>
            </div>
            <Link to="/moulds" className="btn btn-secondary" style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}>
              Open Full Tooling Dashboard →
            </Link>
          </div>

          {mouldsLoading ? (
            <p className="muted">Loading moulds…</p>
          ) : moulds.length === 0 ? (
            <p className="muted">No moulds registered.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
              {moulds.map((m) => {
                const target = m.pm_interval_shots || m.pm_shot_target || 20000;
                const sincePm = m.shots_since_pm || 0;
                const pct = Math.min(100, Math.round((sincePm / target) * 100));
                const isOverdue = sincePm >= target;
                const isNearDue = pct >= 80;
                const barColor = isOverdue ? '#ef4444' : isNearDue ? '#f59e0b' : '#10b981';

                return (
                  <div
                    key={m.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isOverdue ? '#ef4444' : isNearDue ? '#f59e0b' : 'var(--line)'}`,
                      borderRadius: 8,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--amber)' }}>{m.mould_code}</span>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 10,
                          fontSize: 10,
                          fontWeight: 700,
                          background: `${barColor}22`,
                          color: barColor,
                          border: `1px solid ${barColor}`,
                        }}
                      >
                        {isOverdue ? '🔴 PM OVERDUE' : isNearDue ? '🟡 PM DUE SOON' : '🟢 HEALTHY'}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                      {m.mould_name || 'Standard Mould'}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Since Last PM:</span>
                        <strong style={{ color: barColor }}>{sincePm.toLocaleString()} / {target.toLocaleString()} shots ({pct}%)</strong>
                      </div>
                      <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: barColor, transition: 'width 0.3s ease' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                      <span>Lifetime Shots: <strong style={{ color: 'var(--text)' }}>{(m.cumulative_shots || 0).toLocaleString()}</strong></span>
                      <span>Cavities: <strong style={{ color: 'var(--text)' }}>{m.total_cavities || m.cavities || 1}</strong></span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '7px 0', fontSize: 12, fontWeight: 700 }}
                      onClick={() => {
                        setPmForm({ action_type: 'pm_service', technician_name: user.full_name || '', description: 'Periodic Preventive Maintenance completed.' });
                        setPmModal(m);
                      }}
                    >
                      🔧 Log PM &amp; Reset Counter
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* PM Modal */}
          {pmModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
              <div className="panel" style={{ width: '100%', maxWidth: 440, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>
                  🔧 Log Mould PM: {pmModal.mould_code}
                </h3>
                <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                  Logging PM will reset the &quot;shots since PM&quot; counter to 0 and record this action in tooling audit history.
                </p>
                <form onSubmit={handleLogPm} style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700 }}>Action Type</label>
                    <select
                      value={pmForm.action_type}
                      onChange={(e) => setPmForm({ ...pmForm, action_type: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                    >
                      <option value="pm_service">Preventive Maintenance (PM)</option>
                      <option value="repair">Breakdown Repair</option>
                      <option value="inspection">Tooling Inspection</option>
                      <option value="polishing">Cavity Polishing</option>
                      <option value="overhaul">Complete Overhaul</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700 }}>Technician / Supervisor *</label>
                    <input
                      required
                      value={pmForm.technician_name}
                      onChange={(e) => setPmForm({ ...pmForm, technician_name: e.target.value })}
                      placeholder="Technician name"
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700 }}>Work Description / Notes</label>
                    <textarea
                      rows={3}
                      value={pmForm.description}
                      onChange={(e) => setPmForm({ ...pmForm, description: e.target.value })}
                      placeholder="Details of cleaning, seal replacement, runner polishing..."
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                    <button type="button" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => setPmModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>
                      Submit &amp; Reset PM
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: DEFAULTS & QUALITY CHECKSHEETS */}
      {activeTab === 'defaults' && (
        <div className="panel" style={{ padding: 16 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>IATF Quality Checksheet Items &amp; Standard Codes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Checksheet items */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid var(--line)' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--amber)' }}>📋 Shift Checksheet Items</h4>
              {checkItems.length === 0 ? (
                <p className="muted" style={{ fontSize: 12 }}>Standard 7 IATF Checksheet Points active.</p>
              ) : (
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, lineHeight: 1.8 }}>
                  {checkItems.map((ci, i) => (
                    <li key={ci.id || i}>{ci.item_name || ci.check_point || ci.name || String(ci.id || i + 1)}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Standard Reject Reasons */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid var(--line)' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#f87171' }}>🚫 Standard Reject Reasons</h4>
              {rejectReasons.length === 0 ? (
                <p className="muted" style={{ fontSize: 12 }}>Short Shot, Flash, Silver Streak, Sink Mark, Flow Lines, Burn Mark, Warpage.</p>
              ) : (
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, lineHeight: 1.8 }}>
                  {rejectReasons.map((rr, i) => (
                    <li key={rr.id || i}>{rr.item_name || rr.reason || rr.name || String(rr.code || i + 1)}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Downtime breakdown reasons */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 14, borderRadius: 8, border: '1px solid var(--line)' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#fbbf24' }}>⏱️ Downtime Breakdown Reasons</h4>
              {downtimeReasons.length === 0 ? (
                <p className="muted" style={{ fontSize: 12 }}>Mould Change, Heater Breakdown, Hydraulic Leak, No Raw Material, Power Cut.</p>
              ) : (
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, lineHeight: 1.8 }}>
                  {downtimeReasons.map((dr, i) => (
                    <li key={dr.id || i}>{dr.item_name || dr.reason || dr.name || String(dr.code || i + 1)}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
