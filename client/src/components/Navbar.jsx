
import React, { useState, useEffect } from 'react';
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import '../styles/Navbar.css';
import logo from '../assets/Logo.png';
import { useCart } from '../context/CartContext';
import api from '../services/api';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem('token'))
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const closeMenu = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  // Refresh profile details when navigating after login or verification.
  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('token');
    let savedUser = null;

    try {
      savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      savedUser = null;
    }

    setIsLoggedIn(Boolean(token));
    setUser(savedUser);
    setProfileOpen(false);

    if (token) {
      api.get('/auth/me').then((response) => {
        const currentUser = response.data?.user;
        if (active && currentUser) {
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      }).catch(() => {});
    }

    return () => { active = false; };
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim()) {
      closeMenu();
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setIsLoggedIn(false);
    setUser(null);
    closeMenu();

    navigate('/', { replace: true });
  };

  const getInitial = () => {
    const name = user?.name?.trim();
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <img
            src={logo}
            alt="EzyMart - Home"
            className="nav-logo-img"
          />
        </Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            🔍
          </button>
        </form>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => {
            setMenuOpen((open) => !open);
            setProfileOpen(false);
          }}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>

          <NavLink to="/products" onClick={closeMenu}>
            Products
          </NavLink>

          <NavLink to="/cart" onClick={closeMenu} className="nav-cart-link">
            🛒 Cart
            {itemCount > 0 && <span className="nav-cart-count" aria-label={`${itemCount} items`}>{itemCount}</span>}
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/myorders" onClick={closeMenu}>
              My Orders
            </NavLink>
          )}

          {isLoggedIn ? (
            <div className="nav-profile">
              <button
                type="button"
                className="nav-profile-trigger"
                onClick={() => setProfileOpen((open) => !open)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <span className="nav-avatar">{getInitial()}</span>
                <span className="nav-profile-label">{user?.name?.trim() || 'Profile'}</span>
                <span className={`nav-profile-arrow ${profileOpen ? 'rotated' : ''}`}>
                  ▾
                </span>
              </button>

              {profileOpen && (
                <div className="nav-profile-dropdown">
                  <div className="nav-profile-heading">
                    <span className="nav-avatar nav-avatar-large">
                      {getInitial()}
                    </span>
                    <div className="nav-profile-identity">
                      <strong>{user?.name || 'EzyMart User'}</strong>
                      <span>{user?.email || 'Account details unavailable'}</span>
                    </div>
                  </div>

                  <div className="nav-profile-divider" />

                  <Link
                    to="/profile"
                    className="nav-profile-item"
                    onClick={closeMenu}
                  >
                    <span>👤</span> My Profile
                  </Link>

                  <Link
                    to="/myorders"
                    className="nav-profile-item"
                    onClick={closeMenu}
                  >
                    <span>📦</span> My Orders
                  </Link>

                  <button
                    type="button"
                    className="nav-profile-logout"
                    onClick={handleLogout}
                  >
                    <span>↪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="login-btn"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="register-btn"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
