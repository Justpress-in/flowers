import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin } from 'lucide-react';
import { cities as citiesApi } from '../../api/endpoints';

export default function DeliveringBlooms() {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    citiesApi
      .list({ active: 'true' })
      .then(setCities)
      .catch(() => setCities([]));
  }, []);

  if (!cities.length) return null;

  return (
    <section className="cities-section">
      <div className="container">
        <h2 className="fnp-heading">
          <Sparkles size={18} strokeWidth={2} /> Delivering Blooms Across Saudi Arabia <Sparkles size={18} strokeWidth={2} />
        </h2>
        <div className="cities-grid">
          {cities.map((c) => (
            <Link
              key={c.id}
              to={`/flowers?city=${encodeURIComponent(c.id)}`}
              className="city-card"
            >
              {c.icon
                ? <img src={c.icon} alt={c.name} className="city-icon" />
                : <MapPin size={28} className="city-icon" />}
              <span>{c.name}</span>
              <div className="city-arrow"><ArrowRight size={14} /></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
