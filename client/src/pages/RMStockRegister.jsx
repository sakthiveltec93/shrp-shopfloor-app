import SearchableSelect from '../components/SearchableSelect';
import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function RMStockRegister() {
  const { user } = useAuth();
  const [stockRows, setStockRows] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [wipPool, setWipPool] = useState([]);
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'wip'
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Issue modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    shift: 'A',
    machine_id: '',
    material_id: '',
    lot_no: '',
    issue_qty_kg: 25.0,
    remarks: '',
  });

  // Material master modal
  const [showMatModal, setShowMatModal] = useState(false);
  const [matForm, setMatForm] = useState({
    material_code: '',
    material_name: '',
    category: 'VIRGIN_POLYMER',
    supplier_name: '',
    grade_code: '',
    color: 'Natural',
    density_g_cm3: '',
    mfi_g_10min: '',
    standard_bag_wt_kg: 25.0,
    min_stock_kg: 100.0,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [stocks, mats, pool, machs] = await Promise.all([
        api.rawMaterials.stockRegister().catch(() => []),
        api.rawMaterials.list().catch(() => []),
        api.rawMaterials.wipPool().catch(() => []),
        api.machines('PRODUCTION').catch(() => []),
      ]);
      setStockRows(Array.isArray(stocks) ? stocks : []);
      setMaterials(Array.isArray(mats) ? mats : []);
      setWipPool(Array.isArray(pool) ? pool : []);
      setMachines(Array.isArray(machs) ? machs : []);

      if (machs && machs.length > 0 && !issueForm.machine_id) {
        setIssueForm((f) => ({ ...f, machine_id: machs[0].id }));
      }
      if (mats && mats.length > 0 && !issueForm.material_id) {
        setIssueForm((f) => ({ ...f, material_id: mats[0].id }));
      }
    } catch (err) {
      setError(err.message || 'Failed to load stock register');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.rawMaterials.issue(issueForm);
      setShowIssueModal(false);
      setSuccessMsg('Material issue of ' + issueForm.issue_qty_kg + ' kg logged to shopfloor pool!');
      setTimeout(() => setSuccessMsg(''), 5000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to log material issue');
    } finally {
      setSaving(false);
    }
  };

  const handleMatSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.rawMaterials.save(matForm);
      setShowMatModal(false);
      setSuccessMsg('Material grade ' + matForm.material_code + ' added successfully!');
      setTimeout(() => setSuccessMsg(''), 5000);
      setMatForm({
        material_code: '',
        material_name: '',
        category: 'VIRGIN_POLYMER',
        supplier_name: '',
        grade_code: '',
        color: 'Natural',
        density_g_cm3: '',
        mfi_g_10min: '',
        standard_bag_wt_kg: 25.0,
        min_stock_kg: 100.0,
      });
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to add material');
    } finally {
      setSaving(false);
    }
  };

  // Stock Aggregations
  const totalStockKg = stockRows.reduce((s, r) => s + Number(r.current_stock_kg || 0), 0);
  const totalVirginKg = stockRows
    .filter((r) => r.material_category === 'VIRGIN_POLYMER')
    .reduce((s, r) => s + Number(r.current_stock_kg || 0), 0);
  const totalRegrindKg = stockRows
    .filter((r) => r.material_category === 'REGRIND')
    .reduce((s, r) => s + Number(r.current_stock_kg || 0), 0);
  const totalMbKg = stockRows
    .filter((r) => r.material_category === 'MASTERBATCH')
    .reduce((s, r) => s + Number(r.current_stock_kg || 0), 0);

  const filteredStock = stockRows.filter((r) => {
    if (categoryFilter !== 'ALL' && r.material_category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = r.material_name && r.material_name.toLowerCase().includes(q);
      const matchCode = r.material_code && r.material_code.toLowerCase().includes(q);
      const matchLot = r.lot_no && r.lot_no.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchLot) return false;
    }
    return true;
  });

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
          <h1 className="screen-title" style={{ margin: 0, fontSize: 20 }}>📊 Raw Material Stock Register</h1>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Warehouse Batches, Virgin vs Regrind Ratios & Shopfloor WIP Carryover
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowMatModal(true)}
            className="btn btn-secondary"
            style={{ padding: '7px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>➕</span>
            <span>Add Material</span>
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="btn btn-primary"
            style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span>🔥</span>
            <span>Issue to Machine</span>
          </button>
        </div>
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

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 10,
        marginBottom: 16,
      }}>
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Stock</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: 'var(--text)' }}>
            {totalStockKg.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 400 }}>kg</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>≈ {(totalStockKg / 25).toFixed(0)} bags</div>
        </div>

        <div style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#60a5fa', fontWeight: 600, textTransform: 'uppercase' }}>Virgin Polymers</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: '#60a5fa' }}>
            {totalVirginKg.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 400 }}>kg</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>LDPE, LLDPE, POM, PPCP</div>
        </div>

        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, textTransform: 'uppercase' }}>Regrind Granules</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: 'var(--green)' }}>
            {totalRegrindKg.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 400 }}>kg</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Crushed runner stock</div>
        </div>

        <div style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, color: '#c084fc', fontWeight: 600, textTransform: 'uppercase' }}>Masterbatch / Additive</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: '#c084fc' }}>
            {totalMbKg.toFixed(1)} <span style={{ fontSize: 12, fontWeight: 400 }}>kg</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Colorants & MB</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab('stock')}
          style={{
            padding: '8px 14px',
            border: 'none',
            background: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'stock' ? 'var(--amber)' : 'var(--text-muted)',
            borderBottom: activeTab === 'stock' ? '2px solid var(--amber)' : '2px solid transparent',
          }}
        >
          📦 Warehouse Lots ({stockRows.length})
        </button>
        <button
          onClick={() => setActiveTab('wip')}
          style={{
            padding: '8px 14px',
            border: 'none',
            background: 'none',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'wip' ? 'var(--amber)' : 'var(--text-muted)',
            borderBottom: activeTab === 'wip' ? '2px solid var(--amber)' : '2px solid transparent',
          }}
        >
          🔄 Shopfloor WIP Pool ({wipPool.length})
        </button>
      </div>

      {activeTab === 'stock' ? (
        <div>
          {/* Category Filter & Search */}
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
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
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
                <option value="ALL">All Categories</option>
                <option value="VIRGIN_POLYMER">🛢️ Virgin Polymers</option>
                <option value="REGRIND">♻️ Regrind</option>
                <option value="MASTERBATCH">🎨 Masterbatch</option>
                <option value="RUBBER_COMPOUND">🧪 Rubber Compounds</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="🔍 Search lot, material name..."
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

          {/* Stock Card List */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              🔄 Loading stock records...
            </div>
          ) : filteredStock.length === 0 ? (
            <div style={{
              padding: 40,
              textAlign: 'center',
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              color: 'var(--text-muted)',
              fontSize: 13,
            }}>
              No active stock lots found. Inward QA-accepted lots will automatically appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredStock.map((row) => {
                const isLow = Number(row.current_stock_kg) < Number(row.min_stock_kg || 100);
                return (
                  <div
                    key={row.id}
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      borderRadius: 10,
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38,
                          height: 38,
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--line)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                        }}>
                          {getCategoryIcon(row.material_category)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                            {row.material_name}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {row.material_code} {row.grade_code && '• ' + row.grade_code} • {row.supplier_name || 'Generic'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: isLow ? 'var(--red)' : 'var(--green)' }}>
                          {Number(row.current_stock_kg).toFixed(1)} kg
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          ≈ {(Number(row.current_stock_kg) / 25).toFixed(1)} bags
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: 8,
                      background: 'rgba(0,0,0,0.2)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: 12,
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Lot Number:</span>
                        <div style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--amber)', marginTop: 2 }}>
                          {row.lot_no}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                        <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
                          {row.material_category}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Inward Ref:</span>
                        <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
                          {row.inward_no || 'Direct'}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Stock Status:</span>
                        <div style={{ fontWeight: 700, marginTop: 2, color: isLow ? 'var(--red)' : 'var(--green)' }}>
                          {isLow ? '⚠️ LOW STOCK' : '✓ HEALTHY'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* WIP Carryover Pool Tab */
        <div>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              🔄 Loading WIP pool records...
            </div>
          ) : wipPool.length === 0 ? (
            <div style={{
              padding: 40,
              textAlign: 'center',
              background: 'var(--panel)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              color: 'var(--text-muted)',
              fontSize: 13,
            }}>
              No active machine hopper WIP carryover records. Material issues to machines will appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {wipPool.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--line)',
                    borderRadius: 10,
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: 14 }}>🏭 {p.machine_name} ({p.machine_code})</strong>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Date: {p.date} • Shift: {p.shift}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--amber)' }}>
                        {Number(p.closing_balance_kg || 0).toFixed(1)} kg remaining
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Issued: {Number(p.issued_qty_kg || 0).toFixed(1)} kg | Consumed: {Number(p.consumed_qty_kg || 0).toFixed(1)} kg
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. Modal: Issue Material to Machine */}
      {/* ============================================================ */}
      {showIssueModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
        }}>
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12,
            width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', padding: 20,
            boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <strong style={{ fontSize: 16 }}>🔥 Issue Raw Material to Machine Hopper</strong>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Date *</label>
                  <input
                    type="date"
                    value={issueForm.date}
                    onChange={(e) => setIssueForm({ ...issueForm, date: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Shift *</label>
                  <select
                    value={issueForm.shift}
                    onChange={(e) => setIssueForm({ ...issueForm, shift: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  >
                    <option value="A">Shift A</option>
                    <option value="B">Shift B</option>
                    <option value="C">Shift C</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Target Machine *</label>
                <SearchableSelect
                  value={issueForm.machine_id}
                  onChange={(e) => setIssueForm({ ...issueForm, machine_id: e.target.value })}
                  options={machines}
                  placeholder="Select Target Machine..."
                  searchPlaceholder="🔍 Type machine code..."
                  getOptionValue={(m) => m.id}
                  getOptionLabel={(m) => m.machine_name ? (m.machine_name + ' (' + m.machine_code + ')') : m.machine_code}
                  getOptionBadge={(m) => m.machine_code}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Select Material *</label>
                <SearchableSelect
                  value={issueForm.material_id}
                  onChange={(e) => setIssueForm({ ...issueForm, material_id: e.target.value })}
                  options={materials}
                  placeholder="Select Material Grade..."
                  searchPlaceholder="🔍 Type material name, grade..."
                  getOptionValue={(m) => m.id}
                  getOptionLabel={(m) => m.material_name}
                  getOptionBadge={(m) => m.material_code}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Warehouse Lot No</label>
                  <input
                    type="text"
                    placeholder="e.g. REL-2026-LD400"
                    value={issueForm.lot_no}
                    onChange={(e) => setIssueForm({ ...issueForm, lot_no: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Quantity to Issue (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={issueForm.issue_qty_kg}
                    onChange={(e) => setIssueForm({ ...issueForm, issue_qty_kg: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Remarks / Hopper Note</label>
                <input
                  type="text"
                  placeholder="e.g. 1 full bag issued to Hopper #2"
                  value={issueForm.remarks}
                  onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
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
                  {saving ? 'Issuing…' : '✓ Confirm Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. Modal: Add Material Grade */}
      {/* ============================================================ */}
      {showMatModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
        }}>
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12,
            width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', padding: 20,
            boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <strong style={{ fontSize: 16 }}>➕ Add Raw Material Master</strong>
              <button
                type="button"
                onClick={() => setShowMatModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMatSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Material Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. LDPE-24FS040"
                    value={matForm.material_code}
                    onChange={(e) => setMatForm({ ...matForm, material_code: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Category *</label>
                  <select
                    value={matForm.category}
                    onChange={(e) => setMatForm({ ...matForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  >
                    <option value="VIRGIN_POLYMER">🛢️ Virgin Polymer</option>
                    <option value="REGRIND">♻️ Regrind</option>
                    <option value="MASTERBATCH">🎨 Masterbatch</option>
                    <option value="RUBBER_COMPOUND">🧪 Rubber Compound</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Material Name *</label>
                <input
                  type="text"
                  placeholder="e.g. LDPE Virgin Natural Granules"
                  value={matForm.material_name}
                  onChange={(e) => setMatForm({ ...matForm, material_name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Supplier / Maker</label>
                  <input
                    type="text"
                    placeholder="e.g. Reliance Industries"
                    value={matForm.supplier_name}
                    onChange={(e) => setMatForm({ ...matForm, supplier_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Grade Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 24FS040"
                    value={matForm.grade_code}
                    onChange={(e) => setMatForm({ ...matForm, grade_code: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Density (g/cm³)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="e.g. 0.922"
                    value={matForm.density_g_cm3}
                    onChange={(e) => setMatForm({ ...matForm, density_g_cm3: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>MFI (g/10min)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 4.0"
                    value={matForm.mfi_g_10min}
                    onChange={(e) => setMatForm({ ...matForm, mfi_g_10min: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowMatModal(false)}
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
                  {saving ? 'Saving…' : '✓ Save Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
