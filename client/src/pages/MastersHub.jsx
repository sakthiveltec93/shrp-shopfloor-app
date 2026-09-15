import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

const TABS = [
  { key: 'parts', label: '📋 Parts Master', icon: '📋' },
  { key: 'raw_materials', label: '🧪 Raw Materials', icon: '🧪' },
  { key: 'gauges', label: '📏 Gauges & Instruments', icon: '📏' },
  { key: 'suppliers', label: '🏭 Suppliers & Vendors', icon: '🏭' },
  { key: 'customers', label: '🏢 Customers Master', icon: '🏢' },
  { key: 'machines', label: '🖥️ Machines TPM', icon: '🖥️' },
  { key: 'moulds', label: '⚙️ Moulds & Tool Life', icon: '⚙️' },
  { key: 'defaults', label: '📑 Checksheets & Defaults', icon: '📑' },
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
  const [recipes, setRecipes] = useState([]);
  const [rmSearch, setRmSearch] = useState('');

  // 3. GAUGES STATE
  const [gauges, setGauges] = useState([]);
  const [gaugesLoading, setGaugesLoading] = useState(false);
  const [gaugeSummary, setGaugeSummary] = useState(null);
  const [gaugeModal, setGaugeModal] = useState(null);
  const [gaugeForm, setGaugeForm] = useState({
    gauge_code: '', gauge_name: '', gauge_type: 'Vernier', range_spec: '',
    accuracy: '', location: '', calibration_interval_days: 365,
    last_calibrated_at: '', calibration_cert_no: '', status: 'active',
  });

  // 4. SUPPLIERS STATE
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [supplierModal, setSupplierModal] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    supplier_code: '', supplier_name: '', contact_person: '', phone: '',
    email: '', address: '', materials_supplied: '', payment_terms: '',
    lead_time_days: 7, active: true,
  });

  // 5. CUSTOMERS STATE
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // 6. MACHINES STATE
  const [machines, setMachines] = useState([]);
  const [machinesLoading, setMachinesLoading] = useState(false);

  // 7. MOULDS STATE
  const [moulds, setMoulds] = useState([]);
  const [mouldsLoading, setMouldsLoading] = useState(false);
  const [pmModal, setPmModal] = useState(null);
  const [pmForm, setPmForm] = useState({ action_type: 'PM', technician_name: '', description: '' });

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
    Promise.all([
      api.rawMaterials?.list ? api.rawMaterials.list() : Promise.resolve([]),
      api.rawMaterials?.recipes ? api.rawMaterials.recipes() : Promise.resolve([])
    ])
      .then(([m, r]) => { setMaterials(m || []); setRecipes(r || []); })
      .catch((e) => setError(e.message))
      .finally(() => setMaterialsLoading(false));
  };

  const loadGauges = () => {
    setGaugesLoading(true);
    Promise.all([
      api.gauges?.list ? api.gauges.list('all') : Promise.resolve([]),
      api.gauges?.calibrationSummary ? api.gauges.calibrationSummary() : Promise.resolve(null)
    ])
      .then(([gList, gSum]) => { setGauges(gList || []); setGaugeSummary(gSum); })
      .catch((e) => setError(e.message))
      .finally(() => setGaugesLoading(false));
  };

  const loadSuppliers = () => {
    setSuppliersLoading(true);
    if (api.suppliers?.list) {
      api.suppliers.list('all')
        .then(setSuppliers)
        .catch((e) => setError(e.message))
        .finally(() => setSuppliersLoading(false));
    } else {
      setSuppliersLoading(false);
    }
  };

  const loadCustomers = () => {
    setCustomersLoading(true);
    api.customers()
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
      api.checkSheetItems ? api.checkSheetItems() : Promise.resolve([]),
      api.checkItems ? api.checkItems('reject_reason') : Promise.resolve([]),
      api.checkItems ? api.checkItems('downtime_reason') : Promise.resolve([])
    ])
      .then(([ci, rr, dr]) => { setCheckItems(ci || []); setRejectReasons(rr || []); setDowntimeReasons(dr || []); })
      .catch((e) => setError(e.message));
  };

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

  const handleLogPm = async (e) => {
    e.preventDefault();
    if (!pmModal) return;
    setError('');
    try {
      await api.moulds.logMaintenance(pmModal.id, pmForm);
      setSuccess(`✅ PM logged for mould '${pmModal.mould_code}'! Counter reset.`);
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
      (p.customer_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="screen" style={{ paddingBottom: 32 }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(0, 0, 0, 0.4))',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderLeft: '4px solid var(--amber)',
          borderRadius: 8,
          padding: '14px 18px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            IATF-16949 Master Data Center
          </div>
          <h1 style={{ margin: '2px 0 0', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
            🗂️ Item &amp; Masters Hub
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Centralized repository for parts, raw materials, gauges, tooling, vendors &amp; quality checksheets
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--line)', color: 'var(--text-muted)' }}>
            🔒 Supervisor &amp; Admin Gated
          </span>
        </div>
      </div>

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
        {TABS.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => handleTabChange(t.key)}
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
              <span>{t.icon}</span>
              <span>{t.label}</span>
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
                placeholder="🔍 Search part code, name, customer..."
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
                  {filteredParts.map((p) => (
                    <tr key={p.id} style={{ opacity: p.active === false ? 0.6 : 1 }}>
                      <td style={{ fontWeight: 700, color: 'var(--amber)' }}>
                        {p.shrp_part_code || p.part_code}
                      </td>
                      <td>
                        <strong>{p.part_name}</strong>
                        {p.drawing_number && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Dwg: {p.drawing_number}</div>}
                      </td>
                      <td>{p.customer_name || '—'}</td>
                      <td>
                        {p.mould_code ? (
                          <span style={{ color: '#38bdf8' }}>{p.mould_code} ({p.cavity_count || 1} cav)</span>
                        ) : (
                          <span className="muted">No mould linked</span>
                        )}
                      </td>
                      <td>{p.cycle_time_seconds ? `${p.cycle_time_seconds}s` : '—'}</td>
                      <td>
                        {p.net_weight_grams ? `${p.net_weight_grams}g` : '—'} / {p.gross_weight_grams ? `${p.gross_weight_grams}g` : '—'}
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
                  ))}
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
              placeholder="🔍 Search materials..."
              value={rmSearch}
              onChange={(e) => setRmSearch(e.target.value)}
              style={{ width: 280, padding: '8px 12px', fontSize: 13, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text)' }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/rm-inward" className="btn btn-primary" style={{ width: 'auto', padding: '8px 14px', fontSize: 12 }}>
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
                    <th>Grade / Spec</th>
                    <th>Supplier</th>
                    <th>Density (g/cm³)</th>
                    <th>Drying Temp / Time</th>
                    <th>Virgin / Regrind Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {materials
                    .filter((m) => !rmSearch.trim() || (m.material_name || '').toLowerCase().includes(rmSearch.toLowerCase()) || (m.grade || '').toLowerCase().includes(rmSearch.toLowerCase()))
                    .map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 700, color: 'var(--amber)' }}>{m.material_code || m.code || `RM-${m.id}`}</td>
                        <td>
                          <strong>{m.material_name || m.name}</strong>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.grade || 'Standard Grade'}</div>
                        </td>
                        <td>{m.supplier_name || 'Standard Vendor'}</td>
                        <td>{m.density ? `${m.density} g/cm³` : '1.14 g/cm³'}</td>
                        <td>{m.drying_temp ? `${m.drying_temp}°C for ${m.drying_time_hrs || 4}h` : '80°C for 4 hrs'}</td>
                        <td>
                          <span style={{ color: '#34d399', fontWeight: 600 }}>{m.current_stock_kg || 0} kg</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
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
                  gauge_code: '', gauge_name: '', gauge_type: 'Vernier', range_spec: '',
                  accuracy: '', location: 'QA Inspection Lab', calibration_interval_days: 365,
                  last_calibrated_at: new Date().toISOString().slice(0, 10), calibration_cert_no: '', status: 'active',
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
                            style={{ padding: '3px 8px', fontSize: 11, width: 'auto' }}
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

      {/* TAB 4: SUPPLIERS MASTER */}
      {activeTab === 'suppliers' && (
        <div className="panel" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Suppliers &amp; Raw Material Vendors</h3>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '7px 14px', fontSize: 12 }}
              onClick={() => {
                setSupplierForm({
                  supplier_code: '', supplier_name: '', contact_person: '', phone: '',
                  email: '', address: '', materials_supplied: '', payment_terms: '30 Days',
                  lead_time_days: 7, active: true,
                });
                setSupplierModal({ isEdit: false });
              }}
            >
              + Add Supplier
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
                    <th>Contact &amp; Phone</th>
                    <th>Materials Supplied</th>
                    <th>Terms &amp; Lead Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: 'var(--amber)' }}>{s.supplier_code}</td>
                      <td>
                        <strong>{s.supplier_name}</strong>
                        {s.address && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.address}</div>}
                      </td>
                      <td>
                        <div>{s.contact_person || '—'}</div>
                        {s.phone && <a href={`tel:${s.phone}`} style={{ fontSize: 11, color: '#38bdf8' }}>{s.phone}</a>}
                      </td>
                      <td>{s.materials_supplied || 'Polymer / Pigments'}</td>
                      <td>{s.payment_terms || '30 Days'} ({s.lead_time_days || 7}d lead)</td>
                      <td>
                        <span style={{ color: s.active !== false ? '#34d399' : '#f87171', fontWeight: 700 }}>
                          {s.active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: 11, width: 'auto' }}
                          onClick={() => {
                            setSupplierForm({
                              supplier_code: s.supplier_code,
                              supplier_name: s.supplier_name,
                              contact_person: s.contact_person || '',
                              phone: s.phone || '',
                              email: s.email || '',
                              address: s.address || '',
                              materials_supplied: s.materials_supplied || '',
                              payment_terms: s.payment_terms || '',
                              lead_time_days: s.lead_time_days || 7,
                              active: s.active !== false,
                            });
                            setSupplierModal({ isEdit: true, data: s });
                          }}
                        >
                          ✏️ Edit
                        </button>
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
              <div className="panel" style={{ width: '100%', maxWidth: 480, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>
                  {supplierModal.isEdit ? '✏️ Edit Supplier' : '➕ Add Supplier'}
                </h3>
                <form onSubmit={handleSaveSupplier} style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Code *</label>
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
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Contact Person</label>
                      <input
                        value={supplierForm.contact_person}
                        onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                        placeholder="Name"
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Phone</label>
                      <input
                        value={supplierForm.phone}
                        onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                        placeholder="+91..."
                        style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700 }}>Materials Supplied</label>
                    <input
                      value={supplierForm.materials_supplied}
                      onChange={(e) => setSupplierForm({ ...supplierForm, materials_supplied: e.target.value })}
                      placeholder="e.g. PA66 Natural, Black Masterbatch"
                      style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                    />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <input
              type="text"
              placeholder="🔍 Search customers..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              style={{ width: 280, padding: '8px 12px', fontSize: 13, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', borderRadius: 6, color: 'var(--text)' }}
            />
          </div>

          {customersLoading ? (
            <p className="muted">Loading customers…</p>
          ) : customers.length === 0 ? (
            <p className="muted">No customers registered.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="log-table" style={{ width: '100%', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Code / Ref</th>
                    <th>Active Parts Linked</th>
                  </tr>
                </thead>
                <tbody>
                  {customers
                    .filter((c) => !customerSearch.trim() || (c.customer_name || c.name || '').toLowerCase().includes(customerSearch.toLowerCase()))
                    .map((c, i) => (
                      <tr key={c.id || i}>
                        <td style={{ fontWeight: 700, color: 'var(--text)' }}>{c.customer_name || c.name}</td>
                        <td>{c.customer_code || `CUST-${c.id || i + 1}`}</td>
                        <td>
                          <span style={{ color: 'var(--amber)', fontWeight: 700 }}>
                            {parts.filter((p) => (p.customer_name || '').toLowerCase() === (c.customer_name || c.name || '').toLowerCase()).length} parts
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
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
                const target = m.pm_shot_target || 50000;
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
                        setPmForm({ action_type: 'PM', technician_name: user.full_name || '', description: 'Periodic Preventive Maintenance completed.' });
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
                      <option value="PM">Preventive Maintenance (PM)</option>
                      <option value="BREAKDOWN">Breakdown Repair</option>
                      <option value="INSPECTION">Tooling Inspection</option>
                      <option value="POLISHING">Cavity Polishing</option>
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
                    <li key={i}>{ci.item_name || ci.name || ci}</li>
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
                    <li key={i}>{rr.reason || rr.name || rr}</li>
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
                    <li key={i}>{dr.reason || dr.name || dr}</li>
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
