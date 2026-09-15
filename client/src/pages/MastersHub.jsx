import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../api';

const TABS = [
  { key: 'parts', label: '📋 Parts' },
  { key: 'rm', label: '🧪 Raw Materials' },
  { key: 'gauges', label: '📏 Gauges & Instruments' },
  { key: 'suppliers', label: '🏭 Suppliers' },
  { key: 'customers', label: '🏢 Customers' },
  { key: 'machines', label: '⚙️ Machines' },
  { key: 'moulds', label: '🔧 Moulds & Tooling' },
  { key: 'defaults', label: '📑 Defaults & Documents' },
];

// Tabs that link out to an existing, already-built dedicated page rather than
// duplicating that page's logic inline. Keeps this hub as a navigation/
// presentation layer on top of the existing (separate) master tables.
const EXTERNAL_LINK_TABS = {
  parts: { to: '/parts', cta: 'Open Parts Master' },
  machines: { to: '/machines', cta: 'Open Machines Master' },
  moulds: { to: '/moulds', cta: 'Open Moulds & Tooling Master' },
};

export default function MastersHub() {
  const [tab, setTab] = useState('parts');

  return (
    <Layout>
      <div className="screen">
        <h1 className="screen-title">🗂️ Masters Hub</h1>
        <p className="screen-sub">Centralized master data management — admin &amp; supervisor only</p>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={tab === t.key ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ width: 'auto', padding: '8px 14px', fontSize: 13 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {EXTERNAL_LINK_TABS[tab] ? (
          <ExternalLinkPanel {...EXTERNAL_LINK_TABS[tab]} />
        ) : tab === 'rm' ? (
          <RmPanel />
        ) : tab === 'gauges' ? (
          <GaugesPanel />
        ) : tab === 'suppliers' ? (
          <SuppliersPanel />
        ) : tab === 'customers' ? (
          <CustomersPanel />
        ) : tab === 'defaults' ? (
          <DefaultsPanel />
        ) : null}
      </div>
    </Layout>
  );
}

function ExternalLinkPanel({ to, cta }) {
  return (
    <div className="panel" style={{ textAlign: 'center', padding: 32 }}>
      <p style={{ marginBottom: 16, color: 'var(--text-secondary, #999)' }}>
        This master has its own dedicated screen with full search, create, and edit support.
      </p>
      <Link to={to} className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
        {cta} →
      </Link>
    </div>
  );
}

function RmPanel() {
  return (
    <div className="panel" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', padding: 24 }}>
      <Link to="/rm-inward" className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
        RM Inward Inspection →
      </Link>
      <Link to="/rm-stock" className="btn btn-secondary" style={{ width: 'auto', padding: '10px 20px' }}>
        RM Stock Register →
      </Link>
      <Link to="/recipes" className="btn btn-secondary" style={{ width: 'auto', padding: '10px 20px' }}>
        Part Recipes (RM Mix) →
      </Link>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    HEALTHY: { label: 'Healthy', color: '#10b981' },
    DUE_SOON: { label: 'Due Soon', color: '#f59e0b' },
    OVERDUE: { label: 'Overdue', color: '#ef4444' },
  };
  const s = map[status] || map.HEALTHY;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700,
      background: `${s.color}22`, color: s.color, border: `1px solid ${s.color}55`,
    }}>
      {s.label}
    </span>
  );
}

