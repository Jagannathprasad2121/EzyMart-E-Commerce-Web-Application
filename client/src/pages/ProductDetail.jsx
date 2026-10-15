import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../components/ProductCard';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(`/products/${encodeURIComponent(id)}`);
        if (active) setProduct(response.data?.product || response.data);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.status === 404
              ? 'This product could not be found.'
              : requestError.response?.data?.message || 'Unable to load this product. Please try again.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProduct();
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return <main className="product-detail-state" role="status">Loading product…</main>;
  }

  if (error || !product) {
    return (
      <main className="product-detail-state">
        <div className="product-detail-error" role="alert">
          <span aria-hidden="true">🛍️</span>
          <h1>Product unavailable</h1>
          <p>{error || 'This product could not be found.'}</p>
          <Link to="/products" className="product-detail-button">Browse products</Link>
        </div>
      </main>
    );
  }

  const inStock = Number(product.stock) > 0;
  const handleAddToCart = () => setCartMessage(addToCart(product).message);

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">
        <nav className="product-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link><span aria-hidden="true">/</span>
          <Link to="/products">Products</Link><span aria-hidden="true">/</span>
          <span>{product.name}</span>
        </nav>

        <section className="product-detail-card">
          <div className="product-detail-image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <span aria-hidden="true">🛍️</span>
            )}
          </div>

          <div className="product-detail-info">
            <p className="product-detail-category">{product.category}</p>
            <h1>{product.name}</h1>
            {Number(product.numReviews) > 0 && (
              <p className="product-detail-rating">
                <span aria-label={`${product.rating || 0} out of 5 stars`}>★</span>
                {Number(product.rating || 0).toFixed(1)}
                <small>({product.numReviews} reviews)</small>
              </p>
            )}
            <p className="product-detail-price">{formatPrice(product.price)}</p>
            <p className={`product-detail-stock ${inStock ? 'available' : 'unavailable'}`}>
              <span aria-hidden="true">{inStock ? '✓' : '!'}</span>
              {inStock ? `${product.stock} available` : 'Currently out of stock'}
            </p>
            <div className="product-detail-divider" />
            <h2>About this product</h2>
            <p className="product-detail-description">
              {product.description || 'More information about this product will be available soon.'}
            </p>
            <div className="product-detail-actions">
              <button
                type="button"
                className="product-detail-button"
                disabled={!inStock}
                onClick={handleAddToCart}
              >
                {inStock ? 'Add to cart' : 'Out of stock'}
              </button>
              <Link to="/products" className="product-detail-button">Continue browsing</Link>
              <Link to="/" className="product-detail-back">Back to home</Link>
            </div>
            {cartMessage && <p className="product-cart-message" role="status">{cartMessage}</p>}
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProductDetail;
