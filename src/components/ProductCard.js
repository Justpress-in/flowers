import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const cheapest = product.storeInventory.reduce(
    (best, s) => (s.price < best.price ? s : best),
    product.storeInventory[0]
  );
  const lowestPrice = cheapest?.price ?? 0;
  const baseAtLow = Number(cheapest?.basePrice || 0);
  const discountPct = Number(cheapest?.discountPercent || 0);
  const showStrike = baseAtLow > lowestPrice;
  const totalStock = product.storeInventory.reduce((sum, s) => sum + s.stock, 0);

  return (
    <div className="card product-card">
      <Link to={`/product/${product.id}`} className="product-card-img-wrap">
        <img src={product.image} alt={product.name} className="product-card-img" />
        <div className="product-card-badges">
          {product.tags.map(tag => (
            <span key={tag} className={`badge badge-${tagColor(tag)}`}>{tag}</span>
          ))}
        </div>
      </Link>
      <div className="product-card-body">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.description}</p>
        <div className="product-card-footer">
          <div>
            <span className="product-card-price">
              From ${lowestPrice}
              {showStrike && (
                <>
                  {' '}
                  <span style={{ textDecoration: 'line-through', color: '#999', fontWeight: 400, marginLeft: 4 }}>${baseAtLow}</span>
                  {discountPct > 0 && (
                    <span className="badge badge-orange" style={{ marginLeft: 6 }}>{discountPct}% off</span>
                  )}
                </>
              )}
            </span>
            <span className="product-card-stock">{totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}</span>
          </div>
          <Link to={`/product/${product.id}`} className="btn btn-primary">Order</Link>
        </div>
      </div>
    </div>
  );
}

function tagColor(tag) {
  const map = {
    bestseller: 'red',
    premium: 'blue',
    seasonal: 'green',
    romantic: 'red',
    wedding: 'blue',
    bespoke: 'orange',
    personalised: 'orange',
    corporate: 'blue',
    exotic: 'blue',
    aromatic: 'green',
    birthday: 'orange',
  };
  return map[tag] || 'green';
}
