import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { Loader2 } from 'lucide-react';
import './MenuPages.css';

// A product is "special" when any of its inventory rows is discounted.
const isSpecial = (p) =>
  (p.storeInventory || []).some(
    (s) => Number(s.basePrice || 0) > Number(s.price || 0) || Number(s.discountPercent || 0) > 0
  );

export default function SpecialsPage() {
  const { state } = useApp();
  const loading = state.loading?.products;
  const specials = (state.products || []).filter(isSpecial);

  return (
    <div className="menu-page">
      <header className="menu-hero">
        <h1>Specials &amp; Offers</h1>
        <p>Limited-time price drops across flowers, gifts and party essentials. Grab them while they last.</p>
      </header>

      <div className="container">
        {loading ? (
          <div className="menu-empty"><Loader2 className="spin" size={18} /> Loading specials…</div>
        ) : specials.length === 0 ? (
          <div className="menu-empty">
            <p>No active specials right now — but new deals drop weekly.</p>
            <div className="menu-cta-row">
              <Link to="/flowers" className="btn btn-primary">Shop Flowers</Link>
              <Link to="/gifts" className="btn btn-secondary">Browse Gifts</Link>
            </div>
          </div>
        ) : (
          <div className="menu-grid">
            {specials.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
