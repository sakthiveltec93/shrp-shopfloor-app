import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function Alerts() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertsData, setAlertsData] = useState({
    totalCount: 0,
    pendingFpa: [],
    overdueMoulds: [],
    regrindDeviations: [],
    pendingSetups: [],
    pendingDeletions: [],
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'fpa' | 'moulds' | 'regrind' | 'setups' | 'deletions'

  async function loadAlerts() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAlerts();
      setAlertsData(data || {
        totalCount: 0,
        pendingFpa: [],
        overdueMoulds: [],
        regrindDeviations: [],
        pendingSetups: [],
        pendingDeletions: [],
      });
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError(err.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 20000);
    return () => clearInterval(interval);
  }, []);

  const isSupervisorOrAdmin = user && (user.role === 'admin' || user.role === 'supervisor');

  const fpaCount = alertsData.pendingFpa?.length || 0;
  const mouldCount = alertsData.overdueMoulds?.length || 0;
  const regrindCount = alertsData.regrindDeviations?.length || 0;
  const setupCount = alertsData.pendingSetups?.length || 0;
  const deletionCount = alertsData.pendingDeletions?.length || 0;
  const totalCount = fpaCount + mouldCount + regrindCount + setupCount + (isSupervisorOrAdmin ? deletionCount : 0);

  return (
    <div className="screen" style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderLeft: '4px solid #ef4444',
          borderRadius: 8,
          padding: '14px 16px',
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f87171', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Shopfloor Action Center
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>
            ⚡ Active Alerts & Gates
          </div>
        </div>
        <button
          type="button"
          onClick={loadAlerts}
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: '6px 10px',
            color: 'var(--text-muted)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: 10, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 6, color: '#fca5a5', marginBottom: 12, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 14 }}>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            padding: '7px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            border: '1px solid',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            background: activeTab === 'all' ? 'var(--amber)' : 'var(--panel)',
            color: activeTab === 'all' ? '#000' : 'var(--text)',
            borderColor: activeTab === 'all' ? 'var(--amber)' : 'var(--line)',
          }}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fpa')}
          style={{
            padding: '7px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            border: '1px solid',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            background: activeTab === 'fpa' ? '#ef4444' : 'var(--panel)',
            color: activeTab === 'fpa' ? '#fff' : 'var(--text)',
            borderColor: activeTab === 'fpa' ? '#ef4444' : 'var(--line)',
          }}
        >
          🚨 FPA Pending ({fpaCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('moulds')}
          style={{
            padding: '7px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            border: '1px solid',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            background: activeTab === 'moulds' ? '#f59e0b' : 'var(--panel)',
            color: activeTab === 'moulds' ? '#000' : 'var(--text)',
            borderColor: activeTab === 'moulds' ? '#f59e0b' : 'var(--line)',
          }}
        >
          🛠️ Mould PM ({mouldCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('regrind')}
          style={{
            padding: '7px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            border: '1px solid',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            background: activeTab === 'regrind' ? '#8b5cf6' : 'var(--panel)',
            color: activeTab === 'regrind' ? '#fff' : 'var(--text)',
            borderColor: activeTab === 'regrind' ? '#8b5cf6' : 'var(--line)',
          }}
        >
          🧪 Regrind ({regrindCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('setups')}
          style={{
            padding: '7px 12px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            border: '1px solid',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            background: activeTab === 'setups' ? '#3b82f6' : 'var(--panel)',
            color: activeTab === 'setups' ? '#fff' : 'var(--text)',
            borderColor: activeTab === 'setups' ? '#3b82f6' : 'var(--line)',
          }}
        >
          ⚙️ Setup Approvals ({setupCount})
        </button>
        {isSupervisorOrAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('deletions')}
            style={{
              padding: '7px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              border: '1px solid',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              background: activeTab === 'deletions' ? '#ec4899' : 'var(--panel)',
              color: activeTab === 'deletions' ? '#fff' : 'var(--text)',
              borderColor: activeTab === 'deletions' ? '#ec4899' : 'var(--line)',
            }}
          >
            🗑️ Deletions ({deletionCount})
          </button>
        )}
      </div>

      {loading && totalCount === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
          🔄 Loading active alerts…
        </div>
      )}

      {!loading && totalCount === 0 && (
        <div
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: '36px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399' }}>All Clear! No Pending Action Required</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            All first-piece approvals, mould PM cycles, setup authorizations, and quality limits are in good standing.
          </div>
        </div>
      )}

      {/* Alert Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 1. Pending FPA Approvals */}
        {(activeTab === 'all' || activeTab === 'fpa') && alertsData.pendingFpa?.map((item) => (
          <div
            key={`fpa-${item.fpa_id || item.assignment_id}`}
            style={{
              background: 'var(--panel)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderLeft: '4px solid #ef4444',
              borderRadius: 8,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: 4 }}>
                  🚨 FPA GATE BLOCKED
                </span>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>
                  Machine {item.machine_code} · {item.part_name || item.customer_part_no || item.part_code}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Mould: {item.mould_name || item.mould_code || 'Standard'} {item.submitted_by_name ? `· Tech: ${item.submitted_by_name}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/approvals')}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Sign Off FPA →
              </button>
            </div>
            {item.regrind_exceeded_allowed && (
              <div style={{ fontSize: 11, color: '#fca5a5', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: 4 }}>
                ⚠️ Regrind limit exceeded ({item.regrind_pct}%). Deviation approval required.
              </div>
            )}
          </div>
        ))}

        {/* 2. Mould PM Overdue Alerts */}
        {(activeTab === 'all' || activeTab === 'moulds') && alertsData.overdueMoulds?.map((mould) => (
          <div
            key={`mould-${mould.id}`}
            style={{
              background: 'var(--panel)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderLeft: '4px solid #f59e0b',
              borderRadius: 8,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', borderRadius: 4 }}>
                  🛠️ MOULD PM OVERDUE
                </span>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>
                  {mould.mould_name || mould.mould_code} ({mould.mould_code})
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Shots since PM: <strong style={{ color: '#fbbf24' }}>{mould.shots_since_pm?.toLocaleString()}</strong> / Limit: {mould.pm_interval_shots?.toLocaleString()} ({mould.shots_overdue?.toLocaleString()} shots overdue)
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/moulds')}
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#fbbf24',
                  border: '1px solid #f59e0b',
                  borderRadius: 6,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                View PM Tool →
              </button>
            </div>
          </div>
        ))}

        {/* 3. Regrind / Quality Deviations */}
        {(activeTab === 'all' || activeTab === 'regrind') && alertsData.regrindDeviations?.map((dev, idx) => (
          <div
            key={`regrind-${dev.fpa_id || idx}`}
            style={{
              background: 'var(--panel)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderLeft: '4px solid #8b5cf6',
              borderRadius: 8,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', borderRadius: 4 }}>
                  🧪 REGRIND LIMIT EXCEEDED
                </span>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>
                  Machine {dev.machine_code} · {dev.part_name || dev.customer_part_no}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Regrind: <strong style={{ color: '#c4b5fd' }}>{dev.regrind_pct}%</strong> {dev.deviation_no ? `· Deviation #: ${dev.deviation_no}` : '· Awaiting QA Authorization'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/approvals')}
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#c4b5fd',
                  border: '1px solid #8b5cf6',
                  borderRadius: 6,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Review Deviation →
              </button>
            </div>
          </div>
        ))}

        {/* 4. Pending Mould Setup Authorizations */}
        {(activeTab === 'all' || activeTab === 'setups') && alertsData.pendingSetups?.map((setup) => (
          <div
            key={`setup-${setup.assignment_id}`}
            style={{
              background: 'var(--panel)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderLeft: '4px solid #3b82f6',
              borderRadius: 8,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', borderRadius: 4 }}>
                  ⚙️ MOULD SETUP AUTHORIZATION
                </span>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>
                  Machine {setup.machine_code} · {setup.part_name || setup.customer_part_no}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Set By: {setup.set_by_name || 'Operator'} · {new Date(setup.set_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/approvals')}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Authorize →
              </button>
            </div>
          </div>
        ))}

        {/* 5. Pending Deletions */}
        {isSupervisorOrAdmin && (activeTab === 'all' || activeTab === 'deletions') && alertsData.pendingDeletions?.map((del) => (
          <div
            key={`del-${del.id}`}
            style={{
              background: 'var(--panel)',
              border: '1px solid rgba(236, 72, 153, 0.4)',
              borderLeft: '4px solid #ec4899',
              borderRadius: 8,
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', borderRadius: 4 }}>
                  🗑️ RECORD DELETION REQUEST
                </span>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', marginTop: 4 }}>
                  {del.record_type?.toUpperCase()} #{del.id}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Reason: "{del.reason}" {del.requested_by_name ? `· Requested by ${del.requested_by_name}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/approvals')}
                style={{
                  background: 'rgba(236, 72, 153, 0.2)',
                  color: '#f472b6',
                  border: '1px solid #ec4899',
                  borderRadius: 6,
                  padding: '7px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Review Deletion →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
