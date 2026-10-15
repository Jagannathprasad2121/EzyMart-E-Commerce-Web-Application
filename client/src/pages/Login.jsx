
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const email = formData.email.trim().toLowerCase();

    if (!email || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      // Change this endpoint if your backend uses a different login route.
      const response = await api.post('/auth/login', {
        email,
        password: formData.password,
      });

      const data = response.data;
      const token =
        data.token ||
        data.accessToken ||
        data.data?.token ||
        data.data?.accessToken;

      if (!token) {
        throw new Error(
          'Login succeeded, but no authentication token was returned. Check your backend response.'
        );
      }

      localStorage.setItem('token', token);

      const user = data.user || data.data?.user;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Return to the page the user originally wanted to visit.
      const destination = location.state?.from || '/';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Unable to log in. Please try again.'
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
          <p className="login-eyebrow">WELCOME BACK</p>
          <h1>Sign in to your account</h1>
          <p className="login-subtitle">
            Your next great find is just a click away.
          </p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            <span>!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <div className="login-password-label">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="login-forgot">
                Forgot password?
              </Link>
            </div>

            <div className="login-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-show-password"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <span>→</span>}
          </button>
        </form>

        <div className="login-divider">
          <span>SHOP SMART. SHOP EASY.</span>
        </div>

        <p className="login-signup">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>

        <Link to="/products" className="login-guest">
          Continue browsing products →
        </Link>

        <div className="login-security">
          <span>🔒</span>
          Your account information is protected.
        </div>
      </section>
    </main>
  );
};

export default Login;