import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import { BadgePercent, PartyPopper, ArrowRight, Loader2 } from 'lucide-react';
import './MenuPages.css';

export default function PartiesPage() {
  const { state } = useApp();
  const loading = state.loading?.products;
  const partyProducts = (state.products || []).filter((p) => p.category === 'parties');

  return (
    <div className="menu-page">
      <header className="menu-hero">
        <h1>Parties &amp; Events</h1>
        <p>From ready-made packages to a fully custom celebration — choose how you'd like to start.</p>
      </header>

      <div className="container">
        {/* Two main options */}
        <div className="parties-options">
          <Link to="/packages" className="party-option-card">
            <div className="party-option-icon"><BadgePercent size={26} /></div>
            <h2>Packages</h2>
            <p>Browse curated packages by category — schools, weddings, corporate and more.</p>
            <span className="party-option-cta">Explore Packages <ArrowRight size={15} /></span>
          </Link>

          <Link to="/book?for=party" className="party-option-card">
            <div className="party-option-icon"><PartyPopper size={26} /></div>
            <h2>Make Your Party</h2>
            <p>Tell us about your event, describe exactly what you want, and we'll plan it for you.</p>
            <span className="party-option-cta">Book Your Party <ArrowRight size={15} /></span>
          </Link>
        </div>

        {/* Shop party items */}
        {loading ? (
          <div className="menu-empty"><Loader2 className="spin" size={18} /> Loading…</div>
        ) : partyProducts.length > 0 && (
          <section style={{ marginTop: '3rem' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Shop Party Items</h2>
            <p className="section-subtitle" style={{ textAlign: 'center' }}>Decorations, florals and essentials for your celebration.</p>
            <div className="menu-grid">
              {partyProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
