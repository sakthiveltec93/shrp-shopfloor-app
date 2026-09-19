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
    if (!selectedMachine) {
      setTemplate(null);
      setSpecs(null);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    Promise.all([
      api.machineTemplates.getTemplate(selectedMachine),
      partId && api.machineTemplates.getPartSpecs(partId, selectedMachine),
    ])
      .then(([tpl, spec]) => {
        console.log('Loaded template:', tpl);
        console.log('Loaded specs:', spec);
        setTemplate(tpl);
        setSpecs(spec?.parameter_specs || {});
      })
      .catch((err) => {
        console.error('Error loading parameters:', err);
        setError(err.message || 'Failed to load parameters');
      })
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
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>
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
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23${(document.documentElement.style.getPropertyValue('--text') || 'ffffff').replace('#', '')}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                paddingRight: '30px',
              }}
            >
              <option value="">-- Choose a machine --</option>
              {activeMachines.map((m) => (
                <option key={m.id} value={m.id} style={{ background: 'var(--panel)', color: 'var(--text)' }}>
                  {m.machine_code}
                </option>
              ))}
            </select>
          </div>

          {selectedMachine && (
            <>
              {loading ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  🔄 Loading machine template and parameters...
                </div>
              ) : template ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--amber)', borderRadius: 6, padding: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}>
                      Template: {template.template_name}
                    </div>
                    {template.description && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                        {template.description}
                      </div>
                    )}
                  </div>

                  {template.parameters && Array.isArray(template.parameters) && template.parameters.length > 0 ? (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
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
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 6,
                              }}
                            >
                              <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)', display: 'block' }}>
                                {param.name}
                              </label>
                              <input
                                type="text"
                                placeholder="000.0"
                                value={value}
                                onChange={(e) => handleValueChange(param.field_key, e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: 4,
                                  border: '1px solid var(--line)',
                                  background: 'rgba(255,255,255,0.04)',
                                  color: 'var(--text)',
                                  fontSize: 11,
                                  fontFamily: 'monospace',
                                  fontWeight: 600,
                                }}
                              />
                              <div style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center' }}>
                                {param.unit}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleSave}
                        style={{
                          background: '#f59e0b',
                          border: 'none',
                          color: '#000',
                          padding: '12px 16px',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.6 : 1,
                          marginTop: 8,
                        }}
                      >
                        {loading ? '💾 Saving...' : '💾 Save Parameters'}
                      </button>
                    </>
                  ) : (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                      No parameters defined for this machine template.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--red)', padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
                  ⚠️ No template found for this machine. Contact admin to set up template.
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
