import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function PartRecipes() {
  const { user } = useAuth();
  const { t } = useLanguage();
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

  // Bulk Upload Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState(null);

  // Helper for Clean, Short Material Display Name
  const getShortMaterialName = (m) => {
    if (!m) return '';
    if (m.grade && m.polymer_type) {
      return `${m.polymer_type} ${m.grade}`.trim();
    }
    if (m.grade) return m.grade;
    if (m.material_name) {
      return m.material_name
        .replace(/\s*\([^)]*Grade[^)]*\)/gi, '')
        .replace(/\s*\(RM-[^)]*\)/gi, '')
        .replace(/Reliance\s*/gi, '')
        .trim();
    }
    return m.material_code || '';
  };

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
        primary_material_id: existingRecipe.primary_material_id || '',
        primary_ratio_pct: Number(existingRecipe.primary_ratio_pct ?? 100),
        secondary_material_id: existingRecipe.secondary_material_id || '',
        secondary_ratio_pct: Number(existingRecipe.secondary_ratio_pct ?? 0),
        regrind_material_id: existingRecipe.regrind_material_id || '',
        regrind_ratio_pct: Number(existingRecipe.regrind_ratio_pct ?? 0),
        masterbatch_material_id: existingRecipe.masterbatch_material_id || '',
        masterbatch_ratio_pct: Number(existingRecipe.masterbatch_ratio_pct ?? 0),
        max_allowed_regrind_pct: Number(existingRecipe.max_allowed_regrind_pct ?? 15),
        mixing_instructions: existingRecipe.mixing_instructions || '',
      });
    } else {
      const defaultPrimary = (materials || []).find((m) => m.material_code && m.material_code.includes('LDPE')) || materials[0];
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

  // -------------------------------------------------------------
  // Bulk Upload CSV Handlers (Clean column format)
  // -------------------------------------------------------------
  const handleDownloadSampleCsv = () => {
    const headers = [
      'shrp_part_code',
      'part_name',
      'customer_part_no',
      'primary_material_code',
      'primary_ratio_pct',
      'secondary_material_code',
      'secondary_ratio_pct',
      'regrind_material_code',
      'regrind_ratio_pct',
      'masterbatch_material_code',
      'masterbatch_ratio_pct',
      'max_allowed_regrind_pct',
      'mixing_instructions',
    ];

    const rows = (parts || []).filter((p) => p.active !== false).map((p) => {
      const r = (recipes || []).find((rec) => rec.part_id === p.id);
      const priMat = (materials || []).find((m) => m.id === r?.primary_material_id);
      const secMat = (materials || []).find((m) => m.id === r?.secondary_material_id);
      const regMat = (materials || []).find((m) => m.id === r?.regrind_material_id);
      const mbMat = (materials || []).find((m) => m.id === r?.masterbatch_material_id);

      const shrpCode = p.shrp_part_code || p.part_code || '';
      const partName = p.part_code || p.part_name || '';
      const custNo = p.customer_part_no || '';

      return [
        `"${shrpCode.replace(/"/g, '""')}"`,
        `"${partName.replace(/"/g, '""')}"`,
        `"${custNo.replace(/"/g, '""')}"`,
        priMat?.material_code || (materials[0]?.material_code || 'RM-LDPE-16MA400'),
        r?.primary_ratio_pct !== undefined ? r.primary_ratio_pct : 100,
        secMat?.material_code || '',
        r?.secondary_ratio_pct || 0,
        regMat?.material_code || '',
        r?.regrind_ratio_pct || 0,
        mbMat?.material_code || '',
        r?.masterbatch_ratio_pct || 0,
        r?.max_allowed_regrind_pct || 15,
        `"${(r?.mixing_instructions || 'Mix thoroughly before loading hopper').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shrp_compounding_recipes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBulkCsvText(event.target.result || '');
    };
    reader.readAsText(file);
  };

  const handleProcessBulkUpload = async () => {
    if (!bulkCsvText.trim()) {
      setError('Please choose a CSV file or paste CSV content.');
      return;
    }

    setBulkUploading(true);
    setBulkResult(null);
    setError(null);

    try {
      const lines = bulkCsvText
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        throw new Error('CSV file contains no data rows.');
      }

      const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());
      
      let partCodeIdx = headers.indexOf('shrp_part_code');
      if (partCodeIdx === -1) partCodeIdx = headers.indexOf('part_code');
      const partNameIdx = headers.indexOf('part_name');
      const custNoIdx = headers.indexOf('customer_part_no');

      const priMatIdx = headers.findIndex((h) => h.includes('primary_material'));
      const priPctIdx = headers.findIndex((h) => h.includes('primary_ratio'));
      const secMatIdx = headers.findIndex((h) => h.includes('secondary_material'));
      const secPctIdx = headers.findIndex((h) => h.includes('secondary_ratio'));
      const regMatIdx = headers.findIndex((h) => h.includes('regrind_material'));
      const regPctIdx = headers.findIndex((h) => h.includes('regrind_ratio'));
      const mbMatIdx = headers.findIndex((h) => h.includes('masterbatch_material'));
      const mbPctIdx = headers.findIndex((h) => h.includes('masterbatch_ratio'));
      const maxRegIdx = headers.findIndex((h) => h.includes('max_allowed_regrind'));
      const instIdx = headers.findIndex((h) => h.includes('mixing_instructions'));

      if (priMatIdx === -1) {
        throw new Error('CSV must contain a primary material column (primary_material_code).');
      }

      const parsedPayload = [];
      const rowErrors = [];

      for (let i = 1; i < lines.length; i++) {
        const rawRow = lines[i].match(/(".*?"|[^",s]+)(?=s*,|s*$)/g) || lines[i].split(',');
        const row = rawRow.map((c) => c.trim().replace(/^"|"$/g, ''));

        const partCodeVal = partCodeIdx !== -1 ? row[partCodeIdx]?.trim() : '';
        const partNameVal = partNameIdx !== -1 ? row[partNameIdx]?.trim() : '';
        const custNoVal = custNoIdx !== -1 ? row[custNoIdx]?.trim() : '';

        // Match part flexibly by shrp_part_code, part_code, part_name, or customer_part_no
        const partObj = (parts || []).find((p) => {
          if (partCodeVal && (p.part_code?.toLowerCase() === partCodeVal.toLowerCase() || p.shrp_part_code?.toLowerCase() === partCodeVal.toLowerCase())) return true;
          if (custNoVal && p.customer_part_no?.toLowerCase() === custNoVal.toLowerCase()) return true;
          if (partNameVal && p.part_name?.toLowerCase() === partNameVal.toLowerCase()) return true;
          return false;
        });

        if (!partObj) {
          rowErrors.push(`Row ${i + 1}: Part "${partCodeVal || partNameVal || custNoVal}" not found.`);
          continue;
        }

        const priMatCode = row[priMatIdx]?.trim();
        const priMatObj = (materials || []).find(
          (m) => m.material_code?.toLowerCase() === priMatCode?.toLowerCase() ||
                 m.material_name?.toLowerCase() === priMatCode?.toLowerCase() ||
                 m.grade?.toLowerCase() === priMatCode?.toLowerCase()
        );

        if (!priMatObj) {
          rowErrors.push(`Row ${i + 1}: Primary material "${priMatCode}" not found for ${partObj.part_name}.`);
          continue;
        }

        const secMatCode = secMatIdx !== -1 ? row[secMatIdx]?.trim() : '';
        const secMatObj = secMatCode
          ? (materials || []).find((m) => m.material_code?.toLowerCase() === secMatCode?.toLowerCase() || m.grade?.toLowerCase() === secMatCode?.toLowerCase())
          : null;

        const regMatCode = regMatIdx !== -1 ? row[regMatIdx]?.trim() : '';
        const regMatObj = regMatCode
          ? (materials || []).find((m) => m.material_code?.toLowerCase() === regMatCode?.toLowerCase() || m.grade?.toLowerCase() === regMatCode?.toLowerCase())
          : null;

        const mbMatCode = mbMatIdx !== -1 ? row[mbMatIdx]?.trim() : '';
        const mbMatObj = mbMatCode
          ? (materials || []).find((m) => m.material_code?.toLowerCase() === mbMatCode?.toLowerCase() || m.grade?.toLowerCase() === mbMatCode?.toLowerCase())
          : null;

        const priPct = Number(row[priPctIdx] ?? 100);
        const secPct = secPctIdx !== -1 ? Number(row[secPctIdx] ?? 0) : 0;
        const regPct = regPctIdx !== -1 ? Number(row[regPctIdx] ?? 0) : 0;
        const mbPct = mbPctIdx !== -1 ? Number(row[mbPctIdx] ?? 0) : 0;

        parsedPayload.push({
          part_id: partObj.id,
          primary_material_id: priMatObj.id,
          primary_ratio_pct: priPct,
          secondary_material_id: secMatObj?.id || null,
          secondary_ratio_pct: secPct,
          regrind_material_id: regMatObj?.id || null,
          regrind_ratio_pct: regPct,
          masterbatch_material_id: mbMatObj?.id || null,
          masterbatch_ratio_pct: mbPct,
          max_allowed_regrind_pct: maxRegIdx !== -1 ? Number(row[maxRegIdx] ?? 15) : 15,
          mixing_instructions: instIdx !== -1 ? row[instIdx] : '',
        });
      }

      if (parsedPayload.length === 0) {
        throw new Error(rowErrors.join('\n') || 'No valid rows found to upload.');
      }

      const res = await api.rawMaterials.bulkSaveRecipes(parsedPayload);
      setBulkResult({
        saved: res.count || parsedPayload.length,
        errors: rowErrors,
      });
      setSuccessMsg(`✓ Successfully updated ${res.count || parsedPayload.length} compounding recipes in bulk.`);
      loadData();
    } catch (err) {
      setError(err.message || 'Bulk upload failed');
    } finally {
      setBulkUploading(false);
    }
  };

  const filteredParts = (parts || []).filter((p) => {
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
    <div className="screen" style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div>
          <h1 className="screen-title" style={{ margin: 0, fontSize: 20 }}>🧪 Compounding & Blend Recipes</h1>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            Customer COA grade & exact shopfloor compounding ratios
          </p>
        </div>

        {/* Action Buttons: Sample Download & Bulk Upload */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
            title="Download CSV sample prefilled with all parts"
          >
            <span>📥</span> Download Sample CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setShowBulkModal(true);
              setBulkResult(null);
            }}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <span>📤</span> Bulk Upload CSV
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
            boxSizing: 'border-box',
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
            const recipe = (recipes || []).find((r) => r.part_id === part.id);
            const hasRecipe = Boolean(recipe);
            const priMat = (materials || []).find((m) => m.id === recipe?.primary_material_id);
            const secMat = (materials || []).find((m) => m.id === recipe?.secondary_material_id);
            const regMat = (materials || []).find((m) => m.id === recipe?.regrind_material_id);
            const mbMat = (materials || []).find((m) => m.id === recipe?.masterbatch_material_id);

            return (
              <div
                key={part.id}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--line)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                      {part.part_name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      <span style={{ fontFamily: 'monospace', color: 'var(--amber)', fontWeight: 600 }}>{part.shrp_part_code || part.part_code}</span>
                      {part.customer_part_no && ' · Cust: ' + part.customer_part_no}
                      {part.customer_name && ' · ' + part.customer_name}
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
                      flexShrink: 0,
                    }}
                  >
                    <span>{hasRecipe ? '✏️' : '➕'}</span>
                    <span>{hasRecipe ? 'Edit Recipe' : 'Set Recipe'}</span>
                  </button>
                </div>

                {/* Blend Visualization Bar & Short Clean Material Badges */}
                {hasRecipe ? (
                  <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>
                      <span><strong>COA Grade:</strong> <span style={{ color: 'var(--text)', fontWeight: 600 }}>{getShortMaterialName(priMat) || recipe?.primary_material_name || 'Standard Virgin'}</span></span>
                      <span><strong>Max Regrind:</strong> {recipe?.max_allowed_regrind_pct || 15}%</span>
                    </div>

                    <div style={{ height: 10, borderRadius: 5, overflow: 'hidden', display: 'flex', background: '#222' }}>
                      <div
                        style={{
                          width: (recipe?.primary_ratio_pct || 0) + '%',
                          background: '#3b82f6',
                          height: '100%',
                        }}
                        title={'Primary: ' + recipe?.primary_ratio_pct + '%'}
                      />
                      {Number(recipe?.secondary_ratio_pct || 0) > 0 && (
                        <div
                          style={{
                            width: recipe.secondary_ratio_pct + '%',
                            background: '#06b6d4',
                            height: '100%',
                          }}
                          title={'Secondary: ' + recipe.secondary_ratio_pct + '%'}
                        />
                      )}
                      {Number(recipe?.regrind_ratio_pct || 0) > 0 && (
                        <div
                          style={{
                            width: recipe.regrind_ratio_pct + '%',
                            background: 'var(--green)',
                            height: '100%',
                          }}
                          title={'Regrind: ' + recipe.regrind_ratio_pct + '%'}
                        />
                      )}
                      {Number(recipe?.masterbatch_ratio_pct || 0) > 0 && (
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

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6, fontSize: 11 }}>
                      <span style={{ color: '#60a5fa' }}>
                        🛢️ {getShortMaterialName(priMat) || 'Primary'} {recipe?.primary_ratio_pct}%
                      </span>
                      {Number(recipe?.secondary_ratio_pct || 0) > 0 && (
                        <span style={{ color: '#67e8f9' }}>
                          🛢️ {getShortMaterialName(secMat) || 'Sec'} {recipe.secondary_ratio_pct}%
                        </span>
                      )}
                      {Number(recipe?.regrind_ratio_pct || 0) > 0 && (
                        <span style={{ color: 'var(--green)' }}>
                          ♻️ {getShortMaterialName(regMat) || 'Regrind'} {recipe.regrind_ratio_pct}%
                        </span>
                      )}
                      {Number(recipe?.masterbatch_ratio_pct || 0) > 0 && (
                        <span style={{ color: '#d8b4fe' }}>
                          🎨 {getShortMaterialName(mbMat) || 'MB'} {recipe.masterbatch_ratio_pct}%
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(0,0,0,0.15)', padding: '6px 8px', borderRadius: 6 }}>
                    No compounding blend recipe configured yet (Defaults to 100% Primary Virgin).
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* Recipe Modal (Clean Mobile-Friendly) */}
      {/* ============================================================ */}
      {showModal && selectedPart && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12,
        }}>
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12,
            width: '95vw', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden',
            padding: 16, boxSizing: 'border-box', boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                <strong style={{ fontSize: 15, color: 'var(--text)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  🧪 Recipe: {selectedPart.part_name}
                </strong>
                <div style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'monospace' }}>{selectedPart.shrp_part_code || selectedPart.part_code}</div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer', padding: 4 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Primary Material */}
              <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 8, padding: 10 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#60a5fa', marginBottom: 4, fontWeight: 700 }}>
                  Primary Virgin Material (Shown on Customer COA) *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <select
                    value={form.primary_material_id}
                    onChange={(e) => setForm({ ...form, primary_material_id: e.target.value })}
                    required
                    style={{ width: '100%', padding: '7px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }}
                  >
                    <option value="">-- Select Primary Virgin --</option>
                    {(materials || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {getShortMaterialName(m)} ({m.material_code})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ratio:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.primary_ratio_pct}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm({ ...form, primary_ratio_pct: e.target.value === '' ? '' : Number(e.target.value) })}
                      style={{ width: 70, padding: '5px 8px', borderRadius: 5, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>%</span>
                    <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, primary_ratio_pct: Math.max(0, Number(form.primary_ratio_pct || 0) - 5) })}
                        style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--line)', color: 'var(--text)', cursor: 'pointer' }}
                      >
                        -5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, primary_ratio_pct: Math.min(100, Number(form.primary_ratio_pct || 0) + 5) })}
                        style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--line)', color: 'var(--text)', cursor: 'pointer' }}
                      >
                        +5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, primary_ratio_pct: 100, secondary_ratio_pct: 0, regrind_ratio_pct: 0, masterbatch_ratio_pct: 0 })}
                        style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, background: 'rgba(59,130,246,0.2)', border: '1px solid #3b82f6', color: '#60a5fa', cursor: 'pointer' }}
                      >
                        100%
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Virgin */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 8, padding: 10 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Secondary Virgin Polymer (Optional blend)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <select
                    value={form.secondary_material_id}
                    onChange={(e) => setForm({ ...form, secondary_material_id: e.target.value })}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }}
                  >
                    <option value="">-- None (0%) --</option>
                    {(materials || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {getShortMaterialName(m)} ({m.material_code})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ratio:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.secondary_ratio_pct}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm({ ...form, secondary_ratio_pct: e.target.value === '' ? '' : Number(e.target.value) })}
                      style={{ width: 70, padding: '5px 8px', borderRadius: 5, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>%</span>
                    <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, secondary_ratio_pct: Math.max(0, Number(form.secondary_ratio_pct || 0) - 5) })}
                        style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--line)', color: 'var(--text)', cursor: 'pointer' }}
                      >
                        -5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, secondary_ratio_pct: Math.min(100, Number(form.secondary_ratio_pct || 0) + 5) })}
                        style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--line)', color: 'var(--text)', cursor: 'pointer' }}
                      >
                        +5%
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Regrind Material */}
              <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 10 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--green)', marginBottom: 4, fontWeight: 600 }}>
                  Internal Regrind / Runner Recycle (Shopfloor mixing)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <select
                    value={form.regrind_material_id}
                    onChange={(e) => setForm({ ...form, regrind_material_id: e.target.value })}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }}
                  >
                    <option value="">-- No Regrind (0%) --</option>
                    {(materials || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {getShortMaterialName(m)} ({m.material_code})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ratio:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.regrind_ratio_pct}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm({ ...form, regrind_ratio_pct: e.target.value === '' ? '' : Number(e.target.value) })}
                      style={{ width: 70, padding: '5px 8px', borderRadius: 5, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>%</span>
                    <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, regrind_ratio_pct: Math.max(0, Number(form.regrind_ratio_pct || 0) - 5) })}
                        style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--line)', color: 'var(--text)', cursor: 'pointer' }}
                      >
                        -5%
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, regrind_ratio_pct: Math.min(100, Number(form.regrind_ratio_pct || 0) + 5) })}
                        style={{ padding: '3px 7px', fontSize: 10, borderRadius: 4, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--line)', color: 'var(--text)', cursor: 'pointer' }}
                      >
                        +5%
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Masterbatch */}
              <div style={{ background: 'rgba(192,132,252,0.04)', border: '1px solid rgba(192,132,252,0.2)', borderRadius: 8, padding: 10 }}>
                <label style={{ display: 'block', fontSize: 11, color: '#c084fc', marginBottom: 4, fontWeight: 600 }}>
                  Masterbatch / Color Additive (Optional)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <select
                    value={form.masterbatch_material_id}
                    onChange={(e) => setForm({ ...form, masterbatch_material_id: e.target.value })}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }}
                  >
                    <option value="">-- No Masterbatch (0%) --</option>
                    {(materials || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {getShortMaterialName(m)} ({m.material_code})
                      </option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ratio:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={form.masterbatch_ratio_pct}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setForm({ ...form, masterbatch_ratio_pct: e.target.value === '' ? '' : Number(e.target.value) })}
                      style={{ width: 70, padding: '5px 8px', borderRadius: 5, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, textAlign: 'center' }}
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>%</span>
                  </div>
                </div>
              </div>

              {/* Total Ratio Indicator */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: 8,
                background: Math.abs(totalCalculatedPct - 100) < 0.01 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${Math.abs(totalCalculatedPct - 100) < 0.01 ? 'var(--green)' : 'var(--red)'}`,
              }}>
                <span style={{ fontSize: 12, fontWeight: 700 }}>Total Compound Blend:</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: Math.abs(totalCalculatedPct - 100) < 0.01 ? 'var(--green)' : 'var(--red)' }}>
                  {totalCalculatedPct.toFixed(1)}% {Math.abs(totalCalculatedPct - 100) < 0.01 ? '✓ (Balanced)' : '⚠️ (Must equal 100%)'}
                </span>
              </div>

              {/* Max Regrind Limit & Mixing Instructions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Max Regrind Limit (%)
                  </label>
                  <input
                    type="number"
                    value={form.max_allowed_regrind_pct}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => setForm({ ...form, max_allowed_regrind_pct: Number(e.target.value) })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Mixing Instructions
                  </label>
                  <input
                    type="text"
                    value={form.mixing_instructions}
                    placeholder="e.g. Blend virgin & regrind 5 mins in tumbler"
                    onChange={(e) => setForm({ ...form, mixing_instructions: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--line)', color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, background: 'none', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || Math.abs(totalCalculatedPct - 100) > 0.01}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, width: 'auto' }}
                >
                  {saving ? 'Saving…' : 'Save Compounding Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* Bulk Upload Modal */}
      {/* ============================================================ */}
      {showBulkModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
          zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14,
        }}>
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 12,
            width: '95vw', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: 18,
            boxSizing: 'border-box', boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <strong style={{ fontSize: 16, color: 'var(--text)' }}>📤 Bulk Upload Compounding Recipes</strong>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Upload CSV file or paste raw CSV rows</div>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {bulkResult && (
              <div style={{
                background: 'rgba(34,197,94,0.12)', border: '1px solid var(--green)', borderRadius: 8,
                padding: '10px 12px', marginBottom: 12, fontSize: 12, color: 'var(--green)',
              }}>
                <div>✓ Successfully uploaded and applied <strong>{bulkResult.saved}</strong> part recipes!</div>
                {bulkResult.errors?.length > 0 && (
                  <div style={{ marginTop: 6, color: '#f59e0b', fontSize: 11 }}>
                    ⚠️ {bulkResult.errors.length} skipped row(s):
                    <div style={{ maxHeight: 60, overflowY: 'auto', marginTop: 3 }}>
                      {bulkResult.errors.map((err, idx) => (
                        <div key={idx}>• {err}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text)', marginBottom: 6, fontWeight: 600 }}>
                1. Select CSV File from Computer:
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ fontSize: 12, color: 'var(--text-muted)' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text)', marginBottom: 4, fontWeight: 600 }}>
                2. Or Paste CSV Content directly:
              </label>
              <textarea
                rows={7}
                placeholder="shrp_part_code,part_name,customer_part_no,primary_material_code,primary_ratio_pct..."
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6, background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--line)', color: 'var(--text)', fontSize: 11, fontFamily: 'monospace',
                  boxSizing: 'border-box', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                style={{ padding: '6px 10px', fontSize: 11, background: 'none', border: '1px solid var(--line)', color: 'var(--text-muted)', borderRadius: 6, cursor: 'pointer' }}
              >
                📥 Get Sample Template
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  style={{ padding: '8px 12px', fontSize: 12, background: 'none', border: '1px solid var(--line)', color: 'var(--text)', borderRadius: 6, cursor: 'pointer' }}
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={bulkUploading || !bulkCsvText.trim()}
                  onClick={handleProcessBulkUpload}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, width: 'auto' }}
                >
                  {bulkUploading ? 'Uploading & Processing…' : 'Process & Save Bulk Recipes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
