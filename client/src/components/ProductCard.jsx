import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/ProductCard.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [cartMessage, setCartMessage] = React.useState('');
  const inStock = Number(product.stock) > 0;

  const handleAddToCart = () => {
    const result = addToCart(product);
    setCartMessage(result.message);
  };

  return (
    <article className="catalog-product-card">
      <Link
        to={`/products/${product._id}`}
        className="catalog-product-image"
        aria-label={`View ${product.name}`}
      >
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <span className="catalog-image-placeholder" aria-hidden="true">🛍️</span>
        )}
        {Number(product.stock) < 1 && (
          <span className="catalog-stock-badge">Out of stock</span>
        )}
      </Link>

      <div className="catalog-product-info">
        <span className="catalog-product-category">{product.category}</span>
        <h2>
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h2>
        <div className="catalog-product-bottom">
          <strong>{formatPrice(product.price)}</strong>
          <Link
            to={`/products/${product._id}`}
            className="catalog-view-link"
            aria-label={`View details for ${product.name}`}
          >
            View <span aria-hidden="true">→</span>
          </Link>
        </div>
        <button
          type="button"
          className="catalog-add-button"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          {inStock ? 'Add to cart' : 'Out of stock'}
        </button>
        {cartMessage && <p className="catalog-cart-message" role="status">{cartMessage}</p>}
      </div>
    </article>
  );
};

export { formatPrice };
export default ProductCard;
