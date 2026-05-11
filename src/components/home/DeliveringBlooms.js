import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const cities = [
  { name: 'Riyadh', icon: 'https://cdn-icons-png.flaticon.com/512/3248/3248062.png' },
  { name: 'Jeddah', icon: 'https://cdn-icons-png.flaticon.com/512/8204/8204481.png' },
  { name: 'Mecca', icon: 'https://cdn-icons-png.flaticon.com/512/11267/11267598.png' },
  { name: 'Medina', icon: 'https://cdn-icons-png.flaticon.com/512/6211/6211029.png' },
  { name: 'Dammam', icon: 'https://cdn-icons-png.flaticon.com/512/3248/3248074.png' },
  { name: 'Al-Khobar', icon: 'https://cdn-icons-png.flaticon.com/512/3248/3248057.png' },
  { name: 'Tabuk', icon: 'https://cdn-icons-png.flaticon.com/512/3248/3248062.png' },
  { name: 'Abha', icon: 'https://cdn-icons-png.flaticon.com/512/8204/8204481.png' },
];

export default function DeliveringBlooms() {
  return (
    <section className="cities-section container">
      <h2 className="fnp-heading">
        <Sparkles size={18} strokeWidth={2} /> Delivering Blooms Across Saudi Arabia <Sparkles size={18} strokeWidth={2} />
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
  );
}
