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
    {
      to: '/flowers',
      className: 'cat-flowers',
      Icon: Flower2,
      label: 'Flowers',
      desc: 'Roses, orchids, sunflowers & seasonal blooms',
      count: state.products.filter(p => p.category === 'flowers').length,
    },
    {
      to: '/gifts',
      className: 'cat-gifts',
      Icon: Gift,
      label: 'Gifts',
      desc: 'Hampers, chocolates, candles & personalised sets',
      count: state.products.filter(p => p.category === 'gifts').length,
    },
    {
      to: '/parties',
      className: 'cat-parties',
      Icon: PartyPopper,
      label: 'Parties & Events',
      desc: 'Birthday, wedding, and corporate packages',
      count: state.products.filter(p => p.category === 'parties').length,
    },
  ];

  const trustFooter = [
    { icon: 'https://cdn-icons-png.flaticon.com/512/900/900782.png', title: 'Worldwide Delivery', desc: 'We deliver gifts to over 70 countries' },
    { icon: 'https://cdn-icons-png.flaticon.com/512/3225/3225219.png', title: '100% Safe & Secure Payments', desc: 'Pay using secure payment methods' },
    { icon: 'https://cdn-icons-png.flaticon.com/512/4233/4233830.png', title: 'Dedicated Help Center', desc: 'Chat With Us' },
  ];

  const prices = [
    { label: 'Under ₹599', to: '/flowers?price=under599' },
    { label: 'Under ₹999', to: '/flowers?price=under999' },
    { label: 'Under ₹1499', to: '/flowers?price=under1499' },
    { label: 'Under ₹1999', to: '/flowers?price=under1999' },
    { label: 'Above ₹2000', to: '/flowers?price=above2000' },
  ];

  const cities = [
    { name: 'Delhi NCR', icon: 'https://cdn-icons-png.flaticon.com/512/3248/3248062.png' },
    { name: 'Hyderabad', icon: 'https://cdn-icons-png.flaticon.com/512/8204/8204481.png' },
    { name: 'Pune', icon: 'https://cdn-icons-png.flaticon.com/512/11267/11267598.png' },
    { name: 'Mumbai', icon: 'https://cdn-icons-png.flaticon.com/512/6211/6211029.png' },
    { name: 'Chennai', icon: 'https://cdn-icons-png.flaticon.com/512/3248/3248074.png' },
    { name: 'Bengaluru', icon: 'https://cdn-icons-png.flaticon.com/512/3248/3248057.png' },
  ];

  const colours = [
    { name: 'Red', img: 'https://images.unsplash.com/photo-1548094891-c4ba474efd16?w=200&h=200&fit=crop' },
    { name: 'Purple', img: 'https://images.unsplash.com/photo-1596700676646-ac74c1064db1?w=200&h=200&fit=crop' },
    { name: 'Pink', img: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=200&h=200&fit=crop' },
    { name: 'Peach', img: 'https://images.unsplash.com/photo-1502920628464-9279dfc85fce?w=200&h=200&fit=crop' },
    { name: 'Warm', img: 'https://images.unsplash.com/photo-1456315138460-858d1089ddbf?w=200&h=200&fit=crop' },
    { name: 'Pastel', img: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?w=200&h=200&fit=crop' },
    { name: 'Orange', img: 'https://images.unsplash.com/photo-1600862080351-b0db43e7428f?w=200&h=200&fit=crop' },
    { name: 'Blue', img: 'https://images.unsplash.com/photo-1507290439931-a861b5a38200?w=200&h=200&fit=crop' },
    { name: 'White', img: 'https://images.unsplash.com/photo-1503431128871-16ef9822ce81?w=200&h=200&fit=crop' },
    { name: 'Yellow', img: 'https://images.unsplash.com/photo-1520668041539-74d4eb076ce6?w=200&h=200&fit=crop' },
    { name: 'Cool', img: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=200&h=200&fit=crop' },
    { name: 'Mixed', img: 'https://images.unsplash.com/photo-1464652149449-f3b8538144aa?w=200&h=200&fit=crop' },
  ];

  const showstoppers = [
    { name: 'Flower Bouquets', img: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=400&h=300&fit=crop' },
    { name: 'Flower Arrangements', img: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&h=300&fit=crop' },
    { name: 'Standing Bouquets', img: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=300&fit=crop' },
    { name: 'Flower in a Box', img: 'https://images.unsplash.com/photo-1559230554-463286bceca2?w=400&h=300&fit=crop' },
    { name: 'Zodiac Flowers', img: 'https://images.unsplash.com/photo-1523694086438-e699292a433f?w=400&h=300&fit=crop' },
    { name: 'Sleeves', img: 'https://images.unsplash.com/photo-1540306354877-9df03dbba41d?w=400&h=300&fit=crop' },
  ];

  const pairs = [
    { name: 'Flowers and Cakes', img: 'https://images.unsplash.com/photo-1557925923-33b251214f20?w=400&h=300&fit=crop' },
    { name: 'Flowers and Chocolates', img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop' },
    { name: 'Flowers and Teddy Bears', img: 'https://images.unsplash.com/photo-1559627755-e7f62bc12eb2?w=400&h=300&fit=crop' },
    { name: 'Flowers and Guitarist', img: 'https://images.unsplash.com/photo-1510915361894-faa8b2d18475?w=400&h=300&fit=crop' },
    { name: 'Flowers and Plants', img: 'https://images.unsplash.com/photo-1416879598056-0c6559bc5cc4?w=400&h=300&fit=crop' },
    { name: 'Flowers and Greeting Cards', img: 'https://images.unsplash.com/photo-1518349272332-9c3db7dae9e7?w=400&h=300&fit=crop' },
  ];

  const reviews = [
    { initial: 'S', name: 'Sangeeta', time: '9 months ago', rating: 5, text: 'Inspite of heavy rains the delivery boy delivered the gift on time Thanks a lot to him', occ: 'Birthday', city: 'Mumbai' },
    { initial: 'AS', name: 'anoop srivastava', time: '9 months ago', rating: 5, text: 'All gd', occ: 'Birthday', city: 'Delhi' },
    { initial: 'AV', name: 'Archana Verma', time: '9 months ago', rating: 5, text: 'Thank you team for your excellent service and delivery of best quality products, I really ...', occ: 'Birthday', city: 'Ayodhya-Nagar-Bhopal' },
    { initial: 'RS', name: 'Ruhi Singh', time: '9 months ago', rating: 5, text: 'Thank you for delivering the best', occ: 'Birthday', city: 'Ghaziabad' },
  ];

  return (
    <div className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <p className="hero-eyebrow">
              <Flower2 size={12} /> Fresh · Bespoke · Delivered
            </p>
            <h1 className="hero-title">
              Flowers, Gifts &<br />
              <em>Unforgettable</em> Events
            </h1>
            <p className="hero-subtitle">
              From hand-picked bouquets to full event floristry — every order crafted with care and delivered with love.
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
            <img src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&h=380&fit=crop" alt="Red roses" />
            <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300&h=380&fit=crop" alt="Gift box" />
            <img src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&h=380&fit=crop" alt="Event florals" />
          </div>
        </div>
      </section>

      {/* ── Offers / Banner Slider ── */}
      <section className="banners-section">
        <div className="container">
          <div className="home-section-header">
            <div>
              <h2 className="section-title">Offers &amp; Promotions</h2>
              <p className="section-subtitle">Exclusive deals updated weekly</p>
            </div>
          </div>
        </div>
        <BannerSlider />
      </section>

      {/* ── Categories ── */}
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
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <span className="cat-count-badge">{count} items</span>
              </div>
              <h3>{label}</h3>
              <p>{desc}</p>
              <span className="cat-arrow">
                Explore <ArrowRight size={13} strokeWidth={2.5} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured ── */}
      <section className="featured">
        <div className="container">
          <div className="home-section-header">
            <div>
              <h2 className="section-title">
                <Sparkles size={20} color="#f59e0b" strokeWidth={1.5} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                Featured Products
              </h2>
              <p className="section-subtitle">Our most loved items this season</p>
            </div>
            <Link to="/flowers" className="view-all-link">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="grid-3">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* ── Shop By Price ── */}
      <section className="shop-by-price container">
        <h2 className="fnp-heading">
          <Sparkles size={18} strokeWidth={2} /> Shop By Price <Sparkles size={18} strokeWidth={2} />
        </h2>
        <div className="price-pills">
          {prices.map(p => (
            <Link key={p.label} to={p.to} className="price-pill">
              {p.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Delivering Blooms Across India ── */}
      <section className="cities-section container">
        <h2 className="fnp-heading">
          <Sparkles size={18} strokeWidth={2} /> Delivering Blooms Across India <Sparkles size={18} strokeWidth={2} />
        </h2>
        <div className="cities-grid">
          {cities.map(c => (
            <div key={c.name} className="city-card">
              <img src={c.icon} alt={c.name} className="city-icon" />
              <span>{c.name}</span>
              <div className="city-arrow"><ArrowRight size={14} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Choose a Favourite Colour ── */}
      <section className="colours-section container">
        <h2 className="fnp-heading">
          <Sparkles size={18} strokeWidth={2} /> Choose a Favourite Colour <Sparkles size={18} strokeWidth={2} />
        </h2>
        <div className="colours-grid">
          {colours.map(c => (
            <div key={c.name} className="colour-item">
              <div className="colour-img-wrap">
                <img src={c.img} alt={c.name} />
              </div>
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Showstopper Collection ── */}
      <section className="showstopper-section container">
        <h2 className="fnp-heading">
          <Sparkles size={18} strokeWidth={2} /> The Showstopper Collection <Sparkles size={18} strokeWidth={2} />
        </h2>
        <div className="collection-grid">
          {showstoppers.map(s => (
            <div key={s.name} className="collection-card">
              <img src={s.img} alt={s.name} />
              <div className="collection-card-text">
                {s.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pair With Flowers ── */}
      <section className="showstopper-section container">
        <h2 className="fnp-heading">
          <Sparkles size={18} strokeWidth={2} /> Pair With Flowers <Sparkles size={18} strokeWidth={2} />
        </h2>
        <div className="collection-grid">
          {pairs.map(p => (
            <div key={p.name} className="collection-card">
              <img src={p.img} alt={p.name} />
              <div className="collection-card-text">
                {p.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Customer Reviews ── */}
      <section className="reviews-section container">
        <div className="home-section-header">
          <h2 className="section-title">Customer Reviews</h2>
          <button className="view-all-reviews">Show All Reviews <ArrowRight size={14} /></button>
        </div>
        <div className="reviews-carousel">
          {reviews.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-head">
                <div className="review-avatar">{r.initial}</div>
                <div className="review-meta">
                  <div className="review-name"><strong>{r.name}</strong> • {r.time}</div>
                  <div className="review-stars">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} size={14} fill="#22c55e" color="#22c55e" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="review-text">{r.text}</p>
              <div className="review-foot">
                <span>Occasion: {r.occ}</span>
                <span>City: {r.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEO Text ── */}
      <section className="seo-section container">
        <h3>Order Flowers to India and Surprise Loved Ones</h3>
        <p>
          Want to make your near and dear ones feel over the moon? Ordering flowers for them will do the trick. Everyone appreciates the beauty and magnificence of flowers. Therefore, FNP has introduced a huge collection of floral beauties to help you win hearts. You can send our flowers to India and make friends and relatives realise what you feel for them. Scroll through the collection of <a href="/flowers">flower arrangements online</a> on FNP, and buy from our versatile arrangements of blooms, stretched on our vast meadow, for all the special people in your life. The vibrant hues of our flowers will instantly uplift the mood of the recipient. We have a wide variety of roses, orchids, tulips, lilies, hydrangeas, carnations, gerberas etc. For instance, you can order our sunset-inspired floral bouquet that will ooze out happiness or a bouquet of pink flowers that stand for unparalleled passion. Apart from bouquets, our florists can arrange the floral beauties in various ways. You can buy flowers online from us in baskets, vases, or boxes. Some of our trending floral arrangements include - premium red roses double-wrapped bouquets, gleaming love orchid bouquets, boho-inspired floral vases and pastel pink carnations bouquets. All of our flower arrangements radiate goodness & positivity and are sure to make the recipient feel over the moon. So, think no more and place your order today!
        </p>
        <div className="seo-readmore">Read More...</div>
      </section>

      {/* ── Trust Footer ── */}
      <section className="trust-footer">
        <div className="container trust-footer-inner">
          {trustFooter.map((tf, i) => (
            <div className="trust-item" key={i}>
              <img src={tf.icon} alt={tf.title} />
              <div>
                <h4>{tf.title}</h4>
                <p>{tf.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
