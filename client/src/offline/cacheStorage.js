// Cache storage helper for caching master and read data in localStorage
// so that screens can populate dropdowns and tables when offline.

const CACHE_PREFIX = 'shrp_cache_';

export const cacheStorage = {
  set(path, data) {
    if (!path) return;
    try {
      const payload = {
        timestamp: Date.now(),
        data,
      };
      localStorage.setItem(`${CACHE_PREFIX}${path}`, JSON.stringify(payload));
    } catch (e) {
      console.warn('Unable to cache path offline:', path, e);
    }
  },

  get(path) {
    if (!path) return null;
    try {
      const raw = localStorage.getItem(`${CACHE_PREFIX}${path}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed ? parsed.data : null;
    } catch {
      return null;
    }
  },

  remove(path) {
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${path}`);
    } catch { /* ignore */ }
  },

  clear() {
    try {
      const keys = Object.keys(localStorage);
      for (const k of keys) {
        if (k.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
    } catch { /* ignore */ }
  },
};
