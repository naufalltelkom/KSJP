const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const TOKEN_STORAGE_KEY = 'ksjp_sanctum_token';
const USER_STORAGE_KEY = 'ksjp_auth_user';
const REGISTERED_ACCOUNTS_KEY = 'ksjp_registered_accounts';

export function getRegisteredAccounts() {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRegisteredAccount(account) {
  const existing = getRegisteredAccounts().filter((a) => a.nis !== account.nis);
  const updated = [account, ...existing].slice(0, 10);
  try {
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(updated));
  } catch {
    // Abaikan error quota storage
  }
  return updated;
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

async function apiRequest(path, { method = 'GET', body, params, requiresAuth = true } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (requiresAuth) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({
    success: false,
    message: 'Respons server tidak valid.',
  }));

  if (response.status === 401 && requiresAuth) {
    clearAuthSession();
  }

  if (!response.ok) {
    const error = new Error(payload?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function loginRequest(identifier, password) {
  const res = await apiRequest('/login', {
    method: 'POST',
    requiresAuth: false,
    body: {
      identifier,
      password,
      device_name: 'ksjp-web',
    },
  });

  if (res?.data?.token && res?.data?.user) {
    setAuthSession(res.data.token, res.data.user);
  }

  return res;
}

export async function registerRequest({ nama_lengkap, nis, username, jenis_kelamin, password }) {
  const res = await apiRequest('/register', {
    method: 'POST',
    requiresAuth: false,
    body: {
      nama_lengkap,
      nis,
      username: username || undefined,
      jenis_kelamin: jenis_kelamin || 'L',
      password,
      device_name: 'ksjp-web',
    },
  });

  if (res?.data?.token && res?.data?.user) {
    setAuthSession(res.data.token, res.data.user);
  }

  return res;
}

export function fetchAdminOverview() {
  return apiRequest('/admin/overview');
}

export function createAdminKalender(payload) {
  return apiRequest('/admin/kalender', { method: 'POST', body: payload });
}

export function deleteAdminKalender(id) {
  return apiRequest(`/admin/kalender/${id}`, { method: 'DELETE' });
}

export function createAdminMomentum(payload) {
  return apiRequest('/admin/momentum', { method: 'POST', body: payload });
}

export function deleteAdminMomentum(id) {
  return apiRequest(`/admin/momentum/${id}`, { method: 'DELETE' });
}

export function fetchMe() {
  return apiRequest('/me');
}

export async function logoutRequest() {
  try {
    await apiRequest('/logout', { method: 'POST' });
  } finally {
    clearAuthSession();
  }
}

export function fetchJadwal(params = {}) {
  return apiRequest('/jadwal', { params });
}

export function fetchKalender(params = {}) {
  return apiRequest('/kalender', { params });
}

export function fetchNotifikasi(params = {}) {
  return apiRequest('/notifikasi', { params });
}

export function markNotifikasiRead(id) {
  return apiRequest(`/notifikasi/${id}/read`, { method: 'POST' });
}

export function markAllNotifikasiRead() {
  return apiRequest('/notifikasi/read-all', { method: 'POST' });
}

export function fetchVapidPublicKey() {
  return apiRequest('/push/vapid-public-key', { requiresAuth: false });
}

export function subscribeWebPushApi(subscription) {
  return apiRequest('/push/subscribe', {
    method: 'POST',
    body: subscription,
  });
}

export function sendTestWebPushApi(mode = 'default') {
  return apiRequest('/push/test', {
    method: 'POST',
    body: { mode },
  });
}
