import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, Menu, ShoppingCart, User, Utensils, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount, toggleCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMobileMenuOpen(false);
  const toggleMenu = () => setMobileMenuOpen((prev) => !prev);

  const handleCartClick = (event) => {
    event.preventDefault();
    toggleCart(true);
    closeMenu();
  };

  return (
    <>
      <nav className="navbar glass">
        <div className="container nav-container">
          <Link to="/" className="brand" onClick={closeMenu}>
            <Utensils className="brand-icon" />
            <span>
              Resto<span className="brand-accent">Bite</span>
            </span>
          </Link>

          <div className="nav-links desktop-only">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Foods</Link>
            <Link to="/menu" className={location.pathname === '/menu' ? 'active' : ''}>Menu</Link>
            {isAdmin && (
              <>
                <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>Dashboard</Link>
                <Link to="/admin/manage" className={location.pathname.startsWith('/admin/manage') ? 'active' : ''}>
                  Manage Items
                </Link>
              </>
            )}
          </div>

          <div className="nav-actions desktop-only">
            {!isAdmin && (
              <button
                onClick={handleCartClick}
                className="action-btn cart-btn"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            )}
            {user ? (
              <div className="user-menu-wrapper">
                <Link to="/profile" className="action-btn">
                  <User size={20} />
                </Link>
                <button onClick={logout} className="btn btn-outline btn-sm">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                <LogIn size={16} /> Login
              </Link>
            )}
          </div>

          <button
            id="mobile-menu-toggle"
            className="mobile-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMenu}>
          <div className="mobile-panel" onClick={(event) => event.stopPropagation()}>
            <button className="mobile-close-btn" onClick={closeMenu} aria-label="Close menu">
              <X size={26} />
            </button>

            <Link to="/" className="brand mobile-brand" onClick={closeMenu}>
              <Utensils className="brand-icon" />
              <span>
                Resto<span className="brand-accent">Bite</span>
              </span>
            </Link>

            <div className="mobile-divider" />

            <Link to="/" className="mobile-link" onClick={closeMenu}>Home</Link>
            <Link to="/shop" className="mobile-link" onClick={closeMenu}>Foods</Link>
            <Link to="/menu" className="mobile-link" onClick={closeMenu}>Menu</Link>

            {isAdmin && (
              <>
                <Link to="/admin" className="mobile-link" onClick={closeMenu}>Dashboard</Link>
                <Link to="/admin/manage" className="mobile-link" onClick={closeMenu}>Manage Items</Link>
              </>
            )}

            {!isAdmin && (
              <button
                className="mobile-link"
                onClick={handleCartClick}
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '1rem' }}
              >
                Cart {cartCount > 0 ? `(${cartCount})` : ''}
              </button>
            )}

            <div className="mobile-divider" />

            {user ? (
              <>
                <Link to="/profile" className="mobile-link" onClick={closeMenu}>Profile</Link>
                <button className="mobile-link mobile-logout-btn" onClick={() => { logout(); closeMenu(); }}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="mobile-link mobile-login-link" onClick={closeMenu}>Login</Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
