import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, Gift, ArrowLeft, CheckCircle2, CreditCard, Ruler } from 'lucide-react';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [placeError, setPlaceError] = useState('');

  const product = state.products.find(p => p.id === id);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const [customDesc, setCustomDesc] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [orderType, setOrderType] = useState(null); // 'personal' | 'gift'

  // Gift flow state
  const [giftForm, setGiftForm] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    giftMessage: '',
  });

  // Payment state
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const ordered = !!placedOrder;

  if (!product) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Product not found.</p>
      </div>
    );
  }

  const storeEntry = selectedStore
    ? product.storeInventory.find(s => s.storeId === selectedStore)
    : null;

  const price = storeEntry ? storeEntry.price : Math.min(...product.storeInventory.map(s => s.price));

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  function handleOrderType(type) {
    if (!selectedStore) { alert('Please select a store first.'); return; }
    if (product.availableColors.length > 0 && !selectedColor) { alert('Please select a color.'); return; }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) { alert('Please select a size.'); return; }
    setOrderType(type);
  }

  function handleGiftChange(e) {
    setGiftForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function proceedToPayment(e) {
    e.preventDefault();
    if (orderType === 'gift') {
      const { receiverName, receiverPhone, receiverAddress } = giftForm;
      if (!receiverName || !receiverPhone || !receiverAddress) { alert('Please fill all receiver details.'); return; }
    }
    setPaymentStep(true);
  }

  async function placeOrder(e) {
    e.preventDefault();
    setPlaceError('');
    const { cardName, cardNumber, expiry, cvv } = paymentForm;
    if (!cardName || !cardNumber || !expiry || !cvv) {
      setPlaceError('Please fill all payment details.');
      return;
    }

    setPlacing(true);
    try {
      const created = await actions.placeOrder({
        productId: product.id,
        storeId: selectedStore,
        type: orderType,
        color: selectedColor,
        size: selectedSize,
        customDescription: customDesc,
        giftDetails: orderType === 'gift' ? giftForm : null,
        price,
        customerName,
        customerPhone,
        customerEmail,
      });
      try {
        const raw = localStorage.getItem('bn_order_ids');
        const list = raw ? JSON.parse(raw) : [];
        if (!list.includes(created.id)) list.unshift(created.id);
        localStorage.setItem('bn_order_ids', JSON.stringify(list.slice(0, 50)));
      } catch {}
      setPlacedOrder(created);
    } catch (err) {
      setPlaceError(err.message || 'Could not place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  if (ordered) {
    return (
      <div className="container order-success">
        <div className="order-success-card">
          <div className="order-success-icon">
            <CheckCircle2 size={52} strokeWidth={1.5} color="#15803d" />
          </div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been confirmed. We'll be in touch shortly.</p>
          <div className="order-success-details">
            <div><strong>Product:</strong> {product.name}</div>
            {selectedColor && <div><strong>Color:</strong> {selectedColor}</div>}
            <div><strong>Store:</strong> {state.stores.find(s => s.id === selectedStore)?.name}</div>
            <div><strong>Total:</strong> ${price}</div>
            {orderType === 'gift' && <div><strong>Recipient:</strong> {giftForm.receiverName}</div>}
          </div>
          <div className="order-success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>View My Orders</button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep) {
    return (
      <div className="container detail-checkout">
        <button className="back-btn" onClick={() => setPaymentStep(false)}><ArrowLeft size={15} /> Back</button>
        <div className="checkout-wrap">
          <div className="checkout-summary">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            {selectedColor && <p>Color: <strong>{selectedColor}</strong></p>}
            <p>Store: <strong>{state.stores.find(s => s.id === selectedStore)?.name}</strong></p>
            {orderType === 'gift' && (
              <div className="checkout-gift-summary">
                <p>To: <strong>{giftForm.receiverName}</strong></p>
                <p>Address: {giftForm.receiverAddress}</p>
                {giftForm.giftMessage && <p className="gift-message-preview">"{giftForm.giftMessage}"</p>}
              </div>
            )}
            <div className="checkout-total">Total: <span>${price}</span></div>
          </div>
          <form className="checkout-form" onSubmit={placeOrder}>
            <h2><CreditCard size={22} strokeWidth={1.5} style={{verticalAlign:'middle', marginRight:'0.4rem'}} />Payment Details</h2>
            <div className="form-group">
              <label>Name on Card</label>
              <input value={paymentForm.cardName} onChange={e => setPaymentForm(f => ({ ...f, cardName: e.target.value }))} placeholder="John Smith" />
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <input value={paymentForm.cardNumber} onChange={e => setPaymentForm(f => ({ ...f, cardNumber: e.target.value }))} placeholder="1234 5678 9012 3456" maxLength={19} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry</label>
                <input value={paymentForm.expiry} onChange={e => setPaymentForm(f => ({ ...f, expiry: e.target.value }))} placeholder="MM/YY" maxLength={5} />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input value={paymentForm.cvv} onChange={e => setPaymentForm(f => ({ ...f, cvv: e.target.value }))} placeholder="123" maxLength={4} type="password" />
              </div>
            </div>
            {placeError && (
              <div className="al-error" style={{ marginBottom: '0.75rem' }}>
                {placeError}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-full" disabled={placing}>
              {placing ? 'Placing order…' : `Confirm & Pay $${price}`}
            </button>
          </form>
        </div>
      </div>
    );
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
              {product.tags.map(t => <span key={t} className="badge badge-orange">{t}</span>)}
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

          {/* Store Selection */}
          <div className="form-group">
            <label>Select Store *</label>
            <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)}>
              <option value="">Choose a store…</option>
              {product.storeInventory.map(si => {
                const store = state.stores.find(s => s.id === si.storeId);
                return (
                  <option key={si.storeId} value={si.storeId}>
                    {store?.name} — ${si.price} ({si.stock} in stock)
                  </option>
                );
              })}
            </select>
          </div>

          {storeEntry && (
            <div className="detail-price-row">
              <span className="detail-price">${storeEntry.price}</span>
              <span className={`badge ${storeEntry.stock > 5 ? 'badge-green' : storeEntry.stock > 0 ? 'badge-orange' : 'badge-red'}`}>
                {storeEntry.stock > 0 ? `${storeEntry.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          )}

          {/* Color Selection */}
          {product.availableColors.length > 0 && (
            <div className="form-group">
              <label>Select Color *</label>
              <div className="color-options">
                {product.availableColors.map(c => (
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
                {product.sizes.map(s => (
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

          {/* Custom Description */}
          {product.allowCustomDescription && (
            <div className="form-group">
              <label>Custom Request (optional)</label>
              <textarea
                rows={3}
                value={customDesc}
                onChange={e => setCustomDesc(e.target.value)}
                placeholder="Describe exactly what you'd like — our florist will fulfill it as per your wish…"
              />
            </div>
          )}

          {/* Order Type Selection */}
          {!orderType ? (
            <div className="order-type-section">
              <h3>How would you like to order?</h3>
              <div className="order-type-btns">
                <button className="order-type-btn" onClick={() => handleOrderType('personal')}>
                  <span className="ot-icon"><ShoppingBag size={26} strokeWidth={1.5} /></span>
                  <strong>For Myself</strong>
                  <p>Personal order</p>
                </button>
                <button className="order-type-btn" onClick={() => handleOrderType('gift')}>
                  <span className="ot-icon"><Gift size={26} strokeWidth={1.5} /></span>
                  <strong>Send as Gift</strong>
                  <p>Deliver to someone else</p>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={proceedToPayment} className="order-form">
              <div className="order-form-header">
                <h3>{orderType === 'gift' ? 'Recipient Details' : 'Personal Order'}</h3>
                <button type="button" className="btn btn-ghost" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }} onClick={() => setOrderType(null)}>Change</button>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Your Name</label>
                  <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="form-group">
                  <label>Your Phone</label>
                  <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div className="form-group">
                <label>Email (optional, for receipt)</label>
                <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="you@example.com" />
              </div>

              {orderType === 'gift' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Receiver Name *</label>
                      <input name="receiverName" value={giftForm.receiverName} onChange={handleGiftChange} placeholder="Full name" />
                    </div>
                    <div className="form-group">
                      <label>Receiver Phone *</label>
                      <input name="receiverPhone" value={giftForm.receiverPhone} onChange={handleGiftChange} placeholder="+1 234 567 8900" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Delivery Address *</label>
                    <input name="receiverAddress" value={giftForm.receiverAddress} onChange={handleGiftChange} placeholder="Full delivery address" />
                  </div>
                  <div className="form-group">
                    <label>Gift Message (optional)</label>
                    <textarea name="giftMessage" rows={2} value={giftForm.giftMessage} onChange={handleGiftChange} placeholder="Write a personal message to include with the gift…" />
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary btn-full">
                Proceed to Payment — ${price}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
