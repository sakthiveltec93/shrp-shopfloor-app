import { cacheStorage } from './offline/cacheStorage';
import { offlineQueue } from './offline/offlineQueue';

const BASE = '/api';

function getToken() {
  return localStorage.getItem('shrp_token');
}

function isQueueable(path, method) {
  if (method !== 'POST' && method !== 'PUT') return false;
  // Auth and PIN changes must not be queued offline
  if (path.startsWith('/auth') || path.startsWith('/account/change-pin')) return false;
  return true;
}

async function request(path, { method = 'GET', body, isOfflineReplay = false, description } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  // If we are completely offline and this is a mutating queueable action, queue immediately
  if (!isOfflineReplay && typeof navigator !== 'undefined' && !navigator.onLine && isQueueable(path, method)) {
    const item = offlineQueue.enqueue({ path, method, body, description });
    return {
      ok: true,
      queuedOffline: true,
      queueId: item.id,
      message: 'Saved offline. Will sync when reconnected.',
    };
  }

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (netErr) {
    // If GET request fails and we have cached data, return it
    if (method === 'GET') {
      const cached = cacheStorage.get(path);
      if (cached !== null) {
        return cached;
      }
    }
    // If mutating request fails due to network drop, queue it
    if (!isOfflineReplay && isQueueable(path, method)) {
      const item = offlineQueue.enqueue({ path, method, body, description });
      return {
        ok: true,
        queuedOffline: true,
        queueId: item.id,
        message: 'Network error. Saved offline and will sync when reconnected.',
      };
    }
    const err = new Error(netErr.message || 'Network request failed');
    err.isNetworkError = true;
    throw err;
  }

  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  // Cache successful GET requests for offline use
  if (method === 'GET' && data) {
    cacheStorage.set(path, data);
  }

  return data;
}

// Auto-sync whenever the browser detects network reconnection
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineQueue.syncQueue(request);
  });
}

