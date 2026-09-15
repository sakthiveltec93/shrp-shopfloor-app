import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { translations } from './translations';

const STORAGE_KEY = 'shrp_lang';
export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
  { code: 'or', label: 'ଓଡ଼ିଆ', name: 'Odia' },
];

const LanguageContext = createContext(null);

function resolve(dict, key) {
  if (!dict || !key) return undefined;
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
}

function interpolate(str, vars) {
  if (typeof str !== 'string') {
    return typeof str === 'object' && str !== null ? '' : String(str ?? '');
  }
  if (!vars) return str.replace(/\{\{(\w+)\}\}/g, '');
  return str.replace(/\{\{(\w+)\}\}/g, (_, name) => (vars[name] !== undefined && vars[name] !== null ? vars[name] : ''));
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return LANGUAGES.some((l) => l.code === saved) ? saved : 'ta'; // default to Tamil or saved
    } catch {
      return 'ta';
    }
  });

  function setLang(code) {
    if (!LANGUAGES.some((l) => l.code === code)) return;
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  }

  const t = useMemo(() => {
    return (key, vars) => {
      if (!key || typeof key !== 'string') return '';
      const primary = resolve(translations[lang], key);
      if (typeof primary === 'string') return interpolate(primary, vars);
      
      // Fallback to English
      const fallback = resolve(translations.en, key);
      if (typeof fallback === 'string') return interpolate(fallback, vars);
      
      // If default string provided as second argument
      if (typeof vars === 'string') return vars;

      // Fallback: convert dot/camelCase key into clean readable text
      const lastPart = key.split('.').pop() || key;
      return lastPart
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
