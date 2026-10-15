import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../components/ProductCard';
import '../styles/Cart.css';

const Cart = () => {
  const { items, itemCount, subtotal, setQuantity, removeFromCart, clearCart } = useCart();

  return (
    <main className="cart-page">
      <div className="cart-container">
        <header className="cart-heading">
          <div>
            <p className="cart-eyebrow">YOUR EZYMART BAG</p>
            <h1>Shopping cart</h1>
          </div>
          <Link to="/products" className="cart-continue-link">← Continue shopping</Link>
        </header>

        {items.length === 0 ? (
          <section className="cart-empty">
            <span aria-hidden="true">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Find something you love and it will show up here.</p>
            <Link to="/products" className="cart-primary-button">Browse products</Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-items" aria-label="Items in your cart">
              <div className="cart-items-heading">
                <h2>Your items <span>({itemCount})</span></h2>
                <button type="button" onClick={clearCart}>Clear cart</button>
              </div>

              {items.map((item) => {
                const atStockLimit = Number.isFinite(item.stock) && item.quantity >= item.stock;
                return (
                  <article className="cart-item" key={item.productId}>
                    <Link to={`/products/${item.productId}`} className="cart-item-image" aria-label={`View ${item.name}`}>
                      {item.image ? <img src={item.image} alt={item.name} /> : <span aria-hidden="true">🛍️</span>}
                    </Link>

                    <div className="cart-item-info">
                      <span className="cart-item-category">{item.category}</span>
                      <h3><Link to={`/products/${item.productId}`}>{item.name}</Link></h3>
                      <strong className="cart-item-price">{formatPrice(item.price)}</strong>
                      {Number.isFinite(item.stock) && item.stock < 1 && (
                        <p className="cart-stock-warning">Currently out of stock</p>
                      )}
                      <button
                        type="button"
                        className="cart-remove"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="cart-item-controls">
                      <div className="cart-quantity" aria-label={`Quantity for ${item.name}`}>
                        <button
                          type="button"
                          aria-label={`Decrease ${item.name} quantity`}
                          disabled={item.quantity <= 1}
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                        >−</button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase ${item.name} quantity`}
                          disabled={atStockLimit}
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                        >+</button>
                      </div>
                      <strong className="cart-line-total">{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="cart-summary" aria-label="Order summary">
              <h2>Order summary</h2>
              <div className="cart-summary-row">
                <span>Items ({itemCount})</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="cart-summary-row">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="cart-summary-total">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="cart-summary-note">Taxes and delivery details will be confirmed before payment.</p>
              <Link to="/checkout" className="cart-primary-button cart-summary-button">Proceed to checkout</Link>
              <Link to="/products" className="cart-summary-continue">Continue shopping</Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
