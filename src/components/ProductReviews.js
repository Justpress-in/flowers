import React, { useEffect, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { reviews as reviewsApi } from '../api/endpoints';
import { useUserAuth } from '../context/UserAuthContext';

function Stars({ value = 0, size = 14, onChange }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= value ? '#f59e0b' : 'none'}
          stroke="#f59e0b"
          style={{ cursor: onChange ? 'pointer' : 'default' }}
          onClick={onChange ? () => onChange(n) : undefined}
        />
      ))}
    </span>
  );
}

export default function ProductReviews({ productId }) {
  const { isAuthenticated, openAuthModal } = useUserAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 5, title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    try { setData(await reviewsApi.forProduct(productId)); }
    catch { setData({ count: 0, average: 0, distribution: {}, reviews: [] }); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [productId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.body || form.body.trim().length < 5) {
      setError('Please write at least a few words.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      await reviewsApi.create({
        productId,
        rating: form.rating,
        title: form.title,
        body: form.body,
      });
      setForm({ rating: 5, title: '', body: '' });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ padding: '1rem 0' }}><Loader2 className="spin" size={16} /> Loading reviews…</div>;

  return (
    <section style={{ marginTop: '3rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0 }}>Customer Reviews</h2>
        {data.count > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stars value={Math.round(data.average)} size={16} />
            <strong>{data.average.toFixed(1)}</strong>
            <span style={{ color: '#888', fontSize: '0.85rem' }}>· {data.count} review{data.count !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        {!showForm && (
          <button
            className="btn btn-secondary"
            onClick={() => isAuthenticated ? setShowForm(true) : openAuthModal({ mode: 'login', next: () => setShowForm(true) })}
          >
            Write a Review
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem', marginTop: '0.75rem' }}>
            <div style={{ marginBottom: '0.6rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, marginRight: 8 }}>Your rating</label>
              <Stars value={form.rating} size={20} onChange={(n) => setForm({ ...form, rating: n })} />
            </div>
            <div style={{ marginBottom: '0.6rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Title (optional)</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="A short headline" style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 7, fontSize: '0.9rem' }} />
            </div>
            <div style={{ marginBottom: '0.6rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>Your review *</label>
              <textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="What did you love about this product?" style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 7, fontSize: '0.9rem' }} />
            </div>
            {error && <p style={{ color: '#b91c1c', fontSize: '0.82rem', marginBottom: 6 }}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Review'}</button>
            </div>
          </form>
        )}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.reviews.length === 0 ? (
          <p style={{ color: '#888', fontSize: '0.9rem' }}>No reviews yet. Be the first to share your experience!</p>
        ) : (
          data.reviews.map((r) => (
            <div key={r.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <strong>{r.userName}</strong>
                <Stars value={r.rating} />
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              {r.title && <p style={{ fontWeight: 600, marginBottom: 4 }}>{r.title}</p>}
              <p style={{ fontSize: '0.92rem', color: '#374151', lineHeight: 1.55 }}>{r.body}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
