import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Users, Clock, Check } from 'lucide-react';
import { packages as packagesApi } from '../api/endpoints';
import './PackagesSection.css';

export default function PackagesSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    packagesApi.list({ active: 'true' })
      .then((list) => { if (!cancelled) setItems(list); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="pkg-loading"><Loader2 className="spin" size={18} /> Loading packages…</div>;
  if (items.length === 0) return null;

  return (
    <section className="packages-section">
      <div className="packages-header">
        <h2 className="section-title">Curated Event Packages</h2>
        <p className="section-subtitle">All-in-one styling for weddings, birthdays, corporate events and more.</p>
      </div>
      <div className="packages-grid">
        {items.map((p) => (
          <article key={p.id} className="package-card">
            {p.image && <img src={p.image} alt={p.name} className="package-card-img" />}
            <div className="package-card-body">
              <span className="package-card-type">{p.eventType}</span>
              <h3>{p.name}</h3>
              {p.description && <p className="package-card-desc">{p.description}</p>}
              {p.inclusions?.length > 0 && (
                <ul className="package-card-inclusions">
                  {p.inclusions.slice(0, 4).map((inc) => (
                    <li key={inc}><Check size={11} /> {inc}</li>
                  ))}
                  {p.inclusions.length > 4 && <li className="package-card-more">+ {p.inclusions.length - 4} more</li>}
                </ul>
              )}
              <div className="package-card-meta">
                {p.capacity && <span><Users size={11} /> {p.capacity}</span>}
                {p.duration && <span><Clock size={11} /> {p.duration}</span>}
              </div>
              <div className="package-card-footer">
                <div>
                  <span className="package-card-from">Starting from</span>
                  <span className="package-card-price">${p.price.toLocaleString()}</span>
                </div>
                <Link to="/book" className="btn btn-primary">Enquire</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
