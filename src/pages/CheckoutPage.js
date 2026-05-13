import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag, CreditCard, ArrowLeft, CheckCircle2, Gift, ShoppingCart,
  AlertCircle, Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useUserAuth } from '../context/UserAuthContext';
import { orders as ordersApi } from '../api/endpoints';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, count, refresh } = useCart();
  const { user, isAuthenticated, bootstrapping, openAuthModal } = useUserAuth();

  const [orderType, setOrderType] = useState('personal');
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '' });
  const [gift, setGift] = useState({ receiverName: '', receiverPhone: '', receiverAddress: '', giftMessage: '' });
  const [payment, setPayment] = useState({ cardName: '', cardNumber: '', expiry: '', cvv: '' });
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(null);

  // Prefill from user profile when available
  useEffect(() => {
    if (user) {
      setCustomer((c) => ({
        name: c.name || user.name || '',
        phone: c.phone || user.phone || '',
        email: c.email || user.email || '',
      }));
    }
  }, [user]);

  // Open the auth modal automatically if not signed in
  useEffect(() => {
    if (bootstrapping) return;
    if (!isAuthenticated) {
      openAuthModal({ mode: 'login', next: () => refresh() });
    }
  }, [bootstrapping, isAuthenticated, openAuthModal, refresh]);

  function handleCustomer(e) {
    const { name, value } = e.target;
    setCustomer((c) => ({ ...c, [name]: value }));
  }
  function handleGift(e) {
    const { name, value } = e.target;
    setGift((g) => ({ ...g, [name]: value }));
  }
  function handlePayment(e) {
    const { name, value } = e.target;
    setPayment((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (orderType === 'gift') {
      if (!gift.receiverName || !gift.receiverPhone || !gift.receiverAddress) {
        setError('Please fill all receiver details for gift orders.');
        return;
      }
    }
    const { cardName, cardNumber, expiry, cvv } = payment;
    if (!cardName || !cardNumber || !expiry || !cvv) {
      setError('Please fill all payment details.');
      return;
    }
    setPlacing(true);
    try {
      const result = await ordersApi.checkout({
        type: orderType,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        giftDetails: orderType === 'gift' ? gift : null,
      });
      try {
        const raw = localStorage.getItem('bn_order_ids');
        const list = raw ? JSON.parse(raw) : [];
        result.orders.forEach((o) => { if (!list.includes(o.id)) list.unshift(o.id); });
        localStorage.setItem('bn_order_ids', JSON.stringify(list.slice(0, 50)));
      } catch {}
      await refresh();
      setPlaced(result);
    } catch (err) {
      setError(err.message || 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  if (bootstrapping) {
    return <div className="container checkout-page"><p>Loading…</p></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="container checkout-gate">
        <div className="checkout-gate-inner">
          <div className="checkout-gate-icon"><Lock size={36} strokeWidth={1.5} /></div>
          <h2>Sign in to continue</h2>
          <p>You need an account to place your order. We'll keep your cart safe.</p>
          <div className="checkout-gate-actions">
            <button className="btn btn-primary" onClick={() => openAuthModal({ mode: 'login' })}>Sign In</button>
            <button className="btn btn-secondary" onClick={() => openAuthModal({ mode: 'register' })}>Create Account</button>
          </div>
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="container checkout-success">
        <div className="checkout-success-card">
          <div className="checkout-success-icon"><CheckCircle2 size={52} strokeWidth={1.5} color="#15803d" /></div>
          <h2>Order Placed Successfully!</h2>
          <p>We've confirmed {placed.orders.length} order{placed.orders.length !== 1 ? 's' : ''} and will be in touch shortly.</p>
          <div className="checkout-success-list">
            {placed.orders.map((o) => (
              <div key={o.id} className="checkout-success-row">
                <div>
                  <strong>{o.id}</strong>
                  <p>{o.productName} × {o.quantity}</p>
                </div>
                <span>${o.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="checkout-success-total">
              <span>Total</span><strong>${placed.total.toFixed(2)}</strong>
            </div>
          </div>
          <div className="checkout-success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>View My Orders</button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container checkout-page">
        <div className="checkout-empty">
          <ShoppingCart size={48} strokeWidth={1.2} />
          <h2>Your cart is empty</h2>
          <Link to="/" className="btn btn-primary">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <button className="back-btn" onClick={() => navigate('/cart')}><ArrowLeft size={15} /> Back to cart</button>

      <div className="checkout-grid">
        <div className="checkout-form-col">
          <section className="checkout-card">
            <h3>Order Type</h3>
            <div className="checkout-type-options">
              <label className={`checkout-type-option ${orderType === 'personal' ? 'active' : ''}`}>
                <input type="radio" name="orderType" value="personal" checked={orderType === 'personal'} onChange={(e) => setOrderType(e.target.value)} />
                <ShoppingBag size={20} strokeWidth={1.5} />
                <div>
                  <strong>For Myself</strong>
                  <span>Deliver to my address</span>
                </div>
              </label>
              <label className={`checkout-type-option ${orderType === 'gift' ? 'active' : ''}`}>
                <input type="radio" name="orderType" value="gift" checked={orderType === 'gift'} onChange={(e) => setOrderType(e.target.value)} />
                <Gift size={20} strokeWidth={1.5} />
                <div>
                  <strong>Send as Gift</strong>
                  <span>Deliver to someone else</span>
                </div>
              </label>
            </div>
          </section>

          <form onSubmit={handleSubmit}>
            <section className="checkout-card">
              <h3>Contact Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name</label>
                  <input name="name" value={customer.name} onChange={handleCustomer} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={customer.phone} onChange={handleCustomer} placeholder="+1 555 555 5555" />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={customer.email} onChange={handleCustomer} placeholder="you@example.com" />
              </div>
            </section>

            {orderType === 'gift' && (
              <section className="checkout-card">
                <h3>Recipient Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Receiver Name *</label>
                    <input name="receiverName" value={gift.receiverName} onChange={handleGift} placeholder="Full name" />
                  </div>
                  <div className="form-group">
                    <label>Receiver Phone *</label>
                    <input name="receiverPhone" value={gift.receiverPhone} onChange={handleGift} placeholder="+1 234 567 8900" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Delivery Address *</label>
                  <input name="receiverAddress" value={gift.receiverAddress} onChange={handleGift} placeholder="Full delivery address" />
                </div>
                <div className="form-group">
                  <label>Gift Message</label>
                  <textarea name="giftMessage" rows={2} value={gift.giftMessage} onChange={handleGift} placeholder="A personal note to include with the gift…" />
                </div>
              </section>
            )}

            <section className="checkout-card">
              <h3><CreditCard size={18} strokeWidth={1.5} /> Payment</h3>
              <div className="form-group">
                <label>Name on Card</label>
                <input name="cardName" value={payment.cardName} onChange={handlePayment} placeholder="John Smith" />
              </div>
              <div className="form-group">
                <label>Card Number</label>
                <input name="cardNumber" value={payment.cardNumber} onChange={handlePayment} placeholder="1234 5678 9012 3456" maxLength={19} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry</label>
                  <input name="expiry" value={payment.expiry} onChange={handlePayment} placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input name="cvv" type="password" value={payment.cvv} onChange={handlePayment} placeholder="123" maxLength={4} />
                </div>
              </div>
            </section>

            {error && (
              <div className="checkout-error"><AlertCircle size={16} /> {error}</div>
            )}

            <button type="submit" className="btn btn-primary btn-full checkout-submit-btn" disabled={placing}>
              {placing ? 'Placing order…' : `Confirm & Pay $${subtotal.toFixed(2)}`}
            </button>
          </form>
        </div>

        <aside className="checkout-summary">
          <h3>Order Summary</h3>
          <div className="checkout-summary-items">
            {items.map((it) => (
              <div key={it.id} className="checkout-summary-item">
                {it.productImage && <img src={it.productImage} alt={it.productName} />}
                <div className="checkout-summary-item-info">
                  <strong>{it.productName}</strong>
                  <span>{it.storeName}</span>
                  <span>{it.quantity} × ${it.unitPrice.toFixed(2)}</span>
                </div>
                <span className="checkout-summary-item-price">${it.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-summary-row">
            <span>Items ({count})</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
          <div className="checkout-summary-row">
            <span>Delivery</span>
            <strong>Free</strong>
          </div>
          <div className="checkout-summary-total">
            <span>Total</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
