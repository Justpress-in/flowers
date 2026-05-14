import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { collections as collectionsApi } from '../../api/endpoints';

export default function PairWithFlowers() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    collectionsApi
      .list({ kind: 'pair', active: 'true' })
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  return (
    <section className="showstopper-section">
      <div className="container">
        <h2 className="fnp-heading">
          <Sparkles size={18} strokeWidth={2} /> Pair With Flowers <Sparkles size={18} strokeWidth={2} />
        </h2>
        <div className="collection-grid">
          {items.map((p) => (
            <Link key={p.id} to={`/collection/${p.id}`} className="collection-card">
              {p.image && <img src={p.image} alt={p.name} />}
              <div className="collection-card-text">{p.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
