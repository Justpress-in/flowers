import React from 'react';
import { Link } from 'react-router-dom';
import { PartyPopper, Sparkles } from 'lucide-react';
import './MenuPages.css';

export default function FestivalsPage() {
  return (
    <div className="menu-page">
      <header className="menu-hero">
        <h1>Festivals</h1>
        <p>Seasonal & festive collections — Diwali, Eid, Christmas, Valentine's and more. Curated bundles are on the way.</p>
      </header>

      <div className="container">
        <div className="menu-empty">
          <Sparkles size={40} strokeWidth={1.3} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', marginTop: '0.8rem' }}>Festive collections coming soon</h2>
          <p>In the meantime, explore our flowers, gifts and event packages.</p>
          <div className="menu-cta-row">
            <Link to="/flowers" className="btn btn-primary">Shop Flowers</Link>
            <Link to="/parties" className="btn btn-secondary"><PartyPopper size={15} /> Parties &amp; Events</Link>
            <Link to="/packages" className="btn btn-secondary">View Packages</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
