import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, AlertTriangle, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartPage.css';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, subtotal, count, updateItem, removeItem, clearCart, loading } = useCart();
  const [busyId, setBusyId] = useState(null);

  async function changeQty(item, delta) {
    const next = item.quantity + delta;
    if (next < 1) return;
    setBusyId(item.id);
    try { await updateItem(item.id, { quantity: next }); }
    catch (err) { alert(err.message); }
    finally { setBusyId(null); }
  }

  async function handleRemove(item) {
    setBusyId(item.id);
    try { await removeItem(item.id); }
    catch (err) { alert(err.message); }
    finally { setBusyId(null); }
  }

  async function handleClear() {
    if (!window.confirm('Empty your entire cart?')) return;
    try { await clearCart(); }
    catch (err) { alert(err.message); }
  }

  if (loading) {
    return (
      <div className="container cart-empty"><p>Loading cart…</p></div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container cart-empty">
        <div className="cart-empty-inner">
          <div className="cart-empty-icon"><ShoppingBag size={52} strokeWidth={1.2} /></div>
          <h2>Your cart is empty</h2>
          <p>Browse our collection and add a few favourites.</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  const hasStockIssue = items.some((i) => !i.inStock);

  return (
    <div className="container cart-page">
      <div className="cart-header">
        <h1 className="section-title">Your Cart</h1>
        <p className="section-subtitle">{count} item{count !== 1 ? 's' : ''} · ${subtotal.toFixed(2)} subtotal</p>
      </div>

      <div className="cart-grid">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id} className={`cart-item ${!item.inStock ? 'cart-item-warn' : ''}`}>
              <Link to={`/product/${item.productId}`} className="cart-item-img">
                {item.productImage ? <img src={item.productImage} alt={item.productName} /> : <div className="cart-item-img-placeholder" />}
              </Link>
              <div className="cart-item-info">
                <Link to={`/product/${item.productId}`} className="cart-item-name">{item.productName}</Link>
                <div className="cart-item-meta">
                  <span>Store: <strong>{item.storeName}</strong></span>
                  {item.color && <span>Color: <strong>{item.color}</strong></span>}
                  {item.size && <span>Size: <strong>{item.size}</strong></span>}
                </div>
                {item.customDescription && (
                  <p className="cart-item-note">Note: "{item.customDescription}"</p>
                )}
                {!item.inStock && (
                  <p className="cart-item-stock-warn">
                    <AlertTriangle size={13} /> Only {item.available} available at this store
                  </p>
                )}
              </div>
              <div className="cart-item-qty">
                <button
                  className="cart-qty-btn"
                  onClick={() => changeQty(item, -1)}
                  disabled={busyId === item.id || item.quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span>{item.quantity}</span>
                <button
                  className="cart-qty-btn"
                  onClick={() => changeQty(item, 1)}
                  disabled={busyId === item.id}
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>
              <div className="cart-item-price">
                <strong>${item.lineTotal.toFixed(2)}</strong>
                <span>${item.unitPrice.toFixed(2)} ea</span>
              </div>
              <button
                className="cart-item-remove"
                onClick={() => handleRemove(item)}
                disabled={busyId === item.id}
                aria-label="Remove item"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          <div className="cart-actions-row">
            <Link to="/" className="btn btn-ghost">← Continue Shopping</Link>
            <button className="btn btn-ghost cart-clear" onClick={handleClear}>Clear cart</button>
          </div>
        </div>

        <aside className="cart-summary">
          <h3>Order Summary</h3>
          <div className="cart-summary-row">
            <span>Items ({count})</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <div className="cart-summary-row">
            <span>Delivery</span>
            <strong>Calculated at checkout</strong>
          </div>
          <div className="cart-summary-total">
            <span>Total</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <button
            className="btn btn-primary btn-full cart-checkout-btn"
            onClick={() => navigate('/checkout')}
            disabled={hasStockIssue}
          >
            Proceed to Checkout <ArrowRight size={15} />
          </button>
          {hasStockIssue && (
            <p className="cart-stock-warning">
              <AlertTriangle size={13} /> Adjust quantities on out-of-stock items to continue.
            </p>
          )}
          <p className="cart-secure-note">Secure checkout · No payment until you confirm.</p>
        </aside>
      </div>
    </div>
  );
}
