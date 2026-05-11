import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './BannerSlider.css';

export default function BannerSlider() {
  const { state } = useApp();
  const banners = state.banners || [];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;

  const prev = () => setCurrent(c => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent(c => (c + 1) % banners.length);

  return (
    <div className="banner-slider">
      <div className="banner-track" style={{ transform: `translateX(-${current * 100}%)` }}>
        {banners.map((b) => (
          <div key={b.id} className="banner-slide" style={{ background: b.bg }}>
            <div className="container banner-content">
              <div className="banner-text">
                <span className="banner-eyebrow">Special Offer</span>
                <h2>{b.title}</h2>
                <p>{b.subtitle}</p>
                <Link to={b.ctaLink} className="banner-cta">
                  {b.cta} <ArrowRight size={16} />
                </Link>
              </div>
              <div className="banner-img-wrap">
                <img src={b.image} alt={b.title} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button className="banner-arrow banner-prev" onClick={prev} aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button className="banner-arrow banner-next" onClick={next} aria-label="Next">
            <ChevronRight size={20} />
          </button>
          <div className="banner-dots">
            {banners.map((_, i) => (
              <button
                key={i}
                className={`banner-dot ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
