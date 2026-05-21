import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import WhatsAppQR from '../components/WhatsAppQR';
import PackagesSection from '../components/PackagesSection';
import {
  Flower2, Gift, PartyPopper,
  ArrowRight, Star, Package,
  Leaf, Sparkles, X, ChevronDown,
  ShoppingBag, Check,
} from 'lucide-react';
import './CategoryPage.css';

const META = {
  flowers: {
    label: 'Flowers', Icon: Flower2,
    color: '#e11d48', colorLight: 'rgba(225,29,72,0.08)',
    colorMid: 'rgba(225,29,72,0.65)',
    banner: 'https://images.unsplash.com/photo-1490750967868-88df5691cc71?w=1600&h=500&fit=crop&q=85',
    desc: 'Hand-picked fresh blooms for every occasion — from romantic roses to exotic orchids.',
    highlights: ['Same-day delivery', 'Freshness guaranteed', 'Bespoke arrangements'],
  },
  gifts: {
    label: 'Gifts', Icon: Gift,
    color: '#7c3aed', colorLight: 'rgba(124,58,237,0.08)',
    colorMid: 'rgba(124,58,237,0.65)',
    banner: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&h=500&fit=crop&q=85',
    desc: 'Thoughtful, curated gifts that leave a lasting impression.',
    highlights: ['Gift wrapping included', 'Personalised messages', 'Next-day delivery'],
  },
  parties: {
    label: 'Parties & Events', Icon: PartyPopper,
    color: '#d97706', colorLight: 'rgba(217,119,6,0.08)',
    colorMid: 'rgba(217,119,6,0.65)',
    banner: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&h=500&fit=crop&q=85',
    desc: 'Make every celebration unforgettable — from birthdays to grand weddings.',
    highlights: ['Full venue styling', 'Bespoke packages', 'Expert consultation'],
  },
};

