import { cacheStorage } from './offline/cacheStorage';
import { offlineQueue } from './offline/offlineQueue';

const BASE = '/api';

function getToken() {
  return localStorage.getItem('shrp_token');
}

function isQueueable(path, method) {
  // Never queue DELETE requests or administrative/master endpoints
  if (method !== 'POST' && method !== 'PUT') return false;
  if (path.startsWith('/auth') || path.startsWith('/account') || path.startsWith('/users') || path.startsWith('/masters') || path.startsWith('/deletions')) {
    return false;
  }
  // Only queue shopfloor production entries, bags, and inspections
  return (
    path.startsWith('/entries') ||
    path.startsWith('/bags') ||
    path.startsWith('/checksheet') ||
    path.startsWith('/raw-materials/inward')
  );
}

export function getOrCreateDeviceId() {
  if (typeof localStorage === 'undefined') return 'unknown';
  let deviceId = localStorage.getItem('shrp_device_id');
  if (!deviceId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem('shrp_device_id', deviceId);
  }
  return deviceId;
}

async function request(path, { method = 'GET', body, isOfflineReplay = false, description, headers: customHeaders } = {}) {
  const headers = { 'Content-Type': 'application/json', ...(customHeaders || {}) };
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
    // If the server returns a 5xx error (502 Bad Gateway, 503, 504, 500) during deployment or crash:
    if (res.status >= 500) {
      if (method === 'GET') {
        const cached = cacheStorage.get(path);
        if (cached !== null) {
          console.warn(`Server returned ${res.status}, falling back to offline cache for ${path}`);
          return cached;
        }
      }
      if (!isOfflineReplay && isQueueable(path, method)) {
        const item = offlineQueue.enqueue({ path, method, body, description });
        return {
          ok: true,
          queuedOffline: true,
          queueId: item.id,
          message: 'Server temporarily unavailable (updating). Entry securely saved offline and will automatically sync!',
        };
      }
    }

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
  request,
  login: (username, pin) =>
    request('/auth/login', {
      method: 'POST',
      body: { username, pin },
      headers: { 'X-Device-Id': getOrCreateDeviceId() },
    }),
  security: {
    getApprovedDevices: () => request('/security/approved-devices'),
    getPendingDevices: () => request('/security/pending-devices'),
    approveDevice: (payload) => request('/security/approved-devices', { method: 'POST', body: payload }),
    revokeApprovedDevice: (id) => request(`/security/approved-devices/${id}`, { method: 'DELETE' }),
    getAllowedIps: () => request('/security/allowed-ips'),
    addAllowedIp: (payload) => request('/security/allowed-ips', { method: 'POST', body: payload }),
    deleteAllowedIp: (id) => request(`/security/allowed-ips/${id}`, { method: 'DELETE' }),
    getLoginHistory: (limit) => request(`/security/login-history${limit ? `?limit=${limit}` : ''}`),
    getBlockedDevices: () => request('/security/blocked-devices'),
    blockDevice: (payload) => request('/security/blocked-devices', { method: 'POST', body: payload }),
    unblockDevice: (id) => request(`/security/blocked-devices/${id}`, { method: 'DELETE' }),
  },
  users: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: payload }),
  toggleActiveUser: (id) => request(`/users/${id}/toggle-active`, { method: 'POST' }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  userActivityReport: (date) => request(`/users/activity-report${date ? `?date=${date}` : ''}`),
  userActivityDetail: (id, date) => request(`/users/${id}/activity${date ? `?date=${date}` : ''}`),
  masters: {
    machines: () => request('/masters/machines'),
    parts: () => request('/masters/parts'),
    partDetail: (id) => request(`/masters/parts/${id}/detail`),
    customers: () => request('/masters/customers'),
    documentSequences: () => request('/masters/document-sequences'),
  },
  documentSequences: {
    list: () => request('/masters/document-sequences'),
    suggest: (type) => request(`/masters/document-sequences/suggest?type=${encodeURIComponent(type || '')}`),
    create: (payload) => request('/masters/document-sequences', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/masters/document-sequences/${id}`, { method: 'PUT', body: payload }),
    delete: (id) => request(`/masters/document-sequences/${id}`, { method: 'DELETE' }),
    next: (type) => request(`/masters/document-sequences/${encodeURIComponent(type)}/next`, { method: 'POST' }),
  },
  machines: () => request('/masters/machines'),
  parts: () => request('/masters/parts'),
  partDetail: (id) => request(`/masters/parts/${id}/detail`),
  createPart: (payload) => request('/masters/parts', { method: 'POST', body: payload }),
  deletePart: (id) => request('/masters/parts/' + id, { method: 'DELETE' }),
  deleteBag: (id, reason) => request('/deletions/direct/bag/' + id, { method: 'DELETE', body: { reason } }),
  deleteEntry: (id, reason) => request('/deletions/direct/production_entry/' + id, { method: 'DELETE', body: { reason } }),
  updatePart: (id, payload) => request(`/masters/parts/${id}`, { method: 'PUT', body: payload }),
  setPartParameters: (id, parameters) => request(`/masters/parts/${id}/parameters`, { method: 'PUT', body: { parameters } }),
  setPartDimensions: (id, dimensions) => request(`/masters/parts/${id}/dimensions`, { method: 'PUT', body: { dimensions } }),
  setPartMachines: (id, machine_ids) => request(`/masters/parts/${id}/machines`, { method: 'PUT', body: { machine_ids } }),
  uploadPartFile: (id, payload) => request(`/masters/parts/${id}/files`, { method: 'POST', body: payload }),
  deletePartFile: (partId, fileId) => request(`/masters/parts/${partId}/files/${fileId}`, { method: 'DELETE' }),
  customers: Object.assign(
    () => request('/masters/customers'),
    {
      list: () => request('/masters/customers'),
      create: (payload) => request('/masters/customers', { method: 'POST', body: typeof payload === 'string' ? { name: payload } : payload }),
      update: (id, payload) => request(`/masters/customers/${id}`, { method: 'PUT', body: payload }),
      remove: (id) => request(`/masters/customers/${id}`, { method: 'DELETE' }),
      delete: (id) => request(`/masters/customers/${id}`, { method: 'DELETE' }),
    }
  ),
  checkItems: Object.assign(
    (category) => request(`/masters/check-items${category ? `?category=${category}` : ''}`),
    {
      list: (category) => request(`/masters/check-items${category ? `?category=${category}` : ''}`),
      create: (payload) => request('/masters/check-items', { method: 'POST', body: payload }),
      update: (id, payload) => request(`/masters/check-items/${id}`, { method: 'PUT', body: payload }),
      delete: (id) => request(`/masters/check-items/${id}`, { method: 'DELETE' }),
    }
  ),
  dailyCheckItems: {
    list: () => request('/masters/daily-check-items'),
    create: (payload) => request('/masters/daily-check-items', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/masters/daily-check-items/${id}`, { method: 'PUT', body: payload }),
    delete: (id) => request(`/masters/daily-check-items/${id}`, { method: 'DELETE' }),
  },
  createCheckItem: (payload) => request('/masters/check-items', { method: 'POST', body: payload }),
  updateCheckItem: (id, payload) => request(`/masters/check-items/${id}`, { method: 'PUT', body: payload }),
  deleteCheckItem: (id) => request(`/masters/check-items/${id}`, { method: 'DELETE' }),


  // Gauges & Instruments master
  gauges: Object.assign(
    (status) => request(`/gauges${status ? `?status=${status}` : ''}`),
    {
      list: (status) => request(`/gauges${status && status !== 'all' ? `?status=${status}` : ''}`),
      detail: (id) => request(`/gauges/${id}`),
      calibrationSummary: () => request('/gauges/calibration-summary'),
      create: (payload) => request('/gauges', { method: 'POST', body: payload }),
      update: (id, payload) => request(`/gauges/${id}`, { method: 'PUT', body: payload }),
      calibrate: (id, payload) => request(`/gauges/${id}/calibrate`, { method: 'POST', body: payload }),
      remove: (id) => request(`/gauges/${id}`, { method: 'DELETE' }),
      delete: (id) => request(`/gauges/${id}`, { method: 'DELETE' }),
    }
  ),
  gaugeDetail: (id) => request(`/gauges/${id}`),
  gaugeCalibrationSummary: () => request('/gauges/calibration-summary'),
  createGauge: (payload) => request('/gauges', { method: 'POST', body: payload }),
  updateGauge: (id, payload) => request(`/gauges/${id}`, { method: 'PUT', body: payload }),
  recordCalibration: (id, payload) => request(`/gauges/${id}/calibrate`, { method: 'POST', body: payload }),
  deleteGauge: (id) => request(`/gauges/${id}`, { method: 'DELETE' }),

  // Supplier master
  suppliers: Object.assign(
    (active) => request(`/suppliers${active ? `?active=${active}` : ''}`),
    {
      list: (active) => request(`/suppliers${active && active !== 'all' ? `?active=${active}` : ''}`),
      detail: (id) => request(`/suppliers/${id}`),
      create: (payload) => request('/suppliers', { method: 'POST', body: payload }),
      update: (id, payload) => request(`/suppliers/${id}`, { method: 'PUT', body: payload }),
      remove: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),
      delete: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),
    }
  ),
  supplierDetail: (id) => request(`/suppliers/${id}`),
  createSupplier: (payload) => request('/suppliers', { method: 'POST', body: payload }),
  updateSupplier: (id, payload) => request(`/suppliers/${id}`, { method: 'PUT', body: payload }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),
  currentAssignments: () => request('/assignments/current'),
  pendingAssignments: () => request('/assignments/pending'),
  assignmentHistory: (params) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request(`/assignments/history${qs ? `?${qs}` : ''}`);
  },
  mouldCampaignPerformance: (params) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return request(`/assignments/campaign-performance${qs ? `?${qs}` : ''}`);
  },
  createAssignment: (payload) => request('/assignments', { method: 'POST', body: payload }),
  decideAssignment: (id, decision, payload) => request(`/assignments/${id}/decision`, { method: 'POST', body: { decision, ...(payload || {}) } }),
  markFirstOkPart: (id, taken_at) => request(`/assignments/${id}/first-ok-part`, { method: 'POST', body: { taken_at } }),
  entryContext: () => request('/entries/context'),
  createEntry: (payload) => request('/entries', { method: 'POST', body: payload }),
  entriesForDate: (date) => request(`/entries${date ? `?date=${date}` : ''}`),

  activeSession: (machineId) => request(`/sessions/active?machine_id=${machineId}`),
  mySession: () => request('/sessions/mine'),
  suggestedStartCount: (machineId) => request(`/sessions/suggested-start-count?machine_id=${machineId}`),
  startMachine: (payload) => request('/sessions/start', { method: 'POST', body: payload }),
  offMachine: (id, payload) => request(`/sessions/${id}/off`, { method: 'POST', body: payload }),
  changeOperator: (id, payload) => request(`/sessions/${id}/change-operator`, { method: 'POST', body: payload }),

  checkItemsToday: (machineId, shift) => request(`/checksheet/today?machine_id=${machineId}&shift=${shift}`),
  checkSheetItems: () => request('/checksheet/items'),
  submitCheckSheet: (payload) => request('/checksheet/submit', { method: 'POST', body: payload }),

  operators: () => request('/users/operators'),
  users: () => request('/users'),
  createUser: (payload) => request('/users', { method: 'POST', body: payload }),
  updateUser: (id, payload) => request(`/users/${id}`, { method: 'PUT', body: payload }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  toggleActiveUser: (id) => request(`/users/${id}/toggle-active`, { method: 'POST' }),
  userActivityReport: (date) => request(`/users/activity-report${date ? `?date=${date}` : ''}`),
  sendHeartbeat: (page) => request('/users/heartbeat', { method: 'POST', body: { page } }),
  changePin: (payload) => request('/account/change-pin', { method: 'POST', body: payload }),

  createBag: (payload) => request('/bags', { method: 'POST', body: payload }),
  stageParts: (stage) => request(`/bags/stage-parts${stage ? `?stage=${stage}` : ''}`),
  bagBatchInfo: (machineId, entryDate, shift) => request(`/bags/batch-info?machine_id=${machineId}&entry_date=${entryDate}&shift=${shift}`),
  productionVisibility: (machineId, entryDate, shift, partId) => request(`/bags/production-visibility?machine_id=${machineId}&entry_date=${entryDate}&shift=${shift}${partId ? `&part_id=${partId}` : ''}`),
  bagDetail: (id) => request(`/bags/${id}`),
  scanBag: (code, stage) => request(`/bags/by-code/${encodeURIComponent(code)}${stage ? `?stage=${stage}` : ''}`),
  bagsForBatch: (batch_no, stage) => request(`/bags?batch_no=${encodeURIComponent(batch_no)}${stage ? `&stage=${stage}` : ''}`),
  bagsForPart: (partId, stage) => request(`/bags?part_id=${partId}${stage ? `&stage=${stage}` : ''}`),
  bagHistoryLog: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/bags/log/history${qs ? `?${qs}` : ''}`);
  },
  fifoBag: (part_id, stage) => request(`/bags/fifo?part_id=${part_id}&stage=${stage}`),
  trimBag: (id, payload) => request(`/bags/${id}/trim`, { method: 'POST', body: payload }),
  trimSummary: (id) => request(`/bags/${id}/trim-summary`),
  inspectBag: (id, payload) => request(`/bags/${id}/inspect`, { method: 'POST', body: payload }),
  packBag: (id, payload) => request(`/bags/${id}/pack`, { method: 'POST', body: payload }),
  dispatchBag: (id, payload) => request(`/bags/${id}/dispatch`, { method: 'POST', body: payload }),

  // Dispatch history & gate pass (Tab 2 & 3)
  dispatchHistory: (query) => {
    const qs = new URLSearchParams(query).toString();
    return request(`/dispatch/history${qs ? `?${qs}` : ''}`);
  },
  dispatchGetById: (id) => request(`/dispatch/${id}`),
  gatePasGenerate: (dispatchIds) => request('/dispatch/gate-pass', { method: 'POST', body: { dispatch_ids: dispatchIds } }),

  holdBag: (id, payload) => request(`/bags/${id}/hold`, { method: 'POST', body: payload }),
  releaseHoldBag: (id, payload) => request(`/bags/${id}/release-hold`, { method: 'POST', body: payload }),
  releaseHold: (id, payload) => request(`/bags/${id}/release-hold`, { method: 'POST', body: payload }),
  holdBags: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/bags/hold-bags${qs ? `?${qs}` : ''}`);
  },
  balancePool: (partId) => request(`/bags/balance-pool/${partId}`),
  packPacketFromPool: (partId) => request(`/bags/balance-pool/${partId}/pack-packet`, { method: 'POST' }),
  reworkPending: () => request('/bags/rework/pending'),
  completeRework: (id, payload) => request(`/bags/rework/${id}/complete`, { method: 'POST', body: payload }),
  traceability: (bagCode) => request(`/bags/audit/traceability/${encodeURIComponent(bagCode)}`),
  lanPrintBag: (id, payload) => request(`/bags/${id}/lan-print`, { method: 'POST', body: payload }),

  notifications: {
    list: () => request('/notifications'),
    unread: () => request('/notifications'),
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
  todayAttendanceStatus: () => request('/attendance/today'),

  deletions: {
    auditLog: (startDate, endDate, entityType) => request(`/deletions/audit-log?start_date=${startDate || ''}&end_date=${endDate || ''}&entity_type=${entityType || 'ALL'}`),
    request: (payload) => request('/deletions/request', { method: 'POST', body: payload }),
    pending: () => request('/deletions/pending'),
    approve: (id, review_notes) => request(`/deletions/${id}/approve`, { method: 'POST', body: { review_notes } }),
    reject: (id, review_notes) => request(`/deletions/${id}/reject`, { method: 'POST', body: { review_notes } }),
    directDelete: (entity_type, entity_id, reason) => request(`/deletions/direct/${entity_type}/${entity_id}`, { method: 'DELETE', body: { reason } }),
  },

  corrections: {
    request: (payload) => request('/corrections/request', { method: 'POST', body: payload }),
    pending: () => request('/corrections/pending'),
    approve: (id, review_notes) => request(`/corrections/${id}/approve`, { method: 'POST', body: { review_notes } }),
    reject: (id, review_notes) => request(`/corrections/${id}/reject`, { method: 'POST', body: { review_notes } }),
    direct: (payload) => request('/corrections/direct', { method: 'POST', body: payload }),
    log: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/corrections/log${qs ? `?${qs}` : ''}`);
    },
    machineLastState: (machineId, entryDate) => request(`/corrections/machine-last-state?machine_id=${machineId}&entry_date=${entryDate}`),
  },

  reports: {
    dailySummary: (date, shift) => request(`/reports/daily-summary?date=${date || ''}&shift=${shift || 'ALL'}`),
    processSummary: (date) => request(`/reports/process-summary?date=${date || ''}`),
    trendSummary: (startDate, endDate) => request(`/reports/trend-summary?start_date=${startDate || ''}&end_date=${endDate || ''}`),
    stageRaw: (stage, date) => request(`/reports/stage-raw?stage=${stage}&date=${date || ''}`),
    part360: (partId, startDate, endDate, shift) => request(`/reports/analytics/part-360?partId=${partId}&startDate=${startDate || ''}&endDate=${endDate || ''}&shift=${shift || 'ALL'}`),
    machine360: (machineId, startDate, endDate, shift) => request(`/reports/analytics/machine-360?machineId=${machineId}&startDate=${startDate || ''}&endDate=${endDate || ''}&shift=${shift || 'ALL'}`),
    mould360: (mouldId, startDate, endDate) => request(`/reports/analytics/mould-360?mouldId=${mouldId}&startDate=${startDate || ''}&endDate=${endDate || ''}`),
    operator360: (operatorId, startDate, endDate, shift) => request(`/reports/analytics/operator-360?operatorId=${operatorId}&startDate=${startDate || ''}&endDate=${endDate || ''}&shift=${shift || 'ALL'}`),
    bag360: (bagCode) => request(`/reports/analytics/bag-360?bagCode=${encodeURIComponent(bagCode)}`),
  },

  machines_mgmt: {
    overview: (date) => request(`/machines/overview${date ? `?date=${date}` : ''}`),
    history: (id) => request(`/machines/${id}/history`),
    logBreakdown: (id, payload) => request(`/machines/${id}/breakdown`, { method: 'POST', body: payload }),
    update: (id, payload) => request(`/machines/${id}`, { method: 'PUT', body: payload }),
    create: (payload) => request('/machines', { method: 'POST', body: payload }),
    remove: (id) => request(`/machines/${id}`, { method: 'DELETE' }),
  },

  moulds: {
    list: () => request('/moulds'),
    pmSummary: () => request('/moulds/pm-summary'),
    detail: (id) => request(`/moulds/${id}`),
    create: (payload) => request('/moulds', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/moulds/${id}`, { method: 'PUT', body: payload }),
    logMaintenance: (id, payload) => request(`/moulds/${id}/maintenance`, { method: 'POST', body: payload }),
    uploadFile: (id, payload) => request(`/moulds/${id}/files`, { method: 'POST', body: payload }),
    deleteFile: (mouldId, fileId) => request(`/moulds/${mouldId}/files/${fileId}`, { method: 'DELETE' }),
    updateParts: (id, parts) => request(`/moulds/${id}/parts`, { method: 'PUT', body: { parts } }),
  },

  rawMaterials: {
    list: () => request('/raw-materials'),
    create: (payload) => request('/raw-materials', { method: 'POST', body: payload }),
    update: (id, payload) => request(`/raw-materials/${id}`, { method: 'PUT', body: payload }),
    save: (payload) => request('/raw-materials', { method: 'POST', body: payload }),
    delete: (id) => request(`/raw-materials/${id}`, { method: 'DELETE' }),
    remove: (id) => request(`/raw-materials/${id}`, { method: 'DELETE' }),
    recipes: () => request('/raw-materials/recipes'),
    saveRecipe: (partId, payload) => request(`/raw-materials/recipes/${partId}`, { method: 'PUT', body: payload }),
    bulkSaveRecipes: (recipes) => request('/raw-materials/recipes/bulk', { method: 'POST', body: { recipes } }),
    stockRegister: () => request('/raw-materials/stock'),
    wipPool: () => request('/raw-materials/wip'),
    issue: (payload) => request('/raw-materials/issue', { method: 'POST', body: payload }),
    inwardList: () => request('/raw-materials/inward'),
    createInward: (payload) => request('/raw-materials/inward', { method: 'POST', body: payload }),
    inwardDetail: (id) => request(`/raw-materials/inward/${id}`),
    inspectInward: (id, payload) => request(`/raw-materials/inward/${id}/inspect`, { method: 'POST', body: payload }),
  },

  linkPartMould: (partId, mouldId, cavities) =>
    request(`/masters/parts/${partId}/mould`, { method: 'PUT', body: { mould_id: mouldId, cavities_for_part: cavities } }),

  planning: {
    uploadMps: (payload) => request('/planning/mps/upload', { method: 'POST', body: payload }),
    confirmMpsVariance: (payload) => request('/planning/mps/confirm-variance', { method: 'POST', body: payload }),
    getMps: (monthYear) => request(`/planning/mps${monthYear ? `?month_year=${monthYear}` : ''}`),
    deleteMonthMps: (month) => request(`/planning/mps/month/${month}`, { method: 'DELETE' }),
    clearMps: (month) => request(`/planning/mps/month/${month}`, { method: 'DELETE' }),
    deleteMpsItem: (id) => request(`/planning/mps/item/${id}`, { method: 'DELETE' }),
    getPlanVsActual: (monthYear) => request(`/planning/plan-vs-actual${monthYear ? `?month_year=${monthYear}` : ''}`),
    getMilestones: (customerId, monthYear) => request(`/planning/milestones?customer_id=${customerId || ''}&month_year=${monthYear || ''}`),
    createMilestone: (payload) => request('/planning/milestones', { method: 'POST', body: payload }),
    getDailySchedules: (date, shift) => request(`/planning/daily-schedules?date=${date || ''}&shift=${shift || ''}`),
    createDailySchedule: (payload) => request('/planning/daily-schedules', { method: 'POST', body: payload }),
    getActiveTarget: (machineId, date, shift) => request(`/planning/daily-schedules/active-target?machine_id=${machineId}&date=${date || ''}&shift=${shift || ''}`),
  },

  fpa: {
    getData: (machineId, partId, mouldId, assignmentId) =>
      request(`/fpa/data?machine_id=${machineId || ''}&part_id=${partId || ''}&mould_id=${mouldId || ''}&assignment_id=${assignmentId || ''}`),
    submit: (payload) => request('/fpa/submit', { method: 'POST', body: payload }),
    getHistory: (machineId, partId, status) =>
      request(`/fpa/history?machine_id=${machineId || ''}&part_id=${partId || ''}&status=${status || ''}`),
    getPending: () => request('/fpa/pending'),
    downloadPdfUrl: (id) => `/api/fpa/pdf/${id}?token=${getToken()}`,
  },

  notifications: {
    list: () => request('/notifications'),
    unread: () => request('/notifications'),
    getAlerts: () => request('/notifications/alerts'),
    read: (id) => request(`/notifications/${id}/read`, { method: 'POST' }),
    readAll: () => request('/notifications/read-all', { method: 'POST' }),
  },
  gst: {
    verify: (gstin) => request(`/gst/verify/${encodeURIComponent(gstin)}`),
    validate: (gstin) => request(`/gst/validate/${encodeURIComponent(gstin)}`),
  },

  // Pillar 2: Purchase Order Management & Invoicing
  purchaseOrders: {
    list: (query) => {
      const qs = new URLSearchParams(query).toString();
      return request(`/purchase-orders${qs ? `?${qs}` : ''}`);
    },
    create: (payload) => request('/purchase-orders', { method: 'POST', body: payload }),
    getDetail: (id) => request(`/purchase-orders/${id}`),
    update: (id, payload) => request(`/purchase-orders/${id}`, { method: 'PUT', body: payload }),
    addLineItem: (poId, payload) => request(`/purchase-orders/${poId}/line-items`, { method: 'POST', body: payload }),
  },

  invoices: {
    list: (query) => {
      const qs = new URLSearchParams(query).toString();
      return request(`/invoices${qs ? `?${qs}` : ''}`);
    },
    create: (payload) => request('/invoices', { method: 'POST', body: payload }),
    getDetail: (id) => request(`/invoices/${id}`),
    update: (id, payload) => request(`/invoices/${id}`, { method: 'PUT', body: payload }),
    generatePdf: (id) => `/api/invoices/${id}/pdf?token=${getToken()}`,
    recordPayment: (invoiceId, payload) => request(`/invoices/${invoiceId}/payment`, { method: 'POST', body: payload }),
  },

  ewayBill: {
    generate: (invoiceId, payload) => request(`/invoices/${invoiceId}/eway-bill`, { method: 'POST', body: payload }),
    getJson: (invoiceId) => request(`/invoices/${invoiceId}/eway-bill/json`),
  },

  offlineQueue,
  syncOffline: () => offlineQueue.syncQueue(request),
};

export { getToken, offlineQueue };
