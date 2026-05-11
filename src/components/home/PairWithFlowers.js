import React from 'react';
import { Sparkles } from 'lucide-react';

const pairs = [
  { name: 'Flowers and Cakes', img: 'https://images.unsplash.com/photo-1557925923-33b251214f20?w=400&h=300&fit=crop' },
  { name: 'Flowers and Chocolates', img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop' },
  { name: 'Flowers and Teddy Bears', img: 'https://images.unsplash.com/photo-1559627755-e7f62bc12eb2?w=400&h=300&fit=crop' },
  { name: 'Flowers and Guitarist', img: 'https://images.unsplash.com/photo-1510915361894-faa8b2d18475?w=400&h=300&fit=crop' },
  { name: 'Flowers and Plants', img: 'https://images.unsplash.com/photo-1416879598056-0c6559bc5cc4?w=400&h=300&fit=crop' },
  { name: 'Flowers and Greeting Cards', img: 'https://images.unsplash.com/photo-1518349272332-9c3db7dae9e7?w=400&h=300&fit=crop' },
];

export default function PairWithFlowers() {
  return (
    <section className="showstopper-section">
      <div className="container">
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
      </div>
    </section>
  );
}
