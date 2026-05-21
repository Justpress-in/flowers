import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import AdminLogin from './AdminLogin';
import {
  LayoutDashboard, Package, Store as StoreIcon, ClipboardList, MapPin,
  Plus, Pencil, Trash2, X, Flower2, Gift, PartyPopper,
  Leaf, Sparkles, Phone, Mail, LogOut, ChevronRight,
  ShoppingBag, AlertTriangle, DollarSign,
  Menu as MenuIcon,
  Calendar, Users, Tag, Building2, Shield, Truck,
  Loader2, RefreshCw,
  UserCircle2, BadgePercent, Ticket, BookOpen,
  Megaphone, MessageSquareQuote, Bike, CalendarCheck2,
  Star, Settings as SettingsIcon, Image as ImagesIcon, Database,
} from 'lucide-react';
import { admins as adminsApi } from '../api/endpoints';
import { useMaster } from '../api/useMaster';
import {
  UsersTab, SettingsTab, CouponsTab, PackagesTab, BlogsTab,
  OffersTab, TestimonialsTab, DeliveryPartnersTab, BannersTab,
  BookingsTab, ReviewsTab,
} from '../components/admin/AdminTabs';
import CmsTab from '../components/admin/CmsTab';
import MasterTab from '../components/admin/MasterTab';
import { ImageUploadField, ImagesUploadField } from '../components/admin/ImageUploadField';
import { exportToCsv } from '../components/admin/exportCsv';
import { printOrder, printEvent, printProduct } from '../components/admin/print';
import { Eye, Download, LayoutGrid, Printer } from 'lucide-react';
import './AdminPage.css';

const EMPTY_PRODUCT = {
  name: '', category: 'flowers', type: 'natural',
  description: '', image: '', images: '', sizes: '', tags: '', availableColors: '',
  allowCustomDescription: true, storeInventory: [],
};
const EMPTY_STORE = { name: '', location: '', phone: '', email: '' };
const EMPTY_EVENT = {
  name: '', packageType: 'wedding', venue: '', date: '', capacity: '',
  description: '', price: '', contactName: '', contactPhone: '', status: 'enquiry',
};
const EMPTY_ADMIN_FORM = { email: '', name: '', password: '', role: 'admin' };
const EMPTY_PASSWORD_FORM = { currentPassword: '', password: '' };

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',        Icon: LayoutDashboard },
  { id: 'products',   label: 'Products',          Icon: Package },
  { id: 'parties',    label: 'Parties & Events',  Icon: PartyPopper },
  { id: 'packages',   label: 'Packages',          Icon: BadgePercent },
  { id: 'inventory',  label: 'Store Inventory',   Icon: StoreIcon },
  { id: 'stores',     label: 'Stores',            Icon: MapPin },
  { id: 'orders',     label: 'Orders',            Icon: ClipboardList },
  { id: 'bookings',   label: 'Bookings',          Icon: CalendarCheck2 },
  { id: 'customers',  label: 'Customers',         Icon: UserCircle2 },
  { id: 'reviews',    label: 'Reviews',           Icon: Star },
  { id: 'coupons',    label: 'Coupons',           Icon: Ticket },
  { id: 'offers',     label: 'Offers',            Icon: Megaphone },
  { id: 'banners',    label: 'Banners',           Icon: ImagesIcon },
  { id: 'testimonials', label: 'Testimonials',    Icon: MessageSquareQuote },
  { id: 'blogs',      label: 'Blogs',             Icon: BookOpen },
  { id: 'partners',   label: 'Delivery Partners', Icon: Bike },
  { id: 'cms',        label: 'Homepage CMS',     Icon: LayoutGrid },
  { id: 'master',     label: 'Master',            Icon: Database },
  { id: 'admins',     label: 'Admins',            Icon: Shield },
  { id: 'settings',   label: 'Settings',          Icon: SettingsIcon },
];

const ORDER_STATUSES = ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function csvToArr(s) {
  return String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
}

