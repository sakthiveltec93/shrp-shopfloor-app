/**
 * Safe Storage Abstraction
 * Handles environments where window.localStorage is blocked, throws SecurityError,
 * is running in Incognito/Private browsing, or is restricted by Android WebViews.
 * Seamlessly falls back to an in-memory Map so the application never crashes.
 */

const memoryStore = new Map();

function checkLocalStorage() {
  try {
    if (typeof window === 'undefined') return false;
    const testKey = '__shrp_test_storage__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

let isStorageAvailable = false;
try {
  isStorageAvailable = checkLocalStorage();
} catch (e) {
  isStorageAvailable = false;
}

export const safeStorage = {
  getItem(key) {
    try {
      if (isStorageAvailable && typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // Access denied or disabled
    }
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  },

  setItem(key, value) {
    const strVal = String(value);
    try {
      if (isStorageAvailable && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, strVal);
      }
    } catch (e) {
      // Quota exceeded or access denied
    }
    memoryStore.set(key, strVal);
  },

  removeItem(key) {
    try {
      if (isStorageAvailable && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      // Access denied
    }
    memoryStore.delete(key);
  },

  clear() {
    try {
      if (isStorageAvailable && typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch (e) {
      // Access denied
    }
    memoryStore.clear();
  },

  keys() {
    try {
      if (isStorageAvailable && typeof window !== 'undefined' && window.localStorage) {
        return Object.keys(window.localStorage);
      }
    } catch (e) {
      // Access denied
    }
    return Array.from(memoryStore.keys());
  },
};

export default safeStorage;
