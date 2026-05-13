const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const STORAGE = {
  access: 'bn_access_token',
  refresh: 'bn_refresh_token',
  admin: 'bn_admin',
};

let accessToken = null;
let refreshInFlight = null;
const listeners = new Set();

function loadFromStorage() {
  try {
    accessToken = localStorage.getItem(STORAGE.access) || null;
  } catch {
    accessToken = null;
  }
}
loadFromStorage();

export function getAccessToken() {
  return accessToken;
}

export function getStoredRefreshToken() {
  try { return localStorage.getItem(STORAGE.refresh); } catch { return null; }
}

export function getStoredAdmin() {
  try {
    const raw = localStorage.getItem(STORAGE.admin);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession({ accessToken: at, refreshToken, admin } = {}) {
  if (at !== undefined) {
    accessToken = at;
    try { at ? localStorage.setItem(STORAGE.access, at) : localStorage.removeItem(STORAGE.access); } catch {}
  }
  if (refreshToken !== undefined) {
    try { refreshToken ? localStorage.setItem(STORAGE.refresh, refreshToken) : localStorage.removeItem(STORAGE.refresh); } catch {}
  }
  if (admin !== undefined) {
    try { admin ? localStorage.setItem(STORAGE.admin, JSON.stringify(admin)) : localStorage.removeItem(STORAGE.admin); } catch {}
  }
  listeners.forEach((fn) => {
    try { fn(); } catch {}
  });
}

export function clearSession() {
  accessToken = null;
  try {
    localStorage.removeItem(STORAGE.access);
    localStorage.removeItem(STORAGE.refresh);
    localStorage.removeItem(STORAGE.admin);
  } catch {}
  listeners.forEach((fn) => {
    try { fn(); } catch {}
  });
}

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function doRefresh() {
  const stored = getStoredRefreshToken();
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stored ? { refreshToken: stored } : {}),
  });
  if (!res.ok) {
    clearSession();
    throw new ApiError(res.status, 'Session expired, please sign in again');
  }
  const data = await res.json();
  setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

function refreshAccessToken() {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => { refreshInFlight = null; });
  }
  return refreshInFlight;
}

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function joinUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function rawRequest(path, opts = {}) {
  const url = joinUrl(path);
  const headers = new Headers(opts.headers || {});
  const isForm = opts.body instanceof FormData;
  if (!isForm && opts.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken && !opts.skipAuth) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const body =
    opts.body === undefined || isForm || typeof opts.body === 'string'
      ? opts.body
      : JSON.stringify(opts.body);

  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body,
    credentials: 'include',
  });

  let payload = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { payload = await res.json(); } catch { payload = null; }
  } else if (res.status !== 204) {
    try { payload = await res.text(); } catch { payload = null; }
  }

  if (!res.ok) {
    const message = (payload && payload.message) || res.statusText || `Request failed (${res.status})`;
    throw new ApiError(res.status, message, payload);
  }
  return payload;
}

export async function apiFetch(path, opts = {}) {
  try {
    return await rawRequest(path, opts);
  } catch (err) {
    const canRetry =
      err instanceof ApiError &&
      err.status === 401 &&
      !opts.skipAuth &&
      !opts._retried &&
      path !== '/auth/login' &&
      path !== '/auth/refresh';
    if (!canRetry) throw err;
    try {
      await refreshAccessToken();
    } catch (refreshErr) {
      throw refreshErr;
    }
    return rawRequest(path, { ...opts, _retried: true });
  }
}

export const api = {
  get: (p, opts) => apiFetch(p, { ...opts, method: 'GET' }),
  post: (p, body, opts) => apiFetch(p, { ...opts, method: 'POST', body }),
  put: (p, body, opts) => apiFetch(p, { ...opts, method: 'PUT', body }),
  patch: (p, body, opts) => apiFetch(p, { ...opts, method: 'PATCH', body }),
  del: (p, opts) => apiFetch(p, { ...opts, method: 'DELETE' }),
};

export const API_URL = API_BASE;
