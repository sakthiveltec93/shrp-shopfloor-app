import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Shopfloor UI Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px 16px',
          maxWidth: 600,
          margin: '30px auto',
          background: 'var(--surface, #1e222d)',
          border: '1.5px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'var(--text, #f1f5f9)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 32 }}>🛡️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, color: '#f87171', fontWeight: 800 }}>
                Shop Floor Safe Mode
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-muted, #94a3b8)' }}>
                An issue occurred rendering this screen, but your core shopfloor operations are protected.
              </p>
            </div>
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 18 }}>
            You can continue logging your production, trimming, inspection, and packing without interruption:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <a
              href="/entry"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
                background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6',
                borderRadius: 8, color: '#60a5fa', textDecoration: 'none', fontWeight: 700, fontSize: 14,
              }}
            >
              ⏱️ Production Entry
            </a>
            <a
              href="/trimming"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
                background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b',
                borderRadius: 8, color: '#fbbf24', textDecoration: 'none', fontWeight: 700, fontSize: 14,
              }}
            >
              ✂️ Trimming
            </a>
            <a
              href="/inspection"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
                background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981',
                borderRadius: 8, color: '#34d399', textDecoration: 'none', fontWeight: 700, fontSize: 14,
              }}
            >
              🔍 Inspection
            </a>
            <a
              href="/packing"
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px',
                background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7',
                borderRadius: 8, color: '#c084fc', textDecoration: 'none', fontWeight: 700, fontSize: 14,
              }}
            >
              📦 Packing
            </a>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={this.handleReset}
              style={{
                flex: 1, padding: '10px 16px', background: 'var(--primary, #2563eb)',
                color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Refresh Screen
            </button>
            <a
              href="/"
              style={{
                padding: '10px 16px', background: 'var(--surface-alt, #282e3e)',
                color: 'var(--text, #f1f5f9)', border: '1px solid var(--line, #3b4252)',
                borderRadius: 8, textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center',
              }}
            >
              Home
            </a>
          </div>

          {this.state.error && (
            <details style={{ marginTop: 18, fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>
              <summary style={{ cursor: 'pointer' }}>Technical details</summary>
              <pre style={{ overflowX: 'auto', background: '#000', padding: 10, borderRadius: 6, marginTop: 6, whiteSpace: 'pre-wrap' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
