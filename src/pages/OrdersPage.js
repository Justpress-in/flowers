import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PackageOpen, Gift, User, MapPin, CalendarDays } from 'lucide-react';
import './OrdersPage.css';

export default function OrdersPage() {
  const { state } = useApp();
  const orders = [...state.orders].reverse();

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
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <div>
                <span className="order-id">{order.id}</span>
                <span className={`badge ${order.type === 'gift' ? 'badge-blue' : 'badge-green'}`}>
                  {order.type === 'gift' ? 'Gift Order' : 'Personal Order'}
                </span>
              </div>
              <span className="order-date"><CalendarDays size={13} /> {new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
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
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
