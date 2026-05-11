import React, { useState } from 'react';
import { Flower2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import './AdminLogin.css';

const ADMIN_EMAIL = 'admin@flowers.com';
const ADMIN_PASS  = 'admin';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        onLogin();
      } else {
        setError('Invalid email or password. Please try again.');
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div className="al-page">
      <div className="al-left">
        <div className="al-brand">
          <Flower2 size={28} strokeWidth={1.8} />
          <span>BloomNest</span>
        </div>
        <div className="al-tagline">
          <h1>Welcome back,<br />Admin</h1>
          <p>Sign in to manage your products, stores, and orders from one place.</p>
        </div>
        <div className="al-stats">
          <div className="al-stat"><strong>10+</strong><span>Products</span></div>
          <div className="al-stat"><strong>3</strong><span>Stores</span></div>
          <div className="al-stat"><strong>100%</strong><span>Uptime</span></div>
        </div>
      </div>

      <div className="al-right">
        <div className="al-card">
          <div className="al-card-header">
            <div className="al-logo-sm">
              <Flower2 size={22} strokeWidth={1.8} />
            </div>
            <h2>Admin Sign In</h2>
            <p>Enter your credentials to access the dashboard</p>
          </div>

          <form className="al-form" onSubmit={handleSubmit}>
            <div className="al-field">
              <label>Email address</label>
              <div className="al-input-wrap">
                <Mail size={16} className="al-input-icon" />
                <input
                  type="email"
                  placeholder="admin@flowers.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="al-field">
              <label>Password</label>
              <div className="al-input-wrap">
                <Lock size={16} className="al-input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="al-eye-btn"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="al-error">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button type="submit" className="al-submit" disabled={loading}>
              {loading ? <span className="al-spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="al-hint">
            <strong>Demo:</strong> admin@flowers.com / admin
          </p>
        </div>
      </div>
    </div>
  );
}