function GaugesPanel() {
  const [gauges, setGauges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    gauge_code: '', gauge_name: '', gauge_type: '', range_spec: '', accuracy: '',
    location: '', calibration_interval_days: 365, last_calibrated_at: '', calibration_cert_no: '',
  });

  const load = () => {
    setLoading(true);
    api.gauges()
      .then(setGauges)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createGauge(form);
      setShowForm(false);
      setForm({
        gauge_code: '', gauge_name: '', gauge_type: '', range_spec: '', accuracy: '',
        location: '', calibration_interval_days: 365, last_calibrated_at: '', calibration_cert_no: '',
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const calibrateNow = async (id) => {
    try {
      await api.recordCalibration(id, { calibrated_at: new Date().toISOString().slice(0, 10) });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Gauges &amp; Instruments</h3>
        <button className="btn btn-primary" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add Gauge'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form onSubmit={submit} className="panel" style={{ marginBottom: 16, display: 'grid', gap: 8 }}>
          <input placeholder="Gauge code *" required value={form.gauge_code}
            onChange={(e) => setForm({ ...form, gauge_code: e.target.value })} />
          <input placeholder="Gauge name *" required value={form.gauge_name}
            onChange={(e) => setForm({ ...form, gauge_name: e.target.value })} />
          <input placeholder="Type (e.g. Vernier, Micrometer)" value={form.gauge_type}
            onChange={(e) => setForm({ ...form, gauge_type: e.target.value })} />
          <input placeholder="Range (e.g. 0-150mm)" value={form.range_spec}
            onChange={(e) => setForm({ ...form, range_spec: e.target.value })} />
          <input placeholder="Accuracy" value={form.accuracy}
            onChange={(e) => setForm({ ...form, accuracy: e.target.value })} />
          <input placeholder="Location" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <label style={{ fontSize: 12 }}>Calibration interval (days)</label>
          <input type="number" min="1" value={form.calibration_interval_days}
            onChange={(e) => setForm({ ...form, calibration_interval_days: e.target.value })} />
          <label style={{ fontSize: 12 }}>Last calibrated on</label>
          <input type="date" value={form.last_calibrated_at}
            onChange={(e) => setForm({ ...form, last_calibrated_at: e.target.value })} />
          <input placeholder="Calibration certificate no." value={form.calibration_cert_no}
            onChange={(e) => setForm({ ...form, calibration_cert_no: e.target.value })} />
          <button type="submit" className="btn btn-primary">Save Gauge</button>
        </form>
      )}

      {loading ? <p>Loading…</p> : gauges.length === 0 ? (
        <p style={{ color: 'var(--text-secondary, #999)' }}>No gauges added yet.</p>
      ) : (
        gauges.map((g) => (
          <div key={g.id} className="panel" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <strong>{g.gauge_name}</strong> <span style={{ color: 'var(--text-secondary, #999)' }}>({g.gauge_code})</span>
              <div style={{ fontSize: 12, color: 'var(--text-secondary, #999)' }}>
                {g.gauge_type || '—'} {g.range_spec ? `· ${g.range_spec}` : ''} {g.location ? `· ${g.location}` : ''}
              </div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                Last calibrated: {g.last_calibrated_at ? new Date(g.last_calibrated_at).toLocaleDateString() : 'Never'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <StatusBadge status={g.calibration_status} />
              <button className="btn btn-secondary" style={{ width: 'auto', padding: '6px 12px', fontSize: 12 }} onClick={() => calibrateNow(g.id)}>
                Mark Calibrated Today
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function SuppliersPanel() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    supplier_code: '', supplier_name: '', contact_person: '', phone: '', email: '',
    address: '', materials_supplied: '', payment_terms: '', lead_time_days: '',
  });

  const load = () => {
    setLoading(true);
    api.suppliers()
      .then(setSuppliers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createSupplier(form);
      setShowForm(false);
      setForm({
        supplier_code: '', supplier_name: '', contact_person: '', phone: '', email: '',
        address: '', materials_supplied: '', payment_terms: '', lead_time_days: '',
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Suppliers</h3>
        <button className="btn btn-primary" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : '+ Add Supplier'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <form onSubmit={submit} className="panel" style={{ marginBottom: 16, display: 'grid', gap: 8 }}>
          <input placeholder="Supplier code *" required value={form.supplier_code}
            onChange={(e) => setForm({ ...form, supplier_code: e.target.value })} />
          <input placeholder="Supplier name *" required value={form.supplier_name}
            onChange={(e) => setForm({ ...form, supplier_name: e.target.value })} />
          <input placeholder="Contact person" value={form.contact_person}
            onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          <input placeholder="Phone" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Address" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input placeholder="Materials supplied" value={form.materials_supplied}
            onChange={(e) => setForm({ ...form, materials_supplied: e.target.value })} />
          <input placeholder="Payment terms" value={form.payment_terms}
            onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} />
          <input type="number" min="0" placeholder="Lead time (days)" value={form.lead_time_days}
            onChange={(e) => setForm({ ...form, lead_time_days: e.target.value })} />
          <button type="submit" className="btn btn-primary">Save Supplier</button>
        </form>
      )}

      {loading ? <p>Loading…</p> : suppliers.length === 0 ? (
        <p style={{ color: 'var(--text-secondary, #999)' }}>No suppliers added yet.</p>
      ) : (
        suppliers.map((s) => (
          <div key={s.id} className="panel" style={{ marginBottom: 8 }}>
            <strong>{s.supplier_name}</strong> <span style={{ color: 'var(--text-secondary, #999)' }}>({s.supplier_code})</span>
            {!s.active && <span style={{ marginLeft: 8, fontSize: 11, color: '#ef4444' }}>INACTIVE</span>}
            <div style={{ fontSize: 12, color: 'var(--text-secondary, #999)', marginTop: 4 }}>
              {s.contact_person ? `${s.contact_person} · ` : ''}{s.phone || ''} {s.email ? `· ${s.email}` : ''}
            </div>
            {s.materials_supplied && (
              <div style={{ fontSize: 12, marginTop: 4 }}>Supplies: {s.materials_supplied}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function CustomersPanel() {
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const load = () => api.masters.customers().then(setCustomers).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return;
    try {
      await api.createCustomer(name.trim());
      setName('');
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Customers</h3>
      {error && <div className="error-banner">{error}</div>}
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="New customer name" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
        <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '8px 16px' }}>Add</button>
      </form>
      {customers.map((c) => (
        <div key={c.id} className="panel" style={{ marginBottom: 6, padding: '10px 14px' }}>{c.name}</div>
      ))}
    </div>
  );
}

function DefaultsPanel() {
  return (
    <div className="panel" style={{ padding: 24 }}>
      <p style={{ color: 'var(--text-secondary, #999)' }}>
        Checksheet items, reject reason codes, and downtime reason categories are managed from their
        existing dedicated screens. Part SOP / PPAP / drawing documents are managed per-part from the
        Parts Master (📋 Parts tab → open a part → Files).
      </p>
    </div>
  );
}
