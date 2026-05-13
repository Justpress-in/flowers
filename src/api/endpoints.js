import { api, setSession, clearSession, getStoredRefreshToken } from './client';

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh', { refreshToken: getStoredRefreshToken() || undefined }),
  logout: async () => {
    try {
      await api.post('/auth/logout', { refreshToken: getStoredRefreshToken() || undefined });
    } catch {}
    clearSession();
  },
  applyLogin: (data) => {
    setSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      admin: data.admin,
    });
  },
};

export const products = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/products${qs ? `?${qs}` : ''}`);
  },
  get: (id) => api.get(`/products/${id}`),
  create: (body) => api.post('/products', body),
  update: (id, body) => api.put(`/products/${id}`, body),
  remove: (id) => api.del(`/products/${id}`),
};

export const stores = {
  list: () => api.get('/stores'),
  create: (body) => api.post('/stores', body),
  update: (id, body) => api.put(`/stores/${id}`, body),
  remove: (id) => api.del(`/stores/${id}`),
};

export const orders = {
  list: () => api.get('/orders'),
  get: (id) => api.get(`/orders/${id}`),
  create: (body) => api.post('/orders', body),
  updateStatus: (id, body) => api.patch(`/orders/${id}/status`, body),
  remove: (id) => api.del(`/orders/${id}`),
};

export const events = {
  list: () => api.get('/events'),
  create: (body) => api.post('/events', body),
  update: (id, body) => api.put(`/events/${id}`, body),
  remove: (id) => api.del(`/events/${id}`),
};

export const banners = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/banners${qs ? `?${qs}` : ''}`);
  },
  create: (body) => api.post('/banners', body),
  update: (id, body) => api.put(`/banners/${id}`, body),
  remove: (id) => api.del(`/banners/${id}`),
};

export const admins = {
  list: () => api.get('/admins'),
  create: (body) => api.post('/admins', body),
  update: (id, body) => api.put(`/admins/${id}`, body),
  changePassword: (id, body) => api.patch(`/admins/${id}/password`, body),
  remove: (id) => api.del(`/admins/${id}`),
};

export const upload = {
  single: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/upload', fd);
  },
  multiple: (files) => {
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append('images', f));
    return api.post('/upload/multiple', fd);
  },
};
