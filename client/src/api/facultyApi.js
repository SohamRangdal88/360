const BASE = import.meta.env.VITE_API_URL || '';

async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  let res;
  try {
    res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    signal: controller.signal,
    ...options
    });
  } finally {
    clearTimeout(timeout);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function getProfile(facultyId) {
  return request(`/api/faculty/${facultyId}`);
}

export function getProfileByEmail(email) {
  return request(`/api/faculty/account/${encodeURIComponent(email)}`);
}

export function saveProfile(facultyId, profile) {
  return request(`/api/faculty/${facultyId}`, {
    method: 'PUT',
    body: JSON.stringify(profile)
  });
}

export function saveSection(facultyId, section, data) {
  return request(`/api/faculty/${facultyId}/section/${section}`, {
    method: 'PATCH',
    body: JSON.stringify({ data })
  });
}

export function submitProfile(facultyId) {
  return request(`/api/faculty/${facultyId}/submit`, { method: 'POST' });
}

export function reopenProfile(facultyId) {
  return request(`/api/faculty/${facultyId}/reopen`, { method: 'POST' });
}

export function listProfiles(filters = {}, adminEmail = '') {
  const params = new URLSearchParams();
  if (filters.department) params.set('department', filters.department);
  if (filters.status) params.set('status', filters.status);
  const query = params.toString();
  return request(`/api/faculty${query ? `?${query}` : ''}`, {
    headers: adminEmail ? { 'x-admin-email': adminEmail } : {}
  });
}

export function getAdminProfile(facultyId, adminEmail = '') {
  return request(`/api/faculty/${facultyId}`, {
    headers: adminEmail ? { 'x-admin-email': adminEmail } : {}
  });
}

export function approveProfile(facultyId) {
  return request(`/api/faculty/${facultyId}/approve`, { method: 'POST' });
}

export function returnProfile(facultyId) {
  return request(`/api/faculty/${facultyId}/return`, { method: 'POST' });
}

export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/api/uploads`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function deleteUpload(filename) {
  return request(`/api/uploads/${filename}`, { method: 'DELETE' });
}
