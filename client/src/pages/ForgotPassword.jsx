import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      setLoading(true);
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });
      setMessage(response.data.message || 'If an account exists for that email, a reset link has been sent.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to request a reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">E</div>
          <span>Ezy<span className="login-orange">Mart</span></span>
        </div>

        <div className="login-heading">
          <p className="login-eyebrow">ACCOUNT RECOVERY</p>
          <h1>Forgot your password?</h1>
          <p className="login-subtitle">Enter your account email and we’ll send you a password reset link.</p>
        </div>

        {error && <div className="login-error" role="alert">{error}</div>}
        {message && <p className="verify-success" role="status">{message}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="reset-email">Email address</label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? 'Sending link...' : 'Send reset link'}
          </button>
        </form>

        <p className="login-signup" style={{ marginTop: 22 }}>
          Remembered your password? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default ForgotPassword;
