import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../i18n/LanguageContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, pin);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div style={{ textAlign: 'center', margin: '30px 0 24px' }}>
        <img
          src="/shrp-logo.png"
          alt="SHRP Logo"
          style={{
            height: 52,
            width: 'auto',
            margin: '0 auto 16px',
            background: '#ffffff',
            padding: '4px 12px',
            borderRadius: 8,
            display: 'block',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
          onError={(e) => {
            e.currentTarget.src = '/logo.png';
          }}
        />
        <h1 className="screen-title" style={{ fontSize: 22, margin: '0 0 6px' }}>{t('login.title')}</h1>
        <p className="screen-sub" style={{ margin: 0 }}>{t('login.subtitle')}</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="username">{t('login.username')}</label>
          <input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="pin">{t('login.pin')}</label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? t('login.signingIn') : t('login.signIn')}
        </button>
      </form>
    </div>
  );
}
