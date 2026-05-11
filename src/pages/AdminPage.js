import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import AdminLogin from './AdminLogin';
import {
  LayoutDashboard, Package, Store as StoreIcon, ClipboardList, MapPin,
  Plus, Pencil, Trash2, X, Flower2, Gift, PartyPopper,
  Leaf, Sparkles, Phone, Mail, LogOut, ChevronRight,
  TrendingUp, ShoppingBag, AlertTriangle, DollarSign,
  Menu as MenuIcon,
} from 'lucide-react';
import './AdminPage.css';

const EMPTY_PRODUCT = {
  name: '', category: 'flowers', type: 'natural',
  description: '', image: '', tags: '', availableColors: '',
  allowCustomDescription: true, storeInventory: [],
};
const EMPTY_STORE = { name: '', location: '', phone: '', email: '' };

const NAV = [
  { id: 'dashboard', label: 'Dashboard',       Icon: LayoutDashboard },
  { id: 'products',  label: 'Products',         Icon: Package },
  { id: 'inventory', label: 'Store Inventory',  Icon: StoreIcon },
  { id: 'stores',    label: 'Stores',           Icon: MapPin },
  { id: 'orders',    label: 'Orders',           Icon: ClipboardList },
];

export default function AdminPage() {
  const { state, dispatch } = useApp();
  const [authed, setAuthed]       = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // product form
  const [showForm, setShowForm]       = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [form, setForm]               = useState(EMPTY_PRODUCT);
  const [storeRow, setStoreRow]       = useState({ storeId: '', price: '', stock: '' });

  // store form
  const [showStoreForm, setShowStoreForm]     = useState(false);
  const [editingStoreId, setEditingStoreId]   = useState(null);
  const [storeForm, setStoreForm]             = useState(EMPTY_STORE);

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  /* ── product handlers ── */
  function openAddForm()        { setForm(EMPTY_PRODUCT); setEditingId(null); setShowForm(true); }
  function openEditForm(p)      { setForm({ ...p, tags: p.tags.join(', '), availableColors: p.availableColors.join(', ') }); setEditingId(p.id); setShowForm(true); }
  function handleChange(e)      { const { name, value, type, checked } = e.target; setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value })); }
  function addStoreRow() {
    if (!storeRow.storeId || !storeRow.price || !storeRow.stock) return;
    const exists = form.storeInventory.find(s => s.storeId === storeRow.storeId);
    setForm(f => ({
      ...f,
      storeInventory: exists
        ? f.storeInventory.map(s => s.storeId === storeRow.storeId ? { storeId: storeRow.storeId, price: +storeRow.price, stock: +storeRow.stock } : s)
        : [...f.storeInventory, { storeId: storeRow.storeId, price: +storeRow.price, stock: +storeRow.stock }],
    }));
    setStoreRow({ storeId: '', price: '', stock: '' });
  }
  function removeStoreRow(id)   { setForm(f => ({ ...f, storeInventory: f.storeInventory.filter(s => s.storeId !== id) })); }
  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.description || form.storeInventory.length === 0) { alert('Fill name, description and add at least one store.'); return; }
    const product = { ...form, id: editingId || 'p-' + Math.random().toString(36).substr(2, 8), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), availableColors: form.availableColors.split(',').map(c => c.trim()).filter(Boolean) };
    dispatch({ type: editingId ? 'UPDATE_PRODUCT' : 'ADD_PRODUCT', payload: product });
    setShowForm(false); setEditingId(null);
  }
  function deleteProduct(id)    { if (window.confirm('Delete this product?')) dispatch({ type: 'DELETE_PRODUCT', payload: id }); }

  /* ── store handlers ── */
  function openAddStore()       { setStoreForm(EMPTY_STORE); setEditingStoreId(null); setShowStoreForm(true); }
  function openEditStore(s)     { setStoreForm({ name: s.name, location: s.location, phone: s.phone || '', email: s.email || '' }); setEditingStoreId(s.id); setShowStoreForm(true); }
  function handleStoreChange(e) { const { name, value } = e.target; setStoreForm(f => ({ ...f, [name]: value })); }
  function handleStoreSubmit(e) {
    e.preventDefault();
    if (!storeForm.name || !storeForm.location) { alert('Name and location are required.'); return; }
    dispatch({ type: editingStoreId ? 'UPDATE_STORE' : 'ADD_STORE', payload: { ...storeForm, id: editingStoreId || 'store-' + Math.random().toString(36).substr(2, 6) } });
    setShowStoreForm(false); setEditingStoreId(null);
  }
  function deleteStore(id)      { if (window.confirm('Delete this store?')) dispatch({ type: 'DELETE_STORE', payload: id }); }

  const catProducts = (cat) => state.products.filter(p => p.category === cat);

  /* ── dashboard stats ── */
  const totalRevenue = state.orders.reduce((s, o) => s + o.price, 0);
  const lowStockProducts = state.products.filter(p => p.storeInventory.reduce((s, i) => s + i.stock, 0) < 10);

  function navigate(id) { setActiveTab(id); setSidebarOpen(false); }

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
          <button className="adm-footer-link adm-logout" onClick={() => setAuthed(false)}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="adm-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="adm-main">

        {/* Top bar */}
        <header className="adm-topbar">
          <div className="adm-topbar-left">
            <button className="adm-burger" onClick={() => setSidebarOpen(true)}>
              <MenuIcon size={20} />
            </button>
            <div>
              <h1 className="adm-page-title">{NAV.find(n => n.id === activeTab)?.label}</h1>
            </div>
          </div>
          <div className="adm-topbar-right">
            <div className="adm-avatar">A</div>
            <div className="adm-user-info">
              <strong>Admin</strong>
              <span>admin@flowers.com</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="adm-content">

          {/* ── Dashboard ── */}
          {activeTab === 'dashboard' && (
            <div className="adm-section">
              <div className="adm-stat-cards">
                <div className="adm-stat-card">
                  <div className="adm-stat-icon" style={{ background: 'rgba(193,68,14,0.1)', color: '#c1440e' }}><ShoppingBag size={22} /></div>
                  <div><p>Total Products</p><h3>{state.products.length}</h3></div>
                </div>
                <div className="adm-stat-card">
                  <div className="adm-stat-icon" style={{ background: 'rgba(45,106,79,0.1)', color: '#2d6a4f' }}><ClipboardList size={22} /></div>
                  <div><p>Total Orders</p><h3>{state.orders.length}</h3></div>
                </div>
                <div className="adm-stat-card">
                  <div className="adm-stat-icon" style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed' }}><DollarSign size={22} /></div>
                  <div><p>Total Revenue</p><h3>${totalRevenue.toLocaleString()}</h3></div>
                </div>
                <div className="adm-stat-card">
                  <div className="adm-stat-icon" style={{ background: 'rgba(217,119,6,0.1)', color: '#d97706' }}><StoreIcon size={22} /></div>
                  <div><p>Stores</p><h3>{state.stores.length}</h3></div>
                </div>
              </div>

              {lowStockProducts.length > 0 && (
                <div className="adm-alert">
                  <AlertTriangle size={16} />
                  <strong>{lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} low on stock:</strong>
                  {lowStockProducts.map(p => p.name).join(', ')}
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
                    [...state.orders].reverse().slice(0, 5).map(o => (
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
                  <div className="adm-dash-card-header">
                    <h3>Category Split</h3>
                  </div>
                  {['flowers', 'gifts', 'parties'].map(cat => {
                    const count = state.products.filter(p => p.category === cat).length;
                    const pct = state.products.length ? Math.round(count / state.products.length * 100) : 0;
                    return (
                      <div key={cat} className="adm-bar-row">
                        <span className="adm-bar-label">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        <div className="adm-bar-track">
                          <div className="adm-bar-fill" style={{ width: `${pct}%`, background: cat === 'flowers' ? '#e11d48' : cat === 'gifts' ? '#7c3aed' : '#d97706' }} />
                        </div>
                        <span className="adm-bar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Products ── */}
          {activeTab === 'products' && (
            <div className="adm-section">
              <div className="adm-section-header">
                <h2>All Products <span className="adm-count-badge">{state.products.length}</span></h2>
                <button className="btn btn-primary" onClick={openAddForm}><Plus size={15} /> Add Product</button>
              </div>
              {['flowers', 'gifts', 'parties'].map(cat => (
                <div key={cat} className="adm-cat-group">
                  <h3 className="adm-cat-label">
                    {cat === 'flowers' ? <Flower2 size={14} /> : cat === 'gifts' ? <Gift size={14} /> : <PartyPopper size={14} />}
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </h3>
                  <div className="adm-table">
                    <div className="adm-table-head">
                      <span>Product</span><span>Type</span><span>Stores</span><span>Price Range</span><span>Stock</span><span>Actions</span>
                    </div>
                    {catProducts(cat).map(p => {
                      const prices = p.storeInventory.map(s => s.price);
                      const totalStock = p.storeInventory.reduce((n, s) => n + s.stock, 0);
                      return (
                        <div key={p.id} className="adm-table-row">
                          <div className="adm-prod-info">
                            <img src={p.image} alt={p.name} />
                            <div><strong>{p.name}</strong><p>{p.tags.join(', ')}</p></div>
                          </div>
                          <span className={`adm-type-pill ${p.type}`}>
                            {p.type === 'natural' ? <Leaf size={10} /> : <Sparkles size={10} />} {p.type}
                          </span>
                          <span>{p.storeInventory.length}</span>
                          <span>${Math.min(...prices)} – ${Math.max(...prices)}</span>
                          <span className={totalStock < 5 ? 'adm-low' : ''}>{totalStock}</span>
                          <div className="adm-row-actions">
                            <button className="btn btn-ghost" onClick={() => openEditForm(p)}><Pencil size={13} /></button>
                            <button className="btn btn-ghost adm-del-btn" onClick={() => deleteProduct(p.id)}><Trash2 size={13} /></button>
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

          {/* ── Inventory ── */}
          {activeTab === 'inventory' && (
            <div className="adm-section">
              <div className="adm-section-header"><h2>Store Inventory Overview</h2></div>
              <div className="adm-inv-grid">
                {state.stores.map(store => {
                  const storeProds = state.products.filter(p => p.storeInventory.some(s => s.storeId === store.id));
                  return (
                    <div key={store.id} className="adm-inv-card">
                      <div className="adm-inv-head"><h3>{store.name}</h3><p>{store.location}</p></div>
                      <div className="adm-inv-list">
                        {storeProds.map(p => {
                          const si = p.storeInventory.find(s => s.storeId === store.id);
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
                <button className="btn btn-primary" onClick={openAddStore}><Plus size={15} /> Add Store</button>
              </div>
              <div className="adm-stores-grid">
                {state.stores.map(store => (
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
              <div className="adm-section-header"><h2>Orders <span className="adm-count-badge">{state.orders.length}</span></h2></div>
              {state.orders.length === 0 ? (
                <div className="adm-empty-lg">No orders placed yet.</div>
              ) : (
                <div className="adm-orders-list">
                  {[...state.orders].reverse().map(o => (
                    <div key={o.id} className="adm-order-row">
                      <div><strong>{o.id}</strong><p>{o.productName}</p></div>
                      <span className={`badge ${o.type === 'gift' ? 'badge-blue' : 'badge-green'}`}>{o.type}</span>
                      <span>{o.storeName}</span>
                      <strong>${o.price}</strong>
                      <span>{new Date(o.date).toLocaleDateString()}</span>
                      <span className="badge badge-green">{o.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Store Modal ── */}
      {showStoreForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowStoreForm(false)}>
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
                <button type="submit" className="btn btn-primary">{editingStoreId ? 'Save Changes' : 'Add Store'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Product Modal ── */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Red Rose Bouquet" /></div>
                <div className="form-group"><label>Category *</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="flowers">Flowers</option>
                    <option value="gifts">Gifts</option>
                    <option value="parties">Parties & Events</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Product Type</label>
                <div className="type-radio-group">
                  {['natural', 'artificial'].map(t => (
                    <label key={t} className={`type-radio-btn ${form.type === t ? 'active' : ''}`}>
                      <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} />
                      {t === 'natural' ? <Leaf size={13} /> : <Sparkles size={13} />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Description *</label><textarea name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Describe the product…" /></div>
              <div className="form-group"><label>Image URL</label><input name="image" value={form.image} onChange={handleChange} placeholder="https://…" /></div>
              <div className="form-row">
                <div className="form-group"><label>Tags</label><input name="tags" value={form.tags} onChange={handleChange} placeholder="bestseller, romantic" /></div>
                <div className="form-group"><label>Colors</label><input name="availableColors" value={form.availableColors} onChange={handleChange} placeholder="Red, Pink, White" /></div>
              </div>
              <div className="form-group form-check">
                <label><input type="checkbox" name="allowCustomDescription" checked={form.allowCustomDescription} onChange={handleChange} /> Allow bespoke request</label>
              </div>
              <div className="store-inventory-section">
                <h4>Store Inventory *</h4>
                {form.storeInventory.map(si => {
                  const store = state.stores.find(s => s.id === si.storeId);
                  return (
                    <div key={si.storeId} className="store-inv-row">
                      <span>{store?.name}</span><span>${si.price}</span><span>{si.stock} units</span>
                      <button type="button" className="btn btn-ghost text-danger" onClick={() => removeStoreRow(si.storeId)}>Remove</button>
                    </div>
                  );
                })}
                <div className="store-inv-add">
                  <select value={storeRow.storeId} onChange={e => setStoreRow(r => ({ ...r, storeId: e.target.value }))}>
                    <option value="">Select store…</option>
                    {state.stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input type="number" placeholder="Price ($)" value={storeRow.price} onChange={e => setStoreRow(r => ({ ...r, price: e.target.value }))} min="0" />
                  <input type="number" placeholder="Stock" value={storeRow.stock} onChange={e => setStoreRow(r => ({ ...r, stock: e.target.value }))} min="0" />
                  <button type="button" className="btn btn-secondary" onClick={addStoreRow}>Add</button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
