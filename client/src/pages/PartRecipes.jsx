import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';

export default function PartRecipes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [parts, setParts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);
  const [form, setForm] = useState({
    part_id: '',
    primary_material_id: '',
    primary_ratio_pct: 100,
    secondary_material_id: '',
    secondary_ratio_pct: 0,
    regrind_material_id: '',
    regrind_ratio_pct: 0,
    masterbatch_material_id: '',
    masterbatch_ratio_pct: 0,
    max_allowed_regrind_pct: 15,
    mixing_instructions: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recipeList, partList, matList] = await Promise.all([
        api.rawMaterials.recipes(),
        api.masters.parts(),
        api.rawMaterials.list(),
      ]);
      setRecipes(Array.isArray(recipeList) ? recipeList : []);
      setParts(Array.isArray(partList) ? partList : []);
      setMaterials(Array.isArray(matList) ? matList : []);
    } catch (err) {
      setError(err.message || 'Failed to load compounding recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEdit = (part, existingRecipe) => {
    setSelectedPart(part);
    if (existingRecipe) {
      setForm({
        part_id: part.id,
        primary_material_id: existingRecipe.primary_material_id,
        primary_ratio_pct: Number(existingRecipe.primary_ratio_pct || 100),
        secondary_material_id: existingRecipe.secondary_material_id || '',
        secondary_ratio_pct: Number(existingRecipe.secondary_ratio_pct || 0),
        regrind_material_id: existingRecipe.regrind_material_id || '',
        regrind_ratio_pct: Number(existingRecipe.regrind_ratio_pct || 0),
        masterbatch_material_id: existingRecipe.masterbatch_material_id || '',
        masterbatch_ratio_pct: Number(existingRecipe.masterbatch_ratio_pct || 0),
        max_allowed_regrind_pct: Number(existingRecipe.max_allowed_regrind_pct || 15),
        mixing_instructions: existingRecipe.mixing_instructions || '',
      });
    } else {
      // Default to LDPE primary
      const defaultPrimary = materials.find((m) => m.material_code.includes('LDPE')) || materials[0];
      setForm({
        part_id: part.id,
        primary_material_id: defaultPrimary?.id || '',
        primary_ratio_pct: 100,
        secondary_material_id: '',
        secondary_ratio_pct: 0,
        regrind_material_id: '',
        regrind_ratio_pct: 0,
        masterbatch_material_id: '',
        masterbatch_ratio_pct: 0,
        max_allowed_regrind_pct: 15,
        mixing_instructions: '',
      });
    }
    setShowModal(true);
  };

  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.rawMaterials.saveRecipe(form.part_id, form);
      setShowModal(false);
      setSuccessMsg(`Dual-layer recipe for ${selectedPart?.part_name} saved!`);
      setTimeout(() => setSuccessMsg(''), 5000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const totalRatio =
    Number(form.primary_ratio_pct || 0) +
    Number(form.secondary_ratio_pct || 0) +
    Number(form.regrind_ratio_pct || 0) +
    Number(form.masterbatch_ratio_pct || 0);

  const filteredParts = parts.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.part_name?.toLowerCase().includes(q) ||
        p.part_code?.toLowerCase().includes(q) ||
        p.shrp_part_code?.toLowerCase().includes(q) ||
        p.customer_part_no?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="screen">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <div>
          <h1 className="screen-title">Dual-Layer Compounding & Part Recipes</h1>
          <p className="screen-sub">Internal Compounding Ratios (LDPE + LLDPE + Regrind + MB) vs Confidential Customer TC</p>
        </div>
        <input
          type="text"
          placeholder="Search part code, name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-slate-500 w-64"
        />
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

      {/* Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4 flex items-start gap-3">
        <span className="text-xl">🔒</span>
        <div className="text-xs text-indigo-950">
          <strong className="font-bold">Dual-Layer Recipe Separation Principle:</strong> Customer-facing Inspection Reports and Certificates of Analysis (COA) automatically read <em>only</em> the <strong>Primary Virgin Material</strong> to protect company compounding intellectual property. Internal shopfloor material issuance uses the exact secondary and regrind blend ratios configured below.
        </div>
      </div>

      {/* Parts Table */}
      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading parts & compounding recipes...</div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="p-3">SHRP Code / Part Name</th>
                <th className="p-3">Customer Part No</th>
                <th className="p-3">Customer-Facing Grade (COA)</th>
                <th className="p-3">Internal Blend Breakdown</th>
                <th className="p-3 text-center">Max Regrind %</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.map((part) => {
                const recipe = recipes.find((r) => r.part_id === part.id);
                return (
                  <tr key={part.id} className="hover:bg-slate-50/80">
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] border">
                          {part.shrp_part_code || part.part_code}
                        </span>
                        <span className="font-semibold text-slate-800">{part.part_name}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] font-mono mt-0.5">{part.part_code}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {part.customer_part_no || part.part_code}
                    </td>
                    <td className="p-3">
                      {recipe ? (
                        <div>
                          <span className="font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                            {recipe.primary_material_code}
                          </span>
                          <div className="text-[10px] text-slate-500 mt-0.5">{recipe.primary_material_name}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not configured</span>
                      )}
                    </td>
                    <td className="p-3">
                      {recipe ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-[11px]">
                            <span className="font-bold text-slate-700">{recipe.primary_ratio_pct}%</span>
                            <span className="text-slate-500">{recipe.primary_material_name}</span>
                          </div>
                          {Number(recipe.secondary_ratio_pct) > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-indigo-700">
                              <span className="font-bold">+{recipe.secondary_ratio_pct}%</span>
                              <span>{recipe.secondary_material_name}</span>
                            </div>
                          )}
                          {Number(recipe.regrind_ratio_pct) > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-emerald-700">
                              <span className="font-bold">+{recipe.regrind_ratio_pct}%</span>
                              <span>{recipe.regrind_material_name || 'Regrind Granules'}</span>
                            </div>
                          )}
                          {Number(recipe.masterbatch_ratio_pct) > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-purple-700">
                              <span className="font-bold">+{recipe.masterbatch_ratio_pct}%</span>
                              <span>{recipe.masterbatch_material_name || 'Masterbatch'}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Standard 100% Virgin</span>
                      )}
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700">
                      {recipe ? `${recipe.max_allowed_regrind_pct || 15}%` : '15%'}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleOpenEdit(part, recipe)}
                        className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
                      >
                        ⚙ Configure Blend
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Recipe Modal */}
      {showModal && selectedPart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 relative my-6">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Compounding Formulation Recipe</h2>
                <p className="text-xs text-slate-500">
                  Part: <strong className="text-slate-800">{selectedPart.part_name}</strong> ({selectedPart.shrp_part_code || selectedPart.part_code})
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4">
              {/* Primary Material (Customer Facing) */}
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                <label className="block text-xs font-bold text-blue-950 mb-1">
                  1. Primary Material Grade (Customer Facing / COA) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      required
                      value={form.primary_material_id}
                      onChange={(e) => setForm({ ...form, primary_material_id: e.target.value })}
                      className="w-full p-2 text-xs border rounded bg-white font-medium"
                    >
                      <option value="">-- Choose Primary Grade --</option>
                      {materials.filter(m => m.category === 'VIRGIN_POLYMER').map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.material_code} - {m.material_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        required
                        value={form.primary_ratio_pct}
                        onChange={(e) => setForm({ ...form, primary_ratio_pct: e.target.value })}
                        className="w-full p-2 text-xs border rounded font-bold"
                      />
                      <span className="absolute right-2 top-2 text-xs text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Material (Internal Compounding Blend) */}
              <div className="p-3 bg-indigo-50/40 rounded-lg border border-indigo-200">
                <label className="block text-xs font-bold text-indigo-950 mb-1">
                  2. Secondary Modifying Polymer (e.g. LLDPE for tear strength)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={form.secondary_material_id}
                      onChange={(e) => setForm({ ...form, secondary_material_id: e.target.value })}
                      className="w-full p-2 text-xs border rounded bg-white"
                    >
                      <option value="">-- None (100% Single Polymer) --</option>
                      {materials.filter(m => m.category === 'VIRGIN_POLYMER' || m.category === 'RUBBER_COMPOUND').map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.material_code} - {m.material_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="100"
                        value={form.secondary_ratio_pct}
                        onChange={(e) => setForm({ ...form, secondary_ratio_pct: e.target.value })}
                        className="w-full p-2 text-xs border rounded font-bold"
                      />
                      <span className="absolute right-2 top-2 text-xs text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regrind Runner Granules */}
              <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-200">
                <label className="block text-xs font-bold text-emerald-950 mb-1">
                  3. Regrind Runner Granules (De-dusted In-House)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={form.regrind_material_id}
                      onChange={(e) => setForm({ ...form, regrind_material_id: e.target.value })}
                      className="w-full p-2 text-xs border rounded bg-white"
                    >
                      <option value="">-- None (0% Regrind) --</option>
                      {materials.filter(m => m.category === 'REGRIND' || m.material_code.includes('REGRIND')).map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.material_code} - {m.material_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max="50"
                        value={form.regrind_ratio_pct}
                        onChange={(e) => setForm({ ...form, regrind_ratio_pct: e.target.value })}
                        className="w-full p-2 text-xs border rounded font-bold"
                      />
                      <span className="absolute right-2 top-2 text-xs text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Masterbatch / Additives */}
              <div className="p-3 bg-purple-50/40 rounded-lg border border-purple-200">
                <label className="block text-xs font-bold text-purple-950 mb-1">
                  4. Masterbatch / Colorant Additive
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={form.masterbatch_material_id}
                      onChange={(e) => setForm({ ...form, masterbatch_material_id: e.target.value })}
                      className="w-full p-2 text-xs border rounded bg-white"
                    >
                      <option value="">-- None (Natural Color) --</option>
                      {materials.filter(m => m.category === 'MASTERBATCH' || m.category === 'CHEMICAL_ADDITIVE').map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.material_code} - {m.material_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="20"
                        value={form.masterbatch_ratio_pct}
                        onChange={(e) => setForm({ ...form, masterbatch_ratio_pct: e.target.value })}
                        className="w-full p-2 text-xs border rounded font-bold"
                      />
                      <span className="absolute right-2 top-2 text-xs text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulation Total Meter */}
              <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded border">
                <span className="text-xs font-bold text-slate-700">Total Blend Ratio:</span>
                <span className={`text-sm font-black ${Math.abs(totalRatio - 100) < 0.1 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {totalRatio.toFixed(1)}% {Math.abs(totalRatio - 100) < 0.1 ? '✓ Balanced' : '⚠ Must equal 100%'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Allowed Regrind %</label>
                  <input
                    type="number"
                    value={form.max_allowed_regrind_pct}
                    onChange={(e) => setForm({ ...form, max_allowed_regrind_pct: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mixing SOP Instruction</label>
                  <input
                    type="text"
                    placeholder="e.g. 7 bags LDPE + 3 bags LLDPE + 3.5 bags runner"
                    value={form.mixing_instructions}
                    onChange={(e) => setForm({ ...form, mixing_instructions: e.target.value })}
                    className="w-full p-2 text-xs border rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded text-xs font-medium border text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
