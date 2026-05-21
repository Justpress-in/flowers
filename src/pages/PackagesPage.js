import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, Users, Clock, Check, ArrowLeft, BadgePercent } from 'lucide-react';
import { packages as packagesApi } from '../api/endpoints';
import { useMaster } from '../api/useMaster';
import WhatsAppQR from '../components/WhatsAppQR';
import '../components/PackagesSection.css';
import './MenuPages.css';

export default function PackagesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const { labelFor } = useMaster();
  const activeType = params.get('type');

  useEffect(() => {
    let cancelled = false;
    packagesApi.list({ active: 'true' })
      .then((list) => { if (!cancelled) setItems(Array.isArray(list) ? list : []); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  // Distinct sub-categories (package types) that actually have packages.
  const subCategories = useMemo(() => {
    const map = new Map();
    for (const p of items) {
      const t = p.eventType || 'other';
      if (!map.has(t)) map.set(t, { type: t, count: 0, image: '' });
      const entry = map.get(t);
      entry.count += 1;
      if (!entry.image && p.image) entry.image = p.image;
    }
    return Array.from(map.values());
  }, [items]);

  const typeLabel = (t) => labelFor('event-package-type', t) || t;

  if (loading) {
    return (
      <div className="menu-page">
        <header className="menu-hero"><h1>Event Packages</h1></header>
        <div className="menu-empty"><Loader2 className="spin" size={18} /> Loading packages…</div>
      </div>
    );
  }

  // ── Drill-down: a single sub-category's packages ──
  if (activeType) {
    const list = items.filter((p) => (p.eventType || 'other') === activeType);
    return (
      <div className="menu-page">
        <header className="menu-hero">
          <h1 style={{ textTransform: 'capitalize' }}>{typeLabel(activeType)} Packages</h1>
          <p>Curated {typeLabel(activeType).toLowerCase()} packages — tap any to enquire.</p>
        </header>
        <div className="container">
          <button className="menu-back" onClick={() => setParams({})}>
            <ArrowLeft size={15} /> All categories
          </button>
          {list.length === 0 ? (
            <div className="menu-empty">No packages in this category yet.</div>
          ) : (
            <PackageGrid items={list} />
          )}
          <WhatsAppQR />
        </div>
      </div>
    );
  }

  // ── Default: sub-category tiles ──
  return (
    <div className="menu-page">
      <header className="menu-hero">
        <h1>Event Packages</h1>
        <p>Pick a category to see curated packages for your occasion.</p>
      </header>
      <div className="container">
        {subCategories.length === 0 ? (
          <div className="menu-empty">
            <p>No packages published yet — please check back soon.</p>
            <div className="menu-cta-row"><Link to="/book" className="btn btn-primary">Make Your Party</Link></div>
          </div>
        ) : (
          <div className="menu-grid" style={{ paddingTop: '2.2rem' }}>
            {subCategories.map((sc) => (
              <Link key={sc.type} to={`/packages?type=${encodeURIComponent(sc.type)}`} className="subcat-tile">
                {sc.image
                  ? <img src={sc.image} alt={typeLabel(sc.type)} className="subcat-tile-img" />
                  : <div className="subcat-tile-img subcat-tile-img--empty"><BadgePercent size={32} /></div>}
                <div className="subcat-tile-body">
                  <h3>{typeLabel(sc.type)}</h3>
                  <span>{sc.count} package{sc.count !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PackageGrid({ items }) {
  return (
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
                <span className="package-card-price">${Number(p.price).toLocaleString()}</span>
              </div>
              <Link to="/book" className="btn btn-primary">Enquire</Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
