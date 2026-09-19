import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function MachineToleranceManager({ machines }) {
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [tolerances, setTolerances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    parameter_name: '',
    unit: '',
    tolerance_min: '',
    tolerance_max: '',
    tolerance_description: ''
  });

  useEffect(() => {
    if (selectedMachine) {
      loadTolerances();
    }
  }, [selectedMachine]);

  const loadTolerances = async () => {
    setLoading(true);
    try {
      const res = await api.machineTolerances.getMachineTolerances(selectedMachine);
      setTolerances(res);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load tolerances');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedMachine || !formData.parameter_name) {
      setError('Parameter name and machine required');
      return;
    }

    setLoading(true);
    try {
      await api.machineTolerances.saveTolerance({
        machine_id: selectedMachine,
        ...formData
      });
      setSuccess('✓ Tolerance saved successfully');
      setFormData({ parameter_name: '', unit: '', tolerance_min: '', tolerance_max: '', tolerance_description: '' });
      setEditingId(null);
      await loadTolerances();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save tolerance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this tolerance?')) return;

    try {
      await api.machineTolerances.deleteTolerance(id);
      setSuccess('✓ Tolerance deleted');
      await loadTolerances();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete tolerance');
    }
  };

  const handleEdit = (tol) => {
    setFormData({
      parameter_name: tol.parameter_name,
      unit: tol.unit || '',
      tolerance_min: tol.tolerance_min || '',
      tolerance_max: tol.tolerance_max || '',
      tolerance_description: tol.tolerance_description || ''
    });
    setEditingId(tol.id);
  };

  return (
    <div className="panel">
      <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0 }}>
        Machine Parameter Tolerances
      </h2>

      {error && (
        <div style={{ padding: '10px 12px', marginBottom: 10, borderRadius: 6, background: 'rgba(239,68,68,0.12)', border: '1px solid var(--red)', color: 'var(--red)', fontSize: 12 }}>
          ⚠ {error}
        </div>
      )}

      {success && (
        <div style={{ padding: '10px 12px', marginBottom: 10, borderRadius: 6, background: 'rgba(34,197,94,0.12)', border: '1px solid var(--green)', color: 'var(--green)', fontSize: 12 }}>
          {success}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
          Select Machine
        </label>
        <select
          value={selectedMachine || ''}
          onChange={(e) => setSelectedMachine(Number(e.target.value) || null)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 6,
            border: '2px solid var(--amber)',
            background: 'var(--panel)',
            color: 'var(--text)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <option value="">-- Choose a machine --</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.machine_code}
            </option>
          ))}
        </select>
      </div>

      {selectedMachine && (
        <>
          <div style={{ marginBottom: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--line)', borderRadius: 6, padding: 12 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginTop: 0, marginBottom: 12 }}>
              {editingId ? '✏️ Edit Tolerance' : '➕ Add New Tolerance'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Parameter name"
                value={formData.parameter_name}
                onChange={(e) => setFormData({ ...formData, parameter_name: e.target.value })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text)',
                  fontSize: 11
                }}
              />
              <input
                type="text"
                placeholder="Unit (°C, bar, mm, s)"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text)',
                  fontSize: 11
                }}
              />
              <input
                type="number"
                placeholder="Tolerance Min (e.g., -5)"
                value={formData.tolerance_min}
                onChange={(e) => setFormData({ ...formData, tolerance_min: e.target.value })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text)',
                  fontSize: 11
                }}
              />
              <input
                type="number"
                placeholder="Tolerance Max (e.g., +5)"
                value={formData.tolerance_max}
                onChange={(e) => setFormData({ ...formData, tolerance_max: e.target.value })}
                style={{
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid var(--line)',
                  background: 'rgba(255,255,255,0.04)',
                  color: 'var(--text)',
                  fontSize: 11
                }}
              />
            </div>

            <textarea
              placeholder="Description (e.g., Temperature tolerance)"
              value={formData.tolerance_description}
              onChange={(e) => setFormData({ ...formData, tolerance_description: e.target.value })}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 4,
                border: '1px solid var(--line)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text)',
                fontSize: 11,
                fontFamily: 'inherit',
                minHeight: 60,
                marginBottom: 10,
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: '#f59e0b',
                  border: 'none',
                  color: '#000',
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 6,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Saving...' : (editingId ? '✏️ Update' : '➕ Add')}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ parameter_name: '', unit: '', tolerance_min: '', tolerance_max: '', tolerance_description: '' });
                  }}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid var(--line)',
                    color: 'var(--text)',
                    fontSize: 12,
                    fontWeight: 600,
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginTop: 0, marginBottom: 10 }}>
              📋 Current Tolerances ({tolerances.length})
            </h3>

            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                Loading...
              </div>
            ) : tolerances.length === 0 ? (
              <div style={{ padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 6, color: 'var(--text-muted)', fontSize: 12 }}>
                No tolerances defined yet
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 8 }}>
                {tolerances.map((tol) => (
                  <div key={tol.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    padding: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>
                        {tol.parameter_name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        Range: {tol.tolerance_min} to {tol.tolerance_max} {tol.unit}
                        {tol.tolerance_description && ` • ${tol.tolerance_description}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(tol)}
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid var(--blue)',
                          color: 'var(--blue)',
                          fontSize: 11,
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tol.id)}
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid var(--red)',
                          color: 'var(--red)',
                          fontSize: 11,
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
