const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Two parallel auth realms — admin signs in via /api/auth, customer via /api/users.
const REALMS = {
  admin: {
    accessKey: 'bn_access_token',
    refreshKey: 'bn_refresh_token',
    profileKey: 'bn_admin',
    refreshPath: '/auth/refresh',
  },
  user: {
    accessKey: 'bn_user_access_token',
    refreshKey: 'bn_user_refresh_token',
    profileKey: 'bn_user',
    refreshPath: '/users/refresh',
  },
};

const state = {
  admin: { accessToken: null, refreshInFlight: null },
  user: { accessToken: null, refreshInFlight: null },
};

const listeners = { admin: new Set(), user: new Set() };

function loadTokens() {
  try {
    state.admin.accessToken = localStorage.getItem(REALMS.admin.accessKey) || null;
    state.user.accessToken = localStorage.getItem(REALMS.user.accessKey) || null;
  } catch {
    state.admin.accessToken = null;
    state.user.accessToken = null;
  }
}
loadTokens();

function notify(realm) {
  listeners[realm].forEach((fn) => {
    try { fn(); } catch {}
  });
}

export function getAccessToken(realm = 'admin') {
  return state[realm]?.accessToken || null;
}
export function getStoredRefreshToken(realm = 'admin') {
  try { return localStorage.getItem(REALMS[realm].refreshKey); } catch { return null; }
}
export function getStoredProfile(realm = 'admin') {
  try {
    const raw = localStorage.getItem(REALMS[realm].profileKey);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSession(realm, { accessToken, refreshToken, profile } = {}) {
  const cfg = REALMS[realm];
  if (!cfg) return;
  if (accessToken !== undefined) {
    state[realm].accessToken = accessToken;
    try {
      accessToken
        ? localStorage.setItem(cfg.accessKey, accessToken)
        : localStorage.removeItem(cfg.accessKey);
    } catch {}
  }
  if (refreshToken !== undefined) {
    try {
      refreshToken
        ? localStorage.setItem(cfg.refreshKey, refreshToken)
        : localStorage.removeItem(cfg.refreshKey);
    } catch {}
  }
  if (profile !== undefined) {
    try {
      profile
        ? localStorage.setItem(cfg.profileKey, JSON.stringify(profile))
        : localStorage.removeItem(cfg.profileKey);
    } catch {}
  }
  notify(realm);
}

export function clearSession(realm = 'admin') {
  state[realm].accessToken = null;
  try {
    const cfg = REALMS[realm];
    localStorage.removeItem(cfg.accessKey);
    localStorage.removeItem(cfg.refreshKey);
    localStorage.removeItem(cfg.profileKey);
  } catch {}
  notify(realm);
}

export function onAuthChange(realm, fn) {
  listeners[realm].add(fn);
  return () => listeners[realm].delete(fn);
}

async function doRefresh(realm) {
  const cfg = REALMS[realm];
  const stored = getStoredRefreshToken(realm);
  const res = await fetch(`${API_BASE}${cfg.refreshPath}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(stored ? { refreshToken: stored } : {}),
  });
  if (!res.ok) {
    clearSession(realm);
    throw new ApiError(res.status, 'Session expired, please sign in again');
  }
  const data = await res.json();
  setSession(realm, { accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.accessToken;
}

function refreshAccessToken(realm) {
  const s = state[realm];
  if (!s.refreshInFlight) {
    s.refreshInFlight = doRefresh(realm).finally(() => { s.refreshInFlight = null; });
  }
  return s.refreshInFlight;
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
  const realm = opts.realm || 'admin';
  const token = !opts.skipAuth ? state[realm]?.accessToken : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);

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
  const realm = opts.realm || 'admin';
  try {
    return await rawRequest(path, opts);
  } catch (err) {
    const cfg = REALMS[realm];
    const canRetry =
      err instanceof ApiError &&
      err.status === 401 &&
      !opts.skipAuth &&
      !opts._retried &&
      !path.endsWith(cfg.refreshPath) &&
      !path.endsWith('/auth/login') &&
      !path.endsWith('/users/login') &&
      !path.endsWith('/users/register');
    if (!canRetry) throw err;
    try {
      await refreshAccessToken(realm);
    } catch (refreshErr) {
      throw refreshErr;
    }
    return rawRequest(path, { ...opts, _retried: true });
  }
}

function makeApi(realm) {
  return {
    get: (p, opts) => apiFetch(p, { ...opts, realm, method: 'GET' }),
    post: (p, body, opts) => apiFetch(p, { ...opts, realm, method: 'POST', body }),
    put: (p, body, opts) => apiFetch(p, { ...opts, realm, method: 'PUT', body }),
    patch: (p, body, opts) => apiFetch(p, { ...opts, realm, method: 'PATCH', body }),
    del: (p, opts) => apiFetch(p, { ...opts, realm, method: 'DELETE' }),
  };
}

export const api = makeApi('admin');
export const userApi = makeApi('user');
export const API_URL = API_BASE;
