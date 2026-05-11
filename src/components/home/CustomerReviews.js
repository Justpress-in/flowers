import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

const reviews = [
  { initial: 'S', name: 'Sangeeta', time: '9 months ago', rating: 5, text: 'Inspite of heavy rains the delivery boy delivered the gift on time Thanks a lot to him', occ: 'Birthday', city: 'Mumbai' },
  { initial: 'AS', name: 'anoop srivastava', time: '9 months ago', rating: 5, text: 'All gd', occ: 'Birthday', city: 'Delhi' },
  { initial: 'AV', name: 'Archana Verma', time: '9 months ago', rating: 5, text: 'Thank you team for your excellent service and delivery of best quality products, I really ...', occ: 'Birthday', city: 'Ayodhya-Nagar-Bhopal' },
  { initial: 'RS', name: 'Ruhi Singh', time: '9 months ago', rating: 5, text: 'Thank you for delivering the best', occ: 'Birthday', city: 'Ghaziabad' },
];

export default function CustomerReviews() {
  return (
    <section className="reviews-section">
      <div className="container">
        <div className="home-section-header">
          <h2 className="section-title">Customer Reviews</h2>
          <button className="view-all-reviews">Show All Reviews <ArrowRight size={14} /></button>
        </div>
        <div className="reviews-carousel">
          {reviews.map((r, i) => (
            <div key={i} className="review-card">
              <div className="review-head">
                <div className="review-avatar">{r.initial}</div>
                <div className="review-meta">
                  <div className="review-name"><strong>{r.name}</strong> • {r.time}</div>
                  <div className="review-stars">
                    {[...Array(r.rating)].map((_, idx) => (
                      <Star key={idx} size={14} fill="#22c55e" color="#22c55e" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="review-text">{r.text}</p>
              <div className="review-foot">
                <span>Occasion: {r.occ}</span>
                <span>City: {r.city}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
