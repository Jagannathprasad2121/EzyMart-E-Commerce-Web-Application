
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import '../styles/Home.css';

const categories = [
  { name: 'Electronics', icon: '🎧', color: '#e8efff' },
  { name: 'Fashion', icon: '👕', color: '#ffe9df' },
  { name: 'Home & Living', icon: '🛋️', color: '#e5f5e8' },
  { name: 'Accessories', icon: '⌚', color: '#fff1ce' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    let active = true;
    api.get('/products')
      .then((response) => {
        const products = Array.isArray(response.data)
          ? response.data
          : response.data?.products;
        if (active && Array.isArray(products)) setFeaturedProducts(products.slice(0, 4));
      })
      .catch(() => {});

    return () => { active = false; };
  }, []);

  return (
    <main className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">YOUR EVERYDAY MARKETPLACE</span>

          <h1>
            Shopping made
            <br />
            <span>easy with EzyMart.</span>
          </h1>

          <p>
            Discover products you love at prices you'll love even more.
            Your next great find is just a click away.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="primary-btn">
              Shop Now <span>→</span>
            </Link>

            <a href="#categories" className="secondary-btn">
              Explore Categories
            </a>
          </div>

          <div className="hero-benefits">
            <span>✓ Great prices</span>
            <span>✓ Easy ordering</span>
            <span>✓ Simple checkout</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-circle">
            <span className="hero-bag">🛍️</span>
            <span className="floating-item item-one">🎧</span>
            <span className="floating-item item-two">👟</span>
            <span className="floating-item item-three">⌚</span>
          </div>

          <div className="hero-sale">
            <span>YOUR NEXT</span>
            <strong>GREAT FIND!</strong>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories section" id="categories">
        <div className="section-heading">
          <div>
            <span className="section-label">EXPLORE</span>
            <h2>Shop by Category</h2>
          </div>

          <Link to="/products" className="text-link">
            View all →
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="category-card"
              key={category.name}
            >
              <div
                className="category-icon"
                style={{ backgroundColor: category.color }}
              >
                {category.icon}
              </div>

              <h3>{category.name}</h3>
              <span>Explore collection →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured section">
        <div className="section-heading">
          <div>
            <span className="section-label">HANDPICKED FOR YOU</span>
            <h2>Featured Products</h2>
          </div>

          <Link to="/products" className="text-link">
            View all products →
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard product={product} key={product._id} />
            ))}
          </div>
        ) : (
          <p className="home-products-empty">Products will appear here when the catalog is available.</p>
        )}

        <div className="all-products">
          <Link to="/products" className="primary-btn">
            Explore All Products →
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="benefits">
        <div className="benefit-item">
          <span>🚚</span>
          <div>
            <h3>Convenient Shopping</h3>
            <p>Browse and order from anywhere.</p>
          </div>
        </div>

        <div className="benefit-item">
          <span>🔒</span>
          <div>
            <h3>Secure Account</h3>
            <p>Your account stays protected.</p>
          </div>
        </div>

        <div className="benefit-item">
          <span>📦</span>
          <div>
            <h3>Track Your Orders</h3>
            <p>Keep up with your purchases.</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
