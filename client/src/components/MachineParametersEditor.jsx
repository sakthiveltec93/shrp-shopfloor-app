import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function MachineParametersEditor({ partId, machines, selectedMachines, onSave }) {
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [template, setTemplate] = useState(null);
  const [specs, setSpecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load template and specs when machine is selected
  useEffect(() => {
    if (!selectedMachine) return;

    setLoading(true);
    setError('');

    Promise.all([
      api.machineTemplates.getTemplate(selectedMachine),
      partId && api.machineTemplates.getPartSpecs(partId, selectedMachine),
    ])
      .then(([tpl, spec]) => {
        setTemplate(tpl);
        setSpecs(spec?.parameter_specs || {});
      })
      .catch((err) => setError(err.message || 'Failed to load parameters'))
      .finally(() => setLoading(false));
  }, [selectedMachine, partId]);

  const handleValueChange = (fieldKey, value) => {
    setSpecs({ ...specs, [fieldKey]: value });
  };

  const handleSave = async () => {
    if (!selectedMachine || !template || !partId) return;

    setLoading(true);
    try {
      const res = await api.machineTemplates.savePartSpecs(selectedMachine, partId, specs);
      if (res.success) {
        setSuccess(`✓ Parameters saved for ${machines.find(m => m.id == selectedMachine)?.machine_code}`);
        setTimeout(() => setSuccess(''), 3000);
        if (onSave) onSave();
      }
    } catch (err) {
      setError(err.message || 'Failed to save parameters');
    } finally {
      setLoading(false);
    }
  };

  const activeMachines = machines.filter(m => selectedMachines.includes(m.id));

  return (
    <div className="panel">
      <h2 style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 0 }}>
        Process Parameters by Machine
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

      {activeMachines.length === 0 ? (
        <div style={{ padding: 12, fontSize: 12, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
          Select machines above to configure their process parameters.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Select Machine
            </label>
            <select
              value={selectedMachine || ''}
              onChange={(e) => setSelectedMachine(Number(e.target.value) || null)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: '1px solid var(--line)',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text)',
                fontSize: 12
              }}
            >
              <option value="">-- Choose a machine --</option>
              {activeMachines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.machine_code} {specs && m.id === selectedMachine ? '✓' : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedMachine && template && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Template: <strong>{template.template_name}</strong>
                {template.description && <div>{template.description}</div>}
              </div>

              {loading ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  Loading parameters...
                </div>
              ) : (
                <>
                  {template.parameters && Array.isArray(template.parameters) && template.parameters.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                      {template.parameters.map((param) => {
                        const value = specs?.[param.field_key] || '';
                        return (
                          <div
                            key={param.field_key}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              border: '1px solid var(--line)',
                              borderRadius: 6,
                              padding: 10,
                            }}
                          >
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                              {param.name}
                            </label>
                            <input
                              type="text"
                              placeholder={`${param.min_value || ''} - ${param.max_value || ''}`}
                              value={value}
                              onChange={(e) => handleValueChange(param.field_key, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '6px 8px',
                                borderRadius: 4,
                                border: '1px solid var(--line)',
                                background: 'rgba(255,255,255,0.04)',
                                color: 'var(--text)',
                                fontSize: 11,
                                fontFamily: 'monospace',
                                marginBottom: 4,
                              }}
                            />
                            <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>
                              {param.unit} {param.min_value !== undefined && param.max_value !== undefined && `(${param.min_value}-${param.max_value})`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      No parameters defined for this machine template.
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSave}
                    style={{
                      background: '#f59e0b',
                      border: 'none',
                      color: '#000',
                      padding: '10px 14px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Parameters'}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
