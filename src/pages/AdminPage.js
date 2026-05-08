import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Package, Store, ClipboardList,
  Plus, Pencil, Trash2, X, Flower2, Gift, PartyPopper,
} from 'lucide-react';
import './AdminPage.css';

const EMPTY_PRODUCT = {
  name: '',
  category: 'flowers',
  description: '',
  image: '',
  tags: '',
  availableColors: '',
  allowCustomDescription: true,
  storeInventory: [],
};

export default function AdminPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('products');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [storeRow, setStoreRow] = useState({ storeId: '', price: '', stock: '' });

  function openAddForm() {
    setForm(EMPTY_PRODUCT);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(product) {
    setForm({
      ...product,
      tags: product.tags.join(', '),
      availableColors: product.availableColors.join(', '),
    });
    setEditingId(product.id);
    setShowForm(true);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function addStoreRow() {
    if (!storeRow.storeId || !storeRow.price || !storeRow.stock) return;
    const exists = form.storeInventory.find(s => s.storeId === storeRow.storeId);
    if (exists) {
      setForm(f => ({
        ...f,
        storeInventory: f.storeInventory.map(s =>
          s.storeId === storeRow.storeId
            ? { storeId: storeRow.storeId, price: +storeRow.price, stock: +storeRow.stock }
            : s
        ),
      }));
    } else {
      setForm(f => ({
        ...f,
        storeInventory: [...f.storeInventory, { storeId: storeRow.storeId, price: +storeRow.price, stock: +storeRow.stock }],
      }));
    }
    setStoreRow({ storeId: '', price: '', stock: '' });
  }

  function removeStoreRow(storeId) {
    setForm(f => ({ ...f, storeInventory: f.storeInventory.filter(s => s.storeId !== storeId) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.description || form.storeInventory.length === 0) {
      alert('Please fill name, description, and add at least one store.');
      return;
    }
    const product = {
      ...form,
      id: editingId || 'p-' + Date.now(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      availableColors: form.availableColors.split(',').map(c => c.trim()).filter(Boolean),
    };
    if (editingId) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: product });
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: product });
    }
    setShowForm(false);
    setEditingId(null);
  }

  function deleteProduct(id) {
    if (window.confirm('Delete this product?')) {
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    }
  }

  const categoryProducts = (cat) => state.products.filter(p => p.category === cat);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container admin-header-inner">
          <h1>Admin Dashboard</h1>
          <p>Manage products, inventory, and store data</p>
        </div>
      </div>

      <div className="container admin-body">
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <Package size={16} /> Products
          </button>
          <button className={`admin-tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
            <Store size={16} /> Store Inventory
          </button>
          <button className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <ClipboardList size={16} /> Orders
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>All Products ({state.products.length})</h2>
              <button className="btn btn-primary" onClick={openAddForm}><Plus size={16} /> Add Product</button>
            </div>

            {['flowers', 'gifts', 'parties'].map(cat => (
              <div key={cat} className="admin-cat-group">
                <h3 className="admin-cat-label">
                  {cat === 'flowers' ? <Flower2 size={15} /> : cat === 'gifts' ? <Gift size={15} /> : <PartyPopper size={15} />}
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </h3>
                <div className="admin-product-table">
                  <div className="admin-table-head">
                    <span>Product</span>
                    <span>Stores</span>
                    <span>Price Range</span>
                    <span>Total Stock</span>
                    <span>Actions</span>
                  </div>
                  {categoryProducts(cat).map(p => {
                    const prices = p.storeInventory.map(s => s.price);
                    const totalStock = p.storeInventory.reduce((n, s) => n + s.stock, 0);
                    return (
                      <div key={p.id} className="admin-table-row">
                        <div className="admin-product-info">
                          <img src={p.image} alt={p.name} />
                          <div>
                            <strong>{p.name}</strong>
                            <p>{p.tags.join(', ')}</p>
                          </div>
                        </div>
                        <span>{p.storeInventory.length} store{p.storeInventory.length !== 1 ? 's' : ''}</span>
                        <span>${Math.min(...prices)} – ${Math.max(...prices)}</span>
                        <span className={totalStock < 5 ? 'text-danger' : ''}>{totalStock}</span>
                        <div className="admin-actions">
                          <button className="btn btn-ghost" onClick={() => openEditForm(p)}><Pencil size={14} /> Edit</button>
                          <button className="btn btn-ghost text-danger" onClick={() => deleteProduct(p.id)}><Trash2 size={14} /> Delete</button>
                        </div>
                      </div>
                    );
                  })}
                  {categoryProducts(cat).length === 0 && (
                    <div className="admin-table-empty">No products in this category yet.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="admin-section">
            <h2>Store Inventory Overview</h2>
            <div className="inventory-grid">
              {state.stores.map(store => {
                const storeProducts = state.products.filter(p =>
                  p.storeInventory.some(s => s.storeId === store.id)
                );
                return (
                  <div key={store.id} className="inventory-store-card">
                    <div className="inv-store-header">
                      <h3>{store.name}</h3>
                      <p>{store.location}</p>
                    </div>
                    <div className="inv-product-list">
                      {storeProducts.map(p => {
                        const si = p.storeInventory.find(s => s.storeId === store.id);
                        return (
                          <div key={p.id} className="inv-product-row">
                            <span className="inv-product-name">{p.name}</span>
                            <span className={`inv-stock ${si.stock < 5 ? 'low' : ''}`}>{si.stock} units</span>
                            <span className="inv-price">${si.price}</span>
                          </div>
                        );
                      })}
                      {storeProducts.length === 0 && <p className="inv-empty">No products assigned.</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="admin-section">
            <h2>All Orders ({state.orders.length})</h2>
            {state.orders.length === 0 ? (
              <div className="admin-empty">No orders placed yet.</div>
            ) : (
              <div className="admin-orders-list">
                {[...state.orders].reverse().map(o => (
                  <div key={o.id} className="admin-order-row">
                    <div>
                      <strong>{o.id}</strong>
                      <p>{o.productName}</p>
                    </div>
                    <div>
                      <span className={`badge ${o.type === 'gift' ? 'badge-blue' : 'badge-green'}`}>{o.type}</span>
                    </div>
                    <div>{o.storeName}</div>
                    <div>${o.price}</div>
                    <div>{new Date(o.date).toLocaleDateString()}</div>
                    <div><span className="badge badge-green">{o.status}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Red Rose Bouquet" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={form.category} onChange={handleChange}>
                    <option value="flowers">Flowers</option>
                    <option value="gifts">Gifts</option>
                    <option value="parties">Parties & Events</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea name="description" rows={3} value={form.description} onChange={handleChange} placeholder="Describe the product…" />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input name="image" value={form.image} onChange={handleChange} placeholder="https://…" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input name="tags" value={form.tags} onChange={handleChange} placeholder="bestseller, romantic" />
                </div>
                <div className="form-group">
                  <label>Available Colors (comma separated)</label>
                  <input name="availableColors" value={form.availableColors} onChange={handleChange} placeholder="Red, Pink, White" />
                </div>
              </div>
              <div className="form-group form-check">
                <label>
                  <input type="checkbox" name="allowCustomDescription" checked={form.allowCustomDescription} onChange={handleChange} />
                  Allow custom description / bespoke request
                </label>
              </div>

              {/* Store inventory */}
              <div className="store-inventory-section">
                <h4>Store Inventory *</h4>
                {form.storeInventory.map(si => {
                  const store = state.stores.find(s => s.id === si.storeId);
                  return (
                    <div key={si.storeId} className="store-inv-row">
                      <span>{store?.name}</span>
                      <span>${si.price}</span>
                      <span>{si.stock} units</span>
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