export const api = {
  login: (username, pin) => request('/auth/login', { method: 'POST', body: { username, pin } }),
  machines: () => request('/masters/machines'),
  parts: () => request('/masters/parts'),
  partDetail: (id) => request(`/masters/parts/${id}/detail`),
  createPart: (payload) => request('/masters/parts', { method: 'POST', body: payload }),
  updatePart: (id, payload) => request(`/masters/parts/${id}`, { method: 'PUT', body: payload }),
  setPartParameters: (id, parameters) => request(`/masters/parts/${id}/parameters`, { method: 'PUT', body: { parameters } }),
  setPartDimensions: (id, dimensions) => request(`/masters/parts/${id}/dimensions`, { method: 'PUT', body: { dimensions } }),
  setPartMachines: (id, machine_ids) => request(`/masters/parts/${id}/machines`, { method: 'PUT', body: { machine_ids } }),
  uploadPartFile: (id, payload) => request(`/masters/parts/${id}/files`, { method: 'POST', body: payload }),
  deletePartFile: (partId, fileId) => request(`/masters/parts/${partId}/files/${fileId}`, { method: 'DELETE' }),
  customers: () => request('/masters/customers'),
  createCustomer: (name) => request('/masters/customers', { method: 'POST', body: { name } }),
  checkItems: (category) => request(`/masters/check-items${category ? `?category=${category}` : ''}`),
  currentAssignments: () => request('/assignments/current'),
  pendingAssignments: () => request('/assignments/pending'),
  createAssignment: (payload) => request('/assignments', { method: 'POST', body: payload }),
  decideAssignment: (id, decision) => request(`/assignments/${id}/decision`, { method: 'POST', body: { decision } }),
  markFirstOkPart: (id, taken_at) => request(`/assignments/${id}/first-ok-part`, { method: 'POST', body: { taken_at } }),
  entryContext: () => request('/entries/context'),
  createEntry: (payload) => request('/entries', { method: 'POST', body: payload }),
  entriesForDate: (date) => request(`/entries${date ? `?date=${date}` : ''}`),

  activeSession: (machineId) => request(`/sessions/active?machine_id=${machineId}`),
  mySession: () => request('/sessions/mine'),
  suggestedStartCount: (machineId) => request(`/sessions/suggested-start-count?machine_id=${machineId}`),
  startMachine: (payload) => request('/sessions/start', { method: 'POST', body: payload }),
  offMachine: (id, payload) => request(`/sessions/${id}/off`, { method: 'POST', body: payload }),

  checkItemsToday: (machineId, shift) => request(`/checksheet/today?machine_id=${machineId}&shift=${shift}`),
  checkSheetItems: () => request('/checksheet/items'),
  submitCheckSheet: (payload) => request('/checksheet/submit', { method: 'POST', body: payload }),

  users: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: payload }),
  changePin: (payload) => request('/account/change-pin', { method: 'POST', body: payload }),

  createBag: (payload) => request('/bags', { method: 'POST', body: payload }),
  bagBatchInfo: (machineId, entryDate, shift) => request(`/bags/batch-info?machine_id=${machineId}&entry_date=${entryDate}&shift=${shift}`),
  productionVisibility: (machineId, entryDate, shift, partId) => request(`/bags/production-visibility?machine_id=${machineId}&entry_date=${entryDate}&shift=${shift}${partId ? `&part_id=${partId}` : ''}`),
  bagDetail: (id) => request(`/bags/${id}`),
  scanBag: (code, stage) => request(`/bags/by-code/${encodeURIComponent(code)}${stage ? `?stage=${stage}` : ''}`),
  bagsForBatch: (batch_no) => request(`/bags?batch_no=${encodeURIComponent(batch_no)}`),
  fifoBag: (part_id, stage) => request(`/bags/fifo?part_id=${part_id}&stage=${stage}`),
  trimBag: (id, payload) => request(`/bags/${id}/trim`, { method: 'POST', body: payload }),
  inspectBag: (id, payload) => request(`/bags/${id}/inspect`, { method: 'POST', body: payload }),
  packBag: (id, payload) => request(`/bags/${id}/pack`, { method: 'POST', body: payload }),
  dispatchBag: (id, payload) => request(`/bags/${id}/dispatch`, { method: 'POST', body: payload }),
  traceability: (bagCode) => request(`/bags/audit/traceability/${encodeURIComponent(bagCode)}`),

  notifications: {
    list: () => request('/notifications'),
    markRead: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
  },

  attendance: {
    today: () => request('/attendance/today'),
    checkIn: (lat, lng) => request('/attendance/check-in', { method: 'POST', body: { lat, lng } }),
    checkOut: (lat, lng) => request('/attendance/check-out', { method: 'POST', body: { lat, lng } }),
    settings: () => request('/attendance/settings'),
    updateSettings: (payload) => request('/attendance/settings', { method: 'PUT', body: payload }),
    roster: (date) => request(`/attendance${date ? `?date=${date}` : ''}`),
  },

  deletions: {
    request: (payload) => request('/deletions/request', { method: 'POST', body: payload }),
    pending: () => request('/deletions/pending'),
    approve: (id, review_notes) => request(`/deletions/${id}/approve`, { method: 'POST', body: { review_notes } }),
    reject: (id, review_notes) => request(`/deletions/${id}/reject`, { method: 'POST', body: { review_notes } }),
    directDelete: (entity_type, entity_id, reason) => request(`/deletions/direct/${entity_type}/${entity_id}`, { method: 'DELETE', body: { reason } }),
  },

  reports: {
    dailySummary: (date, shift) => request(`/reports/daily-summary?date=${date || ''}&shift=${shift || 'ALL'}`),
    processSummary: (date) => request(`/reports/process-summary?date=${date || ''}`),
    trendSummary: (startDate, endDate) => request(`/reports/trend-summary?start_date=${startDate || ''}&end_date=${endDate || ''}`),
    stageRaw: (stage, date) => request(`/reports/stage-raw?stage=${stage}&date=${date || ''}`),
  },

  offlineQueue,
  syncOffline: () => offlineQueue.syncQueue(request),
};

export { getToken, offlineQueue };

