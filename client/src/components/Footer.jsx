
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span>Ezy</span>
            <strong>Mart</strong>
          </Link>

          <p>
            Shopping made easy. Discover your favorite products,
            explore great deals, and enjoy a simpler shopping experience
            with EzyMart.
          </p>

          <div className="footer-socials">
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">Instagram</a>
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">Facebook</a>
            <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube">YouTube</a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/products">All Products</Link>
          <Link to="/cart">Shopping Cart</Link>
          <Link to="/myorders">My Orders</Link>
        </div>

        {/* Categories */}
        <div className="footer-column">
          <h3>Categories</h3>
          <Link to="/products?category=Electronics">Electronics</Link>
          <Link to="/products?category=Fashion">Fashion</Link>
          <Link to="/products?category=Home%20%26%20Living">Home &amp; Living</Link>
          <Link to="/products?category=Accessories">Accessories</Link>
        </div>

        {/* Support */}
        <div className="footer-column">
          <h3>Customer Support</h3>
          <Link to="/contact">Contact Us</Link>
          <Link to="/faq">FAQs</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} <span>EzyMart</span>.
          All rights reserved.
        </p>

        <p className="footer-tagline">
          Made for smarter shopping 🛍️
        </p>
      </div>
    </footer>
  );
};

export default Footer;