function ProductCard({ product, accentColor }) {
  const prices = product.storeInventory.map(s => s.price);
  const lowestPrice = Math.min(...prices);
  const totalStock = product.storeInventory.reduce((s, i) => s + i.stock, 0);
  const isNatural = product.type === 'natural';
  const isBestseller = product.tags.includes('bestseller');
  const isPremium = product.tags.includes('premium');

  return (
    <Link to={`/product/${product.id}`} className="cp-card">
      <div className="cp-card-img-wrap">
        <img src={product.image} alt={product.name} className="cp-card-img" />

        {/* hover overlay */}
        <div className="cp-card-overlay">
          <span className="cp-card-cta">
            <ShoppingBag size={14} /> View &amp; Order
          </span>
        </div>

        {/* top-left badges */}
        {(isBestseller || isPremium) && (
          <div className="cp-card-top-badges">
            {isBestseller && (
              <span className="cp-badge-bestseller">
                <Star size={9} fill="currentColor" /> Bestseller
              </span>
            )}
            {isPremium && <span className="cp-badge-premium">Premium</span>}
          </div>
        )}

        {/* type badge bottom-left */}
        <span className={`cp-type-badge ${isNatural ? 'natural' : 'artificial'}`}>
          {isNatural ? <Leaf size={10} /> : <Sparkles size={10} />}
          {isNatural ? 'Natural' : 'Artificial'}
        </span>

        {totalStock === 0 && <div className="cp-card-soldout">Sold Out</div>}
      </div>

      <div className="cp-card-body">
        <h3 className="cp-card-name">{product.name}</h3>
        <p className="cp-card-desc">{product.description}</p>

        <div className="cp-card-meta">
          {product.availableColors.length > 0 && (
            <span><Package size={11} /> {product.availableColors.length} colours</span>
          )}
        </div>

        <div className="cp-card-footer">
          <div className="cp-card-price">
            <span className="cp-from">From</span>
            <span className="cp-amount" style={{ color: accentColor }}>${lowestPrice}</span>
          </div>
          <span className={`cp-stock-badge ${totalStock === 0 ? 'out' : totalStock < 10 ? 'low' : 'in'}`}>
            {totalStock === 0 ? 'Sold Out' : totalStock < 10 ? `${totalStock} left` : 'In Stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryPage({ category }) {
  const { state } = useApp();
  const location = useLocation();
  const [sortBy, setSortBy]         = useState('default');
  const [typeFilter, setTypeFilter]  = useState('all');

  const meta = META[category] || META.flowers;
  const { Icon } = meta;

  // Pull CMS-driven filters off the URL (set by home sections).
  const qs = new URLSearchParams(location.search);
  const priceMin = qs.get('priceMin');
  const priceMax = qs.get('priceMax');
  const colorParam = qs.get('color');
  const cityParam = qs.get('city');
  const cmsFilters = [
    priceMax && `Under $${priceMax}`,
    priceMin && !priceMax && `Above $${priceMin}`,
    priceMin && priceMax && `$${priceMin}–$${priceMax}`,
    colorParam && `Colour: ${colorParam}`,
    cityParam && `Delivers to: ${cityParam}`,
  ].filter(Boolean);

  let products = state.products.filter(p => p.category === category);
  if (typeFilter !== 'all')  products = products.filter(p => p.type === typeFilter);

  // CMS filters from query string.
  if (priceMin || priceMax) {
    const min = priceMin != null ? Number(priceMin) : -Infinity;
    const max = priceMax != null ? Number(priceMax) : Infinity;
    products = products.filter((p) => {
      const prices = (p.storeInventory || []).map((s) => s.price);
      if (!prices.length) return false;
      const lo = Math.min(...prices);
      return lo >= min && lo <= max;
    });
  }
  if (colorParam) {
    const target = colorParam.toLowerCase();
    products = products.filter((p) =>
      (p.availableColors || []).some((c) => String(c).toLowerCase().includes(target)) ||
      (p.tags || []).some((t) => String(t).toLowerCase().includes(target))
    );
  }
  if (cityParam) {
    const target = cityParam.toLowerCase().replace(/-/g, ' ');
    products = products.filter((p) =>
      (p.storeInventory || []).some((si) => {
        const store = state.stores.find((s) => s.id === si.storeId);
        const haystack = `${store?.name || ''} ${store?.location || ''}`.toLowerCase();
        return haystack.includes(target);
      })
    );
  }

  if (sortBy === 'price-asc')  products = [...products].sort((a, b) => Math.min(...a.storeInventory.map(s => s.price)) - Math.min(...b.storeInventory.map(s => s.price)));
  if (sortBy === 'price-desc') products = [...products].sort((a, b) => Math.min(...b.storeInventory.map(s => s.price)) - Math.min(...a.storeInventory.map(s => s.price)));

  const featured = products.find(p => p.tags.includes('bestseller') || p.tags.includes('premium'));
  const rest = featured ? products.filter(p => p.id !== featured.id) : products;
  const hasFilters = typeFilter !== 'all' || sortBy !== 'default';
  function clearFilters() { setTypeFilter('all'); setSortBy('default'); }

  const totalAllProducts = state.products.filter(p => p.category === category).length;

  return (
    <div className="cat-page">

      {/* ── Hero ── */}
      <div className="cat-hero" style={{ backgroundImage: `url(${meta.banner})` }}>
        {/* dark gradient scrim */}
        <div className="cat-hero-scrim" />
        {/* coloured tint layer */}
        <div className="cat-hero-tint" style={{ background: meta.colorMid }} />

        <div className="container cat-hero-inner">
          <div className="cat-hero-eyebrow">
            <Icon size={13} strokeWidth={2} />
            <span>{meta.label}</span>
          </div>
          <h1 className="cat-hero-title">{meta.label}</h1>
          <p className="cat-hero-desc">{meta.desc}</p>

          <div className="cat-hero-chips">
            {meta.highlights.map(h => (
              <span key={h} className="cat-hero-chip">
                <Check size={11} strokeWidth={3} /> {h}
              </span>
            ))}
          </div>

          <div className="cat-hero-meta">
            <span>{totalAllProducts} products</span>
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="cat-filters-bar">
        <div className="container cat-filters-inner">

          {/* Type chips */}
          <div className="filter-type-group">
            {[
              { val: 'all',        label: 'All' },
              { val: 'natural',    label: 'Natural',    Icon: Leaf },
              { val: 'artificial', label: 'Artificial', Icon: Sparkles },
            ].map(({ val, label, Icon: TIcon }) => (
              <button
                key={val}
                className={`filter-type-chip ${typeFilter === val ? 'active' : ''}`}
                style={typeFilter === val ? { background: meta.color, borderColor: meta.color } : {}}
                onClick={() => setTypeFilter(val)}
              >
                {TIcon && <TIcon size={11} />}
                {label}
              </button>
            ))}
          </div>

          <div className="filter-sep" />

          {/* Sort select */}
          <div className="filter-select-wrap">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select-sm filter-sort">
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            <ChevronDown size={12} className="filter-select-arrow" />
          </div>

          {hasFilters && (
            <button className="filter-clear-btn" onClick={clearFilters}>
              <X size={12} /> Clear
            </button>
          )}

          <span className="filter-count">
            <strong>{products.length}</strong> result{products.length !== 1 ? 's' : ''}
          </span>
        </div>
        {cmsFilters.length > 0 && (
          <div className="container" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', padding: '0 1rem 0.6rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#666' }}>Applied:</span>
            {cmsFilters.map((label) => (
              <span key={label} className="badge badge-orange" style={{ fontSize: '0.72rem' }}>
                {label}
              </span>
            ))}
            <Link to={`/${category}`} style={{ fontSize: '0.78rem', color: '#c1440e' }}>Clear</Link>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="cat-body">
        <div className="container">
          {products.length === 0 ? (
            <div className="cat-empty">
              <div className="cat-empty-icon" style={{ color: meta.color, background: meta.colorLight }}>
                <Icon size={40} strokeWidth={1.2} />
              </div>
              <h2>No products found</h2>
              <p>Try clearing the filters to see all products.</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              {/* Featured card */}
              {featured && (
                <div className="cat-featured-wrap">
                  <div className="cat-section-label">
                    <Star size={12} fill={meta.color} color={meta.color} />
                    Featured Pick
                  </div>
                  <Link to={`/product/${featured.id}`} className="cat-featured-card">
                    <div className="cat-featured-img-wrap">
                      <img src={featured.image} alt={featured.name} />
                      <div className="cat-feat-img-overlay" style={{ background: `linear-gradient(to right, ${meta.color}22 0%, transparent 50%)` }} />
                      <span className={`cp-type-badge feat ${featured.type === 'natural' ? 'natural' : 'artificial'}`}>
                        {featured.type === 'natural' ? <Leaf size={11} /> : <Sparkles size={11} />}
                        {featured.type === 'natural' ? 'Natural' : 'Artificial'}
                      </span>
                    </div>
                    <div className="cat-featured-info">
                      <div className="cat-featured-badges">
                        {featured.tags.slice(0, 3).map(t => (
                          <span key={t} className="cat-feat-tag"
                            style={{ background: meta.colorLight, color: meta.color, border: `1px solid ${meta.color}33` }}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <h2>{featured.name}</h2>
                      <p>{featured.description}</p>

                      <div className="cat-featured-footer">
                        <div className="cat-feat-pricing">
                          <span className="cat-feat-from">Starting from</span>
                          <span className="cat-feat-price" style={{ color: meta.color }}>
                            ${Math.min(...featured.storeInventory.map(s => s.price))}
                          </span>
                        </div>
                        <span className="cat-feat-btn" style={{ background: meta.color }}>
                          Order Now <ArrowRight size={15} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              {/* Product grid */}
              {rest.length > 0 && (
                <div className="cat-grid-section">
                  {featured && (
                    <div className="cat-section-label">
                      <Package size={12} /> All Products
                    </div>
                  )}
                  <div className="cp-grid">
                    {rest.map(p => (
                      <ProductCard key={p.id} product={p} accentColor={meta.color} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {category === 'parties' && <PackagesSection />}
          {category === 'parties' && <WhatsAppQR />}
        </div>
      </div>
    </div>
  );
}
