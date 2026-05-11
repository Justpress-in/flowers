import React from 'react';
import { Sparkles } from 'lucide-react';

const showstoppers = [
  { name: 'Flower Bouquets', img: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=400&h=300&fit=crop' },
  { name: 'Flower Arrangements', img: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&h=300&fit=crop' },
  { name: 'Standing Bouquets', img: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=300&fit=crop' },
  { name: 'Flower in a Box', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=300&fit=crop' },
  { name: 'Zodiac Flowers', img: 'https://images.unsplash.com/photo-1596700676646-ac74c1064db1?w=400&h=300&fit=crop' },
  { name: 'Sleeves', img: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop' },
];

export default function ShowstopperCollection() {
  return (
    <section className="showstopper-section">
      <div className="container">
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
      </div>
    </section>
  );
}
