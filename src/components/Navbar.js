import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flower2, Menu, X, LayoutDashboard, ShoppingCart, User as UserIcon, LogOut, Package, Home, Truck, ChevronDown } from 'lucide-react';
import { useUserAuth } from '../context/UserAuthContext';
import { useCart } from '../context/CartContext';
import { settings as settingsApi } from '../api/endpoints';
import './Navbar.css';

// Lower (secondary) menu — categories live here, below the top bar.
// "Parties & Events" drills down into Packages + Make Your Party.
const CATEGORY_LINKS = [
  { to: '/flowers',   label: 'Flowers' },
  { to: '/gifts',     label: 'Gifts' },
  { to: '/parties',   label: 'Parties & Events', children: [
      { to: '/packages',     label: 'Packages' },
      { to: '/book?for=party', label: 'Make Your Party' },
  ] },
  { to: '/blog',      label: 'Blog' },
  { to: '/festivals', label: 'Festivals' },
  { to: '/specials',  label: 'Specials' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [trackingUrl, setTrackingUrl] = useState('');
  const userMenuRef = useRef(null);
  const location = useLocation();
  const { user, isAuthenticated, openAuthModal, logout } = useUserAuth();
  const { count } = useCart();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    let on = true;
    settingsApi.get()
      .then((s) => { if (on && s) setTrackingUrl(s.trackingUrl || ''); })
      .catch(() => {});
    return () => { on = false; };
  }, []);

  useEffect(() => {
    function onClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    if (userMenuOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [userMenuOpen]);

  // Shared markup helpers — called as functions so the elements inline into the
  // tree (no remounting, no duplicate refs).
  const trackingLink = (className) =>
    trackingUrl ? (
      <a href={trackingUrl} target="_blank" rel="noreferrer" className={className} onClick={closeMenu}>
        <Truck size={16} /> <span>Tracking</span>
      </a>
    ) : (
      <Link to="/orders" className={`${className} ${isActive('/orders') ? 'active' : ''}`} onClick={closeMenu}>
        <Truck size={16} /> <span>Tracking</span>
      </Link>
    );

  const cartLink = () => (
    <Link to="/cart" className={`navbar-cart-link ${isActive('/cart') ? 'active' : ''}`} onClick={closeMenu}>
      <ShoppingCart size={17} />
      <span>Cart</span>
      {count > 0 && <span className="navbar-cart-badge">{count}</span>}
    </Link>
  );

  return (
    <header className="site-header">
      {/* ── Top bar: logo · Home · Tracking · Cart · Sign in · Admin ── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <Flower2 size={22} strokeWidth={2} className="logo-icon-svg" />
            <span className="logo-text">BloomNest</span>
          </Link>

          <div className="navbar-top-links">
            <Link to="/" className={`navbar-top-link ${location.pathname === '/' ? 'active' : ''}`}>
              <Home size={16} /> <span>Home</span>
            </Link>
            {trackingLink('navbar-top-link')}
            {cartLink()}

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
                    <Link to="/orders" className="navbar-user-menu-item" onClick={() => setUserMenuOpen(false)}>
                      <Package size={14} /> My Orders
                    </Link>
                    <button className="navbar-user-menu-item" onClick={() => { setUserMenuOpen(false); logout(); }}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="btn btn-secondary navbar-signin" onClick={() => openAuthModal({ mode: 'login' })}>
                <UserIcon size={15} /> Sign In
              </button>
            )}

            <Link to="/admin" className="btn btn-primary navbar-admin">
              <LayoutDashboard size={15} strokeWidth={2} /> Admin
            </Link>
          </div>

          <button className="navbar-burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Secondary bar: category links ── */}
      <div className="subnav">
        <div className="container subnav-inner">
          {CATEGORY_LINKS.map((l) => (
            l.children ? (
              <div key={l.to} className="subnav-dropdown">
                <Link to={l.to} className={`subnav-dropdown-trigger ${isActive(l.to) ? 'active' : ''}`}>
                  {l.label} <ChevronDown size={13} />
                </Link>
                <div className="subnav-dropdown-menu">
                  {l.children.map((c) => (
                    <Link key={c.to} to={c.to} className={isActive(c.to) ? 'active' : ''}>{c.label}</Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={l.to} to={l.to} className={isActive(l.to) ? 'active' : ''}>
                {l.label}
              </Link>
            )
          ))}
        </div>
      </div>

      {/* ── Mobile drawer: everything combined (flat auth, no dropdown) ── */}
      <div className={`navbar-mobile ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>Home</Link>
        {CATEGORY_LINKS.map((l) => (
          l.children ? (
            <React.Fragment key={l.to}>
              <Link to={l.to} className={isActive(l.to) ? 'active' : ''} onClick={closeMenu}>{l.label}</Link>
              <div className="navbar-mobile-sub">
                {l.children.map((c) => (
                  <Link key={c.to} to={c.to} className={isActive(c.to) ? 'active' : ''} onClick={closeMenu}>{c.label}</Link>
                ))}
              </div>
            </React.Fragment>
          ) : (
            <Link key={l.to} to={l.to} className={isActive(l.to) ? 'active' : ''} onClick={closeMenu}>
              {l.label}
            </Link>
          )
        ))}
        {trackingLink('navbar-mobile-link')}
        {cartLink()}

        {isAuthenticated ? (
          <>
            <Link to="/orders" onClick={closeMenu}><Package size={14} /> My Orders</Link>
            <button className="btn btn-secondary navbar-signin" onClick={() => { closeMenu(); logout(); }}>
              <LogOut size={15} /> Sign Out
            </button>
          </>
        ) : (
          <button className="btn btn-secondary navbar-signin" onClick={() => { closeMenu(); openAuthModal({ mode: 'login' }); }}>
            <UserIcon size={15} /> Sign In
          </button>
        )}

        <Link to="/admin" className="btn btn-primary navbar-admin" onClick={closeMenu}>
          <LayoutDashboard size={15} strokeWidth={2} /> Admin
        </Link>
      </div>
    </header>
  );
}
