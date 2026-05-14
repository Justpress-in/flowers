import {
  api,
  userApi,
  setSession,
  clearSession,
  getStoredRefreshToken,
} from './client';

// ── Admin auth (realm: admin) ─────────────────────────────────────────
export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  refresh: () =>
    api.post('/auth/refresh', { refreshToken: getStoredRefreshToken('admin') || undefined }),
  logout: async () => {
    try {
      await api.post('/auth/logout', {
        refreshToken: getStoredRefreshToken('admin') || undefined,
      });
    } catch {}
    clearSession('admin');
  },
  applyLogin: (data) => {
    setSession('admin', {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profile: data.admin,
    });
  },
};

// ── User auth (realm: user) ────────────────────────────────────────────
export const userAuth = {
  register: (body) => userApi.post('/users/register', body),
  login: (email, password) => userApi.post('/users/login', { email, password }),
  me: () => userApi.get('/users/me'),
  updateProfile: (body) => userApi.patch('/users/me', body),
  refresh: () =>
    userApi.post('/users/refresh', { refreshToken: getStoredRefreshToken('user') || undefined }),
  logout: async () => {
    try {
      await userApi.post('/users/logout', {
        refreshToken: getStoredRefreshToken('user') || undefined,
      });
    } catch {}
    clearSession('user');
  },
  applySession: (data) => {
    setSession('user', {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      profile: data.user,
    });
  },
};

// ── Cart ───────────────────────────────────────────────────────────────
export const cart = {
  get: () => userApi.get('/cart'),
  addItem: (item) => userApi.post('/cart/items', item),
  updateItem: (id, body) => userApi.patch(`/cart/items/${id}`, body),
  removeItem: (id) => userApi.del(`/cart/items/${id}`),
  clear: () => userApi.del('/cart'),
  merge: (items) => userApi.post('/cart/merge', { items }),
};

// ── Products / stores / orders / events / banners ─────────────────────
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
  listAll: () => api.get('/orders'),
  listMine: () => userApi.get('/orders/mine'),
  get: (id) => api.get(`/orders/${id}`),
  checkout: (body) => userApi.post('/orders/checkout', body),
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

export const adminUsers = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/admin-users${qs ? `?${qs}` : ''}`);
  },
  get: (id) => api.get(`/admin-users/${id}`),
  remove: (id) => api.del(`/admin-users/${id}`),
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

// ── Settings ───────────────────────────────────────────────────────────
export const settings = {
  get: () => api.get('/settings'),
  update: (body) => api.put('/settings', body),
};

// ── Coupons ────────────────────────────────────────────────────────────
export const coupons = {
  list: () => api.get('/coupons'),
  create: (body) => api.post('/coupons', body),
  update: (id, body) => api.put(`/coupons/${id}`, body),
  remove: (id) => api.del(`/coupons/${id}`),
  publicList: () => api.get('/coupons/public'),
  redeem: (code) => userApi.post('/coupons/redeem', { code }),
};

// ── Packages ───────────────────────────────────────────────────────────
export const packages = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/packages${qs ? `?${qs}` : ''}`);
  },
  get: (id) => api.get(`/packages/${id}`),
  create: (body) => api.post('/packages', body),
  update: (id, body) => api.put(`/packages/${id}`, body),
  remove: (id) => api.del(`/packages/${id}`),
};

// ── Reviews ────────────────────────────────────────────────────────────
export const reviews = {
  forProduct: (productId) => api.get(`/reviews/product/${productId}`),
  create: (body) => userApi.post('/reviews', body),
  listMine: () => userApi.get('/reviews/mine'),
  removeMine: (id) => userApi.del(`/reviews/mine/${id}`),
  listAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/reviews${qs ? `?${qs}` : ''}`);
  },
  updateStatus: (id, body) => api.patch(`/reviews/${id}/status`, body),
  remove: (id) => api.del(`/reviews/${id}`),
};

// ── Blogs ──────────────────────────────────────────────────────────────
export const blogs = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/blogs${qs ? `?${qs}` : ''}`);
  },
  get: (id) => api.get(`/blogs/${id}`),
  create: (body) => api.post('/blogs', body),
  update: (id, body) => api.put(`/blogs/${id}`, body),
  remove: (id) => api.del(`/blogs/${id}`),
};

// ── Offers ─────────────────────────────────────────────────────────────
export const offers = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/offers${qs ? `?${qs}` : ''}`);
  },
  create: (body) => api.post('/offers', body),
  update: (id, body) => api.put(`/offers/${id}`, body),
  remove: (id) => api.del(`/offers/${id}`),
};

// ── Testimonials ───────────────────────────────────────────────────────
export const testimonials = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/testimonials${qs ? `?${qs}` : ''}`);
  },
  create: (body) => api.post('/testimonials', body),
  update: (id, body) => api.put(`/testimonials/${id}`, body),
  remove: (id) => api.del(`/testimonials/${id}`),
};

// ── Delivery partners ─────────────────────────────────────────────────
export const deliveryPartners = {
  list: () => api.get('/delivery-partners'),
  create: (body) => api.post('/delivery-partners', body),
  update: (id, body) => api.put(`/delivery-partners/${id}`, body),
  remove: (id) => api.del(`/delivery-partners/${id}`),
};

// ── CMS: Price Tiers ───────────────────────────────────────────────────
export const priceTiers = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/price-tiers${qs ? `?${qs}` : ''}`);
  },
  create: (body) => api.post('/price-tiers', body),
  update: (id, body) => api.put(`/price-tiers/${id}`, body),
  remove: (id) => api.del(`/price-tiers/${id}`),
};

// ── CMS: Cities ────────────────────────────────────────────────────────
export const cities = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/cities${qs ? `?${qs}` : ''}`);
  },
  create: (body) => api.post('/cities', body),
  update: (id, body) => api.put(`/cities/${id}`, body),
  remove: (id) => api.del(`/cities/${id}`),
};

// ── CMS: Home Colours ──────────────────────────────────────────────────
export const homeColours = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/home-colours${qs ? `?${qs}` : ''}`);
  },
  create: (body) => api.post('/home-colours', body),
  update: (id, body) => api.put(`/home-colours/${id}`, body),
  remove: (id) => api.del(`/home-colours/${id}`),
};

// ── CMS: Collections (showstopper + pair) ──────────────────────────────
export const collections = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/collections${qs ? `?${qs}` : ''}`);
  },
  get: (id) => api.get(`/collections/${id}`),
  create: (body) => api.post('/collections', body),
  update: (id, body) => api.put(`/collections/${id}`, body),
  remove: (id) => api.del(`/collections/${id}`),
};

// ── Bookings ───────────────────────────────────────────────────────────
export const bookings = {
  create: (body) => {
    // Anyone (guest or user) can create — userApi is fine, it just attaches user token if present
    return userApi.post('/bookings', body);
  },
  listAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/bookings${qs ? `?${qs}` : ''}`);
  },
  listMine: () => userApi.get('/bookings/mine'),
  update: (id, body) => api.put(`/bookings/${id}`, body),
  remove: (id) => api.del(`/bookings/${id}`),
};
