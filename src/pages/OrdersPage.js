import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { orders as ordersApi } from '../api/endpoints';
import {
  PackageOpen, Gift, User, MapPin, CalendarDays,
  Printer, ExternalLink, Truck, Loader2,
} from 'lucide-react';
import './OrdersPage.css';

function OrderCard({ order }) {
  function printReceipt() {
    const win = window.open('', '_blank', 'width=600,height=700');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt – ${order.id}</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; color: #111; max-width: 480px; margin: 0 auto; }
          h1 { font-size: 1.4rem; margin-bottom: 0.25rem; }
          .sub { color: #777; font-size: 0.85rem; margin-bottom: 1.5rem; }
          hr { border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0; }
          .row { display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.4rem; }
          .label { color: #777; }
          .total { font-size: 1.2rem; font-weight: 700; color: #e11d48; }
          .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; background: #dcfce7; color: #15803d; font-weight: 600; }
          @media print { body { padding: 1rem; } }
        </style>
      </head>
      <body>
        <h1>BloomNest</h1>
        <p class="sub">Order Receipt</p>
        <hr/>
        <div class="row"><span class="label">Order ID</span><span>${order.id}</span></div>
        <div class="row"><span class="label">Date</span><span>${new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
        <div class="row"><span class="label">Status</span><span class="badge">${order.status}</span></div>
        <hr/>
        <div class="row"><span class="label">Product</span><span>${order.productName}</span></div>
        ${order.color ? `<div class="row"><span class="label">Color</span><span>${order.color}</span></div>` : ''}
        <div class="row"><span class="label">Store</span><span>${order.storeName}</span></div>
        ${order.customDescription ? `<div class="row"><span class="label">Note</span><span>${order.customDescription}</span></div>` : ''}
        ${order.type === 'gift' && order.giftDetails ? `
          <hr/>
          <div class="row"><span class="label">Gift To</span><span>${order.giftDetails.receiverName}</span></div>
          <div class="row"><span class="label">Deliver To</span><span>${order.giftDetails.receiverAddress}</span></div>
          ${order.giftDetails.giftMessage ? `<div class="row"><span class="label">Message</span><span>"${order.giftDetails.giftMessage}"</span></div>` : ''}
        ` : ''}
        <hr/>
        <div class="row total"><span>Total</span><span>$${order.price}</span></div>
        <hr/>
        <p style="font-size:0.78rem;color:#999;text-align:center;margin-top:1.5rem;">Thank you for choosing BloomNest!</p>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `);
    win.document.close();
  }

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <span className="order-id">{order.id}</span>
          <span className={`badge ${order.type === 'gift' ? 'badge-blue' : 'badge-green'}`}>
            {order.type === 'gift' ? 'Gift Order' : 'Personal Order'}
          </span>
        </div>
        <span className="order-date">
          <CalendarDays size={13} />
          {new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <div className="order-card-body">
        <div className="order-info">
          <h3>{order.productName}</h3>
          {order.color && <p>Color: <strong>{order.color}</strong></p>}
          <p>Store: <strong>{order.storeName}</strong></p>
          {order.customDescription && <p className="order-custom-desc">Note: "{order.customDescription}"</p>}
        </div>

        {order.type === 'gift' && order.giftDetails && (
          <div className="order-gift-details">
            <p className="gift-label"><Gift size={12} /> Gift for</p>
            <p className="gift-recipient"><User size={13} /> <strong>{order.giftDetails.receiverName}</strong></p>
            <p className="gift-addr"><MapPin size={13} /> {order.giftDetails.receiverAddress}</p>
            {order.giftDetails.giftMessage && (
              <p className="gift-msg">"{order.giftDetails.giftMessage}"</p>
            )}
          </div>
        )}

        <div className="order-card-right">
          <span className="order-price">${order.price}</span>
          <span className="badge badge-green">{order.status}</span>
          <div className="order-card-actions">
            <button className="order-action-btn" onClick={printReceipt} title="Print receipt">
              <Printer size={14} /> Print Receipt
            </button>
            {order.trackingUrl ? (
              <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="order-action-btn order-track-btn">
                <Truck size={14} /> Track Order <ExternalLink size={11} />
              </a>
            ) : (
              <span className="order-track-pending"><Truck size={13} /> Tracking pending</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { state } = useApp();
  const { isAuthenticated } = useAuth();
  const [guestOrders, setGuestOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (isAuthenticated) {
        if (!cancelled) setLoading(false);
        return;
      }
      let ids = [];
      try {
        const raw = localStorage.getItem('bn_order_ids');
        ids = raw ? JSON.parse(raw) : [];
      } catch {}
      if (!Array.isArray(ids) || ids.length === 0) {
        if (!cancelled) { setGuestOrders([]); setLoading(false); }
        return;
      }
      const results = await Promise.all(
        ids.map((id) => ordersApi.get(id).catch(() => null))
      );
      if (cancelled) return;
      setGuestOrders(results.filter(Boolean));
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const orders = isAuthenticated ? state.orders : guestOrders;

  if (loading) {
    return (
      <div className="container orders-empty">
        <div className="orders-empty-inner">
          <Loader2 className="spin" size={24} />
          <p>Loading orders…</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container orders-empty">
        <div className="orders-empty-inner">
          <div className="orders-empty-icon">
            <PackageOpen size={52} strokeWidth={1.2} color="var(--text-muted)" />
          </div>
          <h2>No orders yet</h2>
          <p>Your order history will appear here once you place an order.</p>
          <Link to="/" className="btn btn-primary">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container orders-page">
      <h1 className="section-title">My Orders</h1>
      <p className="section-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
      <div className="orders-list">
        {orders.map((order) => <OrderCard key={order.id} order={order} />)}
      </div>
    </div>
  );
}
