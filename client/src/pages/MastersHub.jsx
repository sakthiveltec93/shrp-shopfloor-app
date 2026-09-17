import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedCheckItem } from '../i18n/checksheetTranslations';
import { isValidGSTIN, extractPanFromGSTIN } from '../utils/gstinValidator';

function formatGstAddress(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [
    addr.bno ? `Door ${addr.bno}` : '',
    addr.bnm,
    addr.st,
    addr.loc,
    addr.dst,
    addr.stcd,
    addr.pncd,
  ].filter(Boolean);
  return parts.join(', ');
}

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
  const { lang, t } = useLanguage();
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
  const [supplierGstVerifying, setSupplierGstVerifying] = useState(false);
  const [supplierGstResult, setSupplierGstResult] = useState(null);
  const [supplierGstError, setSupplierGstError] = useState('');
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
    gst_last_verified_at: null,
    gst_verification_status: null,
  });

  // 5. CUSTOMERS STATE
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerModal, setCustomerModal] = useState(null);
  const [customerGstVerifying, setCustomerGstVerifying] = useState(false);
  const [customerGstResult, setCustomerGstResult] = useState(null);
  const [customerGstError, setCustomerGstError] = useState('');
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
    gst_last_verified_at: null,
    gst_verification_status: null,
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
  const [expandedChecksheetSection, setExpandedChecksheetSection] = useState('shift'); // 'shift' | 'reject' | 'downtime' | null
  const [checkItemModal, setCheckItemModal] = useState(null); // { type: 'daily' | 'reject_reason' | 'downtime_reason', isEdit: boolean, data?: obj }
  const [checkItemForm, setCheckItemForm] = useState({
    item_name: '',
    category: 'reject_reason',
    code: '',
    default_disposition: 'SCRAP',
    related_to: 'MACHINE',
    local_label: '',
    specification: '',
    icon: '⚙️',
    sort_order: 0,
    active: true,
  });

  // Expandable card states for all tabs
  const [expandedPartId, setExpandedPartId] = useState(null);
  const [expandedRmId, setExpandedRmId] = useState(null);
  const [expandedGaugeId, setExpandedGaugeId] = useState(null);
  const [expandedSupplierId, setExpandedSupplierId] = useState(null);

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
      api.dailyCheckItems?.list ? api.dailyCheckItems.list().catch(() => []) : (api.checkSheetItems ? api.checkSheetItems().catch(() => []) : Promise.resolve([])),
      api.checkItems ? api.checkItems('reject_reason').catch(() => []) : Promise.resolve([]),
      api.checkItems ? api.checkItems('downtime_reason').catch(() => []) : Promise.resolve([]),
    ])
      .then(([ci, rr, dr]) => {
        setCheckItems(Array.isArray(ci) ? ci : (ci?.items || ci?.rows || []));
        setRejectReasons(Array.isArray(rr) ? rr : (rr?.items || rr?.rows || []));
        setDowntimeReasons(Array.isArray(dr) ? dr : (dr?.items || dr?.rows || []));
      })
      .catch((e) => setError(e.message));
  };

  // --- CHECKSHEET & REASON ACTIONS ---
  const handleSaveCheckItem = async (e) => {
    e.preventDefault();
    setError('');
    const { type, isEdit, data } = checkItemModal || {};
    try {
      if (type === 'daily') {
        if (isEdit) {
          await api.dailyCheckItems.update(data.id, {
            item_name: checkItemForm.item_name,
            local_label: checkItemForm.local_label,
            specification: checkItemForm.specification,
            icon: checkItemForm.icon,
            category: checkItemForm.related_to || 'MACHINE',
            sort_order: checkItemForm.sort_order,
            active: checkItemForm.active,
          });
          setSuccess(`✅ Shift check item '${checkItemForm.item_name}' updated.`);
        } else {
          await api.dailyCheckItems.create({
            item_name: checkItemForm.item_name,
            local_label: checkItemForm.local_label,
            specification: checkItemForm.specification,
            icon: checkItemForm.icon,
            category: checkItemForm.related_to || 'MACHINE',
            sort_order: checkItemForm.sort_order,
            active: checkItemForm.active,
          });
          setSuccess(`✅ Shift check item '${checkItemForm.item_name}' added.`);
        }
      } else {
        // reject_reason or downtime_reason
        if (isEdit) {
          await api.checkItems.update(data.id, {
            item_name: checkItemForm.item_name,
            category: type,
            code: checkItemForm.code,
            default_disposition: checkItemForm.default_disposition,
            related_to: checkItemForm.related_to,
          });
          setSuccess(`✅ Reason '${checkItemForm.item_name}' updated.`);
        } else {
          await api.checkItems.create({
            item_name: checkItemForm.item_name,
            category: type,
            code: checkItemForm.code,
            default_disposition: checkItemForm.default_disposition,
            related_to: checkItemForm.related_to,
          });
          setSuccess(`✅ Reason '${checkItemForm.item_name}' created.`);
        }
      }
      setCheckItemModal(null);
      loadDefaults();
    } catch (err) {
      setError(err.message || 'Failed to save item');
    }
  };

  const handleDeleteCheckItem = async (item, type) => {
    if (!window.confirm(`Are you sure you want to delete '${item.item_name || item.name}'?`)) return;
    try {
      if (type === 'daily') {
        await api.dailyCheckItems.delete(item.id);
      } else {
        await api.checkItems.delete(item.id);
      }
      setSuccess(`✅ Item '${item.item_name || item.name}' deleted.`);
      loadDefaults();
    } catch (err) {
      setError(err.message || 'Cannot delete item');
    }
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
  const handleVerifySupplierGST = async () => {
    if (!isValidGSTIN(supplierForm.gstin)) return;
    setSupplierGstVerifying(true);
    setSupplierGstError('');
    setSupplierGstResult(null);
    try {
      const data = await api.gst.verify(supplierForm.gstin);
      setSupplierGstResult(data);
      const status = data.sts || (data.status === 'Active' ? 'Active' : (data.status || 'Verified'));
      setSupplierForm((prev) => ({
        ...prev,
        gst_verification_status: status,
        gst_last_verified_at: new Date().toISOString(),
      }));
    } catch (err) {
      setSupplierGstError(err.message || 'GST verification failed');
    } finally {
      setSupplierGstVerifying(false);
    }
  };

  const handleAutofillSupplierFromGST = () => {
    if (!supplierGstResult) return;
    const r = supplierGstResult;
    const addrObj = r.pradr?.addr || r.pradr || {};
    const fullAddr = formatGstAddress(addrObj);
    const derivedPan = extractPanFromGSTIN(supplierForm.gstin);

    setSupplierForm((prev) => ({
      ...prev,
      supplier_name: r.tradeNam || r.lgnm || prev.supplier_name,
      pan_no: derivedPan || prev.pan_no,
      address: fullAddr || prev.address,
      city: addrObj.dst || addrObj.loc || prev.city,
      state: addrObj.stcd || prev.state,
      pincode: addrObj.pncd ? String(addrObj.pncd) : prev.pincode,
    }));
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
  const handleVerifyCustomerGST = async () => {
    if (!isValidGSTIN(customerForm.gstin)) return;
    setCustomerGstVerifying(true);
    setCustomerGstError('');
    setCustomerGstResult(null);
    try {
      const data = await api.gst.verify(customerForm.gstin);
      setCustomerGstResult(data);
      const status = data.sts || (data.status === 'Active' ? 'Active' : (data.status || 'Verified'));
      setCustomerForm((prev) => ({
        ...prev,
        gst_verification_status: status,
        gst_last_verified_at: new Date().toISOString(),
      }));
    } catch (err) {
      setCustomerGstError(err.message || 'GST verification failed');
    } finally {
      setCustomerGstVerifying(false);
    }
  };

  const handleAutofillCustomerFromGST = () => {
    if (!customerGstResult) return;
    const r = customerGstResult;
    const addrObj = r.pradr?.addr || r.pradr || {};
    const fullAddr = formatGstAddress(addrObj);
    const derivedPan = extractPanFromGSTIN(customerForm.gstin);

    setCustomerForm((prev) => ({
      ...prev,
      name: r.tradeNam || r.lgnm || prev.name,
      pan_no: derivedPan || prev.pan_no,
      address: fullAddr || prev.address,
      city: addrObj.dst || addrObj.loc || prev.city,
      state: addrObj.stcd || prev.state,
      pincode: addrObj.pncd ? String(addrObj.pncd) : prev.pincode,
    }));
  };

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

      {/* Tab Navigation Switcher — Dropdown + Wrapped Pills (No horizontal scrolling!) */}
      <div style={{ marginBottom: 16 }}>
        {/* Mobile quick dropdown */}
        <div style={{ marginBottom: 8 }}>
          <select
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 14,
              fontWeight: 700,
              background: 'var(--panel)',
              border: '1.5px solid var(--amber)',
              borderRadius: 8,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {TABS.map((tItem) => (
              <option key={tItem.key} value={tItem.key}>
                {tItem.icon} {tItem.label} Master
              </option>
            ))}
          </select>
        </div>

        {/* Wrapped flex pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            paddingBottom: 8,
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
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 6,
                  border: isActive ? '1px solid var(--amber)' : '1px solid var(--line)',
                  background: isActive ? 'var(--amber)' : 'var(--panel)',
                  color: isActive ? '#1c1500' : 'var(--text-muted)',
                  cursor: 'pointer',
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
              {filteredParts.map((p) => {
                const isExpanded = expandedPartId === p.id;
                const cycleTime = p.standard_cycle_time_sec || p.cycle_time_seconds;
                const netWt = p.unit_weight_g || p.net_weight_grams;
                const grossWt = p.part_weight_g || p.gross_weight_grams;
                const mouldInfo = p.mould_code
                  ? `${p.mould_code} (${p.cavities_for_part || p.cavity_count || 1} cav)`
                  : (p.cavity_count ? `${p.cavity_count} cav` : '—');

                return (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      opacity: p.active === false ? 0.6 : 1,
                    }}
                  >
                    {/* Top Row: Part Code + Part Name + Edit/Delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, color: 'var(--amber)', fontSize: 13 }}>
                            {p.shrp_part_code || p.part_code}
                          </span>
                          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.part_name}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          🏢 {p.customer_name || 'Internal / Direct'} · <span style={{ color: p.active !== false ? '#34d399' : '#f87171', fontWeight: 600 }}>{p.active !== false ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>

                      {/* Action buttons — Always visible on right */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <Link
                          to={`/parts/${p.id}/edit`}
                          className="btn btn-secondary"
                          style={{ padding: '3px 8px', fontSize: 11, width: 'auto' }}
                        >
                          ✏️ Edit
                        </Link>
                        {user.role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeletePart(p)}
                            style={{
                              padding: '3px 8px',
                              fontSize: 11,
                              width: 'auto',
                              background: 'rgba(239,68,68,0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.4)',
                              borderRadius: 4,
                              cursor: 'pointer',
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chips Row: Mould, Cavities, Cycle, Wt */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
                      <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#38bdf8' }}>
                        ⚙️ {mouldInfo}
                      </span>
                      {cycleTime && (
                        <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#fbbf24' }}>
                          ⏱️ {cycleTime}s
                        </span>
                      )}
                      {netWt && (
                        <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#34d399' }}>
                          ⚖️ {netWt}g {grossWt ? `(${grossWt}g gross)` : ''}
                        </span>
                      )}
                    </div>

                    {/* Click to expand/collapse full details */}
                    <div
                      onClick={() => setExpandedPartId(isExpanded ? null : p.id)}
                      style={{
                        fontSize: 11,
                        color: 'var(--amber)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        paddingTop: 4,
                        borderTop: '1px dashed rgba(255,255,255,0.08)',
                        userSelect: 'none',
                      }}
                    >
                      <span>{isExpanded ? '▲ Hide Details' : '▼ More Details'}</span>
                    </div>

                    {isExpanded && (
                      <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '8px 10px', fontSize: 11, display: 'grid', gap: 4, marginTop: 2 }}>
                        {p.customer_part_no && <div><strong>Cust Part No:</strong> {p.customer_part_no}</div>}
                        {p.standard_pack_qty && <div><strong>Std Pack Qty:</strong> {p.standard_pack_qty} pcs/packet</div>}
                        {p.tolerance_pct && <div><strong>Weight Tolerance:</strong> ±{p.tolerance_pct}%</div>}
                        {p.notes && <div><strong>Notes:</strong> {p.notes}</div>}
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4, color: 'var(--text-muted)' }}>
                          <span>Stages:</span>
                          <span style={{ color: p.trim_required ? '#34d399' : '#888' }}>{p.trim_required ? '✓ Trim' : '✕ No Trim'}</span>
                          <span style={{ color: p.inspection_required ? '#34d399' : '#888' }}>{p.inspection_required ? '✓ Inspect' : '✕ No Inspect'}</span>
                          <span style={{ color: p.packing_required !== false ? '#34d399' : '#888' }}>{p.packing_required !== false ? '✓ Pack' : '✕ No Pack'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
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
                .map((m) => {
                  const isExpanded = expandedRmId === m.id;
                  const isLowStock = Number(m.total_stock_kg || 0) < Number(m.min_stock_kg || 100);

                  return (
                    <div
                      key={m.id}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        opacity: m.active === false ? 0.6 : 1,
                      }}
                    >
                      {/* Top Row: Code + Name + Edit/Delete */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, color: 'var(--amber)', fontSize: 13 }}>
                              {m.material_code}
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {m.material_name}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            🏭 {m.supplier_name || 'Standard Vendor'} · <span style={{ color: m.active !== false ? '#34d399' : '#f87171', fontWeight: 600 }}>{m.active !== false ? 'Active' : 'Inactive'}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: 11, width: 'auto' }}
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
                              style={{
                                padding: '3px 8px',
                                fontSize: 11,
                                width: 'auto',
                                background: 'rgba(239,68,68,0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239,68,68,0.4)',
                                borderRadius: 4,
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Chips Row: Category, Stock, Grade, Color */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
                        <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#38bdf8' }}>
                          🧪 {m.category ? m.category.replace('_', ' ') : 'VIRGIN POLYMER'}
                        </span>
                        <span style={{ background: isLowStock ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: 4, color: isLowStock ? '#f87171' : '#34d399', fontWeight: 700 }}>
                          📦 {Number(m.total_stock_kg || 0).toLocaleString()} kg
                        </span>
                        {m.grade_code && (
                          <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: 'var(--text)' }}>
                            Grade: {m.grade_code}
                          </span>
                        )}
                        {m.color && (
                          <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#fbbf24' }}>
                            {m.color}
                          </span>
                        )}
                      </div>

                      {/* Expand/collapse button */}
                      <div
                        onClick={() => setExpandedRmId(isExpanded ? null : m.id)}
                        style={{
                          fontSize: 11,
                          color: 'var(--amber)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          paddingTop: 4,
                          borderTop: '1px dashed rgba(255,255,255,0.08)',
                          userSelect: 'none',
                        }}
                      >
                        <span>{isExpanded ? '▲ Hide Specs' : '▼ Technical Specs & Drying'}</span>
                      </div>

                      {isExpanded && (
                        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '8px 10px', fontSize: 11, display: 'grid', gap: 4, marginTop: 2 }}>
                          <div><strong>Drying:</strong> {m.drying_temp_c ? `${m.drying_temp_c}°C / ${m.drying_time_hrs || 4}h` : '80°C / 4h'}</div>
                          {m.density_g_cm3 && <div><strong>Density:</strong> {m.density_g_cm3} g/cm³</div>}
                          {m.mfi_g_10min && <div><strong>MFI:</strong> {m.mfi_g_10min} g/10min</div>}
                          {m.melt_temp_c && <div><strong>Melt Temp:</strong> {m.melt_temp_c}°C</div>}
                          <div><strong>Safety Stock / Bag Wt:</strong> Min {m.min_stock_kg || 100} kg · {m.standard_bag_wt_kg || 25} kg/bag</div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
              {gauges.map((g) => {
                const isOverdue = g.calib_status === 'overdue' || g.calibration_status === 'OVERDUE';
                const isDueSoon = g.calib_status === 'due_soon' || g.calibration_status === 'DUE_SOON';
                const badgeColor = isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#10b981';
                const badgeText = isOverdue ? '🔴 Overdue' : isDueSoon ? '🟡 Due Soon' : '🟢 Valid';
                const isExpanded = expandedGaugeId === g.id;

                return (
                  <div
                    key={g.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    {/* Top Row: Code + Name + Edit/Delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, color: 'var(--amber)', fontSize: 13 }}>
                            {g.gauge_code}
                          </span>
                          <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {g.gauge_name}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          📍 {g.location || 'QA Lab'} · <span style={{ color: badgeColor, fontWeight: 700 }}>{badgeText} {g.days_remaining != null ? `(${g.days_remaining}d)` : ''}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
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
                        {user.role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteGauge(g)}
                            style={{
                              padding: '3px 8px',
                              fontSize: 11,
                              width: 'auto',
                              background: 'rgba(239,68,68,0.15)',
                              color: '#f87171',
                              border: '1px solid rgba(239,68,68,0.4)',
                              borderRadius: 4,
                              cursor: 'pointer',
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Chips Row: Type, Range, Accuracy, Last Calibrated */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11, color: 'var(--text-muted)' }}>
                      <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#38bdf8' }}>
                        📏 {g.gauge_type} {g.range_spec ? `(${g.range_spec})` : ''}
                      </span>
                      {g.accuracy && (
                        <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: 'var(--text)' }}>
                          Acc: {g.accuracy}
                        </span>
                      )}
                      <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#fbbf24' }}>
                        Cal: {g.last_calibrated_at ? new Date(g.last_calibrated_at).toLocaleDateString() : 'Never'}
                      </span>
                    </div>

                    {/* Expand/collapse button */}
                    <div
                      onClick={() => setExpandedGaugeId(isExpanded ? null : g.id)}
                      style={{
                        fontSize: 11,
                        color: 'var(--amber)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        paddingTop: 4,
                        borderTop: '1px dashed rgba(255,255,255,0.08)',
                        userSelect: 'none',
                      }}
                    >
                      <span>{isExpanded ? '▲ Hide Certificate' : '▼ Certificate & Interval Details'}</span>
                    </div>

                    {isExpanded && (
                      <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '8px 10px', fontSize: 11, display: 'grid', gap: 4, marginTop: 2 }}>
                        {g.calibration_cert_no && <div><strong>Cert No:</strong> {g.calibration_cert_no}</div>}
                        <div><strong>Calib Interval:</strong> {g.calibration_interval_days || 365} days</div>
                        <div><strong>Status:</strong> {g.status || 'Active'}</div>
                      </div>
                    )}
                  </div>
                );
              })}
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
                  gst_last_verified_at: null,
                  gst_verification_status: null,
                });
                setSupplierGstResult(null);
                setSupplierGstError('');
                setSupplierGstVerifying(false);
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
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
                .map((s) => {
                  const isExpanded = expandedSupplierId === s.id;
                  const location = [s.city, s.state].filter(Boolean).join(', ') || 'Tamil Nadu';

                  return (
                    <div
                      key={s.id}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--line)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        opacity: s.active === false ? 0.6 : 1,
                      }}
                    >
                      {/* Top Row: Code + Name + Edit/Delete */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, color: 'var(--amber)', fontSize: 13 }}>
                              {s.supplier_code}
                            </span>
                            <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.supplier_name}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            📍 {location} · <span style={{ color: s.active !== false ? '#34d399' : '#f87171', fontWeight: 600 }}>{s.active !== false ? 'Active' : 'Inactive'}</span> · <strong style={{ color: '#34d399' }}>Rating: {s.vendor_rating || 100}%</strong>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: 11, width: 'auto' }}
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
                                gst_last_verified_at: s.gst_last_verified_at || null,
                                gst_verification_status: s.gst_verification_status || null,
                              });
                              setSupplierGstResult(null);
                              setSupplierGstError('');
                              setSupplierGstVerifying(false);
                              setSupplierModal({ isEdit: true, data: s });
                            }}
                          >
                            ✏️ Edit
                          </button>
                          {user.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteSupplier(s)}
                              style={{
                                padding: '3px 8px',
                                fontSize: 11,
                                width: 'auto',
                                background: 'rgba(239,68,68,0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239,68,68,0.4)',
                                borderRadius: 4,
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Chips Row: GSTIN, Contact, Materials, IATF */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                        {s.gstin && (
                          <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', color: '#38bdf8' }}>
                            GST: {s.gstin}
                          </span>
                        )}
                        {s.gstin && s.gst_verification_status === 'Active' && (
                          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                            ✓ Verified Active
                          </span>
                        )}
                        {s.gstin && s.gst_verification_status && s.gst_verification_status !== 'Active' && (
                          <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                            ⚠️ {s.gst_verification_status}
                          </span>
                        )}
                        {s.contact_person && (
                          <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: 'var(--text)' }}>
                            👤 {s.contact_person} {s.phone ? `(${s.phone})` : ''}
                          </span>
                        )}
                        {s.materials_supplied && (
                          <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, color: '#fbbf24' }}>
                            📦 {s.materials_supplied}
                          </span>
                        )}
                      </div>

                      {/* Expand/collapse button */}
                      <div
                        onClick={() => setExpandedSupplierId(isExpanded ? null : s.id)}
                        style={{
                          fontSize: 11,
                          color: 'var(--amber)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          paddingTop: 4,
                          borderTop: '1px dashed rgba(255,255,255,0.08)',
                          userSelect: 'none',
                        }}
                      >
                        <span>{isExpanded ? '▲ Hide Details' : '▼ Payment & Address Details'}</span>
                      </div>

                      {isExpanded && (
                        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: '8px 10px', fontSize: 11, display: 'grid', gap: 4, marginTop: 2 }}>
                          {s.pan_no && <div><strong>PAN:</strong> {s.pan_no}</div>}
                          {s.email && <div><strong>Email:</strong> <a href={`mailto:${s.email}`} style={{ color: '#38bdf8' }}>{s.email}</a></div>}
                          {s.address && <div><strong>Address:</strong> {s.address}</div>}
                          <div><strong>Terms:</strong> {s.payment_terms || '30 Days'} · Lead Time: {s.lead_time_days || 7} days</div>
                          <div><strong>Certification:</strong> {s.iso_iatf_certified !== false ? '✓ IATF/ISO Certified' : '✕ Uncertified'}</div>
                          {s.gst_last_verified_at && (
                            <div style={{ color: '#94a3b8' }}>
                              GST Verified: {new Date(s.gst_last_verified_at).toLocaleDateString()} ({s.gst_verification_status || 'OK'})
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* Supplier Modal */}
          {supplierModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
              <div className="panel" style={{ width: '100%', maxWidth: 580, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 20, maxHeight: '90vh', overflowY: 'auto' }}>
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

                  {/* GSTIN & PAN row with Live Verification */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, border: '1px solid var(--line)', display: 'grid', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <label style={{ fontSize: 11, fontWeight: 700 }}>GSTIN (GST Number)</label>
                          {supplierForm.gstin && (
                            <span style={{ fontSize: 10, fontWeight: 700 }}>
                              {isValidGSTIN(supplierForm.gstin) ? (
                                <span style={{ color: '#34d399' }}>✓ Valid Checksum</span>
                              ) : supplierForm.gstin.length === 15 ? (
                                <span style={{ color: '#f87171' }}>✕ Invalid Checksum</span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>({supplierForm.gstin.length}/15)</span>
                              )}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            value={supplierForm.gstin}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase().trim();
                              setSupplierForm({ ...supplierForm, gstin: val });
                              setSupplierGstError('');
                            }}
                            placeholder="33AAAAA0000A1Z5"
                            maxLength={15}
                            style={{ flex: 1, padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontFamily: 'monospace' }}
                          />
                          <button
                            type="button"
                            onClick={handleVerifySupplierGST}
                            disabled={!isValidGSTIN(supplierForm.gstin) || supplierGstVerifying}
                            style={{
                              padding: '6px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                              background: isValidGSTIN(supplierForm.gstin) ? 'var(--amber)' : 'rgba(255,255,255,0.08)',
                              color: isValidGSTIN(supplierForm.gstin) ? '#000' : 'var(--text-muted)',
                              border: 'none',
                              borderRadius: 4,
                              cursor: isValidGSTIN(supplierForm.gstin) && !supplierGstVerifying ? 'pointer' : 'not-allowed',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {supplierGstVerifying ? '⏳ Checking…' : '🔍 Verify'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700 }}>PAN Number</label>
                        <input
                          value={supplierForm.pan_no}
                          onChange={(e) => setSupplierForm({ ...supplierForm, pan_no: e.target.value.toUpperCase() })}
                          placeholder="AAAAA0000A"
                          maxLength={10}
                          style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontFamily: 'monospace', marginTop: 17 }}
                        />
                      </div>
                    </div>

                    {/* GST Error Banner */}
                    {supplierGstError && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '6px 10px', borderRadius: 6, fontSize: 11 }}>
                        ⚠️ {supplierGstError}
                      </div>
                    )}

                    {/* GST Verified Preview Card */}
                    {supplierGstResult && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 6, padding: '8px 10px', fontSize: 11, display: 'grid', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, color: supplierGstResult.sts === 'Active' ? '#34d399' : '#f87171' }}>
                            Status: {supplierGstResult.sts || 'Verified'}
                          </span>
                          <button
                            type="button"
                            onClick={handleAutofillSupplierFromGST}
                            style={{
                              padding: '3px 8px',
                              fontSize: 10,
                              fontWeight: 700,
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                            }}
                          >
                            ⚡ Auto-fill Form
                          </button>
                        </div>
                        {supplierGstResult.sts && supplierGstResult.sts !== 'Active' && (
                          <div style={{ color: '#f87171', fontWeight: 700 }}>
                            ⚠️ Warning: GSTIN status is {supplierGstResult.sts}! Tax compliance may be impacted.
                          </div>
                        )}
                        <div><strong>Legal Name:</strong> {supplierGstResult.lgnm || '—'}</div>
                        {supplierGstResult.tradeNam && <div><strong>Trade Name:</strong> {supplierGstResult.tradeNam}</div>}
                        {supplierGstResult.pradr && <div><strong>Address:</strong> {formatGstAddress(supplierGstResult.pradr.addr || supplierGstResult.pradr)}</div>}
                      </div>
                    )}
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
                  gst_last_verified_at: null,
                  gst_verification_status: null,
                });
                setCustomerGstResult(null);
                setCustomerGstError('');
                setCustomerGstVerifying(false);
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
                                gst_last_verified_at: c.gst_last_verified_at || null,
                                gst_verification_status: c.gst_verification_status || null,
                              });
                              setCustomerGstResult(null);
                              setCustomerGstError('');
                              setCustomerGstVerifying(false);
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

                      {/* Chips / Status Row */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontSize: 11 }}>
                        {c.gstin && (
                          <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', color: '#38bdf8' }}>
                            GST: {c.gstin}
                          </span>
                        )}
                        {c.gstin && c.gst_verification_status === 'Active' && (
                          <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                            ✓ Verified Active
                          </span>
                        )}
                        {c.gstin && c.gst_verification_status && c.gst_verification_status !== 'Active' && (
                          <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                            ⚠️ {c.gst_verification_status}
                          </span>
                        )}
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
                          {c.gst_last_verified_at && (
                            <div style={{ gridColumn: 'span 2', color: '#94a3b8' }}>
                              GST Verified: {new Date(c.gst_last_verified_at).toLocaleDateString()} ({c.gst_verification_status || 'OK'})
                            </div>
                          )}
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
              <div className="panel" style={{ width: '100%', maxWidth: 580, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 20, maxHeight: '90vh', overflowY: 'auto' }}>
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

                  {/* GSTIN & PAN row with Live Verification */}
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, border: '1px solid var(--line)', display: 'grid', gap: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 8, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <label style={{ fontSize: 11, fontWeight: 700 }}>GSTIN (GST Number)</label>
                          {customerForm.gstin && (
                            <span style={{ fontSize: 10, fontWeight: 700 }}>
                              {isValidGSTIN(customerForm.gstin) ? (
                                <span style={{ color: '#34d399' }}>✓ Valid Checksum</span>
                              ) : customerForm.gstin.length === 15 ? (
                                <span style={{ color: '#f87171' }}>✕ Invalid Checksum</span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>({customerForm.gstin.length}/15)</span>
                              )}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            value={customerForm.gstin}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase().trim();
                              setCustomerForm({ ...customerForm, gstin: val });
                              setCustomerGstError('');
                            }}
                            placeholder="33AAAAA0000A1Z5"
                            maxLength={15}
                            style={{ flex: 1, padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontFamily: 'monospace' }}
                          />
                          <button
                            type="button"
                            onClick={handleVerifyCustomerGST}
                            disabled={!isValidGSTIN(customerForm.gstin) || customerGstVerifying}
                            style={{
                              padding: '6px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                              background: isValidGSTIN(customerForm.gstin) ? 'var(--amber)' : 'rgba(255,255,255,0.08)',
                              color: isValidGSTIN(customerForm.gstin) ? '#000' : 'var(--text-muted)',
                              border: 'none',
                              borderRadius: 4,
                              cursor: isValidGSTIN(customerForm.gstin) && !customerGstVerifying ? 'pointer' : 'not-allowed',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {customerGstVerifying ? '⏳ Checking…' : '🔍 Verify'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700 }}>PAN Number</label>
                        <input
                          value={customerForm.pan_no}
                          onChange={(e) => setCustomerForm({ ...customerForm, pan_no: e.target.value.toUpperCase() })}
                          placeholder="AAAAA0000A"
                          maxLength={10}
                          style={{ width: '100%', padding: '6px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontFamily: 'monospace', marginTop: 17 }}
                        />
                      </div>
                    </div>

                    {/* GST Error Banner */}
                    {customerGstError && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '6px 10px', borderRadius: 6, fontSize: 11 }}>
                        ⚠️ {customerGstError}
                      </div>
                    )}

                    {/* GST Verified Preview Card */}
                    {customerGstResult && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 6, padding: '8px 10px', fontSize: 11, display: 'grid', gap: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, color: customerGstResult.sts === 'Active' ? '#34d399' : '#f87171' }}>
                            Status: {customerGstResult.sts || 'Verified'}
                          </span>
                          <button
                            type="button"
                            onClick={handleAutofillCustomerFromGST}
                            style={{
                              padding: '3px 8px',
                              fontSize: 10,
                              fontWeight: 700,
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                            }}
                          >
                            ⚡ Auto-fill Form
                          </button>
                        </div>
                        {customerGstResult.sts && customerGstResult.sts !== 'Active' && (
                          <div style={{ color: '#f87171', fontWeight: 700 }}>
                            ⚠️ Warning: GSTIN status is {customerGstResult.sts}! Tax compliance may be impacted.
                          </div>
                        )}
                        <div><strong>Legal Name:</strong> {customerGstResult.lgnm || '—'}</div>
                        {customerGstResult.tradeNam && <div><strong>Trade Name:</strong> {customerGstResult.tradeNam}</div>}
                        {customerGstResult.pradr && <div><strong>Address:</strong> {formatGstAddress(customerGstResult.pradr.addr || customerGstResult.pradr)}</div>}
                      </div>
                    )}
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
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Checksheets &amp; Defect / Downtime Reasons</h3>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              Click any section below to view, add, edit, or remove inspection checkpoints and master reason codes.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {/* 1. SHIFT CHECKSHEET ITEMS */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div
                onClick={() => setExpandedChecksheetSection(expandedChecksheetSection === 'shift' ? null : 'shift')}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: expandedChecksheetSection === 'shift' ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                  borderBottom: expandedChecksheetSection === 'shift' ? '1px solid var(--line)' : 'none',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>📋</span>
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--amber)' }}>Shift &amp; Machine Checksheet Points</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Daily pre-operational machine safety &amp; 5S checks</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'rgba(245, 158, 11, 0.2)', color: 'var(--amber)' }}>
                    {checkItems.length} Points
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    {expandedChecksheetSection === 'shift' ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {expandedChecksheetSection === 'shift' && (
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}
                      onClick={() => {
                        setCheckItemForm({
                          item_name: '',
                          category: 'daily',
                          code: '',
                          default_disposition: 'OK',
                          related_to: 'MACHINE',
                          local_label: '',
                          specification: '',
                          icon: '📋',
                          sort_order: checkItems.length + 1,
                          active: true,
                        });
                        setCheckItemModal({ type: 'daily', isEdit: false });
                      }}
                    >
                      ➕ Add Checksheet Item
                    </button>
                  </div>

                  {checkItems.length === 0 ? (
                    <p className="muted" style={{ fontSize: 12 }}>No checksheet items configured.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                      {checkItems.map((ci, i) => {
                        const loc = getLocalizedCheckItem(ci, lang);
                        const iconVal = loc.icon || ci.icon || '';
                        const isTabler = iconVal.startsWith('ti-') || iconVal.startsWith('ti ');
                        const tablerClass = iconVal.replace(/^ti\s+/, '');
                        return (
                          <div
                            key={ci.id || i}
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: '1px solid var(--line)',
                              borderRadius: 6,
                              padding: '8px 12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {isTabler ? <i className={`ti ${tablerClass}`} style={{ color: 'var(--accent)', fontSize: 16 }} /> : <span>{iconVal || '📋'}</span>}
                                <span>{loc.name || ci.item_name || ci.check_point}</span>
                              </div>
                              {(loc.spec || ci.specification || ci.local_label) && (
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                  {loc.spec || ci.specification || ci.local_label}
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '3px 8px', fontSize: 11, width: 'auto' }}
                                onClick={() => {
                                  setCheckItemForm({
                                    item_name: ci.item_name || ci.check_point || '',
                                    category: 'daily',
                                    code: ci.code || '',
                                    default_disposition: 'OK',
                                    related_to: ci.category || 'MACHINE',
                                    local_label: ci.local_label || '',
                                    specification: ci.specification || '',
                                    icon: ci.icon || '📋',
                                    sort_order: ci.sort_order || i + 1,
                                    active: ci.active !== false,
                                  });
                                  setCheckItemModal({ type: 'daily', isEdit: true, data: ci });
                                }}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCheckItem(ci, 'daily')}
                                style={{
                                  padding: '3px 8px',
                                  fontSize: 11,
                                  width: 'auto',
                                  background: 'rgba(239,68,68,0.15)',
                                  color: '#f87171',
                                  border: '1px solid rgba(239,68,68,0.4)',
                                  borderRadius: 4,
                                  cursor: 'pointer',
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. REJECTION REASONS (DEFECTS) */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div
                onClick={() => setExpandedChecksheetSection(expandedChecksheetSection === 'reject' ? null : 'reject')}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: expandedChecksheetSection === 'reject' ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                  borderBottom: expandedChecksheetSection === 'reject' ? '1px solid var(--line)' : 'none',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>🚫</span>
                  <div>
                    <strong style={{ fontSize: 14, color: '#f87171' }}>Standard Rejection Reasons (Defects)</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Moulding defect classification &amp; scrap disposal codes</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                    {rejectReasons.length} Defects
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    {expandedChecksheetSection === 'reject' ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {expandedChecksheetSection === 'reject' && (
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}
                      onClick={() => {
                        setCheckItemForm({
                          item_name: '',
                          category: 'reject_reason',
                          code: '',
                          default_disposition: 'SCRAP',
                          related_to: 'QUALITY',
                          local_label: '',
                          specification: '',
                          icon: '🚫',
                          sort_order: rejectReasons.length + 1,
                          active: true,
                        });
                        setCheckItemModal({ type: 'reject_reason', isEdit: false });
                      }}
                    >
                      ➕ Add Reject Reason
                    </button>
                  </div>

                  {rejectReasons.length === 0 ? (
                    <p className="muted" style={{ fontSize: 12 }}>No reject reasons registered.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                      {rejectReasons.map((rr, i) => (
                        <div
                          key={rr.id || i}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--line)',
                            borderRadius: 6,
                            padding: '8px 12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#f87171' }}>
                              {rr.code ? `[${rr.code}] ` : ''}{rr.item_name || rr.reason}
                            </div>
                            {rr.default_disposition && (
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                                Disposition: {rr.default_disposition}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '3px 8px', fontSize: 11, width: 'auto' }}
                              onClick={() => {
                                setCheckItemForm({
                                  item_name: rr.item_name || rr.reason || '',
                                  category: 'reject_reason',
                                  code: rr.code || '',
                                  default_disposition: rr.default_disposition || 'SCRAP',
                                  related_to: rr.related_to || 'QUALITY',
                                  local_label: '',
                                  specification: '',
                                  icon: '🚫',
                                  sort_order: i + 1,
                                  active: true,
                                });
                                setCheckItemModal({ type: 'reject_reason', isEdit: true, data: rr });
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCheckItem(rr, 'reject_reason')}
                              style={{
                                padding: '3px 8px',
                                fontSize: 11,
                                width: 'auto',
                                background: 'rgba(239,68,68,0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239,68,68,0.4)',
                                borderRadius: 4,
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. DOWNTIME BREAKDOWN REASONS */}
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div
                onClick={() => setExpandedChecksheetSection(expandedChecksheetSection === 'downtime' ? null : 'downtime')}
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  background: expandedChecksheetSection === 'downtime' ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                  borderBottom: expandedChecksheetSection === 'downtime' ? '1px solid var(--line)' : 'none',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>⏱️</span>
                  <div>
                    <strong style={{ fontSize: 14, color: '#fbbf24' }}>Downtime &amp; Breakdown Reasons</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Machine stoppage, mould change &amp; maintenance causes</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                    {downtimeReasons.length} Reasons
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                    {expandedChecksheetSection === 'downtime' ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {expandedChecksheetSection === 'downtime' && (
                <div style={{ padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ width: 'auto', padding: '6px 14px', fontSize: 12 }}
                      onClick={() => {
                        setCheckItemForm({
                          item_name: '',
                          category: 'downtime_reason',
                          code: '',
                          default_disposition: '',
                          related_to: 'MACHINE',
                          local_label: '',
                          specification: '',
                          icon: '⏱️',
                          sort_order: downtimeReasons.length + 1,
                          active: true,
                        });
                        setCheckItemModal({ type: 'downtime_reason', isEdit: false });
                      }}
                    >
                      ➕ Add Downtime Reason
                    </button>
                  </div>

                  {downtimeReasons.length === 0 ? (
                    <p className="muted" style={{ fontSize: 12 }}>No downtime reasons registered.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                      {downtimeReasons.map((dr, i) => (
                        <div
                          key={dr.id || i}
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--line)',
                            borderRadius: 6,
                            padding: '8px 12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#fbbf24' }}>
                              {dr.code ? `[${dr.code}] ` : ''}{dr.item_name || dr.reason}
                            </div>
                            {dr.related_to && (
                              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                                Related to: {dr.related_to}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '3px 8px', fontSize: 11, width: 'auto' }}
                              onClick={() => {
                                setCheckItemForm({
                                  item_name: dr.item_name || dr.reason || '',
                                  category: 'downtime_reason',
                                  code: dr.code || '',
                                  default_disposition: '',
                                  related_to: dr.related_to || 'MACHINE',
                                  local_label: '',
                                  specification: '',
                                  icon: '⏱️',
                                  sort_order: i + 1,
                                  active: true,
                                });
                                setCheckItemModal({ type: 'downtime_reason', isEdit: true, data: dr });
                              }}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCheckItem(dr, 'downtime_reason')}
                              style={{
                                padding: '3px 8px',
                                fontSize: 11,
                                width: 'auto',
                                background: 'rgba(239,68,68,0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239,68,68,0.4)',
                                borderRadius: 4,
                                cursor: 'pointer',
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add / Edit Check Item & Reason Modal */}
          {checkItemModal && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
              <div className="panel" style={{ width: '100%', maxWidth: 440, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: 20 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700 }}>
                  {checkItemModal.isEdit ? '✏️ Edit Item / Reason' : '➕ Add Master Item / Reason'}
                </h3>
                <form onSubmit={handleSaveCheckItem} style={{ display: 'grid', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700 }}>Item / Reason Name *</label>
                    <input
                      required
                      value={checkItemForm.item_name}
                      onChange={(e) => setCheckItemForm({ ...checkItemForm, item_name: e.target.value })}
                      placeholder={checkItemModal.type === 'daily' ? 'e.g. Oil Level Check' : checkItemModal.type === 'reject_reason' ? 'e.g. Short Shot' : 'e.g. Mould Changeover'}
                      style={{ width: '100%', padding: '7px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                    />
                  </div>

                  {checkItemModal.type !== 'daily' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700 }}>Code (Optional)</label>
                        <input
                          value={checkItemForm.code}
                          onChange={(e) => setCheckItemForm({ ...checkItemForm, code: e.target.value })}
                          placeholder="e.g. R-01 or DT-05"
                          style={{ width: '100%', padding: '7px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700 }}>Related To / Category</label>
                        <select
                          value={checkItemForm.related_to}
                          onChange={(e) => setCheckItemForm({ ...checkItemForm, related_to: e.target.value })}
                          style={{ width: '100%', padding: '7px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                        >
                          <option value="MACHINE">Machine</option>
                          <option value="MOULD">Mould / Tooling</option>
                          <option value="QUALITY">Quality / Process</option>
                          <option value="RAW_MATERIAL">Raw Material</option>
                          <option value="MANPOWER">Manpower / Planned</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {checkItemModal.type === 'daily' && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700 }}>Specification / Acceptance Standard</label>
                      <input
                        value={checkItemForm.specification}
                        onChange={(e) => setCheckItemForm({ ...checkItemForm, specification: e.target.value })}
                        placeholder="e.g. Level between MIN and MAX marks"
                        style={{ width: '100%', padding: '7px 10px', fontSize: 12, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                    <button type="button" className="btn btn-secondary" style={{ width: 'auto', padding: '8px 14px' }} onClick={() => setCheckItemModal(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>
                      Save Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
