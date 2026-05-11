import React from 'react';
import { Sparkles } from 'lucide-react';

const pairs = [
  { name: 'Flowers and Cakes', img: 'https://images.unsplash.com/photo-1502920628464-9279dfc85fce?w=400&h=300&fit=crop' },
  { name: 'Flowers and Chocolates', img: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop' },
  { name: 'Flowers and Teddy Bears', img: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d3a3a?w=400&h=300&fit=crop' },
  { name: 'Flowers and Guitarist', img: 'https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=400&h=300&fit=crop' },
  { name: 'Flowers and Plants', img: 'https://images.unsplash.com/photo-1464652149449-f3b8538144aa?w=400&h=300&fit=crop' },
  { name: 'Flowers and Greeting Cards', img: 'https://images.unsplash.com/photo-1503431128871-16ef9822ce81?w=400&h=300&fit=crop' },
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
