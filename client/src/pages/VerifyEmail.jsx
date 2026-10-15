
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Login.css';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !/^\d{6}$/.test(otp)) {
      setError('Enter a valid email address and 6-digit OTP.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/verify-email', {
        email: email.trim().toLowerCase(),
        otp,
      });

      const data = response.data;

      if (!data.token) {
        setSuccess('Email verified! Please sign in.');
        return;
      }

      localStorage.setItem('token', data.token);

      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess('Email verified successfully!');

      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Email verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">E</div>
          <span>
            Ezy<span className="login-orange">Mart</span>
          </span>
        </div>

        <div className="login-heading">
          <p className="login-eyebrow">EMAIL VERIFICATION</p>
          <h1>Verify your email</h1>
          <p className="login-subtitle">
            Enter the 6-digit OTP sent to your email address.
          </p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <p role="status" className="verify-success">
            {success}
          </p>
        )}

        <form className="login-form" onSubmit={handleVerify}>
          <div className="login-field">
            <label htmlFor="verify-email">Email address</label>
            <input
              id="verify-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="otp">6-digit OTP</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]{6}"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <p className="login-signup" style={{ marginTop: 22 }}>
          Already verified? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default VerifyEmail;