export default function AdminPage() {
  const { state, actions } = useApp();
  const { admin: currentAdmin, isAuthenticated, bootstrapping, logout } = useAuth();
  const { options: masterOptions } = useMaster();

  // Master-driven dropdowns (fall back to built-ins until the lists load).
  const categoryOptions = masterOptions('product-category');
  const productTypeOptions = masterOptions('product-type');
  const orderStatusOptions = masterOptions('order-status');
  const eventPackageTypeOptions = masterOptions('event-package-type');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'error' | 'success', text }

  // product form
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [form, setForm]               = useState(EMPTY_PRODUCT);
  const [storeRow, setStoreRow]       = useState({
    storeId: '', stockPrice: '', basePrice: '', offeredPrice: '', discountPercent: '', stock: '',
  });

  // store form
  const [showStoreForm, setShowStoreForm]     = useState(false);
  const [editingStoreId, setEditingStoreId]   = useState(null);
  const [storeForm, setStoreForm]             = useState(EMPTY_STORE);

  // event form
  const [showEventForm, setShowEventForm]     = useState(false);
  const [editingEventId, setEditingEventId]   = useState(null);
  const [eventForm, setEventForm]             = useState(EMPTY_EVENT);

  // admin form
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN_FORM);
  const [showPassForm, setShowPassForm] = useState(false);
  const [passwordTargetId, setPasswordTargetId] = useState(null);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);

  // order status form
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [orderForm, setOrderForm] = useState({ status: 'Confirmed', trackingUrl: '' });
  const [viewingOrder, setViewingOrder] = useState(null);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 4000);
    return () => clearTimeout(t);
  }, [banner]);

  useEffect(() => {
    if (activeTab !== 'admins' || !isAuthenticated) return;
    let cancelled = false;
    setAdminsLoading(true);
    adminsApi
      .list()
      .then((list) => { if (!cancelled) setAdmins(list); })
      .catch((err) => { if (!cancelled) setBanner({ type: 'error', text: err.message }); })
      .finally(() => { if (!cancelled) setAdminsLoading(false); });
    return () => { cancelled = true; };
  }, [activeTab, isAuthenticated]);

  // Re-pull orders and products whenever the admin opens dashboard or orders so
  // new customer checkouts show up without a full page reload.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab !== 'dashboard' && activeTab !== 'orders') return;
    actions.refetch('orders').catch(() => {});
    actions.refetch('products').catch(() => {});
  }, [activeTab, isAuthenticated, actions]);

  if (bootstrapping) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#555' }}>
        <span><Loader2 className="spin" size={18} /> Loading…</span>
      </div>
    );
  }
  if (!isAuthenticated) return <AdminLogin />;

  function navigate(id) { setActiveTab(id); setSidebarOpen(false); }

  async function run(fn, successText) {
    setBusy(true);
    try {
      const out = await fn();
      if (successText) setBanner({ type: 'success', text: successText });
      return out;
    } catch (err) {
      setBanner({ type: 'error', text: err.message || 'Something went wrong' });
      throw err;
    } finally {
      setBusy(false);
    }
  }

  /* ── product handlers ── */
  function openAddForm() {
    setForm(EMPTY_PRODUCT); setEditingId(null); setShowForm(true);
  }
  function openEditForm(p) {
    setForm({
      ...p,
      tags: (p.tags || []).join(', '),
      availableColors: (p.availableColors || []).join(', '),
      images: (p.images || []).join(', '),
      sizes: (p.sizes || []).join(', '),
    });
    setEditingId(p.id);
    setShowForm(true);
  }
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }
  // Live-recompute the price relationship so admins never have to do the math.
  //   - editing Offered or Base → recompute Disc %
  //   - editing Disc % → recompute Offered from Base
  // The field the admin just typed is treated as the source of truth.
  function setRowField(field, value) {
    setStoreRow((r) => {
      const next = { ...r, [field]: value };
      const base = parseFloat(next.basePrice);
      const offered = parseFloat(next.offeredPrice);
      const pct = parseFloat(next.discountPercent);
      const fmt = (n) =>
        Number.isFinite(n) ? String(Math.round(n * 100) / 100) : '';
      if (field === 'basePrice' || field === 'offeredPrice') {
        if (Number.isFinite(base) && base > 0 && Number.isFinite(offered)) {
          const newPct = ((base - offered) / base) * 100;
          next.discountPercent = newPct > 0 ? fmt(newPct) : '0';
        }
      } else if (field === 'discountPercent') {
        if (Number.isFinite(base) && base > 0 && Number.isFinite(pct)) {
          next.offeredPrice = fmt(base - (base * pct) / 100);
        }
      }
      return next;
    });
  }

  function addStoreRow() {
    if (!storeRow.storeId || !storeRow.basePrice || !storeRow.stock) return;
    const basePrice = +storeRow.basePrice;
    const stockPrice = +storeRow.stockPrice || 0;
    const discountPercent = +storeRow.discountPercent || 0;
    // Prefer explicit offeredPrice; otherwise derive from discountPercent; otherwise = basePrice.
    let offeredPrice = storeRow.offeredPrice !== '' ? +storeRow.offeredPrice : null;
    if (offeredPrice == null) {
      offeredPrice = discountPercent > 0
        ? Math.max(0, basePrice - (basePrice * discountPercent) / 100)
        : basePrice;
    }
    const derivedPct = (!discountPercent && basePrice > 0 && offeredPrice < basePrice)
      ? Math.round(((basePrice - offeredPrice) / basePrice) * 100)
      : discountPercent;
    const row = {
      storeId: storeRow.storeId,
      stockPrice,
      basePrice,
      offeredPrice,
      discountPercent: derivedPct,
      price: offeredPrice,
      stock: +storeRow.stock,
    };
    const exists = form.storeInventory.find((s) => s.storeId === storeRow.storeId);
    setForm((f) => ({
      ...f,
      storeInventory: exists
        ? f.storeInventory.map((s) => (s.storeId === storeRow.storeId ? row : s))
        : [...f.storeInventory, row],
    }));
    setStoreRow({ storeId: '', stockPrice: '', basePrice: '', offeredPrice: '', discountPercent: '', stock: '' });
  }
  function removeStoreRow(id) {
    setForm((f) => ({ ...f, storeInventory: f.storeInventory.filter((s) => s.storeId !== id) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.description || form.storeInventory.length === 0) {
      setBanner({ type: 'error', text: 'Fill name, description and add at least one store.' });
      return;
    }
    const payload = {
      name: form.name,
      category: form.category,
      type: form.type,
      description: form.description,
      image: form.image,
      images: csvToArr(form.images),
      sizes: csvToArr(form.sizes),
      tags: csvToArr(form.tags),
      availableColors: csvToArr(form.availableColors),
      allowCustomDescription: !!form.allowCustomDescription,
      storeInventory: form.storeInventory,
    };
    try {
      if (editingId) {
        await run(() => actions.updateProduct(editingId, payload), 'Product updated');
      } else {
        await run(() => actions.createProduct(payload), 'Product created');
      }
      setShowForm(false);
      setEditingId(null);
    } catch {}
  }
  async function deleteProduct(id) {
    if (!window.confirm('Delete this product?')) return;
    try { await run(() => actions.deleteProduct(id), 'Product deleted'); } catch {}
  }

  /* ── store handlers ── */
  function openAddStore() {
    setStoreForm(EMPTY_STORE); setEditingStoreId(null); setShowStoreForm(true);
  }
  function openEditStore(s) {
    setStoreForm({ name: s.name, location: s.location, phone: s.phone || '', email: s.email || '' });
    setEditingStoreId(s.id);
    setShowStoreForm(true);
  }
  function handleStoreChange(e) {
    const { name, value } = e.target;
    setStoreForm((f) => ({ ...f, [name]: value }));
  }
  async function handleStoreSubmit(e) {
    e.preventDefault();
    if (!storeForm.name || !storeForm.location) {
      setBanner({ type: 'error', text: 'Name and location are required.' });
      return;
    }
    try {
      if (editingStoreId) {
        await run(() => actions.updateStore(editingStoreId, storeForm), 'Store updated');
      } else {
        await run(() => actions.createStore(storeForm), 'Store created');
      }
      setShowStoreForm(false); setEditingStoreId(null);
    } catch {}
  }
  async function deleteStore(id) {
    if (!window.confirm('Delete this store?')) return;
    try { await run(() => actions.deleteStore(id), 'Store deleted'); } catch {}
  }

  /* ── event handlers ── */
  function openAddEvent() {
    setEventForm(EMPTY_EVENT); setEditingEventId(null); setShowEventForm(true);
  }
  function openEditEvent(ev) {
    setEventForm({
      ...ev,
      date: ev.date ? new Date(ev.date).toISOString().slice(0, 10) : '',
    });
    setEditingEventId(ev.id);
    setShowEventForm(true);
  }
  function handleEventChange(e) {
    const { name, value } = e.target;
    setEventForm((f) => ({ ...f, [name]: value }));
  }
  async function handleEventSubmit(e) {
    e.preventDefault();
    if (!eventForm.name || !eventForm.venue || !eventForm.contactPhone) {
      setBanner({ type: 'error', text: 'Fill name, venue and contact phone.' });
      return;
    }
    const payload = { ...eventForm };
    if (!payload.date) payload.date = null;
    try {
      if (editingEventId) {
        await run(() => actions.updateEvent(editingEventId, payload), 'Event updated');
      } else {
        await run(() => actions.createEvent(payload), 'Event created');
      }
      setShowEventForm(false); setEditingEventId(null);
    } catch {}
  }
  async function deleteEvent(id) {
    if (!window.confirm('Delete this event booking?')) return;
    try { await run(() => actions.deleteEvent(id), 'Event deleted'); } catch {}
  }

  /* ── order handlers ── */
  function openEditOrder(o) {
    setEditingOrderId(o.id);
    setOrderForm({ status: o.status || 'Confirmed', trackingUrl: o.trackingUrl || '' });
  }
  async function handleOrderSubmit(e) {
    e.preventDefault();
    try {
      await run(
        () => actions.updateOrderStatus(editingOrderId, orderForm),
        'Order updated'
      );
      setEditingOrderId(null);
    } catch {}
  }

  /* ── admin handlers ── */
  function openAddAdmin() {
    setAdminForm(EMPTY_ADMIN_FORM); setEditingAdminId(null); setShowAdminForm(true);
  }
  function openEditAdmin(a) {
    setAdminForm({ email: a.email, name: a.name, password: '', role: a.role });
    setEditingAdminId(a.id);
    setShowAdminForm(true);
  }
  function handleAdminChange(e) {
    const { name, value } = e.target;
    setAdminForm((f) => ({ ...f, [name]: value }));
  }
  async function handleAdminSubmit(e) {
    e.preventDefault();
    try {
      if (editingAdminId) {
        const updated = await run(
          () => adminsApi.update(editingAdminId, {
            email: adminForm.email,
            name: adminForm.name,
            role: adminForm.role,
          }),
          'Admin updated'
        );
        setAdmins((list) => list.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        if (!adminForm.email || !adminForm.password) {
          setBanner({ type: 'error', text: 'Email and password are required.' });
          return;
        }
        const created = await run(() => adminsApi.create(adminForm), 'Admin created');
        setAdmins((list) => [...list, created]);
      }
      setShowAdminForm(false); setEditingAdminId(null);
    } catch {}
  }
  function openChangePassword(adminId) {
    setPasswordTargetId(adminId);
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setShowPassForm(true);
  }
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!passwordForm.password || passwordForm.password.length < 6) {
      setBanner({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    const isSelf = passwordTargetId === currentAdmin?.id;
    const payload = { password: passwordForm.password };
    if (isSelf) payload.currentPassword = passwordForm.currentPassword;
    try {
      await run(
        () => adminsApi.changePassword(passwordTargetId, payload),
        isSelf ? 'Password changed — please sign in again' : 'Password reset'
      );
      setShowPassForm(false);
      if (isSelf) await logout();
    } catch {}
  }
  async function deleteAdmin(id) {
    if (!window.confirm('Delete this admin?')) return;
    try {
      await run(() => adminsApi.remove(id), 'Admin deleted');
      setAdmins((list) => list.filter((a) => a.id !== id));
    } catch {}
  }

  async function handleLogout() {
    await logout();
  }

  const catProducts = (cat) => state.products.filter((p) => p.category === cat);
  const totalRevenue = state.orders.reduce((s, o) => s + Number(o.price || 0), 0);
  const lowStockProducts = state.products.filter(
    (p) => (p.storeInventory || []).reduce((s, i) => s + i.stock, 0) < 10
  );

  return (
    <div className="adm-shell">

      {/* ── Sidebar ── */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="adm-sidebar-brand">
          <Flower2 size={22} strokeWidth={1.8} />
          <span>BloomNest</span>
          <button className="adm-sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <nav className="adm-nav">
          {NAV.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`adm-nav-item ${activeTab === id ? 'active' : ''}`}
              onClick={() => navigate(id)}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
              {activeTab === id && <ChevronRight size={14} className="adm-nav-chevron" />}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <Link to="/" className="adm-footer-link">
            <Flower2 size={15} /> View Store
          </Link>
          <button className="adm-footer-link adm-logout" onClick={handleLogout}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="adm-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="adm-main">

        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button className="adm-burger" onClick={() => setSidebarOpen(true)}>
              <MenuIcon size={20} />
            </button>
            <div>
              <h1 className="adm-page-title">{NAV.find((n) => n.id === activeTab)?.label}</h1>
            </div>
          </div>
          <div className="adm-topbar-right">
            <div className="adm-avatar">{(currentAdmin?.name || 'A').charAt(0).toUpperCase()}</div>
            <div className="adm-user-info">
              <strong>{currentAdmin?.name || 'Admin'}</strong>
              <span>{currentAdmin?.email}</span>
            </div>
          </div>
        </header>

        {banner && (
          <div
            className="adm-alert"
            style={{
              background: banner.type === 'error' ? 'rgba(220,38,38,0.08)' : 'rgba(21,128,61,0.08)',
              color: banner.type === 'error' ? '#b91c1c' : '#15803d',
              margin: '0.75rem 1.5rem 0',
            }}
          >
            {banner.type === 'error' ? <AlertTriangle size={16} /> : <Sparkles size={16} />}
            {banner.text}
          </div>
        )}

        <div className="adm-content">

          {/* ── Dashboard ── */}
          {activeTab === 'dashboard' && (
            <div className="adm-section">
              <div className="adm-stat-cards">
                <div className="adm-stat-card">
                  <div className="adm-stat-icon" style={{ background: 'rgba(193,68,14,0.1)', color: '#c1440e' }}><ShoppingBag size={22} /></div>
                  <div><p>Total Products</p><h3>{state.products.filter((p) => p.category !== 'parties').length}</h3></div>
                </div>
                <div className="adm-stat-card">
                  <div className="adm-stat-icon" style={{ background: 'rgba(217,119,6,0.1)', color: '#d97706' }}><PartyPopper size={22} /></div>
                  <div><p>Events</p><h3>{state.events.length}</h3></div>
                </div>
                <div className="adm-stat-card">
                  <div className="adm-stat-icon" style={{ background: 'rgba(45,106,79,0.1)', color: '#2d6a4f' }}><ClipboardList size={22} /></div>
                  <div><p>Total Orders</p><h3>{state.orders.length}</h3></div>
                </div>
                <div className="adm-stat-card">
                  <div className="adm-stat-icon" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}><DollarSign size={22} /></div>
                  <div><p>Total Revenue</p><h3>${totalRevenue.toLocaleString()}</h3></div>
                </div>
              </div>

              {lowStockProducts.length > 0 && (
                <div className="adm-alert">
                  <AlertTriangle size={16} />
                  <strong>{lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} low on stock:</strong>
                  {lowStockProducts.map((p) => p.name).join(', ')}
                </div>
              )}

              <div className="adm-dash-grid">
                <div className="adm-dash-card">
                  <div className="adm-dash-card-header">
                    <h3>Recent Orders</h3>
                    <button className="adm-link-btn" onClick={() => navigate('orders')}>View all</button>
                  </div>
                  {state.orders.length === 0 ? (
                    <p className="adm-empty-sm">No orders yet.</p>
                  ) : (
                    state.orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="adm-dash-row">
                        <div>
                          <strong>{o.id}</strong>
                          <p>{o.productName}</p>
                        </div>
                        <span className={`badge ${o.type === 'gift' ? 'badge-blue' : 'badge-green'}`}>{o.type}</span>
                        <strong>${o.price}</strong>
                      </div>
                    ))
                  )}
                </div>

                <div className="adm-dash-card">
                  <div className="adm-dash-card-header"><h3>Product Split</h3></div>
                  {['flowers', 'gifts'].map((cat) => {
                    const count = state.products.filter((p) => p.category === cat).length;
                    const total = state.products.filter((p) => p.category !== 'parties').length;
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={cat} className="adm-bar-row">
                        <span className="adm-bar-label">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        <div className="adm-bar-track">
                          <div className="adm-bar-fill" style={{ width: `${pct}%`, background: cat === 'flowers' ? '#e11d48' : '#7c3aed' }} />
                        </div>
                        <span className="adm-bar-count">{count}</span>
                      </div>
                    );
                  })}
                  <div className="adm-bar-row">
                    <span className="adm-bar-label">Events</span>
                    <div className="adm-bar-track">
                      <div className="adm-bar-fill" style={{ width: state.events.length ? '60%' : '0%', background: '#d97706' }} />
                    </div>
                    <span className="adm-bar-count">{state.events.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Products ── */}
          {activeTab === 'products' && (
            <div className="adm-section">
              <div className="adm-section-header">
                <h2>All Products <span className="adm-count-badge">{state.products.filter((p) => p.category !== 'parties').length}</span></h2>
                <button className="btn btn-primary" onClick={openAddForm} disabled={busy}><Plus size={15} /> Add Product</button>
              </div>
              {['flowers', 'gifts'].map((cat) => (
                <div key={cat} className="adm-cat-group">
                  <h3 className="adm-cat-label">
                    {cat === 'flowers' ? <Flower2 size={14} /> : <Gift size={14} />}
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </h3>
                  <div className="adm-table">
                    <div className="adm-table-head">
                      <span>Product</span><span>Type</span><span>Stores</span><span>Price Range</span><span>Stock</span><span>Actions</span>
                    </div>
                    {catProducts(cat).map((p) => {
                      const prices = (p.storeInventory || []).map((s) => s.price);
                      const totalStock = (p.storeInventory || []).reduce((n, s) => n + s.stock, 0);
                      return (
                        <div key={p.id} className="adm-table-row">
                          <div className="adm-prod-info">
                            <img src={p.image} alt={p.name} />
                            <div><strong>{p.name}</strong><p>{(p.tags || []).join(', ')}</p></div>
                          </div>
                          <span className={`adm-type-pill ${p.type}`}>
                            {p.type === 'natural' ? <Leaf size={10} /> : <Sparkles size={10} />} {p.type}
                          </span>
                          <span>{(p.storeInventory || []).length}</span>
                          <span>{prices.length ? `$${Math.min(...prices)} – $${Math.max(...prices)}` : '—'}</span>
                          <span className={totalStock < 5 ? 'adm-low' : ''}>{totalStock}</span>
                          <div className="adm-row-actions">
                            <button className="btn btn-ghost" title="Edit" onClick={() => openEditForm(p)}><Pencil size={13} /></button>
                            <button className="btn btn-ghost" title="Print details" onClick={() => printProduct(p, state.stores)}><Printer size={13} /></button>
                            <button className="btn btn-ghost adm-del-btn" title="Delete" onClick={() => deleteProduct(p.id)}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      );
                    })}
                    {catProducts(cat).length === 0 && <div className="adm-table-empty">No products yet.</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Parties & Events ── */}
          {activeTab === 'parties' && (
            <div className="adm-section">
              <div className="adm-section-header">
                <h2>Parties & Events <span className="adm-count-badge">{state.events.length}</span></h2>
                <button className="btn btn-primary" onClick={openAddEvent} disabled={busy}><Plus size={15} /> New Booking</button>
              </div>

              <div className="adm-event-chips">
                {['wedding','birthday','corporate','anniversary','other'].map((type) => {
                  const count = state.events.filter((ev) => ev.packageType === type).length;
                  return (
                    <div key={type} className="adm-event-chip">
                      <span className="adm-event-chip-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      <span className="adm-event-chip-count">{count}</span>
                    </div>
                  );
                })}
              </div>

              {state.events.length === 0 ? (
                <div className="adm-events-empty">
                  <PartyPopper size={40} strokeWidth={1.2} />
                  <p>No event bookings yet.</p>
                  <button className="btn btn-primary" onClick={openAddEvent}><Plus size={14} /> Add First Booking</button>
                </div>
              ) : (
                <div className="adm-events-grid">
                  {state.events.map((ev) => (
                    <div key={ev.id} className="adm-event-card">
                      <div className="adm-event-card-header">
                        <span className={`adm-event-type-badge type-${ev.packageType}`}>
                          <PartyPopper size={11} /> {ev.packageType}
                        </span>
                        <span className={`adm-event-status status-${ev.status}`}>{ev.status}</span>
                      </div>
                      <h3 className="adm-event-name">{ev.name}</h3>
                      <div className="adm-event-meta">
                        {ev.date && <p><Calendar size={12} /> {new Date(ev.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>}
                        <p><Building2 size={12} /> {ev.venue}</p>
                        {ev.capacity > 0 && <p><Users size={12} /> {ev.capacity} guests</p>}
                        {ev.price > 0 && <p><Tag size={12} /> ${Number(ev.price).toLocaleString()}</p>}
                      </div>
                      {ev.description && <p className="adm-event-desc">{ev.description}</p>}
                      <div className="adm-event-contact">
                        <strong>{ev.contactName}</strong> · {ev.contactPhone}
                      </div>
                      <div className="adm-event-actions">
                        <button className="btn btn-ghost" onClick={() => openEditEvent(ev)}><Pencil size={13} /> Edit</button>
                        <button className="btn btn-ghost" onClick={() => printEvent(ev)}><Printer size={13} /> Print</button>
                        <button className="btn btn-ghost adm-del-btn" onClick={() => deleteEvent(ev.id)}><Trash2 size={13} /> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Inventory ── */}
          {activeTab === 'inventory' && (
            <div className="adm-section">
              <div className="adm-section-header"><h2>Store Inventory Overview</h2></div>
              <div className="adm-inv-grid">
                {state.stores.map((store) => {
                  const storeProds = state.products.filter((p) => (p.storeInventory || []).some((s) => s.storeId === store.id));
                  return (
                    <div key={store.id} className="adm-inv-card">
                      <div className="adm-inv-head">
                        <h3>{store.name}</h3>
                        <p><MapPin size={14} /> {store.location}</p>
                      </div>
                      <div className="adm-inv-list">
                        {storeProds.map((p) => {
                          const si = p.storeInventory.find((s) => s.storeId === store.id);
                          return (
                            <div key={p.id} className="adm-inv-row">
                              <span className="adm-inv-name">{p.name}</span>
                              <span className={`adm-inv-stock ${si.stock < 5 ? 'low' : ''}`}>{si.stock} units</span>
                              <span className="adm-inv-price">${si.price}</span>
                            </div>
                          );
                        })}
                        {storeProds.length === 0 && <p className="adm-inv-empty">No products assigned.</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Stores ── */}
          {activeTab === 'stores' && (
            <div className="adm-section">
              <div className="adm-section-header">
                <h2>Stores <span className="adm-count-badge">{state.stores.length}</span></h2>
                <button className="btn btn-primary" onClick={openAddStore} disabled={busy}><Plus size={15} /> Add Store</button>
              </div>
              <div className="adm-stores-grid">
                {state.stores.map((store) => (
                  <div key={store.id} className="adm-store-card">
                    <div className="adm-store-body">
                      <div className="adm-store-icon"><StoreIcon size={20} strokeWidth={1.6} /></div>
                      <div className="adm-store-info">
                        <h3>{store.name}</h3>
                        <p><MapPin size={11} /> {store.location}</p>
                        {store.phone && <p><Phone size={11} /> {store.phone}</p>}
                        {store.email && <p><Mail size={11} /> {store.email}</p>}
                      </div>
                    </div>
                    <div className="adm-store-actions">
                      <button className="btn btn-ghost" onClick={() => openEditStore(store)}><Pencil size={13} /> Edit</button>
                      <button className="btn btn-ghost adm-del-btn" onClick={() => deleteStore(store.id)}><Trash2 size={13} /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {activeTab === 'orders' && (
            <div className="adm-section">
              <div className="adm-section-header">
                <h2>Orders <span className="adm-count-badge">{state.orders.length}</span></h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => exportToCsv(
                      `orders-${new Date().toISOString().slice(0, 10)}.csv`,
                      state.orders.map((o) => ({
                        OrderID: o.id,
                        Date: o.date ? new Date(o.date).toLocaleString() : '',
                        Type: o.type,
                        Status: o.status,
                        Product: o.productName,
                        Quantity: o.quantity,
                        Color: o.color,
                        Size: o.size,
                        Store: o.storeName,
                        CustomerName: o.customerName,
                        CustomerPhone: o.customerPhone,
                        CustomerEmail: o.customerEmail,
                        CustomerAddress: o.customerAddress,
                        ReceiverName: o.giftDetails?.receiverName || '',
                        ReceiverPhone: o.giftDetails?.receiverPhone || '',
                        ReceiverAddress: o.giftDetails?.receiverAddress || '',
                        GiftMessage: o.giftDetails?.giftMessage || '',
                        UnitPrice: o.unitPrice,
                        BasePrice: o.basePrice,
                        Coupon: o.couponCode,
                        Discount: o.discount,
                        Total: o.price,
                        TrackingURL: o.trackingUrl,
                      }))
                    )}
                    disabled={busy || state.orders.length === 0}
                  >
                    <Download size={14} /> Export Excel
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={async () => {
                      try { await actions.refetch('orders'); }
                      catch (err) { setBanner({ type: 'error', text: err.message }); }
                    }}
                    disabled={busy}
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              </div>
              {state.orders.length === 0 ? (
                <div className="adm-empty-lg">No orders placed yet.</div>
              ) : (
                <div className="adm-orders-list">
                  {state.orders.map((o) => (
                    <div key={o.id} className="adm-order-row">
                      <div><strong>{o.id}</strong><p>{o.productName}</p></div>
                      <span className={`badge ${o.type === 'gift' ? 'badge-blue' : 'badge-green'}`}>{o.type}</span>
                      <span>{o.storeName}</span>
                      <strong>${o.price}</strong>
                      <span>{new Date(o.date).toLocaleDateString()}</span>
                      <span className="badge badge-green">{o.status}</span>
                      <div className="adm-row-actions" style={{ display: 'flex', gap: '0.3rem' }}>
                        <button className="btn btn-ghost" onClick={() => setViewingOrder(o)}><Eye size={13} /> View</button>
                        <button className="btn btn-ghost" onClick={() => printOrder(o)}><Printer size={13} /> Print</button>
                        <button className="btn btn-ghost" onClick={() => openEditOrder(o)}><Truck size={13} /> Update</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── New feature tabs ── */}
          {activeTab === 'customers' && <UsersTab />}
          {activeTab === 'coupons' && <CouponsTab />}
          {activeTab === 'packages' && <PackagesTab />}
          {activeTab === 'reviews' && <ReviewsTab />}
          {activeTab === 'offers' && <OffersTab />}
          {activeTab === 'testimonials' && <TestimonialsTab />}
          {activeTab === 'partners' && <DeliveryPartnersTab />}
          {activeTab === 'banners' && <BannersTab />}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'blogs' && <BlogsTab />}
          {activeTab === 'cms' && <CmsTab />}
          {activeTab === 'master' && <MasterTab />}
          {activeTab === 'settings' && <SettingsTab />}

          {/* ── Admins ── */}
          {activeTab === 'admins' && (
            <div className="adm-section">
              <div className="adm-section-header">
                <h2>Admins <span className="adm-count-badge">{admins.length}</span></h2>
                <button className="btn btn-primary" onClick={openAddAdmin} disabled={busy}><Plus size={15} /> Add Admin</button>
              </div>
              {adminsLoading ? (
                <div className="adm-empty-lg"><Loader2 className="spin" size={16} /> Loading admins…</div>
              ) : admins.length === 0 ? (
                <div className="adm-empty-lg">No admins yet.</div>
              ) : (
                <div className="adm-stores-grid">
                  {admins.map((a) => (
                    <div key={a.id} className="adm-store-card">
                      <div className="adm-store-body">
                        <div className="adm-store-icon"><Shield size={20} strokeWidth={1.6} /></div>
                        <div className="adm-store-info">
                          <h3>{a.name} {a.id === currentAdmin?.id && <span className="badge badge-green">you</span>}</h3>
                          <p><Mail size={11} /> {a.email}</p>
                          <p><Tag size={11} /> {a.role}</p>
                          <p style={{ fontSize: '0.75rem', color: '#888' }}>Created {new Date(a.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="adm-store-actions">
                        <button className="btn btn-ghost" onClick={() => openEditAdmin(a)}><Pencil size={13} /> Edit</button>
                        <button className="btn btn-ghost" onClick={() => openChangePassword(a.id)}><Shield size={13} /> Password</button>
                        {a.id !== currentAdmin?.id && (
                          <button className="btn btn-ghost adm-del-btn" onClick={() => deleteAdmin(a.id)}><Trash2 size={13} /> Delete</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Order Details Modal ── */}
      {viewingOrder && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewingOrder(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Order {viewingOrder.id}</h2>
              <button className="modal-close" onClick={() => setViewingOrder(null)}><X size={18} /></button>
            </div>
            <div className="modal-form">
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span className={`badge ${viewingOrder.type === 'gift' ? 'badge-blue' : 'badge-green'}`}>{viewingOrder.type}</span>
                <span className="badge badge-green">{viewingOrder.status}</span>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>
                  {viewingOrder.date ? new Date(viewingOrder.date).toLocaleString() : ''}
                </span>
              </div>

              <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '0.8rem' }}>
                <legend style={{ padding: '0 0.4rem', fontWeight: 700, fontSize: '0.8rem', color: '#374151' }}>Product</legend>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                  {viewingOrder.productImage && (
                    <img src={viewingOrder.productImage} alt="" style={{ width: 64, height: 64, borderRadius: 6, objectFit: 'cover' }} />
                  )}
                  <div style={{ flex: 1, fontSize: '0.85rem' }}>
                    <strong>{viewingOrder.productName}</strong>
                    <p style={{ color: '#666' }}>Store: {viewingOrder.storeName}</p>
                    <p style={{ color: '#666' }}>Qty: {viewingOrder.quantity} {viewingOrder.color ? `· ${viewingOrder.color}` : ''} {viewingOrder.size ? `· ${viewingOrder.size}` : ''}</p>
                    {viewingOrder.customDescription && (
                      <p style={{ color: '#666' }}>Custom: {viewingOrder.customDescription}</p>
                    )}
                  </div>
                </div>
              </fieldset>

              <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '0.8rem' }}>
                <legend style={{ padding: '0 0.4rem', fontWeight: 700, fontSize: '0.8rem', color: '#374151' }}>Customer</legend>
                <p style={{ fontSize: '0.85rem' }}><strong>{viewingOrder.customerName || '—'}</strong></p>
                <p style={{ fontSize: '0.82rem', color: '#555' }}><Phone size={11} /> {viewingOrder.customerPhone || '—'}</p>
                <p style={{ fontSize: '0.82rem', color: '#555' }}><Mail size={11} /> {viewingOrder.customerEmail || '—'}</p>
                {viewingOrder.customerAddress && (
                  <p style={{ fontSize: '0.82rem', color: '#555' }}><MapPin size={11} /> {viewingOrder.customerAddress}</p>
                )}
              </fieldset>

              {viewingOrder.giftDetails && (
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '0.8rem' }}>
                  <legend style={{ padding: '0 0.4rem', fontWeight: 700, fontSize: '0.8rem', color: '#374151' }}>Gift Recipient</legend>
                  <p style={{ fontSize: '0.85rem' }}><strong>{viewingOrder.giftDetails.receiverName}</strong></p>
                  <p style={{ fontSize: '0.82rem', color: '#555' }}><Phone size={11} /> {viewingOrder.giftDetails.receiverPhone}</p>
                  <p style={{ fontSize: '0.82rem', color: '#555' }}><MapPin size={11} /> {viewingOrder.giftDetails.receiverAddress}</p>
                  {viewingOrder.giftDetails.giftMessage && (
                    <p style={{ fontSize: '0.82rem', color: '#555', fontStyle: 'italic' }}>"{viewingOrder.giftDetails.giftMessage}"</p>
                  )}
                </fieldset>
              )}

              <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '0.8rem' }}>
                <legend style={{ padding: '0 0.4rem', fontWeight: 700, fontSize: '0.8rem', color: '#374151' }}>Pricing</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '0.3rem', fontSize: '0.85rem' }}>
                  <span>Unit price</span><strong>${Number(viewingOrder.unitPrice || 0).toFixed(2)}</strong>
                  {viewingOrder.basePrice > 0 && (<><span>Base / MRP</span><strong>${Number(viewingOrder.basePrice).toFixed(2)}</strong></>)}
                  {viewingOrder.couponCode && (<><span>Coupon</span><strong>{viewingOrder.couponCode}</strong></>)}
                  {viewingOrder.discount > 0 && (<><span>Discount</span><strong>-${Number(viewingOrder.discount).toFixed(2)}</strong></>)}
                  <span>Total</span><strong style={{ color: '#c1440e' }}>${Number(viewingOrder.price || 0).toFixed(2)}</strong>
                </div>
              </fieldset>

              {viewingOrder.trackingUrl && (
                <p style={{ fontSize: '0.82rem' }}>
                  Tracking:{' '}
                  <a href={viewingOrder.trackingUrl} target="_blank" rel="noopener noreferrer">
                    {viewingOrder.trackingUrl}
                  </a>
                </p>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setViewingOrder(null)}>Close</button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => printOrder(viewingOrder)}
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => { openEditOrder(viewingOrder); setViewingOrder(null); }}
                >
                  <Truck size={13} /> Update status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Update Modal ── */}
      {editingOrderId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditingOrderId(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Update Order Status</h2>
              <button className="modal-close" onClick={() => setEditingOrderId(null)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={handleOrderSubmit}>
              <div className="form-group">
                <label>Status</label>
                <select value={orderForm.status} onChange={(e) => setOrderForm((f) => ({ ...f, status: e.target.value }))}>
                  {(orderStatusOptions.length ? orderStatusOptions : ORDER_STATUSES.map((s) => ({ value: s, label: s })))
                    .map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tracking URL (optional)</label>
                <input value={orderForm.trackingUrl} onChange={(e) => setOrderForm((f) => ({ ...f, trackingUrl: e.target.value }))} placeholder="https://…" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditingOrderId(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Event Modal ── */}
      {showEventForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowEventForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingEventId ? 'Edit Event Booking' : 'New Event Booking'}</h2>
              <button className="modal-close" onClick={() => setShowEventForm(false)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={handleEventSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Event / Client Name *</label>
                  <input name="name" value={eventForm.name} onChange={handleEventChange} placeholder="e.g. Sharma Wedding" />
                </div>
                <div className="form-group">
                  <label>Package Type *</label>
                  <select name="packageType" value={eventForm.packageType} onChange={handleEventChange}>
                    {(eventPackageTypeOptions.length ? eventPackageTypeOptions : [
                      { value: 'wedding', label: 'Wedding' },
                      { value: 'birthday', label: 'Birthday' },
                      { value: 'corporate', label: 'Corporate' },
                      { value: 'anniversary', label: 'Anniversary' },
                      { value: 'other', label: 'Other' },
                    ]).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Venue *</label>
                  <input name="venue" value={eventForm.venue} onChange={handleEventChange} placeholder="Grand Ballroom, Hotel Taj" />
                </div>
                <div className="form-group">
                  <label>Event Date</label>
                  <input type="date" name="date" value={eventForm.date} onChange={handleEventChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Guest Capacity</label>
                  <input type="number" name="capacity" value={eventForm.capacity} onChange={handleEventChange} placeholder="e.g. 200" min="1" />
                </div>
                <div className="form-group">
                  <label>Package Price ($)</label>
                  <input type="number" name="price" value={eventForm.price} onChange={handleEventChange} placeholder="e.g. 1500" min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Description / Requirements</label>
                <textarea name="description" rows={3} value={eventForm.description} onChange={handleEventChange} placeholder="Floral arch, table centrepieces, bridal bouquet…" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input name="contactName" value={eventForm.contactName} onChange={handleEventChange} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Contact Phone *</label>
                  <input name="contactPhone" value={eventForm.contactPhone} onChange={handleEventChange} placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={eventForm.status} onChange={handleEventChange}>
                  <option value="enquiry">Enquiry</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowEventForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : (editingEventId ? 'Save Changes' : 'Create Booking')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Store Modal ── */}
      {showStoreForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowStoreForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingStoreId ? 'Edit Store' : 'Add Store'}</h2>
              <button className="modal-close" onClick={() => setShowStoreForm(false)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={handleStoreSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Store Name *</label><input name="name" value={storeForm.name} onChange={handleStoreChange} placeholder="e.g. Bloom Central" /></div>
                <div className="form-group"><label>Location *</label><input name="location" value={storeForm.location} onChange={handleStoreChange} placeholder="12 Rose Street, Mumbai" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Phone</label><input name="phone" value={storeForm.phone} onChange={handleStoreChange} placeholder="+91 99999 99999" /></div>
                <div className="form-group"><label>Email</label><input name="email" type="email" value={storeForm.email} onChange={handleStoreChange} placeholder="store@example.com" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowStoreForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : (editingStoreId ? 'Save Changes' : 'Add Store')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Product Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal modal-wide">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Red Rose Bouquet" /></div>
                <div className="form-group"><label>Category *</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    {(categoryOptions.length ? categoryOptions : [
                      { value: 'flowers', label: 'Flowers' },
                      { value: 'gifts', label: 'Gifts' },
                      { value: 'parties', label: 'Parties' },
                    ]).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Product Type</label>
                <div className="type-radio-group">
                  {(productTypeOptions.length ? productTypeOptions : [
                    { value: 'natural', label: 'Natural' },
                    { value: 'artificial', label: 'Artificial' },
                  ]).map((t) => (
                    <label key={t.value} className={`type-radio-btn ${form.type === t.value ? 'active' : ''}`}>
                      <input type="radio" name="type" value={t.value} checked={form.type === t.value} onChange={handleChange} />
                      {t.value === 'natural' ? <Leaf size={13} /> : <Sparkles size={13} />}
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Description *</label><textarea name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Describe the product…" /></div>

              {/* Cover photo */}
              <ImageUploadField
                label="Cover Photo *"
                value={form.image || ''}
                onChange={(url) => setForm((f) => ({ ...f, image: url }))}
              />

              {/* Gallery */}
              <ImagesUploadField
                label="Gallery Images"
                value={form.images || ''}
                onChange={(csv) => setForm((f) => ({ ...f, images: csv }))}
              />

              <div className="form-row">
                <div className="form-group"><label>Tags</label><input name="tags" value={form.tags} onChange={handleChange} placeholder="bestseller, romantic" /></div>
                <div className="form-group"><label>Colors</label><input name="availableColors" value={form.availableColors} onChange={handleChange} placeholder="Red, Pink, White" /></div>
              </div>
              <div className="form-group">
                <label>Sizes (comma-separated)</label>
                <input name="sizes" value={form.sizes} onChange={handleChange} placeholder="Small, Medium, Large" />
                {form.sizes && (
                  <div className="prod-size-preview">
                    {csvToArr(form.sizes).map((s) => (
                      <span key={s} className="prod-size-chip">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group form-check">
                <label><input type="checkbox" name="allowCustomDescription" checked={form.allowCustomDescription} onChange={handleChange} /> Allow bespoke request</label>
              </div>
              <div className="store-inventory-section">
                <h4>Store Inventory *</h4>
                <p style={{ fontSize: '0.78rem', color: '#777', marginBottom: '0.5rem' }}>
                  Stock = cost · Base = MRP · Offered = selling price. Enter any two of Base / Offered / Disc % — the third fills in automatically.
                </p>
                {form.storeInventory.map((si) => {
                  const store = state.stores.find((s) => s.id === si.storeId);
                  const base = Number(si.basePrice || si.price || 0);
                  const offered = Number(si.offeredPrice || si.price || 0);
                  const pct = Number(si.discountPercent || 0);
                  return (
                    <div key={si.storeId} className="prod-inv-row">
                      <span className="prod-inv-row-store"><strong>{store?.name || si.storeId}</strong></span>
                      <span className="prod-inv-row-cell">
                        Cost: ${Number(si.stockPrice || 0).toFixed(2)}
                      </span>
                      <span className="prod-inv-row-cell">
                        {pct > 0 ? (
                          <>
                            <span style={{ textDecoration: 'line-through', color: '#999' }}>${base.toFixed(2)}</span>
                            {' '}<strong style={{ color: '#c1440e' }}>${offered.toFixed(2)}</strong>
                            {' '}<span className="badge badge-orange">{pct}% off</span>
                          </>
                        ) : (
                          <strong>${base.toFixed(2)}</strong>
                        )}
                      </span>
                      <span className="prod-inv-row-cell">{si.stock} units</span>
                      <button type="button" className="btn btn-ghost text-danger prod-inv-row-remove" onClick={() => removeStoreRow(si.storeId)}>Remove</button>
                    </div>
                  );
                })}
                <div className="prod-inv-add">
                  <select
                    className="prod-inv-store"
                    value={storeRow.storeId}
                    onChange={(e) => setStoreRow((r) => ({ ...r, storeId: e.target.value }))}
                  >
                    <option value="">Select store…</option>
                    {state.stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input type="number" placeholder="Stock $" title="Stock / cost price" value={storeRow.stockPrice}
                    onChange={(e) => setStoreRow((r) => ({ ...r, stockPrice: e.target.value }))} min="0" />
                  <input type="number" placeholder="Base $" title="Base / MRP price" value={storeRow.basePrice}
                    onChange={(e) => setRowField('basePrice', e.target.value)} min="0" />
                  <input type="number" placeholder="Offered $" title="Offered selling price — Disc % auto-fills" value={storeRow.offeredPrice}
                    onChange={(e) => setRowField('offeredPrice', e.target.value)} min="0" />
                  <input type="number" placeholder="Disc %" title="Discount % — Offered $ auto-fills from Base" value={storeRow.discountPercent}
                    onChange={(e) => setRowField('discountPercent', e.target.value)} min="0" max="100" />
                  <input type="number" placeholder="Stock" title="Quantity in stock" value={storeRow.stock}
                    onChange={(e) => setStoreRow((r) => ({ ...r, stock: e.target.value }))} min="0" />
                  <button type="button" className="btn btn-secondary prod-inv-add-btn" onClick={addStoreRow}>Add</button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : (editingId ? 'Save Changes' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Admin Modal ── */}
      {showAdminForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdminForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingAdminId ? 'Edit Admin' : 'Add Admin'}</h2>
              <button className="modal-close" onClick={() => setShowAdminForm(false)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={handleAdminSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Name</label><input name="name" value={adminForm.name} onChange={handleAdminChange} placeholder="Admin name" /></div>
                <div className="form-group"><label>Email *</label><input name="email" type="email" value={adminForm.email} onChange={handleAdminChange} placeholder="admin@example.com" required /></div>
              </div>
              <div className="form-row">
                {!editingAdminId && (
                  <div className="form-group">
                    <label>Password *</label>
                    <input name="password" type="password" value={adminForm.password} onChange={handleAdminChange} placeholder="At least 6 characters" required minLength={6} />
                  </div>
                )}
                <div className="form-group">
                  <label>Role</label>
                  <select name="role" value={adminForm.role} onChange={handleAdminChange}>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdminForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : (editingAdminId ? 'Save Changes' : 'Create Admin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showPassForm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowPassForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Change Password</h2>
              <button className="modal-close" onClick={() => setShowPassForm(false)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={handlePasswordSubmit}>
              {passwordTargetId === currentAdmin?.id && (
                <div className="form-group">
                  <label>Current Password *</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>
              {passwordTargetId === currentAdmin?.id && (
                <p style={{ fontSize: '0.8rem', color: '#888' }}>
                  Changing your own password will sign you out of all sessions.
                </p>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowPassForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Update Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
