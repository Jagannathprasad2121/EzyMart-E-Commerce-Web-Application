
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Register.css';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();

    if (!name || !email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/register', {
        name,
        email,
        password: formData.password,
      });

      // Your backend sends an OTP after creating the account.
      navigate('/verify-email', {
        state: { email },
        replace: false,
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-card">

        {/* Brand */}
        <Link to="/" className="register-brand">
          <span>
            Ezy<span>Mart</span>
          </span>
        </Link>

        {/* Heading */}
        <div className="register-heading">
          <p className="register-eyebrow">CREATE ACCOUNT</p>
          <h1>Join EzyMart Today</h1>
          <p>
            Create your account to enjoy a smarter
            <br className="register-desktop-break" />
            {' '}and easier shopping experience.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="register-message register-error" role="alert">
            {error}
          </div>
        )}

        {/* Registration form */}
        <form className="register-form" onSubmit={handleSubmit}>

          {/* Name */}
          <div className="register-field">
            <label htmlFor="name">
              Full Name <span>*</span>
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              maxLength={80}
              required
            />
          </div>

          {/* Email */}
          <div className="register-field">
            <label htmlFor="register-email">
              Email Address <span>*</span>
            </label>

            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div className="register-field">
            <label htmlFor="register-password">
              Password <span>*</span>
            </label>

            <div className="register-password-wrap">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                minLength={6}
                required
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="register-field">
            <label htmlFor="confirm-password">
              Confirm Password <span>*</span>
            </label>

            <div className="register-password-wrap">
              <input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="register-password-toggle"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Terms */}
          <label className="register-terms">
            <input type="checkbox" required />

            <span>
              I agree to the{' '}
              <Link to="/terms">Terms &amp; Conditions</Link>
              {' '}and{' '}
              <Link to="/privacy">Privacy Policy</Link>.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <span>→</span>}
          </button>
        </form>

        {/* Login link */}
        <div className="register-divider">
          <span>ALREADY HAVE AN ACCOUNT?</span>
        </div>

        <p className="register-login">
          Sign in to your account{' '}
          <Link to="/login">Login →</Link>
        </p>

        {/* Benefits */}
        <div className="register-benefits">
          <div>
            <span>🔒</span>
            <p>Secure<br />Account</p>
          </div>

          <div>
            <span>📦</span>
            <p>Easy<br />Shopping</p>
          </div>

          <div>
            <span>💬</span>
            <p>Customer<br />Support</p>
          </div>
        </div>

      </section>
    </main>
  );
};

export default Register;