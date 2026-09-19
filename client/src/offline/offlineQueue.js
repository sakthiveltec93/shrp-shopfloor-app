// Offline Mutation Queue with FIFO auto-sync
import safeStorage from '../utils/safeStorage';

const QUEUE_KEY = 'shrp_offline_queue';
let isSyncing = false;

function sanitizeQueue(rawQueue) {
  if (!Array.isArray(rawQueue)) return [];
  // Discard any stale user/admin/delete requests that were accidentally queued
  return rawQueue.filter((item) => {
    if (!item || !item.path) return false;
    if (item.method === 'DELETE') return false;
    if (item.path.startsWith('/users') || item.path.startsWith('/masters') || item.path.startsWith('/auth')) return false;
    return true;
  });
}

function readQueue() {
  try {
    const raw = safeStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const clean = sanitizeQueue(parsed);
    if (clean.length !== parsed.length) {
      safeStorage.setItem(QUEUE_KEY, JSON.stringify(clean));
    }
    return clean;
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  try {
    safeStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('shrp:offline-queue-updated', { detail: { count: queue.length } }));
    }
  } catch (e) {
    console.error('Failed to write offline queue:', e);
  }
}

export const offlineQueue = {
  enqueue({ path, method = 'POST', body, description }) {
    const queue = readQueue();
    const item = {
      id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      path,
      method,
      body,
      description: description || path,
      createdAt: Date.now(),
    };
    queue.push(item);
    writeQueue(queue);
    return item;
  },

  getQueue() {
    return readQueue();
  },

  getPendingCount() {
    return readQueue().length;
  },

  remove(id) {
    const queue = readQueue().filter((item) => item.id !== id);
    writeQueue(queue);
  },

  clear() {
    writeQueue([]);
  },

  isSyncing() {
    return isSyncing;
  },

    async syncQueue(requestFn) {
    if (isSyncing) return { inProgress: true };
    const queue = readQueue();
    if (queue.length === 0) return { synced: 0, remaining: 0 };

    if (!navigator.onLine) {
      return { offline: true, remaining: queue.length };
    }

    isSyncing = true;
    window.dispatchEvent(new CustomEvent('shrp:offline-sync-started', { detail: { count: queue.length } }));

    let syncedCount = 0;

    for (const item of queue) {
      try {
        await requestFn(item.path, {
          method: item.method,
          body: item.body,
          isOfflineReplay: true,
        });
        offlineQueue.remove(item.id);
        syncedCount++;
      } catch (err) {
        console.warn('Sync failed for item:', item, err);
        // If network is completely dropped, stop loop
        if (!navigator.onLine || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
          break;
        }
        // If the server rejected it (4xx or permanent error), remove from queue so it never hangs
        offlineQueue.remove(item.id);
      }
    }

    isSyncing = false;
    const finalQueue = readQueue();
    window.dispatchEvent(new CustomEvent('shrp:offline-queue-updated', { detail: { count: finalQueue.length } }));
    return { synced: syncedCount, remaining: finalQueue.length };
  },
};
