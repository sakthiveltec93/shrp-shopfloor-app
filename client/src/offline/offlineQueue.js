// Offline Mutation Queue with FIFO auto-sync

const QUEUE_KEY = 'shrp_offline_queue';
let isSyncing = false;

function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('shrp:offline-queue-updated', { detail: { count: queue.length } }));
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
    const remaining = [...queue];

    for (const item of queue) {
      try {
        await requestFn(item.path, {
          method: item.method,
          body: item.body,
          isOfflineReplay: true,
        });
        // Success: remove from local queue
        offlineQueue.remove(item.id);
        syncedCount++;
      } catch (err) {
        console.warn('Sync failed for item:', item, err);
        // If it's a network error, stop syncing and retry later
        if (!navigator.onLine || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
          break;
        }
        // If it's a permanent HTTP validation error (4xx), remove it or archive to prevent blocking the queue
        if (err.status && err.status >= 400 && err.status < 500) {
          console.error(`Discarding invalid offline action (${err.status}):`, item, err);
          offlineQueue.remove(item.id);
        } else {
          // 5xx error, server might be temporarily down; stop processing for now
          break;
        }
      }
    }

    isSyncing = false;
    const remainingCount = readQueue().length;
    window.dispatchEvent(new CustomEvent('shrp:offline-sync-completed', {
      detail: { syncedCount, remainingCount },
    }));

    return { synced: syncedCount, remaining: remainingCount };
  },
};
