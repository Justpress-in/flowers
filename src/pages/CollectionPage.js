import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { collections as collectionsApi } from '../api/endpoints';
import ProductCard from '../components/ProductCard';

export default function CollectionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    collectionsApi
      .get(slug)
      .then((data) => { if (!cancelled) setCollection(data); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load collection'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center', color: '#666' }}>
        <Loader2 className="spin" size={18} /> Loading collection…
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <AlertTriangle size={32} color="#b91c1c" />
        <h2 style={{ marginTop: '0.6rem' }}>Collection not found</h2>
        <p style={{ color: '#666' }}>{error || 'This collection may have been removed.'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to home</button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 3rem' }}>
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={15} /> Back
      </button>

      <header style={{ textAlign: 'center', margin: '1rem 0 2rem' }}>
        {collection.image && (
          <img
            src={collection.image}
            alt={collection.name}
            style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 14, marginBottom: '1rem' }}
          />
        )}
        <h1 style={{ fontSize: '2rem', margin: 0 }}>
          <Sparkles size={18} strokeWidth={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {collection.name}
        </h1>
        {collection.description && (
          <p style={{ color: '#666', maxWidth: 640, margin: '0.6rem auto 0' }}>
            {collection.description}
          </p>
        )}
      </header>

      {collection.products && collection.products.length > 0 ? (
        <div className="grid-3">
          {collection.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
          <p>No products assigned to this collection yet.</p>
          <Link to="/flowers" className="btn btn-primary" style={{ marginTop: '0.6rem' }}>Browse all flowers</Link>
        </div>
      )}
    </div>
  );
}
