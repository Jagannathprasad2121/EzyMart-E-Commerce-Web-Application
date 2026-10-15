import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatPrice } from '../components/ProductCard';
import '../styles/MyOrders.css';

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(date);
};

const getOrderStatus = (status) => {
  const labels = { pending: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };
  return labels[status] || status || 'Status unavailable';
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/orders/myorders');
        const result = response.data?.orders;
        if (!Array.isArray(result)) throw new Error('The order service returned an unexpected response.');
        if (active) setOrders(result);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              'Unable to load your orders. Please try again.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOrders();
    return () => { active = false; };
  }, [retryCount]);

  return (
    <main className="orders-page">
      <div className="orders-container">
        <header className="orders-heading">
          <div>
            <p className="orders-eyebrow">YOUR PURCHASES</p>
            <h1>My orders</h1>
            <p>View your purchases and check their latest status.</p>
          </div>
          <Link to="/products" className="orders-shop-link">Shop products <span aria-hidden="true">→</span></Link>
        </header>

        {loading && <div className="orders-state" role="status">Loading your orders…</div>}

        {!loading && error && (
          <div className="orders-state orders-error" role="alert">
            <h2>We couldn’t load your orders</h2>
            <p>{error}</p>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <section className="orders-empty">
            <span aria-hidden="true">📦</span>
            <h2>No orders yet</h2>
            <p>Your purchases will appear here after you place an order.</p>
            <Link to="/products" className="orders-primary-button">Explore products</Link>
          </section>
        )}

        {!loading && !error && orders.length > 0 && (
          <section className="orders-list" aria-label="Order history">
            {orders.map((order) => {
              const address = order.address || {};
              return (
                <article className="order-card" key={order._id}>
                  <header className="order-card-header">
                    <div className="order-card-meta">
                      <span>Order placed</span>
                      <strong>{formatDate(order.createdAt)}</strong>
                    </div>
                    <div className="order-card-meta order-reference">
                      <span>Order reference</span>
                      <strong title={order._id}>{order._id}</strong>
                    </div>
                    <div className="order-card-total">
                      <span>Total</span>
                      <strong>{formatPrice(order.totalAmount)}</strong>
                    </div>
                    <span className={`order-status order-status-${order.status || 'pending'}`}>
                      {getOrderStatus(order.status)}
                    </span>
                  </header>

                  <div className="order-card-content">
                    <div className="order-products">
                      {order.items?.map((item, index) => {
                        const product = item.productId && typeof item.productId === 'object'
                          ? item.productId
                          : null;
                        const productName = product?.name || 'Product no longer available';
                        const productImage = product?.image;
                        return (
                          <div className="order-product" key={`${product?._id || item.productId}-${index}`}>
                            <div className="order-product-image">
                              {productImage ? <img src={productImage} alt="" /> : <span aria-hidden="true">🛍️</span>}
                            </div>
                            <div className="order-product-info">
                              {product?._id ? <Link to={`/products/${product._id}`}>{productName}</Link> : <strong>{productName}</strong>}
                              <span>Qty {item.quantity} · {formatPrice(item.price)} each</span>
                            </div>
                            <strong className="order-product-total">{formatPrice(Number(item.price) * Number(item.quantity))}</strong>
                          </div>
                        );
                      })}
                    </div>

                    <div className="order-delivery">
                      <h2>Delivering to</h2>
                      <strong>{address.fullName || 'Address unavailable'}</strong>
                      {address.street && <span>{address.street}</span>}
                      {(address.city || address.state || address.pincode) && (
                        <span>{[address.city, address.state, address.pincode].filter(Boolean).join(', ')}</span>
                      )}
                      {address.country && <span>{address.country}</span>}
                      {address.phone && <span>{address.phone}</span>}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default MyOrders;
