import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { collections as collectionsApi } from '../../api/endpoints';

export default function ShowstopperCollection() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    collectionsApi
      .list({ kind: 'showstopper', active: 'true' })
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  return (
    <section className="showstopper-section">
      <div className="container">
        <h2 className="fnp-heading">
          <Sparkles size={18} strokeWidth={2} /> The Showstopper Collection <Sparkles size={18} strokeWidth={2} />
        </h2>
        <div className="collection-grid">
          {items.map((s) => (
            <Link key={s.id} to={`/collection/${s.id}`} className="collection-card">
              {s.image && <img src={s.image} alt={s.name} />}
              <div className="collection-card-text">{s.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
