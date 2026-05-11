import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const prices = [
  { label: 'Under ₹599', to: '/flowers?price=under599' },
  { label: 'Under ₹999', to: '/flowers?price=under999' },
  { label: 'Under ₹1499', to: '/flowers?price=under1499' },
  { label: 'Under ₹1999', to: '/flowers?price=under1999' },
  { label: 'Above ₹2000', to: '/flowers?price=above2000' },
];

export default function ShopByPrice() {
  return (
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
  );
}
