import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag, ArrowLeft, ShoppingCart, Ruler,
  Plus, Minus, CheckCircle2,
} from 'lucide-react';
import ProductReviews from '../components/ProductReviews';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useApp();
  const { addItem } = useCart();

  const product = state.products.find((p) => p.id === id);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [customDesc, setCustomDesc] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Product not found.</p>
      </div>
    );
  }

  // Auto-pick the cheapest store with enough stock for the requested quantity.
  // Falls back to any store with stock, then to the cheapest store at all.
  const inventory = product.storeInventory || [];
  const sortedByPrice = [...inventory].sort((a, b) => a.price - b.price);
  const storeEntry =
    sortedByPrice.find((s) => s.stock >= quantity) ||
    sortedByPrice.find((s) => s.stock > 0) ||
    sortedByPrice[0] ||
    null;

  const totalStock = inventory.reduce((sum, s) => sum + s.stock, 0);
  const price = storeEntry ? storeEntry.price : 0;
  const lineTotal = price * quantity;
  const isOutOfStock = totalStock === 0;

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  function validate() {
    if (isOutOfStock || !storeEntry) {
      setError('Sorry, this item is out of stock.');
      return false;
    }
    if (storeEntry.stock < quantity) {
      setError(`Only ${totalStock} available in total — please reduce the quantity.`);
      return false;
    }
    if (product.availableColors.length > 0 && !selectedColor) {
      setError('Please select a color.');
      return false;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setError('Please select a size.');
      return false;
    }
    setError('');
    return true;
  }

  async function handleAddToCart(thenGoToCart = false) {
    if (!validate()) return;
    setAdding(true);
    try {
      await addItem({
        productId: product.id,
        storeId: storeEntry.storeId,
        quantity,
        color: selectedColor,
        size: selectedSize,
        customDescription: customDesc,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
      if (thenGoToCart) navigate('/cart');
    } catch (err) {
      setError(err.message || 'Could not add to cart.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="container detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>

      <div className="detail-grid">
        {/* Left: Image gallery */}
        <div className="detail-img-col">
          <div className="detail-img-main-wrap">
            <img src={allImages[activeImg] || product.image} alt={product.name} className="detail-img-main" />
            <div className="detail-tags">
              {product.tags.map((t) => <span key={t} className="badge badge-orange">{t}</span>)}
            </div>
          </div>
          {allImages.length > 1 && (
            <div className="detail-thumbs">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  className={`detail-thumb ${activeImg === i ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  type="button"
                >
                  <img src={img} alt={`view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="detail-info">
          <h1 className="detail-name">{product.name}</h1>
          <p className="detail-desc">{product.description}</p>

          <div className="detail-price-row">
            <span className="detail-price">${price}</span>
            <span
              className={`badge ${
                totalStock > 10 ? 'badge-green' : totalStock > 0 ? 'badge-orange' : 'badge-red'
              }`}
            >
              {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Color Selection */}
          {product.availableColors.length > 0 && (
            <div className="form-group">
              <label>Select Color *</label>
              <div className="color-options">
                {product.availableColors.map((c) => (
                  <button
                    key={c}
                    className={`color-btn ${selectedColor === c ? 'selected' : ''}`}
                    onClick={() => setSelectedColor(c)}
                    type="button"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="form-group">
              <label><Ruler size={13} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />Select Size *</label>
              <div className="size-options">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={`size-btn ${selectedSize === s ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(s)}
                    type="button"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="form-group">
            <label>Quantity</label>
            <div className="detail-qty">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}><Minus size={13} /></button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => Math.min(99, q + 1))}><Plus size={13} /></button>
              <span className="detail-line-total">Total: <strong>${lineTotal.toFixed(2)}</strong></span>
            </div>
          </div>

          {/* Custom Description */}
          {product.allowCustomDescription && (
            <div className="form-group">
              <label>Custom Request (optional)</label>
              <textarea
                rows={3}
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Describe exactly what you'd like — our florist will fulfill it as per your wish…"
              />
            </div>
          )}

          {error && <div className="detail-error">{error}</div>}
          {added && (
            <div className="detail-added">
              <CheckCircle2 size={16} /> Added to your cart
            </div>
          )}

          <div className="detail-actions">
            <button
              className="btn btn-secondary detail-cta"
              onClick={() => handleAddToCart(false)}
              disabled={adding || isOutOfStock}
            >
              <ShoppingCart size={16} /> {adding ? 'Adding…' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button
              className="btn btn-primary detail-cta"
              onClick={() => handleAddToCart(true)}
              disabled={adding || isOutOfStock}
            >
              <ShoppingBag size={16} /> Buy Now
            </button>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}
