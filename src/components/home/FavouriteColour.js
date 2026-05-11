import React from 'react';
import { Sparkles } from 'lucide-react';

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

export default function FavouriteColour() {
  return (
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
  );
}
