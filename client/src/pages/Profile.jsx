import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import '../styles/Profile.css';

const readSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [user, setUser] = useState(readSavedUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/auth/me');
        const currentUser = response.data?.user;
        if (!currentUser) throw new Error('The account service returned an unexpected response.');
        if (active) {
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              'Unable to refresh your account details.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => { active = false; };
  }, [retryCount]);

  const name = user?.name?.trim() || 'EzyMart customer';
  const initial = name.charAt(0).toUpperCase();
  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date(user.createdAt))
    : 'Unavailable';

  const handleLogout = () => {
    clearCart();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  };

  return (
    <main className="profile-page">
      <div className="profile-container">
        <header className="profile-heading">
          <div>
            <p className="profile-eyebrow">YOUR ACCOUNT</p>
            <h1>My Profile</h1>
            <p className="profile-intro">View your account details and keep track of your shopping.</p>
          </div>
          <Link className="profile-shop-link" to="/products">
            Continue shopping <span aria-hidden="true">→</span>
          </Link>
        </header>

        {loading && <p className="profile-load-message" role="status">Refreshing account details…</p>}
        {error && (
          <div className="profile-load-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Retry</button>
          </div>
        )}

        <section className="profile-card" aria-labelledby="profile-details-title">
          <div className="profile-card-heading">
            <div className="profile-avatar" aria-hidden="true">{initial}</div>
            <div>
              <h2 id="profile-details-title">Account details</h2>
              <p>Your personal information</p>
            </div>
          </div>

          <dl className="profile-details">
            <div className="profile-detail-row">
              <dt>Full name</dt>
              <dd>{name}</dd>
            </div>
            <div className="profile-detail-row">
              <dt>Email address</dt>
              <dd>{user?.email || 'Not available'}</dd>
            </div>
            <div className="profile-detail-row">
              <dt>Email status</dt>
              <dd>
                <span className={`profile-status ${user?.verified ? '' : 'profile-status-unverified'}`}>
                  <span aria-hidden="true">{user?.verified ? '✓' : '!'}</span>
                  {user?.verified ? 'Verified' : 'Unverified'}
                </span>
              </dd>
            </div>
            <div className="profile-detail-row">
              <dt>Member since</dt>
              <dd>{memberSince}</dd>
            </div>
          </dl>

          <p className="profile-note">Need to change your account details? Contact customer support for help.</p>
        </section>

        <section className="profile-shortcuts" aria-label="Account shortcuts">
          <Link className="profile-shortcut" to="/myorders">
            <span className="profile-shortcut-icon" aria-hidden="true">📦</span>
            <span><strong>My orders</strong><small>View your purchases and delivery status</small></span>
            <span className="profile-shortcut-arrow" aria-hidden="true">→</span>
          </Link>
          <Link className="profile-shortcut" to="/cart">
            <span className="profile-shortcut-icon" aria-hidden="true">🛒</span>
            <span><strong>Shopping cart</strong><small>Review items you want to buy</small></span>
            <span className="profile-shortcut-arrow" aria-hidden="true">→</span>
          </Link>
        </section>

        <div className="profile-signout-row">
          <p>Signed in as <strong>{user?.email || name}</strong></p>
          <button type="button" className="profile-signout" onClick={handleLogout}>Sign out</button>
        </div>
      </div>
    </main>
  );
};

export default Profile;
