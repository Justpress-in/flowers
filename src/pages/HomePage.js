import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import BannerSlider from '../components/BannerSlider';
import {
  Flower2, Gift, PartyPopper,
  Truck, MessageSquare, Store, Leaf,
  ArrowRight, Star, Sparkles,
} from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  const { state } = useApp();

  const featured = state.products.filter(p =>
    p.tags.includes('bestseller') || p.tags.includes('premium') || p.tags.includes('bespoke')
  ).slice(0, 3);

  const categories = [
    { to: '/flowers', className: 'cat-flowers', Icon: Flower2, label: 'Flowers', desc: 'Roses, orchids, sunflowers & seasonal blooms', count: state.products.filter(p => p.category === 'flowers').length },
    { to: '/gifts', className: 'cat-gifts', Icon: Gift, label: 'Gifts', desc: 'Hampers, chocolates, candles & personalised sets', count: state.products.filter(p => p.category === 'gifts').length },
    { to: '/parties', className: 'cat-parties', Icon: PartyPopper, label: 'Parties & Events', desc: 'Birthday, wedding, and corporate packages', count: state.products.filter(p => p.category === 'parties').length },
  ];

  const perks = [
    { Icon: Truck, title: 'Same-Day Delivery', desc: 'Order by 2pm for delivery today' },
    { Icon: MessageSquare, title: 'Custom Messages', desc: 'Personalise your gift with a handwritten note' },
    { Icon: Store, title: 'Multi-Store Network', desc: 'Order from your nearest store location' },
    { Icon: Leaf, title: 'Sustainably Sourced', desc: 'Fresh blooms from ethical growers' },
  ];

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <p className="hero-eyebrow">Fresh. Bespoke. Delivered.</p>
            <h1 className="hero-title">Flowers, Gifts &<br />Unforgettable Events</h1>
            <p className="hero-subtitle">
              From hand-picked bouquets to full event floristry — we craft every order with care.
            </p>
            <div className="hero-cta">
              <Link to="/flowers" className="btn btn-primary hero-btn">
                <Flower2 size={16} /> Shop Flowers
              </Link>
              <Link to="/gifts" className="btn btn-secondary hero-btn">
                <Gift size={16} /> Browse Gifts
              </Link>
            </div>
            <div className="hero-trust">
              <span><Star size={13} fill="#f59e0b" color="#f59e0b" /> 4.9 rated</span>
              <span>·</span>
              <span>2,000+ orders</span>
              <span>·</span>
              <span>3 locations</span>
            </div>
          </div>
          <div className="hero-image-grid">
            <img src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=280&h=340&fit=crop" alt="Flowers" />
            <img src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=280&h=340&fit=crop" alt="Gift" />
            <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=280&h=340&fit=crop" alt="Event" />
          </div>
        </div>
      </section>

      {/* Banners / Offers */}
      <section className="home-banners">
        <div className="container">
          <div className="home-section-header">
            <div>
              <h2 className="section-title">Offers & Promotions</h2>
              <p className="section-subtitle">Exclusive deals updated weekly</p>
            </div>
          </div>
        </div>
        <BannerSlider />
      </section>

      {/* Categories */}
      <section className="categories container">
        <div className="home-section-header">
          <div>
            <h2 className="section-title">What are you looking for?</h2>
            <p className="section-subtitle">Choose a category to explore our curated collection</p>
          </div>
          <Link to="/flowers" className="view-all-link">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="category-grid">
          {categories.map(({ to, className, Icon, label, desc, count }) => (
            <Link key={to} to={to} className={`cat-card ${className}`}>
              <div className="cat-card-top">
                <div className="cat-icon-wrap">
                  <Icon size={26} strokeWidth={1.5} />
                </div>
                <span className="cat-count-badge">{count} items</span>
              </div>
              <h3>{label}</h3>
              <p>{desc}</p>
              <span className="cat-arrow">
                Explore <ArrowRight size={14} strokeWidth={2.5} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="featured container">
        <div className="home-section-header">
          <div>
            <h2 className="section-title">
              <Sparkles size={22} color="#f59e0b" strokeWidth={1.5} style={{verticalAlign:'middle', marginRight:'0.4rem'}} />
              Featured Products
            </h2>
            <p className="section-subtitle">Our most loved items this season</p>
          </div>
          <Link to="/flowers" className="view-all-link">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="grid-3">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Perks */}
      <section className="perks">
        <div className="container perks-inner">
          {perks.map(({ Icon, title, desc }) => (
            <div className="perk-item" key={title}>
              <div className="perk-icon-wrap">
                <Icon size={26} strokeWidth={1.5} />
              </div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
