import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Flower2, Gift, PartyPopper,
  SlidersHorizontal, ArrowRight, Star,
  MapPin, Package, ChevronDown,
} from 'lucide-react';
import './CategoryPage.css';

const META = {
  flowers: {
    label: 'Flowers',
    Icon: Flower2,
    color: '#e11d48',
    colorLight: 'rgba(225,29,72,0.08)',
    banner: 'https://images.unsplash.com/photo-1490750967868-88df5691cc71?w=1400&h=360&fit=crop&q=80',
    desc: 'Hand-picked fresh blooms for every occasion — from romantic roses to exotic orchids.',
    highlights: ['Same-day delivery', 'Freshness guaranteed', 'Bespoke arrangements'],
  },
  gifts: {
    label: 'Gifts',
    Icon: Gift,
    color: '#7c3aed',
    colorLight: 'rgba(124,58,237,0.08)',
    banner: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1400&h=360&fit=crop&q=80',
    desc: 'Thoughtful, curated gifts that leave a lasting impression — for every person and every occasion.',
    highlights: ['Gift wrapping included', 'Personalised messages', 'Next-day delivery'],
  },
  parties: {
    label: 'Parties & Events',
    Icon: PartyPopper,
    color: '#d97706',
    colorLight: 'rgba(217,119,6,0.08)',
    banner: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1400&h=360&fit=crop&q=80',
    desc: 'Make every celebration unforgettable — from intimate birthdays to grand weddings and corporate events.',
    highlights: ['Full venue styling', 'Bespoke packages', 'Expert consultation'],
  },
};

