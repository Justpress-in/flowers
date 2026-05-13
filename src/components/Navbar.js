import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flower2, Menu, X, LayoutDashboard, ShoppingCart, User as UserIcon, LogOut, Package } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const { user, isAuthenticated, openAuthModal, logout } = useUserAuth();
  const { count } = useCart();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  useEffect(() => {
    function onClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    if (userMenuOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [userMenuOpen]);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <Flower2 size={22} strokeWidth={2} className="logo-icon-svg" />
          <span className="logo-text">BloomNest</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/flowers" className={isActive('/flowers') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Flowers</Link>
          <Link to="/gifts" className={isActive('/gifts') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Gifts</Link>
          <Link to="/parties" className={isActive('/parties') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Parties & Events</Link>
          <Link to="/blog" className={isActive('/blog') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Blog</Link>

          <Link to="/cart" className={`navbar-cart-link ${isActive('/cart') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            <ShoppingCart size={17} />
            <span>Cart</span>
            {count > 0 && <span className="navbar-cart-badge">{count}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="navbar-user" ref={userMenuRef}>
              <button
                className="navbar-user-btn"
                onClick={() => setUserMenuOpen((o) => !o)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <span className="navbar-user-avatar">{(user?.name || user?.email || '?').charAt(0).toUpperCase()}</span>
                <span className="navbar-user-name">{user?.name || user?.email}</span>
              </button>
              {userMenuOpen && (
                <div className="navbar-user-menu">
                  <div className="navbar-user-menu-header">
                    <strong>{user?.name || 'Account'}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <Link to="/orders" className="navbar-user-menu-item" onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }}>
                    <Package size={14} /> My Orders
                  </Link>
                  <button className="navbar-user-menu-item" onClick={() => { setUserMenuOpen(false); logout(); }}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn btn-secondary navbar-signin"
              onClick={() => { setMenuOpen(false); openAuthModal({ mode: 'login' }); }}
            >
              <UserIcon size={15} /> Sign In
            </button>
          )}

          <Link to="/admin" className="btn btn-primary navbar-admin" onClick={() => setMenuOpen(false)}>
            <LayoutDashboard size={15} strokeWidth={2} />
            Admin
          </Link>
        </div>

        <button className="navbar-burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}
