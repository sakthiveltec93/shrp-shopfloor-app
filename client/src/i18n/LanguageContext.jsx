import { createContext, useContext, useMemo, useState } from 'react';
import { translations } from './translations';

const STORAGE_KEY = 'shrp_lang';
export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ta', label: 'தமிழ்', name: 'Tamil' },
  { code: 'or', label: 'ଓଡ଼ିଆ', name: 'Odia' },
];

const LanguageContext = createContext(null);

function resolve(dict, key) {
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, name) => (vars[name] !== undefined ? vars[name] : `{{${name}}}`));
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return LANGUAGES.some((l) => l.code === saved) ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  function setLang(code) {
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  }

  const t = useMemo(() => {
    return (key, vars) => {
      const primary = resolve(translations[lang], key);
      if (primary !== undefined) return interpolate(primary, vars);
      // Fall back to English, then to the raw key, so a missing translation
      // never blanks out the UI.
      const fallback = resolve(translations.en, key);
      if (fallback !== undefined) return interpolate(fallback, vars);
      return key;
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
