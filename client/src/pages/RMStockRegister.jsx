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
        api.rawMaterials.stockRegister(),
        api.rawMaterials.list(),
        api.rawMaterials.wipPool(),
        api.masters.machines(),
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
      setSuccessMsg(`Material issue of ${issueForm.issue_qty_kg} kg logged to shopfloor pool!`);
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
      setSuccessMsg(`Material grade "${matForm.material_code}" saved!`);
      setTimeout(() => setSuccessMsg(''), 5000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save material');
    } finally {
      setSaving(false);
    }
  };

  const totalStockKg = stockRows.reduce((sum, r) => sum + Number(r.current_stock_kg || 0), 0);
  const totalVirginKg = stockRows.filter(r => r.material_category === 'VIRGIN_POLYMER').reduce((sum, r) => sum + Number(r.current_stock_kg || 0), 0);
  const totalRegrindKg = stockRows.filter(r => r.material_category === 'REGRIND').reduce((sum, r) => sum + Number(r.current_stock_kg || 0), 0);
  const totalMbKg = stockRows.filter(r => r.material_category === 'MASTERBATCH').reduce((sum, r) => sum + Number(r.current_stock_kg || 0), 0);

  const filteredStock = stockRows.filter((r) => {
    if (categoryFilter !== 'ALL' && r.material_category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="screen">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div>
          <h1 className="screen-title">Raw Material Stock Register</h1>
          <p className="screen-sub">Live Warehouse Lots, Virgin vs Regrind Ratios & Shopfloor WIP Carryover</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMatModal(true)}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            + Add Material Grade
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 600 }}
          >
            📤 Issue Material to Machine
          </button>
        </div>
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
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Raw Material Stock</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{totalStockKg.toFixed(1)} <span className="text-sm font-normal">kg</span></div>
          <div className="text-xs text-slate-500 mt-0.5">≈ {(totalStockKg / 25).toFixed(0)} standard bags</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Virgin Polymers</div>
          <div className="text-2xl font-bold text-blue-800 mt-1">{totalVirginKg.toFixed(1)} <span className="text-sm font-normal">kg</span></div>
          <div className="text-xs text-blue-600 mt-0.5">LDPE, LLDPE, PPCP, POM, PA66</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Regrind Granules</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1">{totalRegrindKg.toFixed(1)} <span className="text-sm font-normal">kg</span></div>
          <div className="text-xs text-emerald-600 mt-0.5">Crushed & De-dusted runner stock</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-purple-200 bg-purple-50/20 shadow-sm">
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Masterbatch / Additives</div>
          <div className="text-2xl font-bold text-purple-800 mt-1">{totalMbKg.toFixed(1)} <span className="text-sm font-normal">kg</span></div>
          <div className="text-xs text-purple-600 mt-0.5">Black MB, Colorants</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-4">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-2 px-3 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'stock'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          📦 Warehouse Lots Register ({stockRows.length})
        </button>
        <button
          onClick={() => setActiveTab('wip')}
          className={`pb-2 px-3 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'wip'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          🔄 Shopfloor WIP RM Carryover Pool ({wipPool.length})
        </button>
      </div>

      {activeTab === 'stock' ? (
        <div>
          {/* Category Pills */}
          <div className="flex gap-1 mb-3">
            {['ALL', 'VIRGIN_POLYMER', 'REGRIND', 'MASTERBATCH', 'RUBBER_COMPOUND'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading stock records...</div>
          ) : filteredStock.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border text-slate-500">
              No active stock lots found. Inward accepted lots will automatically appear here.
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="p-3">Material Code & Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 font-mono">Lot Number</th>
                    <th className="p-3">Inward Reference</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3 text-right">Available Stock</th>
                    <th className="p-3 text-right">Bags Equiv.</th>
                    <th className="p-3 text-center">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStock.map((row) => {
                    const isLow = Number(row.current_stock_kg) < Number(row.min_stock_kg || 100);
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{row.material_name}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{row.material_code} {row.grade_code && `· ${row.grade_code}`}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {row.material_category}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-800">
                          {row.lot_no}
                        </td>
                        <td className="p-3 text-slate-600">
                          {row.inward_no || 'Initial Stock'}
                        </td>
                        <td className="p-3 text-slate-600">
                          {row.supplier_name || 'SHRP In-House'}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 text-sm">
                          {Number(row.current_stock_kg).toFixed(1)} kg
                        </td>
                        <td className="p-3 text-right text-slate-600">
                          {(Number(row.current_stock_kg) / 25).toFixed(1)} bags
                        </td>
                        <td className="p-3 text-center">
                          {isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Healthy
                            </span>
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
      ) : (
        /* WIP Carryover Pool Table */
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          {wipPool.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No shopfloor WIP carryover records logged yet. Material issued to machines will reconcile here with daily production entries.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="p-3">Date & Shift</th>
                  <th className="p-3">Machine</th>
                  <th className="p-3">Material Grade</th>
                  <th className="p-3 text-right">Opening (kg)</th>
                  <th className="p-3 text-right">Issued (kg)</th>
                  <th className="p-3 text-right">Consumed (kg)</th>
                  <th className="p-3 text-right font-bold text-slate-900">Closing Balance (kg)</th>
                  <th className="p-3 text-center">Reconciliation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wipPool.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-800">
                      {p.date} · Shift {p.shift}
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {p.machine_name} ({p.machine_code})
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{p.material_name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{p.material_code}</div>
                    </td>
                    <td className="p-3 text-right text-slate-600">{Number(p.opening_balance_kg).toFixed(1)}</td>
                    <td className="p-3 text-right font-semibold text-blue-700">+{Number(p.issued_qty_kg).toFixed(1)}</td>
                    <td className="p-3 text-right font-semibold text-slate-700">-{Number(p.consumed_qty_kg).toFixed(1)}</td>
                    <td className="p-3 text-right font-bold text-emerald-800 text-sm">
                      {Number(p.closing_balance_kg).toFixed(1)} kg
                    </td>
                    <td className="p-3 text-center">
                      {p.is_over_consumed ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Over-consumed</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Balanced</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal: Issue Material to Machine */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Issue Material to Machine</h2>
                <p className="text-xs text-slate-500">Record physical dispatch of polymer bags to shopfloor machine</p>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={issueForm.date}
                    onChange={(e) => setIssueForm({ ...issueForm, date: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift</label>
                  <select
                    value={issueForm.shift}
                    onChange={(e) => setIssueForm({ ...issueForm, shift: e.target.value })}
                    className="w-full p-2 text-xs border rounded bg-white"
                  >
                    <option value="A">Shift A</option>
                    <option value="B">Shift B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Machine *</label>
                <select
                  required
                  value={issueForm.machine_id}
                  onChange={(e) => setIssueForm({ ...issueForm, machine_id: e.target.value })}
                  className="w-full p-2 text-xs border rounded bg-white"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>{m.machine_name} ({m.machine_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Raw Material Grade *</label>
                <select
                  required
                  value={issueForm.material_id}
                  onChange={(e) => setIssueForm({ ...issueForm, material_id: e.target.value })}
                  className="w-full p-2 text-xs border rounded bg-white font-medium"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.material_code} - {m.material_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lot / Batch No</label>
                  <input
                    type="text"
                    placeholder="e.g. REL-2026-LD400"
                    value={issueForm.lot_no}
                    onChange={(e) => setIssueForm({ ...issueForm, lot_no: e.target.value })}
                    className="w-full p-2 text-xs border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Quantity (kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={issueForm.issue_qty_kg}
                    onChange={(e) => setIssueForm({ ...issueForm, issue_qty_kg: e.target.value })}
                    className="w-full p-2 text-xs border rounded font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Bag LDPE issued for job start"
                  value={issueForm.remarks}
                  onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
                  className="w-full p-2 text-xs border rounded"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium border text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Issuing...' : 'Confirm Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Material Master */}
      {showMatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Add Raw Material Master</h2>
                <p className="text-xs text-slate-500">Create new polymer grade, masterbatch or rubber compound</p>
              </div>
              <button onClick={() => setShowMatModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleMatSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Material Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RM-LDPE-16MA400"
                    value={matForm.material_code}
                    onChange={(e) => setMatForm({ ...matForm, material_code: e.target.value })}
                    className="w-full p-2 text-xs border rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={matForm.category}
                    onChange={(e) => setMatForm({ ...matForm, category: e.target.value })}
                    className="w-full p-2 text-xs border rounded bg-white font-medium"
                  >
                    <option value="VIRGIN_POLYMER">Virgin Polymer</option>
                    <option value="REGRIND">Regrind Granules</option>
                    <option value="MASTERBATCH">Masterbatch</option>
                    <option value="RUBBER_COMPOUND">Rubber Compound</option>
                    <option value="CHEMICAL_ADDITIVE">Chemical Additive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LDPE Injection Grade 16MA400"
                  value={matForm.material_name}
                  onChange={(e) => setMatForm({ ...matForm, material_name: e.target.value })}
                  className="w-full p-2 text-xs border rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer / Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. Reliance / IOCL"
                    value={matForm.supplier_name}
                    onChange={(e) => setMatForm({ ...matForm, supplier_name: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Grade Code / Color</label>
                  <input
                    type="text"
                    placeholder="e.g. 16MA400 / Natural"
                    value={matForm.grade_code}
                    onChange={(e) => setMatForm({ ...matForm, grade_code: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Safe Stock (kg)</label>
                  <input
                    type="number"
                    value={matForm.min_stock_kg}
                    onChange={(e) => setMatForm({ ...matForm, min_stock_kg: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Std Bag Wt (kg)</label>
                  <input
                    type="number"
                    value={matForm.standard_bag_wt_kg}
                    onChange={(e) => setMatForm({ ...matForm, standard_bag_wt_kg: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowMatModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium border text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Material Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
