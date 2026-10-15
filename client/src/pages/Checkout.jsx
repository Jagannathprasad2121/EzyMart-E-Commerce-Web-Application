import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../components/ProductCard';
import '../styles/Checkout.css';

const readSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const Checkout = () => {
  const { items, itemCount, subtotal, clearCart } = useCart();
  const user = readSavedUser();
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!localStorage.getItem('token')) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />;
  }

  if (!placedOrder && items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAddress((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const normalizedAddress = Object.fromEntries(
      Object.entries(address).map(([key, value]) => [key, value.trim()])
    );
    if (!/^[+]?[-\d\s()]{7,20}$/.test(normalizedAddress.phone)) {
      setError('Enter a valid phone number.');
      return;
    }
    if (!/^[A-Za-z0-9 -]{3,12}$/.test(normalizedAddress.pincode)) {
      setError('Enter a valid postal code.');
      return;
    }

    try {
      setLoading(true);

      const paymentOrderResponse = await api.post('/payment/order', {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      const paymentOrder = paymentOrderResponse.data;

      if (!paymentOrder?.paymentId || !Array.isArray(paymentOrder.items)) {
        throw new Error('The server did not return a valid order. Please try again.');
      }

      const verificationResponse = await api.post('/payment/verify', {
        paymentId: paymentOrder.paymentId,
        items: paymentOrder.items,
        address: normalizedAddress,
      });
      const result = verificationResponse.data;

      if (!result?.success || !result.order) {
        throw new Error(result?.message || 'Unable to place your order. Please try again.');
      }

      setPlacedOrder(result.order);
      clearCart();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          'Unable to place your order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <main className="checkout-page">
        <section className="checkout-success">
          <span className="checkout-success-icon" aria-hidden="true">✓</span>
          <p className="checkout-eyebrow">ORDER CONFIRMED</p>
          <h1>Thank you for your order!</h1>
          <p>Your order has been placed and is now being prepared.</p>
          <div className="checkout-order-reference">
            <span>Order reference</span>
            <strong>{placedOrder._id}</strong>
          </div>
          <p className="checkout-demo-note">This checkout uses the current demo payment flow. No real payment was charged.</p>
          <Link to="/products" className="checkout-submit">Continue shopping</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-heading">
          <div>
            <p className="checkout-eyebrow">ALMOST THERE</p>
            <h1>Checkout</h1>
            <p>Enter the address where you would like your order delivered.</p>
          </div>
          <Link to="/cart" className="checkout-back-link">← Back to cart</Link>
        </header>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <section className="checkout-form-section">
              <div className="checkout-section-title">
                <span>1</span>
                <div>
                  <h2>Delivery address</h2>
                  <p>Where should we send your order?</p>
                </div>
              </div>

              {error && <div className="checkout-error" role="alert">{error}</div>}

              <div className="checkout-fields">
                <label className="checkout-field checkout-field-wide">
                  <span>Full name</span>
                  <input name="fullName" autoComplete="name" maxLength={100} value={address.fullName} onChange={handleChange} required />
                </label>
                <label className="checkout-field">
                  <span>Phone number</span>
                  <input name="phone" type="tel" autoComplete="tel" maxLength={20} placeholder="For delivery updates" value={address.phone} onChange={handleChange} required />
                </label>
                <label className="checkout-field checkout-field-wide">
                  <span>Street address</span>
                  <textarea name="street" autoComplete="street-address" rows={3} maxLength={250} placeholder="House number, street, area" value={address.street} onChange={handleChange} required />
                </label>
                <label className="checkout-field">
                  <span>City</span>
                  <input name="city" autoComplete="address-level2" maxLength={80} value={address.city} onChange={handleChange} required />
                </label>
                <label className="checkout-field">
                  <span>State</span>
                  <input name="state" autoComplete="address-level1" maxLength={80} value={address.state} onChange={handleChange} required />
                </label>
                <label className="checkout-field">
                  <span>Postal code</span>
                  <input name="pincode" autoComplete="postal-code" maxLength={12} value={address.pincode} onChange={handleChange} required />
                </label>
                <label className="checkout-field">
                  <span>Country</span>
                  <input name="country" autoComplete="country-name" maxLength={80} value={address.country} onChange={handleChange} required />
                </label>
              </div>
            </section>

            <div className="checkout-demo-note checkout-form-note">
              Demo checkout: this places an order using the current mock payment API. No real payment is collected.
            </div>
            <button type="submit" className="checkout-submit" disabled={loading}>
              {loading ? 'Placing order…' : `Place order · ${formatPrice(subtotal)}`}
            </button>
          </form>

          <aside className="checkout-summary">
            <h2>Order summary <span>({itemCount})</span></h2>
            <div className="checkout-summary-items">
              {items.map((item) => (
                <div className="checkout-summary-item" key={item.productId}>
                  <div className="checkout-summary-thumb">
                    {item.image ? <img src={item.image} alt="" /> : <span aria-hidden="true">🛍️</span>}
                    <span className="checkout-summary-quantity">{item.quantity}</span>
                  </div>
                  <span className="checkout-summary-name">{item.name}</span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="checkout-summary-total">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <p className="checkout-summary-footnote">Delivery and final charges are not included in this demo checkout.</p>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
