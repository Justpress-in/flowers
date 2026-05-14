import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, ArrowLeft } from 'lucide-react';
import { bookings as bookingsApi, stores as storesApi } from '../api/endpoints';
import { useUserAuth } from '../context/UserAuthContext';
import './BookingPage.css';

export default function BookingPage() {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [storesList, setStoresList] = useState([]);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    storeId: '',
    serviceType: 'consultation',
    occasion: '',
    preferredDate: '',
    preferredTime: '',
    durationMin: 30,
    notes: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    storesApi.list().then(setStoresList).catch(() => {});
  }, []);
  useEffect(() => {
    if (user) {
      setForm((f) => ({
        customerName: f.customerName || user.name || '',
        customerPhone: f.customerPhone || user.phone || '',
        customerEmail: f.customerEmail || user.email || '',
        customerAddress: f.customerAddress || user.address || '',
        ...f,
      }));
    }
  }, [user]);

  function handle(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const result = await bookingsApi.create(form);
      setSubmitted(result);
    } catch (err) {
      setError(err.message || 'Could not submit booking');
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="container booking-success">
        <CheckCircle2 size={48} color="#15803d" />
        <h2>Booking Request Sent!</h2>
        <p>Your booking <strong>{submitted.id}</strong> has been received. Our team will reach out to confirm shortly.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div className="container booking-page">
      <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft size={15} /> Back</button>
      <header className="booking-header">
        <Calendar size={32} color="#c1440e" />
        <h1>Book a Consultation</h1>
        <p>Tell us a bit about your occasion and we'll get back to you within one business day.</p>
      </header>

      <form onSubmit={submit} className="booking-form">
        <div className="form-row">
          <div className="form-group">
            <label>Your Name *</label>
            <input name="customerName" value={form.customerName} onChange={handle} required />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input name="customerPhone" value={form.customerPhone} onChange={handle} required placeholder="+1 555 555 5555" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="customerEmail" value={form.customerEmail} onChange={handle} />
          </div>
          <div className="form-group">
            <label>Preferred Store</label>
            <select name="storeId" value={form.storeId} onChange={handle}>
              <option value="">Any store</option>
              {storesList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Service *</label>
            <select name="serviceType" value={form.serviceType} onChange={handle}>
              <option value="consultation">Consultation</option>
              <option value="event-planning">Event Planning</option>
              <option value="workshop">Workshop</option>
              <option value="tasting">Tasting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Occasion</label>
            <input name="occasion" value={form.occasion} onChange={handle} placeholder="Wedding, anniversary, …" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Preferred Date *</label>
            <input type="date" name="preferredDate" value={form.preferredDate} onChange={handle} required />
          </div>
          <div className="form-group">
            <label>Preferred Time</label>
            <input name="preferredTime" value={form.preferredTime} onChange={handle} placeholder="e.g. 3:00 PM" />
          </div>
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea
            rows={2}
            name="customerAddress"
            value={form.customerAddress}
            onChange={handle}
            placeholder="Street, city, postal code"
          />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <textarea rows={3} name="notes" value={form.notes} onChange={handle} placeholder="Anything else we should know…" />
        </div>
        {error && <p className="booking-error">{error}</p>}
        <button type="submit" className="btn btn-primary btn-full" disabled={busy}>
          {busy ? 'Submitting…' : 'Request Booking'}
        </button>
      </form>
    </div>
  );
}
