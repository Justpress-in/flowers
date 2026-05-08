import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flower2, Menu, X, LayoutDashboard } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

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
          <Link to="/orders" className={isActive('/orders') ? 'active' : ''} onClick={() => setMenuOpen(false)}>My Orders</Link>
          <Link to="/admin" className="btn btn-primary navbar-admin" onClick={() => setMenuOpen(false)}>
            <LayoutDashboard size={15} strokeWidth={2} />
            Admin
          </Link>
        </div>

        <button className="navbar-burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}
