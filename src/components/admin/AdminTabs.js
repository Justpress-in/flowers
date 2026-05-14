import React, { useEffect, useState } from 'react';
import CrudTab from './CrudTab';
import {
  adminUsers,
  coupons,
  packages,
  blogs,
  offers,
  testimonials,
  deliveryPartners,
  bookings,
  banners,
  reviews,
  settings,
} from '../../api/endpoints';
import {
  Mail, Phone, Loader2, AlertTriangle, CheckCircle2, Save, Star, X,
  Eye, Download, MapPin, Calendar as CalIcon,
} from 'lucide-react';
import { exportToCsv } from './exportCsv';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
const fmtMoney = (n) => '$' + Number(n || 0).toLocaleString();

/* ── Users ─────────────────────────────────────── */
export function UsersTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminUsers.list().then((list) => { if (!cancelled) setItems(list); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = query
    ? items.filter((u) =>
        [u.email, u.name, u.phone].some((s) => String(s || '').toLowerCase().includes(query.toLowerCase()))
      )
    : items;

  async function handleDelete(id) {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await adminUsers.remove(id);
      setItems((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Customers <span className="adm-count-badge">{items.length}</span></h2>
        <input
          placeholder="Search name, email, phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ padding: '0.45rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 7, fontSize: '0.85rem', minWidth: 240 }}
        />
      </div>

      {error && <div className="adm-alert" style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}><AlertTriangle size={16} /> {error}</div>}

      {loading ? (
        <div className="adm-empty-lg"><Loader2 className="spin" size={16} /> Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty-lg">No customers found.</div>
      ) : (
        <div className="adm-table">
          <div className="adm-table-head" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr auto' }}>
            <span>Customer</span><span>Email</span><span>Phone</span><span>Orders</span><span>Spent</span><span>Actions</span>
          </div>
          {filtered.map((u) => (
            <div key={u.id} className="adm-table-row" style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr auto' }}>
              <div>
                <strong>{u.name || '—'}</strong>
                <p style={{ fontSize: '0.72rem', color: '#888' }}>Joined {fmtDate(u.createdAt)}</p>
              </div>
              <span><Mail size={11} style={{ marginRight: 4 }} />{u.email}</span>
              <span>{u.phone || '—'}</span>
              <span>{u.orderCount}</span>
              <strong style={{ color: '#c1440e' }}>{fmtMoney(u.totalSpent)}</strong>
              <div className="adm-row-actions">
                <button className="btn btn-ghost adm-del-btn" onClick={() => handleDelete(u.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Coupons ──────────────────────────────────── */
export const CouponsTab = () => (
  <CrudTab
    title="Coupons"
    api={coupons}
    emptyForm={{
      code: '', description: '', type: 'percent', value: 10,
      minOrder: 0, maxDiscount: 0, usageLimit: 0, perUserLimit: 0,
      startsAt: '', expiresAt: '', active: true,
    }}
    searchKeys={['code', 'description']}
    columns={[
      { key: 'code', label: 'Code', render: (r) => <strong>{r.code}</strong> },
      { key: 'type', label: 'Type', render: (r) => `${r.type === 'percent' ? r.value + '%' : '$' + r.value}` },
      { key: 'minOrder', label: 'Min Order', render: (r) => r.minOrder ? '$' + r.minOrder : '—' },
      { key: 'usedCount', label: 'Used', render: (r) => `${r.usedCount}${r.usageLimit ? ' / ' + r.usageLimit : ''}` },
      { key: 'expiresAt', label: 'Expires', render: (r) => fmtDate(r.expiresAt) },
      { key: 'active', label: 'Active', render: (r) => r.active ? <span className="badge badge-green">yes</span> : <span className="badge badge-red">no</span> },
    ]}
    fields={[
      { name: 'code', label: 'Coupon Code', required: true, placeholder: 'SUMMER20' },
      { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
      { name: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'percent', label: 'Percent off' }, { value: 'flat', label: 'Flat amount off' }] },
      { name: 'value', label: 'Value', type: 'number', required: true, hint: 'Percent (1-100) or flat amount ($)', min: 0 },
      { name: 'minOrder', label: 'Min Order Subtotal ($)', type: 'number', min: 0 },
      { name: 'maxDiscount', label: 'Max Discount Cap ($)', type: 'number', min: 0, hint: '0 = no cap (only matters for percent)' },
      { name: 'usageLimit', label: 'Total Usage Limit', type: 'number', min: 0, hint: '0 = unlimited' },
      { name: 'perUserLimit', label: 'Per-User Limit', type: 'number', min: 0, hint: '0 = unlimited' },
      { name: 'startsAt', label: 'Starts At', type: 'date' },
      { name: 'expiresAt', label: 'Expires At', type: 'date' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ]}
  />
);

/* ── Packages ─────────────────────────────────── */
export const PackagesTab = () => (
  <CrudTab
    title="Event Packages"
    api={packages}
    emptyForm={{
      name: '', eventType: 'wedding', description: '', image: '',
      gallery: '', inclusions: '', price: 0, duration: '', capacity: '',
      tags: '', featured: false, active: true,
    }}
    searchKeys={['name', 'eventType']}
    columns={[
      { key: 'name', label: 'Name', render: (r) => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{r.image && <img src={r.image} alt="" style={{ width: 36, height: 36, borderRadius: 4, objectFit: 'cover' }} />}<strong>{r.name}</strong></div> },
      { key: 'eventType', label: 'Type' },
      { key: 'price', label: 'Price', render: (r) => fmtMoney(r.price) },
      { key: 'capacity', label: 'Capacity' },
      { key: 'featured', label: 'Featured', render: (r) => r.featured ? '⭐' : '—' },
      { key: 'active', label: 'Active', render: (r) => r.active ? <span className="badge badge-green">live</span> : '—' },
    ]}
    fields={[
      { name: 'name', label: 'Package Name', required: true },
      { name: 'eventType', label: 'Event Type', type: 'select', required: true,
        options: ['wedding', 'birthday', 'corporate', 'anniversary', 'baby-shower', 'other'] },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
      { name: 'image', label: 'Cover Image URL' },
      { name: 'gallery', label: 'Gallery Image URLs (comma-separated)', type: 'csv' },
      { name: 'inclusions', label: 'Inclusions (comma-separated)', type: 'csv', placeholder: 'Bridal bouquet, Mandap florals, Centerpieces' },
      { name: 'price', label: 'Price ($)', type: 'number', required: true, min: 0 },
      { name: 'duration', label: 'Duration', placeholder: 'e.g. Full Day' },
      { name: 'capacity', label: 'Capacity', placeholder: 'e.g. Up to 200 guests' },
      { name: 'tags', label: 'Tags (comma-separated)', type: 'csv' },
      { name: 'featured', label: 'Featured', type: 'checkbox' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ]}
  />
);

/* ── Blogs ────────────────────────────────────── */
export const BlogsTab = () => (
  <CrudTab
    title="Blog Posts"
    api={blogs}
    emptyForm={{
      title: '', excerpt: '', body: '', coverImage: '', author: 'BloomNest',
      tags: '', category: 'General', published: true, publishedAt: '',
    }}
    searchKeys={['title', 'author', 'category']}
    columns={[
      { key: 'title', label: 'Title', render: (r) => <strong>{r.title}</strong> },
      { key: 'author', label: 'Author' },
      { key: 'category', label: 'Category' },
      { key: 'views', label: 'Views' },
      { key: 'published', label: 'Status', render: (r) => r.published ? <span className="badge badge-green">published</span> : <span className="badge badge-orange">draft</span> },
      { key: 'publishedAt', label: 'Date', render: (r) => fmtDate(r.publishedAt) },
    ]}
    fields={[
      { name: 'title', label: 'Title', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2, placeholder: 'Short summary shown in listings' },
      { name: 'body', label: 'Body (Markdown / HTML)', type: 'textarea', rows: 12, required: true },
      { name: 'coverImage', label: 'Cover Image URL' },
      { name: 'author', label: 'Author' },
      { name: 'category', label: 'Category', placeholder: 'Flowers, Events, Tips, …' },
      { name: 'tags', label: 'Tags (comma-separated)', type: 'csv' },
      { name: 'published', label: 'Published', type: 'checkbox' },
      { name: 'publishedAt', label: 'Publish Date', type: 'date' },
    ]}
  />
);

/* ── Offers ───────────────────────────────────── */
export const OffersTab = () => (
  <CrudTab
    title="Offers"
    api={offers}
    emptyForm={{
      title: '', subtitle: '', image: '', badge: '', link: '',
      couponCode: '', startsAt: '', endsAt: '', active: true, order: 0,
    }}
    searchKeys={['title', 'couponCode']}
    columns={[
      { key: 'title', label: 'Title', render: (r) => <strong>{r.title}</strong> },
      { key: 'badge', label: 'Badge' },
      { key: 'couponCode', label: 'Coupon' },
      { key: 'endsAt', label: 'Ends', render: (r) => fmtDate(r.endsAt) },
      { key: 'active', label: 'Active', render: (r) => r.active ? <span className="badge badge-green">live</span> : '—' },
    ]}
    fields={[
      { name: 'title', label: 'Title', required: true },
      { name: 'subtitle', label: 'Subtitle' },
      { name: 'image', label: 'Image URL' },
      { name: 'badge', label: 'Badge Text', placeholder: 'e.g. 30% OFF' },
      { name: 'link', label: 'CTA Link', placeholder: '/flowers' },
      { name: 'couponCode', label: 'Coupon Code (optional)' },
      { name: 'startsAt', label: 'Starts At', type: 'date' },
      { name: 'endsAt', label: 'Ends At', type: 'date' },
      { name: 'order', label: 'Display Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ]}
  />
);

/* ── Testimonials ─────────────────────────────── */
export const TestimonialsTab = () => (
  <CrudTab
    title="Testimonials"
    api={testimonials}
    emptyForm={{
      customerName: '', location: '', avatar: '', rating: 5, quote: '',
      occasion: '', productId: '', featured: false, active: true, order: 0,
    }}
    searchKeys={['customerName', 'quote']}
    columns={[
      { key: 'customerName', label: 'Customer', render: (r) => <strong>{r.customerName}</strong> },
      { key: 'rating', label: 'Rating', render: (r) => '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating) },
      { key: 'occasion', label: 'Occasion' },
      { key: 'featured', label: 'Featured', render: (r) => r.featured ? '⭐' : '—' },
      { key: 'active', label: 'Active', render: (r) => r.active ? <span className="badge badge-green">live</span> : '—' },
    ]}
    fields={[
      { name: 'customerName', label: 'Customer Name', required: true },
      { name: 'location', label: 'Location' },
      { name: 'avatar', label: 'Avatar URL' },
      { name: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5 },
      { name: 'quote', label: 'Quote', type: 'textarea', required: true, rows: 3 },
      { name: 'occasion', label: 'Occasion', placeholder: 'e.g. Anniversary, Wedding' },
      { name: 'productId', label: 'Related Product ID (optional)' },
      { name: 'order', label: 'Display Order', type: 'number' },
      { name: 'featured', label: 'Featured', type: 'checkbox' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ]}
  />
);

/* ── Delivery Partners ────────────────────────── */
export const DeliveryPartnersTab = () => (
  <CrudTab
    title="Delivery Partners"
    api={deliveryPartners}
    emptyForm={{
      name: '', logo: '', contactPhone: '', contactEmail: '',
      serviceAreas: '', trackingUrlTemplate: '', active: true, order: 0, notes: '',
    }}
    searchKeys={['name']}
    columns={[
      { key: 'name', label: 'Name', render: (r) => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{r.logo && <img src={r.logo} alt="" style={{ width: 32, height: 32, objectFit: 'contain' }} />}<strong>{r.name}</strong></div> },
      { key: 'contactPhone', label: 'Phone' },
      { key: 'serviceAreas', label: 'Service Areas', render: (r) => (r.serviceAreas || []).join(', ') || '—' },
      { key: 'active', label: 'Active', render: (r) => r.active ? <span className="badge badge-green">on</span> : '—' },
    ]}
    fields={[
      { name: 'name', label: 'Partner Name', required: true },
      { name: 'logo', label: 'Logo URL' },
      { name: 'contactPhone', label: 'Contact Phone' },
      { name: 'contactEmail', label: 'Contact Email' },
      { name: 'serviceAreas', label: 'Service Areas (comma-separated)', type: 'csv' },
      { name: 'trackingUrlTemplate', label: 'Tracking URL Template', placeholder: 'https://carrier.com/track/{id}' },
      { name: 'notes', label: 'Internal Notes', type: 'textarea', rows: 2 },
      { name: 'order', label: 'Display Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ]}
  />
);

/* ── Banners ──────────────────────────────────── */
export const BannersTab = () => (
  <CrudTab
    title="Homepage Banners"
    api={banners}
    emptyForm={{
      title: '', subtitle: '', cta: '', ctaLink: '', bg: '', image: '',
      order: 0, active: true,
    }}
    searchKeys={['title']}
    columns={[
      { key: 'title', label: 'Title', render: (r) => <strong>{r.title}</strong> },
      { key: 'cta', label: 'CTA' },
      { key: 'order', label: 'Order' },
      { key: 'active', label: 'Active', render: (r) => r.active ? <span className="badge badge-green">live</span> : '—' },
    ]}
    fields={[
      { name: 'title', label: 'Title', required: true },
      { name: 'subtitle', label: 'Subtitle' },
      { name: 'cta', label: 'CTA Label', placeholder: 'Shop Flowers' },
      { name: 'ctaLink', label: 'CTA Link', placeholder: '/flowers' },
      { name: 'bg', label: 'Background', placeholder: 'linear-gradient(...) or color' },
      { name: 'image', label: 'Image URL' },
      { name: 'order', label: 'Display Order', type: 'number' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ]}
  />
);

/* ── Bookings ─────────────────────────────────── */
export function BookingsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  async function load() {
    setLoading(true); setError('');
    try { setItems(await bookings.listAll()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function saveBooking(e) {
    e.preventDefault();
    try {
      const updated = await bookings.update(editing.id, {
        status: editing.status,
        adminNotes: editing.adminNotes,
        preferredDate: editing.preferredDate,
        preferredTime: editing.preferredTime,
        basePrice: Number(editing.basePrice) || 0,
        customerAddress: editing.customerAddress || '',
      });
      setItems((prev) => prev.map((b) => b.id === updated.id ? updated : b));
      setEditing(null);
    } catch (err) { alert(err.message); }
  }
  async function deleteBooking(id) {
    if (!window.confirm('Delete this booking?')) return;
    try { await bookings.remove(id); setItems((prev) => prev.filter((b) => b.id !== id)); }
    catch (err) { alert(err.message); }
  }

  function handleExport() {
    exportToCsv(
      `bookings-${new Date().toISOString().slice(0, 10)}.csv`,
      items.map((b) => ({
        BookingID: b.id,
        CreatedAt: b.createdAt ? new Date(b.createdAt).toLocaleString() : '',
        Status: b.status,
        Service: b.serviceType,
        Occasion: b.occasion,
        CustomerName: b.customerName,
        CustomerPhone: b.customerPhone,
        CustomerEmail: b.customerEmail,
        CustomerAddress: b.customerAddress,
        Store: b.storeName,
        PreferredDate: b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : '',
        PreferredTime: b.preferredTime,
        DurationMin: b.durationMin,
        BasePrice: b.basePrice,
        Notes: b.notes,
        AdminNotes: b.adminNotes,
      }))
    );
  }

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Bookings & Consultations <span className="adm-count-badge">{items.length}</span></h2>
        <button className="btn btn-ghost" onClick={handleExport} disabled={items.length === 0}>
          <Download size={14} /> Export Excel
        </button>
      </div>
      {error && <div className="adm-alert" style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}><AlertTriangle size={16} /> {error}</div>}
      {loading ? (
        <div className="adm-empty-lg"><Loader2 className="spin" size={16} /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="adm-empty-lg">No bookings yet.</div>
      ) : (
        <div className="adm-table">
          <div className="adm-table-head" style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr auto' }}>
            <span>ID</span><span>Customer</span><span>Service</span><span>Date</span><span>Time</span><span>Status</span><span>Actions</span>
          </div>
          {items.map((b) => (
            <div key={b.id} className="adm-table-row" style={{ gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr auto' }}>
              <strong>{b.id}</strong>
              <div>
                <strong>{b.customerName}</strong>
                <p style={{ fontSize: '0.72rem', color: '#888' }}>{b.customerPhone}</p>
              </div>
              <span>{b.serviceType}</span>
              <span>{fmtDate(b.preferredDate)}</span>
              <span>{b.preferredTime || '—'}</span>
              <span className={`badge ${b.status === 'confirmed' ? 'badge-green' : b.status === 'cancelled' ? 'badge-red' : 'badge-orange'}`}>{b.status}</span>
              <div className="adm-row-actions" style={{ display: 'flex', gap: '0.3rem' }}>
                <button className="btn btn-ghost" onClick={() => setViewing(b)}><Eye size={13} /> View</button>
                <button className="btn btn-ghost" onClick={() => setEditing(b)}>Edit</button>
                <button className="btn btn-ghost adm-del-btn" onClick={() => deleteBooking(b.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Booking {editing.id}</h2>
              <button className="modal-close" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <form className="modal-form" onSubmit={saveBooking}>
              <p><strong>{editing.customerName}</strong> · {editing.customerPhone}</p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>{editing.serviceType} · {editing.occasion || 'no occasion'}</p>
              {editing.notes && <p style={{ fontSize: '0.85rem' }}>Notes: {editing.notes}</p>}
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={editing.preferredDate ? new Date(editing.preferredDate).toISOString().slice(0,10) : ''}
                    onChange={(e) => setEditing({ ...editing, preferredDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input value={editing.preferredTime || ''} onChange={(e) => setEditing({ ...editing, preferredTime: e.target.value })} placeholder="3:00 PM" />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  {['requested','confirmed','completed','cancelled','rescheduled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Base Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editing.basePrice ?? 0}
                    onChange={(e) => setEditing({ ...editing, basePrice: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Customer Address</label>
                  <input
                    value={editing.customerAddress || ''}
                    onChange={(e) => setEditing({ ...editing, customerAddress: e.target.value })}
                    placeholder="Street, city, postal code"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Admin Notes</label>
                <textarea rows={3} value={editing.adminNotes || ''} onChange={(e) => setEditing({ ...editing, adminNotes: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewing(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Booking {viewing.id}</h2>
              <button className="modal-close" onClick={() => setViewing(null)}><X size={18} /></button>
            </div>
            <div className="modal-form">
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.6rem' }}>
                <span className={`badge ${viewing.status === 'confirmed' ? 'badge-green' : viewing.status === 'cancelled' ? 'badge-red' : 'badge-orange'}`}>
                  {viewing.status}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>
                  Created {viewing.createdAt ? new Date(viewing.createdAt).toLocaleString() : '—'}
                </span>
              </div>

              <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '0.8rem' }}>
                <legend style={{ padding: '0 0.4rem', fontWeight: 700, fontSize: '0.8rem', color: '#374151' }}>Customer</legend>
                <p style={{ fontSize: '0.85rem' }}><strong>{viewing.customerName}</strong></p>
                <p style={{ fontSize: '0.82rem', color: '#555' }}><Phone size={11} /> {viewing.customerPhone}</p>
                {viewing.customerEmail && <p style={{ fontSize: '0.82rem', color: '#555' }}><Mail size={11} /> {viewing.customerEmail}</p>}
                {viewing.customerAddress && <p style={{ fontSize: '0.82rem', color: '#555' }}><MapPin size={11} /> {viewing.customerAddress}</p>}
              </fieldset>

              <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '0.8rem' }}>
                <legend style={{ padding: '0 0.4rem', fontWeight: 700, fontSize: '0.8rem', color: '#374151' }}>Appointment</legend>
                <p style={{ fontSize: '0.85rem' }}><CalIcon size={12} /> {fmtDate(viewing.preferredDate)} {viewing.preferredTime ? `· ${viewing.preferredTime}` : ''}</p>
                <p style={{ fontSize: '0.82rem', color: '#555' }}>Service: {viewing.serviceType}</p>
                {viewing.occasion && <p style={{ fontSize: '0.82rem', color: '#555' }}>Occasion: {viewing.occasion}</p>}
                {viewing.storeName && <p style={{ fontSize: '0.82rem', color: '#555' }}>Store: {viewing.storeName}</p>}
                <p style={{ fontSize: '0.82rem', color: '#555' }}>Duration: {viewing.durationMin} min</p>
                {viewing.basePrice > 0 && (
                  <p style={{ fontSize: '0.85rem' }}><strong>Base Price:</strong> ${Number(viewing.basePrice).toFixed(2)}</p>
                )}
              </fieldset>

              {(viewing.notes || viewing.adminNotes) && (
                <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '0.8rem 1rem', marginBottom: '0.8rem' }}>
                  <legend style={{ padding: '0 0.4rem', fontWeight: 700, fontSize: '0.8rem', color: '#374151' }}>Notes</legend>
                  {viewing.notes && <p style={{ fontSize: '0.82rem', color: '#555' }}>Customer: {viewing.notes}</p>}
                  {viewing.adminNotes && <p style={{ fontSize: '0.82rem', color: '#555' }}>Admin: {viewing.adminNotes}</p>}
                </fieldset>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setViewing(null)}>Close</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => { setEditing(viewing); setViewing(null); }}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Reviews ──────────────────────────────────── */
export function ReviewsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      setItems(await reviews.listAll(params));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusFilter]);

  async function setStatus(id, status) {
    try {
      const updated = await reviews.updateStatus(id, { status });
      setItems((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    } catch (err) { alert(err.message); }
  }
  async function handleDelete(id) {
    if (!window.confirm('Delete this review?')) return;
    try { await reviews.remove(id); setItems((prev) => prev.filter((r) => r.id !== id)); }
    catch (err) { alert(err.message); }
  }

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Reviews <span className="adm-count-badge">{items.length}</span></h2>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.45rem 0.7rem', border: '1px solid #d1d5db', borderRadius: 7, fontSize: '0.85rem' }}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      {error && <div className="adm-alert" style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}><AlertTriangle size={16} /> {error}</div>}
      {loading ? (
        <div className="adm-empty-lg"><Loader2 className="spin" size={16} /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="adm-empty-lg">No reviews.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((r) => (
            <div key={r.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <strong>{r.userName}</strong>
                  <span style={{ marginLeft: '0.6rem', color: '#f59e0b' }}>
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill={i < r.rating ? '#f59e0b' : 'none'} stroke="#f59e0b" />)}
                  </span>
                  <span style={{ marginLeft: '0.6rem', fontSize: '0.78rem', color: '#888' }}>on {r.productId}</span>
                </div>
                <span className={`badge ${r.status === 'approved' ? 'badge-green' : r.status === 'rejected' ? 'badge-red' : 'badge-orange'}`}>{r.status}</span>
              </div>
              {r.title && <p style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{r.title}</p>}
              <p style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '0.6rem' }}>{r.body}</p>
              <p style={{ fontSize: '0.72rem', color: '#888' }}>{new Date(r.createdAt).toLocaleString()}</p>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem' }}>
                <button className="btn btn-ghost" onClick={() => setStatus(r.id, 'approved')}>Approve</button>
                <button className="btn btn-ghost" onClick={() => setStatus(r.id, 'rejected')}>Reject</button>
                <button className="btn btn-ghost adm-del-btn" onClick={() => handleDelete(r.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Settings ─────────────────────────────────── */
export function SettingsTab() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    settings.get().then(setForm).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  function set(path, value) {
    setForm((prev) => {
      const next = { ...prev };
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = { ...cur[parts[i]] };
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setBusy(true); setError(''); setSaved(false);
    try {
      const updated = await settings.update(form);
      setForm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="adm-empty-lg"><Loader2 className="spin" size={16} /> Loading settings…</div>;
  if (!form) return <div className="adm-empty-lg">Could not load settings.</div>;

  return (
    <div className="adm-section">
      <div className="adm-section-header">
        <h2>Site Settings</h2>
        {saved && <span style={{ color: '#15803d', fontSize: '0.85rem' }}><CheckCircle2 size={14} /> Saved</span>}
      </div>
      {error && <div className="adm-alert" style={{ background: 'rgba(220,38,38,0.08)', color: '#b91c1c' }}><AlertTriangle size={16} /> {error}</div>}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <fieldset style={fsStyle}>
          <legend style={lgStyle}>General</legend>
          <div className="form-row">
            <div className="form-group"><label>Site Name</label><input value={form.siteName || ''} onChange={(e) => set('siteName', e.target.value)} /></div>
            <div className="form-group"><label>Tagline</label><input value={form.tagline || ''} onChange={(e) => set('tagline', e.target.value)} /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea rows={2} value={form.description || ''} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label>Logo URL</label><input value={form.logoUrl || ''} onChange={(e) => set('logoUrl', e.target.value)} /></div>
            <div className="form-group"><label>Currency Symbol</label><input value={form.currencySymbol || '$'} onChange={(e) => set('currencySymbol', e.target.value)} /></div>
          </div>
        </fieldset>

        <fieldset style={fsStyle}>
          <legend style={lgStyle}>Contact</legend>
          <div className="form-row">
            <div className="form-group"><label>Email</label><input type="email" value={form.contactEmail || ''} onChange={(e) => set('contactEmail', e.target.value)} /></div>
            <div className="form-group"><label>Phone</label><input value={form.contactPhone || ''} onChange={(e) => set('contactPhone', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>WhatsApp</label><input value={form.whatsappNumber || ''} onChange={(e) => set('whatsappNumber', e.target.value)} /></div>
            <div className="form-group"><label>Address</label><input value={form.contactAddress || ''} onChange={(e) => set('contactAddress', e.target.value)} /></div>
          </div>
        </fieldset>

        <fieldset style={fsStyle}>
          <legend style={lgStyle}>Social</legend>
          <div className="form-row">
            <div className="form-group"><label>Instagram</label><input value={form.social?.instagram || ''} onChange={(e) => set('social.instagram', e.target.value)} /></div>
            <div className="form-group"><label>Facebook</label><input value={form.social?.facebook || ''} onChange={(e) => set('social.facebook', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Twitter / X</label><input value={form.social?.twitter || ''} onChange={(e) => set('social.twitter', e.target.value)} /></div>
            <div className="form-group"><label>YouTube</label><input value={form.social?.youtube || ''} onChange={(e) => set('social.youtube', e.target.value)} /></div>
          </div>
        </fieldset>

        <fieldset style={fsStyle}>
          <legend style={lgStyle}>Hero / Homepage</legend>
          <div className="form-row">
            <div className="form-group"><label>Title</label><input value={form.hero?.title || ''} onChange={(e) => set('hero.title', e.target.value)} /></div>
            <div className="form-group"><label>Subtitle</label><input value={form.hero?.subtitle || ''} onChange={(e) => set('hero.subtitle', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Primary CTA</label><input value={form.hero?.ctaPrimary || ''} onChange={(e) => set('hero.ctaPrimary', e.target.value)} /></div>
            <div className="form-group"><label>Primary CTA Link</label><input value={form.hero?.ctaPrimaryLink || ''} onChange={(e) => set('hero.ctaPrimaryLink', e.target.value)} /></div>
          </div>
        </fieldset>

        <fieldset style={fsStyle}>
          <legend style={lgStyle}>SEO</legend>
          <div className="form-row">
            <div className="form-group"><label>Meta Title</label><input value={form.seo?.metaTitle || ''} onChange={(e) => set('seo.metaTitle', e.target.value)} /></div>
            <div className="form-group"><label>Meta Description</label><input value={form.seo?.metaDescription || ''} onChange={(e) => set('seo.metaDescription', e.target.value)} /></div>
          </div>
        </fieldset>

        <fieldset style={fsStyle}>
          <legend style={lgStyle}>Footer</legend>
          <div className="form-group"><label>Footer Copy</label><textarea rows={2} value={form.footerCopy || ''} onChange={(e) => set('footerCopy', e.target.value)} /></div>
          <div className="form-group"><label>Shipping Note</label><input value={form.shippingNote || ''} onChange={(e) => set('shippingNote', e.target.value)} /></div>
        </fieldset>

        <div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            <Save size={14} /> {busy ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

const fsStyle = { border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem 1.25rem', background: 'white' };
const lgStyle = { padding: '0 0.5rem', fontWeight: 700, color: '#374151', fontSize: '0.85rem' };
