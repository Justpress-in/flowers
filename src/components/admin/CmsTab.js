import React, { useEffect, useState } from 'react';
import {
  Loader2, AlertTriangle, Plus, Pencil, Trash2, X, Sparkles, Tag, Palette, LayoutGrid, Link2, Check,
} from 'lucide-react';
import CrudTab from './CrudTab';
import { ImageUploadField } from './ImageUploadField';
import {
  priceTiers as priceTiersApi,
  homeColours as homeColoursApi,
  collections as collectionsApi,
  products as productsApi,
} from '../../api/endpoints';

// Cities moved to the Master section (single home for basic/master data).
const SUBTABS = [
  { id: 'tiers',       label: 'Shop By Price',  Icon: Tag },
  { id: 'colours',     label: 'Colours',         Icon: Palette },
  { id: 'showstopper', label: 'Showstopper',     Icon: Sparkles },
  { id: 'pair',        label: 'Pair With',       Icon: Link2 },
];

export default function CmsTab() {
  const [sub, setSub] = useState('tiers');

  return (
    <div className="adm-section">
      <div className="adm-section-header" style={{ alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LayoutGrid size={18} /> Homepage CMS
        </h2>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {SUBTABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setSub(id)}
              className={`btn ${sub === id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.82rem' }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 0.8rem' }}>
        Sections you turn off here disappear from the homepage. Empty sections (no active items) are also hidden automatically.
      </p>

      {sub === 'tiers' && <PriceTiersTab />}
      {sub === 'colours' && <ColoursTab />}
      {sub === 'showstopper' && <CollectionTab kind="showstopper" title="Showstopper Collections" />}
      {sub === 'pair' && <CollectionTab kind="pair" title="Pair With Flowers" />}
    </div>
  );
}

/* ── Price Tiers ───────────────────────────────────────────── */
function PriceTiersTab() {
  return (
    <CrudTab
      title="Price Tier"
      api={priceTiersApi}
      emptyForm={{
        label: '', minPrice: '', maxPrice: '', currencySymbol: '$', order: 0, active: true,
      }}
      columns={[
        { key: 'label', label: 'Label', render: (r) => <strong>{r.label}</strong> },
        { key: 'minPrice', label: 'Min', render: (r) => r.minPrice != null ? `${r.currencySymbol || '$'}${r.minPrice}` : '—' },
        { key: 'maxPrice', label: 'Max', render: (r) => r.maxPrice != null ? `${r.currencySymbol || '$'}${r.maxPrice}` : '—' },
        { key: 'order', label: 'Order' },
        { key: 'active', label: 'Active', render: (r) => r.active ? <span className="badge badge-green">live</span> : <span className="badge badge-red">off</span> },
      ]}
      fields={[
        { name: 'label', label: 'Display Label', required: true, placeholder: 'Under $599' },
        { name: 'minPrice', label: 'Min Price (blank = no lower bound)', type: 'number', min: 0, nullable: true },
        { name: 'maxPrice', label: 'Max Price (blank = no upper bound)', type: 'number', min: 0, nullable: true },
        { name: 'currencySymbol', label: 'Currency Symbol', placeholder: '$' },
        { name: 'order', label: 'Display Order', type: 'number' },
        { name: 'active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}

/* ── Colours ───────────────────────────────────────────────── */
function ColoursTab() {
  return (
    <CrudTab
      title="Colour"
      api={homeColoursApi}
      emptyForm={{ name: '', image: '', swatch: '', order: 0, active: true }}
      columns={[
        { key: 'name', label: 'Name', render: (r) => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {r.image
            ? <img src={r.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            : <div style={{ width: 24, height: 24, borderRadius: '50%', background: r.swatch || '#eee' }} />}
          <strong>{r.name}</strong>
        </div> },
        { key: 'order', label: 'Order' },
        { key: 'active', label: 'Active', render: (r) => r.active ? <span className="badge badge-green">live</span> : <span className="badge badge-red">off</span> },
      ]}
      fields={[
        { name: 'name', label: 'Colour Name', required: true, placeholder: 'Red', hint: 'Used to filter products by availableColors / tags' },
        { name: 'image', label: 'Image (preferred)', type: 'image' },
        { name: 'swatch', label: 'Or CSS Colour', placeholder: '#e11d48 or red' },
        { name: 'order', label: 'Display Order', type: 'number' },
        { name: 'active', label: 'Active', type: 'checkbox' },
      ]}
    />
  );
}

/* ── Collections (showstopper + pair) — custom because of product picker ── */
function CollectionTab({ kind, title }) {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const [list, prods] = await Promise.all([
        collectionsApi.list({ kind }),
        productsApi.list(),
      ]);
      setItems(Array.isArray(list) ? list : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [kind]);

  function openAdd() {
    setEditing({ name: '', description: '', image: '', productIds: [], order: 0, active: true, kind });
  }
  function openEdit(row) {
    setEditing({ ...row, kind });
  }

  function toggleProduct(productId) {
    setEditing((prev) => {
      const has = prev.productIds.includes(productId);
      return {
        ...prev,
        productIds: has ? prev.productIds.filter((p) => p !== productId) : [...prev.productIds, productId],
      };
    });
  }

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = {
        kind,
        name: editing.name,
        description: editing.description,
        image: editing.image,
        productIds: editing.productIds || [],
        order: Number(editing.order) || 0,
        active: !!editing.active,
      };
      if (editing.id) {
        const updated = await collectionsApi.update(editing.id, payload);
        setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      } else {
        const created = await collectionsApi.create(payload);
        setItems((prev) => [created, ...prev]);
      }
      setEditing(null);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await collectionsApi.remove(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="adm-section-header">
        <h3>{title} <span className="adm-count-badge">{items.length}</span></h3>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add</button>
      </div>

      {error && (
        <div className="adm-alert" style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div className="adm-empty-lg"><Loader2 className="spin" size={16} /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="adm-empty-lg">No collections yet.</div>
      ) : (
        <div className="adm-table">
          <div className="adm-table-head" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr auto' }}>
            <span>Name</span><span>Products</span><span>Order</span><span>Active</span><span>Actions</span>
          </div>
          {items.map((row) => (
            <div key={row.id} className="adm-table-row" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {row.image && <img src={row.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
                <div>
                  <strong>{row.name}</strong>
                  {row.description && <p style={{ fontSize: '0.72rem', color: '#888' }}>{row.description}</p>}
                </div>
              </div>
              <span>{(row.productIds || []).length}</span>
              <span>{row.order || 0}</span>
              <span>{row.active ? <span className="badge badge-green">live</span> : <span className="badge badge-red">off</span>}</span>
              <div className="adm-row-actions">
                <button className="btn btn-ghost" onClick={() => openEdit(row)}><Pencil size={13} /></button>
                <button className="btn btn-ghost adm-del-btn" onClick={() => remove(row.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <h2>{editing.id ? 'Edit Collection' : 'New Collection'}</h2>
              <button className="modal-close" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={save}>
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    placeholder={kind === 'pair' ? 'Flowers and Cakes' : 'Flower Bouquets'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={editing.order || 0}
                    onChange={(e) => setEditing({ ...editing, order: e.target.value })}
                  />
                </div>
              </div>
              <ImageUploadField
                label="Cover Image"
                value={editing.image || ''}
                onChange={(url) => setEditing({ ...editing, image: url })}
              />
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={2}
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div className="form-group form-check">
                <label>
                  <input
                    type="checkbox"
                    checked={!!editing.active}
                    onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  /> Active
                </label>
              </div>

              <div className="form-group">
                <label>Assign Products ({(editing.productIds || []).length} selected)</label>
                <div style={{
                  border: '1px solid #e5e7eb', borderRadius: 8, padding: '0.5rem',
                  maxHeight: 260, overflowY: 'auto', background: '#fafafa',
                }}>
                  {products.length === 0
                    ? <p style={{ fontSize: '0.82rem', color: '#888', padding: '0.4rem' }}>No products available — add some first.</p>
                    : products.map((p) => {
                        const checked = (editing.productIds || []).includes(p.id);
                        return (
                          <label
                            key={p.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, padding: '0.35rem 0.5rem',
                              borderRadius: 6, cursor: 'pointer',
                              background: checked ? 'rgba(193,68,14,0.08)' : 'transparent',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProduct(p.id)}
                            />
                            {p.image && <img src={p.image} alt="" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />}
                            <span style={{ flex: 1, fontSize: '0.85rem' }}>{p.name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#888' }}>{p.category}</span>
                            {checked && <Check size={14} color="#15803d" />}
                          </label>
                        );
                      })}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : (editing.id ? 'Save' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
