import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const cities = [
  { name: 'Delhi NCR', icon: 'https://cdn-icons-png.flaticon.com/512/3248/3248062.png' },
  { name: 'Hyderabad', icon: 'https://cdn-icons-png.flaticon.com/512/8204/8204481.png' },
  { name: 'Pune', icon: 'https://cdn-icons-png.flaticon.com/512/11267/11267598.png' },
  { name: 'Mumbai', icon: 'https://cdn-icons-png.flaticon.com/512/6211/6211029.png' },
  { name: 'Chennai', icon: 'https://cdn-icons-png.flaticon.com/512/3248/3248074.png' },
  { name: 'Bengaluru', icon: 'https://cdn-icons-png.flaticon.com/512/3248/3248057.png' },
];

export default function DeliveringBlooms() {
  return (
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
  );
}
