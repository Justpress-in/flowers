import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { priceTiers as priceTiersApi } from '../../api/endpoints';

function buildQuery(tier) {
  const parts = [];
  if (tier.minPrice != null) parts.push(`priceMin=${tier.minPrice}`);
  if (tier.maxPrice != null) parts.push(`priceMax=${tier.maxPrice}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

export default function ShopByPrice() {
  const [tiers, setTiers] = useState([]);

  useEffect(() => {
    priceTiersApi
      .list({ active: 'true' })
      .then(setTiers)
      .catch(() => setTiers([]));
  }, []);

  if (!tiers.length) return null;

  return (
    <section className="shop-by-price">
      <div className="container">
        <h2 className="fnp-heading">
          <Sparkles size={18} strokeWidth={2} /> Shop By Price <Sparkles size={18} strokeWidth={2} />
        </h2>
        <div className="price-pills">
          {tiers.map((t) => (
            <Link key={t.id} to={`/flowers${buildQuery(t)}`} className="price-pill">
              {t.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