function ProductCard({ product }) {
  const { state } = useApp();
  const prices = product.storeInventory.map(s => s.price);
  const lowestPrice = Math.min(...prices);
  const totalStock = product.storeInventory.reduce((s, i) => s + i.stock, 0);
  const storeCount = product.storeInventory.length;

  return (
    <Link to={`/product/${product.id}`} className="cp-card">
      <div className="cp-card-img-wrap">
        <img src={product.image} alt={product.name} className="cp-card-img" />
        <div className="cp-card-overlay">
          <span className="cp-card-cta">View & Order <ArrowRight size={14} /></span>
        </div>
        {product.tags.includes('bestseller') && (
          <div className="cp-card-bestseller"><Star size={11} fill="currentColor" /> Bestseller</div>
        )}
        {product.tags.includes('premium') && (
          <div className="cp-card-premium">Premium</div>
        )}
        {totalStock === 0 && <div className="cp-card-soldout">Sold Out</div>}
      </div>
      <div className="cp-card-body">
        <h3 className="cp-card-name">{product.name}</h3>
        <p className="cp-card-desc">{product.description}</p>
        <div className="cp-card-meta">
          <span className="cp-card-stores">
            <MapPin size={12} /> {storeCount} store{storeCount !== 1 ? 's' : ''}
          </span>
          {product.availableColors.length > 0 && (
            <span className="cp-card-colors">
              <Package size={12} /> {product.availableColors.length} colours
            </span>
          )}
        </div>
        <div className="cp-card-footer">
          <div className="cp-card-price">
            <span className="cp-from">From</span>
            <span className="cp-amount">${lowestPrice}</span>
          </div>
          <span className={`cp-stock-badge ${totalStock === 0 ? 'out' : totalStock < 10 ? 'low' : 'in'}`}>
            {totalStock === 0 ? 'Sold Out' : totalStock < 10 ? `Only ${totalStock} left` : 'In Stock'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryPage({ category }) {
  const { state } = useApp();
  const [sortBy, setSortBy] = useState('default');
  const [storeFilter, setStoreFilter] = useState('all');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const meta = META[category] || META.flowers;
  const { Icon } = meta;

  let products = state.products.filter(p => p.category === category);

  if (storeFilter !== 'all') {
    products = products.filter(p =>
      p.storeInventory.some(s => s.storeId === storeFilter && s.stock > 0)
    );
  }

  if (sortBy === 'price-asc') {
    products = [...products].sort((a, b) =>
      Math.min(...a.storeInventory.map(s => s.price)) - Math.min(...b.storeInventory.map(s => s.price))
    );
  } else if (sortBy === 'price-desc') {
    products = [...products].sort((a, b) =>
      Math.min(...b.storeInventory.map(s => s.price)) - Math.min(...a.storeInventory.map(s => s.price))
    );
  }

  const featured = products.find(p => p.tags.includes('bestseller') || p.tags.includes('premium'));
  const rest = featured ? products.filter(p => p.id !== featured.id) : products;

  return (
    <div className="cat-page">

      {/* Banner */}
      <div className="cat-hero" style={{ backgroundImage: `url(${meta.banner})` }}>
        <div className="cat-hero-overlay" style={{ background: `linear-gradient(135deg, ${meta.color}cc 0%, rgba(0,0,0,0.55) 100%)` }} />
        <div className="container cat-hero-inner">
          <div className="cat-hero-icon" style={{ background: 'rgba(255,255,255,0.18)' }}>
            <Icon size={30} strokeWidth={1.5} color="white" />
          </div>
          <h1>{meta.label}</h1>
          <p className="cat-hero-desc">{meta.desc}</p>
          <div className="cat-hero-highlights">
            {meta.highlights.map(h => (
              <span key={h} className="cat-highlight-chip">
                <Star size={11} fill="white" color="white" /> {h}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container cat-body">

        {/* Toolbar */}
        <div className="cat-toolbar">
          <p className="cat-count">
            <strong>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
          </p>
          <div className="cat-toolbar-right">
            <button
              className={`cat-filter-toggle ${filtersOpen ? 'active' : ''}`}
              onClick={() => setFiltersOpen(o => !o)}
            >
              <SlidersHorizontal size={15} />
              Filters
              <ChevronDown size={14} className={`chevron ${filtersOpen ? 'open' : ''}`} />
            </button>

            <div className="cat-sort-wrap">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="cat-select">
                <option value="default">Sort: Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="cat-filter-panel">
            <div className="filter-group">
              <label>Store Location</label>
              <div className="filter-chips">
                <button
                  className={`filter-chip ${storeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setStoreFilter('all')}
                >All Stores</button>
                {state.stores.map(s => (
                  <button
                    key={s.id}
                    className={`filter-chip ${storeFilter === s.id ? 'active' : ''}`}
                    onClick={() => setStoreFilter(s.id)}
                  >
                    <MapPin size={11} /> {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {products.length === 0 ? (
          /* Empty state */
          <div className="cat-empty">
            <div className="cat-empty-icon" style={{ color: meta.color, background: meta.colorLight }}>
              <Icon size={40} strokeWidth={1.2} />
            </div>
            <h2>No products found</h2>
            <p>Try selecting a different store or clearing the filters.</p>
            <button className="btn btn-primary" onClick={() => { setStoreFilter('all'); setSortBy('default'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured spotlight */}
            {featured && (
              <div className="cat-featured-wrap">
                <p className="cat-section-label">
                  <Star size={14} fill={meta.color} color={meta.color} /> Featured Pick
                </p>
                <Link to={`/product/${featured.id}`} className="cat-featured-card">
                  <div className="cat-featured-img-wrap">
                    <img src={featured.image} alt={featured.name} />
                  </div>
                  <div className="cat-featured-info">
                    <div className="cat-featured-badges">
                      {featured.tags.map(t => (
                        <span key={t} className="badge badge-orange">{t}</span>
                      ))}
                    </div>
                    <h2>{featured.name}</h2>
                    <p>{featured.description}</p>
                    <div className="cat-featured-stores">
                      {featured.storeInventory.map(si => {
                        const store = state.stores.find(s => s.id === si.storeId);
                        return (
                          <div key={si.storeId} className="cat-feat-store-row">
                            <MapPin size={13} />
                            <span>{store?.name}</span>
                            <strong>${si.price}</strong>
                            <span className={`cp-stock-badge ${si.stock < 5 ? 'low' : 'in'}`} style={{fontSize:'0.7rem'}}>
                              {si.stock} left
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="cat-featured-footer">
                      <div>
                        <span className="cat-feat-from">From</span>
                        <span className="cat-feat-price">
                          ${Math.min(...featured.storeInventory.map(s => s.price))}
                        </span>
                      </div>
                      <span className="btn btn-primary cat-feat-btn">
                        Order Now <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <>
                {featured && (
                  <p className="cat-section-label" style={{ marginTop: '2.5rem' }}>
                    <Package size={14} /> All Products
                  </p>
                )}
                <div className="cp-grid">
                  {rest.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
