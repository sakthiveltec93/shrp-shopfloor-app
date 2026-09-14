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
        api.rawMaterials.recipes().catch(() => []),
        api.parts().catch(() => []),
        api.rawMaterials.list().catch(() => []),
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
      const defaultPrimary = materials.find((m) => m.material_code && m.material_code.includes('LDPE')) || materials[0];
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
      setSuccessMsg('Compounding recipe for ' + (selectedPart?.part_name || 'part') + ' saved!');
      setTimeout(() => setSuccessMsg(''), 5000);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const filteredParts = parts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchName = p.part_name && p.part_name.toLowerCase().includes(q);
    const matchCode = p.part_code && p.part_code.toLowerCase().includes(q);
    const matchCustNo = p.customer_part_no && p.customer_part_no.toLowerCase().includes(q);
    return matchName || matchCode || matchCustNo;
  });

  const totalCalculatedPct =
    Number(form.primary_ratio_pct || 0) +
    Number(form.secondary_ratio_pct || 0) +
    Number(form.regrind_ratio_pct || 0) +
    Number(form.masterbatch_ratio_pct || 0);

  return (
    <div className="screen" style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 className="screen-title" style={{ margin: 0, fontSize: 20 }}>🧪 Dual-Layer Compounding & Part Recipes</h1>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
          Standard virgin grade for customer COA & exact shopfloor blend ratios
        </p>
      </div>

      {/* Concise Tip Banner */}
      <div style={{
        background: 'rgba(217,119,6,0.08)',
        border: '1px solid rgba(217,119,6,0.3)',
        borderRadius: 10,
        padding: '10px 14px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 12,
        color: 'var(--text)',
      }}>
        <span style={{ fontSize: 18 }}>🛡️</span>
        <div>
          <strong>Dual-Layer Recipe Protection:</strong> Customer inspection reports display only the Primary Virgin grade. Internal shopfloor material mixing uses the exact blend configured below.
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

      {/* Search Input */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Search part code, part name, customer part no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            color: 'var(--text)',
            fontSize: 13,
          }}
        />
      </div>

      {/* Parts & Recipe Card Grid */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
          🔄 Loading compounding recipes...
        </div>
      ) : filteredParts.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 10,
          color: 'var(--text-muted)',
          fontSize: 13,
        }}>
          No parts found matching search.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredParts.map((part) => {
            const recipe = recipes.find((r) => r.part_id === part.id);
            const hasRecipe = Boolean(recipe);

            return (
              <div
                key={part.id}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                      {part.part_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--amber)', fontWeight: 600 }}>{part.part_code}</span>
                      {part.customer_part_no && ' • Cust No: ' + part.customer_part_no}
                      {part.customer_name && ' • ' + part.customer_name}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(part, recipe)}
                    className="btn btn-secondary"
                    style={{
                      padding: '5px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>{hasRecipe ? '✏️' : '➕'}</span>
                    <span>{hasRecipe ? 'Edit Recipe' : 'Configure Recipe'}</span>
                  </button>
                </div>

                {/* Blend Visualization Bar */}
                {hasRecipe ? (
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span><strong>COA Grade:</strong> {recipe.primary_material_name || 'Standard Virgin'}</span>
                      <span><strong>Max Regrind:</strong> {recipe.max_allowed_regrind_pct || 15}%</span>
                    </div>

                    {/* Multi-segment Progress Bar */}
                    <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex', background: '#222' }}>
                      <div
                        style={{
                          width: (recipe.primary_ratio_pct || 0) + '%',
                          background: '#3b82f6',
                          height: '100%',
                        }}
                        title={'Primary: ' + recipe.primary_ratio_pct + '%'}
                      />
                      {Number(recipe.secondary_ratio_pct || 0) > 0 && (
                        <div
                          style={{
                            width: recipe.secondary_ratio_pct + '%',
                            background: '#06b6d4',
                            height: '100%',
                          }}
                          title={'Secondary: ' + recipe.secondary_ratio_pct + '%'}
                        />
                      )}
                      {Number(recipe.regrind_ratio_pct || 0) > 0 && (
                        <div
                          style={{
                            width: recipe.regrind_ratio_pct + '%',
                            background: 'var(--green)',
                            height: '100%',
                          }}
                          title={'Regrind: ' + recipe.regrind_ratio_pct + '%'}
                        />
                      )}
                      {Number(recipe.masterbatch_ratio_pct || 0) > 0 && (
                        <div
                          style={{
                            width: recipe.masterbatch_ratio_pct + '%',
                            background: '#c084fc',
                            height: '100%',
                          }}
                          title={'Masterbatch: ' + recipe.masterbatch_ratio_pct + '%'}
                        />
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, fontSize: 11 }}>
                      <span style={{ color: '#60a5fa' }}>🛢️ Virgin {recipe.primary_ratio_pct}%</span>
                      {Number(recipe.secondary_ratio_pct || 0) > 0 && (
                        <span style={{ color: '#67e8f9' }}>🛢️ Sec {recipe.secondary_ratio_pct}%</span>
                      )}
                      {Number(recipe.regrind_ratio_pct || 0) > 0 && (
                        <span style={{ color: 'var(--green)' }}>♻️ Regrind {recipe.regrind_ratio_pct}%</span>
                      )}
                      {Number(recipe.masterbatch_ratio_pct || 0) > 0 && (
                        <span style={{ color: '#d8b4fe' }}>🎨 MB {recipe.masterbatch_ratio_pct}%</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(0,0,0,0.15)', padding: 8, borderRadius: 6 }}>
                    No compounding blend recipe configured yet (Defaults to 100% Primary Virgin).
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* Recipe Modal */}
      {/* ============================================================ */}
      {showModal && selectedPart && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <strong style={{ fontSize: 16 }}>🧪 Recipe: {selectedPart.part_name}</strong>
                <div style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'monospace' }}>{selectedPart.part_code}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Primary Material */}
              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, padding: 10 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#60a5fa', marginBottom: 4, fontWeight: 700 }}>
                  Primary Virgin Material (Shown on Customer COA) *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                  <select
                    value={form.primary_material_id}
                    onChange={(e) => setForm({ ...form, primary_material_id: e.target.value })}
                    required
                    style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                  >
                    <option value="">-- Select Primary Virgin --</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.material_name} ({m.material_code})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.primary_ratio_pct}
                      onChange={(e) => setForm({ ...form, primary_ratio_pct: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>%</span>
                  </div>
                </div>
              </div>

              {/* Secondary Virgin */}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Secondary Virgin Polymer (Optional blend)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                  <select
                    value={form.secondary_material_id}
                    onChange={(e) => setForm({ ...form, secondary_material_id: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                  >
                    <option value="">-- None --</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.material_name} ({m.material_code})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.secondary_ratio_pct}
                      onChange={(e) => setForm({ ...form, secondary_ratio_pct: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>%</span>
                  </div>
                </div>
              </div>

              {/* Regrind Blend */}
              <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: 10 }}>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--green)', marginBottom: 4, fontWeight: 700 }}>
                  ♻️ Regrind Granules Ratio
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                  <select
                    value={form.regrind_material_id}
                    onChange={(e) => setForm({ ...form, regrind_material_id: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                  >
                    <option value="">-- Auto Match Regrind --</option>
                    {materials.filter(m => m.category === 'REGRIND' || m.material_code.includes('REG')).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.material_name} ({m.material_code})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.regrind_ratio_pct}
                      onChange={(e) => setForm({ ...form, regrind_ratio_pct: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>%</span>
                  </div>
                </div>
              </div>

              {/* Masterbatch */}
              <div>
                <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  🎨 Masterbatch / Colorant Ratio
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 }}>
                  <select
                    value={form.masterbatch_material_id}
                    onChange={(e) => setForm({ ...form, masterbatch_material_id: e.target.value })}
                    style={{ padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12 }}
                  >
                    <option value="">-- None / Natural --</option>
                    {materials.filter(m => m.category === 'MASTERBATCH').map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.material_name} ({m.material_code})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.masterbatch_ratio_pct}
                      onChange={(e) => setForm({ ...form, masterbatch_ratio_pct: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>%</span>
                  </div>
                </div>
              </div>

              {/* Total Percentage Calculation Warning */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: 6,
                background: totalCalculatedPct === 100 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: '1px solid ' + (totalCalculatedPct === 100 ? 'var(--green)' : 'var(--red)'),
                fontSize: 12, fontWeight: 700,
              }}>
                <span>Total Compounding Ratio:</span>
                <span style={{ color: totalCalculatedPct === 100 ? 'var(--green)' : 'var(--red)' }}>
                  {totalCalculatedPct}% {totalCalculatedPct === 100 ? '✓ Exact (100%)' : '⚠ Must equal 100%'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: 10 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || totalCalculatedPct !== 100}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: 10, fontWeight: 700 }}
                >
                  {saving ? 'Saving…' : '✓ Save Compounding Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
