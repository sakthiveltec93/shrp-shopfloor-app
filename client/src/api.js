const BASE = '/api';

function getToken() {
  return localStorage.getItem('shrp_token');
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch { /* no body */ }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
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
  lastEntry: (machineId) => request(`/entries/last?machine_id=${machineId}`),
  createEntry: (payload) => request('/entries', { method: 'POST', body: payload }),
  entriesForDate: (date) => request(`/entries${date ? `?date=${date}` : ''}`),

  createBag: (payload) => request('/bags', { method: 'POST', body: payload }),
  bagsForBatch: (batch_no) => request(`/bags?batch_no=${encodeURIComponent(batch_no)}`),
  fifoBag: (part_id, stage) => request(`/bags/fifo?part_id=${part_id}&stage=${stage}`),
  trimBag: (id, payload) => request(`/bags/${id}/trim`, { method: 'POST', body: payload }),
  inspectBag: (id, payload) => request(`/bags/${id}/inspect`, { method: 'POST', body: payload }),
  packBag: (id, payload) => request(`/bags/${id}/pack`, { method: 'POST', body: payload }),
};

export { getToken };
