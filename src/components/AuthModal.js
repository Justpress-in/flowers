import React, { useEffect, useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Phone, AlertCircle, Flower2 } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import './AuthModal.css';

export default function AuthModal() {
  const { authModal, closeAuthModal, login, register } = useUserAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (authModal) {
      setMode(authModal.mode || 'login');
      setError('');
      setForm({ email: '', password: '', name: '', phone: '' });
    }
  }, [authModal]);

  if (!authModal) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone,
        });
      }
      const next = authModal.next;
      closeAuthModal();
      if (typeof next === 'function') next();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeAuthModal()}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={closeAuthModal}><X size={18} /></button>
        <div className="auth-modal-brand">
          <Flower2 size={28} strokeWidth={1.8} />
          <span>BloomNest</span>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Sign in to continue with your order'
            : 'Create an account to save your cart and orders'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-input-wrap">
                <UserIcon size={16} className="auth-input-icon" />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" autoComplete="name" />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <div className="auth-input-wrap">
              <Mail size={16} className="auth-input-icon" />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="auth-field">
              <label>Phone</label>
              <div className="auth-input-wrap">
                <Phone size={16} className="auth-input-icon" />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 555 5555" autoComplete="tel" />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrap">
              <Lock size={16} className="auth-input-icon" />
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? 'Please wait…' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>New to BloomNest? <button type="button" onClick={() => { setMode('register'); setError(''); }}>Create an account</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
